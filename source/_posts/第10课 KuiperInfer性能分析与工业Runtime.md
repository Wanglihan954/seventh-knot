---
title: "第10课 KuiperInfer性能分析与工业Runtime"
categories:
  - AI 推理工程
tags:
  - "AI 推理工程"
  - "深度学习"
  - "KuiperInfer"
  - "性能分析"
  - "ONNXRuntime"
  - "CUDA"
  - "学习笔记"
  - "课程"
description: "比较教学型 KuiperInfer 与工业运行时的性能差异，定位编译优化、内存访问、算子实现与并行策略。"
readmore: true
mathjax: true
date: 2026-09-19 20:00:00
updated: 2026-09-18 16:56:55
abbrlink: "5864d4ef"
---
> **本课定位**
> 前九课回答“推理框架如何工作”；本课开始回答“时间花在哪里、怎样证明瓶颈、成熟 Runtime 多做了什么”。


<!-- more -->

## 🎯 本节目标

- [ ] 能设计公平、可复现的 CPU 推理 benchmark。
- [ ] 能解释 Debug 与 Release 的巨大差距。
- [ ] 能定位 KuiperInfer 相对 PyTorch/ONNX Runtime 的主要性能差距。
- [ ] 区分 ONNX、ONNX Runtime、PNNX 与 ncnn。
- [ ] 理解 ONNX Runtime C++ 的最小执行链。
- [ ] 制定从 CPU profiling 到 CUDA 的实践路线。

## 🧭 当前结论

```text
最初结果：KuiperInfer CPU 比 PyTorch CPU 慢约 60×
                  ↓ 排查构建配置
改用 Release：差距缩小到约 3×
                  ↓
结论：60× 主要是 Debug/未优化编译问题；
剩余约 3× 才是 kernel、内存与 Runtime 优化成熟度的差距。
```

这个结果也说明：`RuntimeOperator`、`shared_ptr`、注册器和一次虚函数调用不是主要瓶颈。ResNet 的时间主要落在卷积、GEMM 和大块特征图内存访问上。

## 1. 先建立正确的性能直觉

不要比较：

```text
C++ vs Python
```

应该比较：

```text
KuiperInfer
= 教学级 Runtime + im2col + Armadillo/OpenBLAS

PyTorch CPU
= ATen + oneDNN/MKL + SIMD + blocked layout + 成熟线程调度

ONNX Runtime
= 图优化 + Execution Provider + kernel 选择 + 内存规划
```

Python 通常只负责发起调用，重型卷积仍由底层原生 kernel 执行。API 使用什么语言，并不能直接推导核心算子的速度。

## 2. 公平 benchmark 清单

### 2.1 必须保持一致

- 同一个模型和权重；
- 相同输入 shape、batch 和 `float32` dtype；
- 相同 CPU、线程数和电源模式；
- 两边都预热；
- 都只测 Forward；
- 明确统计的是平均值、中位数还是 P95；
- 明确单位是 `ms/batch` 还是 `ms/image`。

### 2.2 PyTorch 参考骨架

```python
model.eval()
torch.set_num_threads(8)

with torch.inference_mode():
    for _ in range(20):
        model(x)

    begin = time.perf_counter()
    for _ in range(100):
        model(x)
    end = time.perf_counter()

latency_ms = (end - begin) * 1000 / 100
```

### 2.3 KuiperInfer 参考骨架

```cpp
graph.Build(input_name, output_name);  // 不计入 Forward

for (int i = 0; i < 20; ++i) {
  graph.Forward(inputs, false);
}

const auto begin = std::chrono::steady_clock::now();
for (int i = 0; i < 100; ++i) {
  graph.Forward(inputs, false);
}
const auto end = std::chrono::steady_clock::now();
```

### 2.4 首轮排查命令

```bash
# 确认 Release/O2/O3
grep CMAKE_BUILD_TYPE build/CMakeCache.txt
cat build/CMakeFiles/*/flags.make

# 确认 BLAS 实现确实被链接
ldd ./your_binary | grep -Ei "blas|openblas|mkl"
```

还要防止 OpenMP 与 OpenBLAS 线程嵌套造成 oversubscription：

```bash
OMP_NUM_THREADS=8 OPENBLAS_NUM_THREADS=1 ./benchmark
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=8 ./benchmark
```

不能默认“双层都开满线程”一定更快；这可能制造大量竞争、上下文切换和 cache 抖动。

## 3. 剩余约 3× 差距可能在哪里

### 3.1 Im2Col 的复制开销

KuiperInfer 的卷积大致为：

```text
Input feature map
       ↓ im2col
[C×Kh×Kw, Hout×Wout] 临时矩阵
       ↓ GEMM
Output feature map
```

例如 `64×56×56` 输入经过 `3×3` 展开，会形成近似：

```text
(64×3×3) × (56×56)
= 576 × 3136
```

的临时矩阵。GEMM 很快不代表整个 Conv 都快；数据展开、写临时 buffer 和 cache miss 也会消耗大量时间。

### 3.2 Batch 数据组织

PyTorch 原生 Tensor 通常是完整的 `[N,C,H,W]`，成熟 kernel 可以统一做 blocking、SIMD 和线程划分。KuiperInfer 更接近：

```text
vector<Tensor<C,H,W>>
```

即逐 sample 保存。设计直观，但不利于把 batch 作为整体优化。

### 3.3 缺少图融合

推理阶段的 Conv 与 BatchNorm 可以折叠：

$$
W'_c = \frac{\gamma_c}{\sqrt{\sigma_c^2+\epsilon}}W_c
$$

$$
b'_c = \frac{\gamma_c}{\sqrt{\sigma_c^2+\epsilon}}(b_c-\mu_c)+\beta_c
$$

运行时便从：

```text
Conv → 写 feature map → BN 读取 → 再写 feature map
```

变为一个使用新权重的 `Conv'`。成熟 Runtime 还会尝试 Conv+Activation、常量折叠和冗余节点消除。

### 3.4 专用 kernel 与布局

oneDNN 等库会针对 CPU 指令集、shape 和 layout 选择实现，可能使用 AVX2/AVX-512、cache blocking、权重预排布或避免完整 im2col。KuiperInfer 的通用实现更适合教学和验证正确性，不等价于工业级 kernel。

## 4. 不猜瓶颈：按层 Profiling

第一轮需要采集：

| 层级 | 要回答的问题 |
| --- | --- |
| 整图 | 平均、P50、P95 latency 是多少？ |
| Layer | Conv、BN、ReLU、Pool 各占多少？ |
| Conv 内部 | im2col 与 GEMM 分别耗时多少？ |
| 线程 | 1/2/4/8/... 线程是否持续加速？ |
| 内存 | 临时矩阵大小、分配次数和 cache 行为如何？ |

建议结果表：

```text
ResNet18 FP32 / batch=1 / threads=8

Runtime          latency(ms)
KuiperInfer      ...
PyTorch eager    ...
ONNX Runtime     ...

KuiperInfer breakdown
Conv             ...%
BatchNorm        ...%
ReLU/Pool/Others ...%

Conv breakdown
im2col           ...%
GEMM             ...%
other            ...%
```

只有拿到这些数据，才能把“PyTorch 优化得更好”升级成可验证结论。

## 5. ONNX、ONNX Runtime、PNNX 与 ncnn

| 名称 | 本质 | 是否直接负责高性能执行 |
| --- | --- | --- |
| ONNX | 模型交换格式 | 否 |
| ONNX Runtime | ONNX 推理引擎 | 是 |
| PNNX | PyTorch 模型转换/交换工具与 IR | 主要不是 |
| ncnn | 面向移动端/边缘设备的推理引擎 | 是 |

因此合理的比较是：

```text
PyTorch eager / torch.compile
vs ONNX Runtime
vs pnnx → ncnn
vs KuiperInfer
```

而不是“ONNX 文件是否比 PyTorch 快”或“PNNX 本身是否更快”。

## 6. ONNX Runtime C++ 最小执行链

```text
.onnx
  ↓
Ort::Env
  ↓
Ort::SessionOptions
  ↓
Ort::Session
  ↓
Ort::Value input
  ↓
session.Run()
  ↓
Ort::Value output
```

与 KuiperInfer 对照：

| KuiperInfer | ONNX Runtime | 含义 |
| --- | --- | --- |
| `RuntimeGraph` | `Ort::Session` | 已准备好的可执行模型 |
| `Tensor<float>` | `Ort::Value` | 运行时数据对象 |
| `Build()` | Session 创建阶段 | 解析、优化并准备执行 |
| `Forward()` | `session.Run()` | 执行图 |
| 算子实现 | Execution Provider/kernel | 具体硬件后端 |

`Ort::Session` 不是简单打开文件。创建阶段通常包含图解析、图优化、Execution Provider 选择、kernel 准备和内存规划。

### 6.1 核心对象

- `Ort::Env`：Runtime 的全局环境和日志上下文；
- `Ort::SessionOptions`：线程数、图优化等级和执行后端等配置；
- `Ort::Session`：加载并准备好的可执行图；
- `Ort::MemoryInfo`：说明 Tensor 内存位于 CPU 还是其他设备；
- `Ort::Value`：带 dtype 与 shape 的运行时值包装；
- `session.Run()`：传入输入名和值，执行并返回输出。

真实工程中不要猜输入名和 shape，应从 Session 查询：

```cpp
auto input_name = session.GetInputNameAllocated(0, allocator);
auto input_info = session.GetInputTypeInfo(0);
auto shape = input_info.GetTensorTypeAndShapeInfo().GetShape();
```

图像分类的完整链仍是：

```text
OpenCV BGR/HWC uint8
→ RGB
→ float / 255
→ mean/std normalize
→ CHW std::vector<float>
→ Ort::Value
→ session.Run()
→ postprocess
```

## 7. 从现在开始的实践路线

### 阶段一：CPU 性能工程

1. 建立 KuiperInfer/PyTorch 的统一 baseline；
2. 按 Layer 计时；
3. 单独计时 im2col 与 GEMM；
4. 测试线程数缩放；
5. 做 Conv+BN folding 实验；
6. 加入 ONNX Runtime 作为成熟 Runtime 对照。

### 阶段二：并行与 CUDA 基础

```text
Cache/locality
→ SIMD 与编译器自动向量化
→ OpenMP 与 false sharing
→ vector add CUDA
→ naive GEMM
→ tiled GEMM + shared memory
→ ReLU CUDA operator
```

### 阶段三：工业 Runtime

```text
ONNX Runtime profiling/threading
→ CUDA Execution Provider
→ TensorRT engine
→ 自定义 CUDA/TensorRT plugin
```

最终项目可以整理为：

```text
MiniInferBench/
├── kuiper_benchmark/
├── pytorch_benchmark/
├── onnxruntime_benchmark/
├── cuda/
├── results/
└── README.md
```

## ⚠️ 易错点

### 1. 把 Build 时间算进每次推理

Build 是模型准备阶段，稳定推理延迟应该只测 Forward。

### 2. 线程越多一定越快

线程过多、OpenMP 与 BLAS 嵌套都可能让性能下降。

### 3. 用一次运行结果下结论

需要预热、多次重复，并报告统计量和环境。

### 4. 将 C++ API 当作加速来源

同一 Runtime 的 Python/C++ API 往往进入同一底层 kernel；C++ 的优势更多是部署集成、内存控制和降低外围开销。

### 5. 只比速度，不验证输出

错误的预处理或算子实现也可能“跑得很快”。必须先建立数值正确性基线。

## 📝 课后自测

### Q1｜为什么 Release 后从 60× 缩小到约 3×？

>

### Q2｜为什么 `im2col + GEMM` 中 GEMM 很快，整个 Conv 仍可能慢？

>

### Q3｜为什么 ONNX 和 PNNX 不能直接与 PyTorch Runtime 比速度？

>

### Q4｜如何证明 KuiperInfer 的主要瓶颈确实在 Conv？

>

## ✅ 本节总结

1. 性能比较首先要保证 Release、线程、batch、预热和计时范围一致。
2. KuiperInfer 与成熟 Runtime 的差距主要来自 kernel、内存访问、布局、融合和调度，而非 C++/Python 表面语言差异。
3. ONNX Runtime 是理解工业推理优化的自然下一站。
4. 下一阶段的学习方法是“最小实验 → benchmark → profile → 解释结果”。

**一句话总结：**

> 从“能跑模型”进阶到“能解释每一毫秒花在哪里”，才真正进入推理系统性能工程。

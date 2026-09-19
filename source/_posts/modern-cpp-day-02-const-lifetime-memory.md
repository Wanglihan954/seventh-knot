---
title: "C++ Day 2 - Const Correctness, Lifetime & Dynamic Memory"
categories:
  - 现代 C++
tags:
  - "C++"
  - "Modern C++"
  - "const"
  - "内存管理"
  - "RAII"
  - "学习笔记"
  - "CS106L"
  - "lifetime"
  - "pointer"
  - "memory"
  - "KuiperInfer"
description: "理解 const correctness、对象生命周期、动态内存及现代 C++ 为何以 RAII 取代裸 new/delete。"
readmore: true
date: 2026-08-28
updated: 2026-09-18 16:55:49
abbrlink: "7387e265"
---
> **学习信息**
> **学习日期：** 2026-08-28（周五）
> **课程：** Stanford CS106L 2026
> **Lecture：** L3 References、L6 Pointers、L9 Const Correctness、L16 RAII
> **所属计划：** {% post_link modern-cpp-14-day-learning-plan "14 天 C++ 学习计划 · Day 2" %}

> **快速复习路径**
> **const 承诺** → **对象生命周期** → **Stack / Heap** → **RAII 替代手动资源管理**


<!-- more -->

## 今日目标

- 区分普通 `const`、const Reference 和三种 const Pointer；
- 理解 Scope、Lifetime、Stack 与 Heap；
- 识别 Memory Leak、Dangling Pointer 与返回局部地址；
- 理解为什么现代 C++ 优先使用 RAII，而不是裸 `new/delete`。

## 1. Const Correctness：限制对象或访问路径

`const` 是 API 承诺：这段代码不会通过受限路径修改对象。

```cpp
const int x = 10;       // x 本身不可修改

int y = 10;
const int& ref = y;     // 不能通过 ref 修改 y
y = 20;                 // 仍然合法
```

![const 对象与非 const 对象应提供不同的访问接口](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/cs106l-day2-const-reference.png)

> 图源：[Stanford CS106L Spring 2026 · Lecture 9](https://web.stanford.edu/class/cs106l/lectures/2026Spring-09-TemplateClasses.pdf)，第 75 页。

### 为什么参数常用 `const T&`

```cpp
void process(const Tensor& input);
```

它同时表达：

- 不复制大型对象；
- 函数不能通过 `input` 修改对象；
- 原对象不一定是 const，其他可写路径仍可修改它。

> `int`、`float` 等小型标量通常按值传递，不必机械地改成 `const T&`。

## 2. Const Pointer 矩阵

判断时分别问：`p` 能否改指向？能否通过 `*p` 修改对象？

| 声明 | `p` 能否改指向 | 能否通过 `*p` 修改对象 |
|---|:---:|:---:|
| `const int* p` | ✅ | ❌ |
| `int const* p` | ✅ | ❌ |
| `int* const p` | ❌ | ✅ |
| `const int* const p` | ❌ | ❌ |

```cpp
int x = 10;
int y = 20;

const int* p1 = &x;
p1 = &y;           // OK
// *p1 = 30;       // Error

int* const p2 = &x;
*p2 = 30;          // OK
// p2 = &y;        // Error
```

> 心法：`*` 左侧的 `const` 限制所指对象；`*` 右侧的 `const` 限制 Pointer 自身。

## 3. Const Member Function 与 Shallow Const

```cpp
class Point {
public:
    int getX() const { return x_; }
private:
    int x_ = 0;
};
```

末尾的 `const` 表示函数不通过 `this` 修改当前对象的非 `mutable` 成员。可近似理解为：

```cpp
Point const* const this;
```

普通 const 是 shallow const：它限制对象直接保存的状态，但不会递归冻结指针指向的外部对象。

```cpp
class A {
    int* p_;
public:
    void foo() const {
        *p_ = 30;          // 可能合法：修改外部对象
        // p_ = nullptr;   // 非法：修改成员 p_
    }
};
```

## 4. Scope、Lifetime 与内存位置

| 概念 | 回答的问题 |
|---|---|
| Scope | 名字在哪里可见？ |
| Lifetime | 对象现在是否仍存在？ |
| Storage | 对象的存储由谁管理？ |

![进程地址空间中的 Stack、Heap、全局变量与代码](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/cs106l-day2-memory.png)

> 图源：[Stanford CS106L Spring 2026 · Lecture 6](https://web.stanford.edu/class/cs106l/lectures/2026Spring-06-Iterators.pdf)，第 72 页。

普通局部对象具有自动存储期，离开代码块时自动销毁；`new` 创建的对象具有动态存储期，必须由所有者负责释放。

```cpp
int* p = nullptr;
{
    int x = 10;
    p = &x;
}
// *p;  // Undefined Behavior：x 的 Lifetime 已结束
```

> 还能拿到一个地址，不代表那个地址上的原对象仍然活着。

## 5. `new/delete`、Leak 与 Dangling Pointer

```cpp
int* p = new int(10);
delete p;
p = nullptr;

int* values = new int[10];
delete[] values;
values = nullptr;
```

必须匹配：`new → delete`，`new[] → delete[]`。

### Memory Leak

```cpp
void foo() {
    int* p = new int(10);
}   // 这里只销毁 p，动态对象仍存在且地址丢失
```

![异常可能绕过 delete 并造成 Memory Leak](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/cs106l-day2-memory-leak.png)

> 图源：[Stanford CS106L Spring 2026 · Lecture 16](https://web.stanford.edu/class/cs106l/lectures/2026Spring-16-RAII-SmartPointers.pdf)，第 30 页。

### Dangling Pointer / Reference

```cpp
int* p = new int(10);
delete p;
// *p;          // Undefined Behavior
p = nullptr;    // 只避免再次通过 p 误用
```

`delete` 不会自动把所有别名 Pointer 设为 `nullptr`。

```cpp
int* badPointer() {
    int x = 10;
    return &x;       // 函数结束后 x 已销毁
}

int& badReference() {
    int x = 10;
    return x;        // 返回悬空 Reference
}

int value() {
    int x = 10;
    return x;        // 返回值是安全的
}
```

## 6. RAII：让 Lifetime 跟随对象

![RAII 让资源释放跟随对象离开作用域](https://cdn.jsdelivr.net/gh/Wanglihan954/Picture-bed@img/img/cs106l-day2-raii.png)

> 图源：[Stanford CS106L Spring 2026 · Lecture 16](https://web.stanford.edu/class/cs106l/lectures/2026Spring-16-RAII-SmartPointers.pdf)，第 38 页。

RAII 的核心是：在构造函数中取得资源，在析构函数中释放资源。这样即使提前返回或抛出异常，只要对象离开 Scope，析构函数仍负责清理。

```cpp
{
    Resource resource;  // acquire
    // use resource
}                       // destructor releases it
```

> **> 现代 C++ 业务代码应优先使用 `std::vector`、`std::string`、`std::unique_ptr` 等 RAII 类型。学习裸 `new/delete` 是为了读懂 Lifetime、Ownership 与旧代码，不是为了日常手写内存管理。**

## 7. `const_cast`

`const_cast` 只改变类型系统中的 const 限定，不会改变原对象的真实可写性。

```cpp
const int x = 10;
const int* p = &x;
int* q = const_cast<int*>(p);
// *q = 20;       // Undefined Behavior：原对象本身是 const
```

如果原对象本身可写，只是当前路径带 const，去掉 const 后写入才可能合法。日常代码应优先修正 API，而不是依赖 `const_cast`。

## 8. 代码实验

### Experiment 1｜Const Pointer

运行第 2 节代码，确认 `p1` 可改指向但不可写对象，`p2` 不可改指向但可写对象。

### Experiment 2｜析构时机

```cpp
#include <iostream>

class Resource {
public:
    Resource()  { std::cout << "construct\n"; }
    ~Resource() { std::cout << "destroy\n"; }
};

int main() {
    std::cout << "before\n";
    { Resource resource; std::cout << "inside\n"; }
    std::cout << "after\n";
}
```

输出顺序应为 `before → construct → inside → destroy → after`。

### Experiment 3｜Dynamic Memory

```cpp
int* p = new int(42);
std::cout << *p << '\n';
delete p;
p = nullptr;
```

## 对话补充：返回值与接收方式共同决定是否复制

```cpp
struct Box {
    int value = 10;
    int getValue() const { return value; }
    int& getRef() { return value; }
};

Box box;
int a = box.getRef();        // 即使返回引用，这里仍复制一个 int
int& b = box.getRef();       // 保留对 box.value 的引用
b = 4;                      // box.value == 4，a == 10
const int& c = box.getValue(); // 绑定返回的临时值并延长其生命周期
// int& d = box.getValue();  // 错误：普通左值引用不能绑定该临时值
```

按值返回不等于“返回函数栈上某个马上被 delete 的变量”。返回结果按语言规则初始化调用者的对象；现代 C++ 还可能直接在目标位置构造。按引用返回则要求被引用对象仍存活，不能返回局部变量的引用。接收时 `auto` 通常去掉引用，`auto&` 才保留它。

> **生命周期延长有边界**
> `const int& x = getValue();` 可以延长直接绑定的临时结果的生命周期；如果函数已经返回悬空引用，外面再加 `const&` 不能救活对象。

### Python 类比的边界

Python 的 `a = 10; b = a; b = 20` 是重新绑定 `b`，`a` 仍为 10；列表的 `b.append(...)` 则可能修改共同引用的对象。不要把 mutable 等同于 C++ 引用、immutable 等同于复制，也不要把 Python 名字绑定硬套成 `const T*`。

## 9. 易错点

| 易错认识 | 正确判断 |
|---|---|
| Pointer 还在，对象就还在 | 两者 Lifetime 相互独立 |
| `delete p` 会把 `p` 设为 `nullptr` | `delete` 结束对象 Lifetime，不修改地址值 |
| const Reference 让原对象永久 const | 它只限制这条访问路径 |
| const Member Function 递归冻结所有内存 | 普通 const 是 shallow const |
| `const_cast` 后总能安全写入 | 原对象本身为 const 时写入是 UB |
| 函数结束会自动释放 `new` 的对象 | 只会自动销毁局部 Pointer |

## 10. 自测

- [x] `const int* p` 与 `int* const p` 分别限制什么？
- [x] 为什么大型只读参数常写成 `const T&`？
- [x] `getX() const` 中的 const 限制什么？
- [x] Scope 与 Lifetime 有什么区别？
- [x] 为什么不能返回局部变量的 Pointer 或 Reference？
- [x] Memory Leak 与 Dangling Pointer 的区别是什么？
- [ ] RAII 和 `unique_ptr` 如何自动管理对象 Lifetime？

> **一句话总结**
> 看到任何 Pointer 或 Reference，都要追问：它指向谁、谁拥有对象、对象什么时候销毁？

**下一节：** Day 3 — Sequence Containers：`std::vector` 与 `std::string`

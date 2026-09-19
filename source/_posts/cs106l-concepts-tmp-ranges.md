---
title: "CS106L 对话补充 - Concepts、TMP 与 Ranges"
categories:
  - 现代 C++
tags:
  - "C++"
  - "CS106L"
  - "Concepts"
  - "TMP"
  - "Ranges"
  - "学习笔记"
description: "补充 Concepts、模板元编程与 C++ Ranges 的关键概念，并与 14 天 Modern C++ 主线笔记建立链接。"
readmore: true
date: 2026-09-19
updated: 2026-09-18 16:57:49
abbrlink: "8856ba2d"
---
> **阅读位置**
> 接在 {% post_link modern-cpp-day-06-class-templates "C++ Day 6 - Class Templates" %} 和 {% post_link modern-cpp-day-07-lambda-algorithms-containers "C++ Day 7 - Lambda, Algorithms & Associative Containers" %} 之后。以下是课程对话的补充，不改变原 14 天计划的学习日期或测试记录。


<!-- more -->

## 1. 模板能替换类型，不代表任意类型都可用

`template<typename T>` 的函数如果使用 `a < b`，就隐含要求 T 支持该表达式。自定义结构体不会自动获得符合业务含义的排序规则，需定义比较运算或提供比较器。

```cpp
#include <concepts>

template<class T>
concept LessComparable = requires(const T& a, const T& b) {
    { a < b } -> std::convertible_to<bool>;
};

template<LessComparable T>
bool comesBefore(const T& a, const T& b) {
    return a < b;
}
```

requires 中的 a、b 用于检查表达式，不在运行时构造对象。Concept 把接口要求写出来，使不满足约束的类型更早被排除；它不会替你实现比较，也不能自动证明比较器满足严格弱序等数学性质。若函数还需要复制 T，约束也应覆盖该要求。

## 2. TMP 如何把类型作为输入

```cpp
#include <type_traits>

using Pointer = std::add_pointer_t<int>;      // 输出类型 int*
using Value = std::remove_reference_t<int&>; // 输出类型 int
static_assert(std::is_same_v<Pointer, int*>);

template<unsigned N>
struct Factorial {
    static constexpr unsigned value = N * Factorial<N - 1>::value;
};
template<>
struct Factorial<0> {
    static constexpr unsigned value = 1;
};
static_assert(Factorial<5>::value == 120);
```

类型不是存进运行时 vector 的数据；模板接收类型参数，在编译时选择或生成另一种类型。阶乘模板展示编译期数值计算，实际代码中简单常量计算通常用 constexpr 函数更易读，且需考虑溢出。

编译期处理适合固定类型和配置，但会增加编译时间、错误信息复杂度，也可能增大二进制。普通函数的常量调用也可能被优化器折叠，不能说只有 TMP 才能提前算出结果。

### 类型序列为什么能顺序执行 apply

```cpp
struct State { int x = 0; };
struct AddOne { static void apply(State& s) { ++s.x; } };
struct Double { static void apply(State& s) { s.x *= 2; } };

template<class... Steps>
void applySequence(State& s) {
    (Steps::apply(s), ...); // C++17 逗号折叠，按包中顺序执行
}

// State s;
// applySequence<AddOne, Double>(s); // s.x == 2
```

顺序执行来自 applySequence 的实现，名字 apply 没有自动遍历的魔法。类型序列在编译期确定，修改 s 的操作仍可在运行时发生；这也不同于“所有 forward 都在编译期运行”。`typename... Steps` 是类型参数包，`...` 在这里展开调用。

## 3. Range、View 与容器分别是什么

| 概念 | 作用 | 例子 |
|---|---|---|
| Range | 可取得起点与终点、按规则遍历的范围 | vector、数组、view |
| View | 满足 view 要求的 range 类型，适合轻量组合 | filter_view、transform_view |
| 容器 | 管理存储的元素 | vector、set |

`std::ranges::find(v, 3)` 让算法接收整个范围。Ranges 还提供约束、投影及可组合视图，能力不限于省略 begin/end。View 不是某一个叫 View 的统一类，也不是函数本身。

```cpp
#include <ranges>
#include <vector>

std::vector<int> values{1, 2, 3, 4};
auto view = values
    | std::views::filter([](int x) { return x % 2 == 0; })
    | std::views::transform([](int x) { return x * 10; });

std::vector<int> result;
for (int x : view) {
    result.push_back(x); // 得到 {20, 40}；values 仍为 {1, 2, 3, 4}
}
```

构建该管道不预先生成全部结果；遍历时逐元素筛选、变换。这里 transform 按值返回，所以遍历不会修改原元素。另一些 view 可以暴露可写引用，不能把“惰性”理解为“永不修改数据”。

> **View 的寿命与失效规则**
> 上例借用 values，不能让 view 比 values 活得更久；底层容器扩容、删改也可能使迭代器或缓存失效。有些 view 拥有底层范围，因此“view 永远不拥有数据”也不准确。不要假设修改底层后，已缓存的 filter_view 会自动从头重新寻找匹配项。

### ranges::to 是物化结果

```cpp
// C++23，需要标准库实现支持
auto collected = view | std::ranges::to<std::vector<int>>();
```

它把遍历结果收集进实际容器；上面的循环则可用于 C++20。Ranges/Views 属于 C++20，而 ranges::to 属于 C++23，不要仅开启 C++20 就假设二者都可用。

Python 的 `(x for x in values)` 是生成器表达式，不是元组；可用来类比延迟取值，但生成器通常一次性消费，C++ view 是否可重复遍历取决于它的范围能力。

## 4. 自测：先解释，再运行

- 返回借用局部 vector 的 view，为什么仍会悬空？
- filter + transform 为什么没有生成两个中间 vector？
- 一个类型有 operator<，是否就保证它能作为正确的排序规则？
- applySequence 的类型顺序在编译期确定，为什么数据操作仍可发生在运行时？

## 来源

整理自 [CS106L课程讨论](chatgpt-conversation://6a8eac16-6d48-83ec-ae49-03a6936257e1) 的文字记录；未将不可见的课件截图当作已核验内容。

规范核对：[C++23 工作草案 N4950](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/n4950.pdf) 的 Range conversions；[当前工作草案：ranges::to](https://eel.is/c++draft/range.utility.conv.to)。

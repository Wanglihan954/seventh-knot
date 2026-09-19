---
title: "CS106L 对话复习索引"
categories:
  - 现代 C++
tags:
  - "C++"
  - "CS106L"
  - "复习"
  - "学习笔记"
description: "按问题索引 14 天 Modern C++ 学习中的关键概念，便于从具体疑问回到对应课程笔记。"
readmore: true
date: 2026-09-18 16:57:54
updated: 2026-09-18 16:57:54
abbrlink: "c4fb33cf"
---
来源：[CS106L课程讨论](chatgpt-conversation://6a8eac16-6d48-83ec-ae49-03a6936257e1)。按真实提问补充笔记，保留原计划日期与既有测试记录；新增内容不代表已经通过新测试。

| 当时的问题 | 复习入口 |
|---|---|
| 函数传引用了，为什么循环里仍是复制？ | {% post_link modern-cpp-day-01-pointer-reference-iterator "C++ Day 1 - Pointer, Reference & Iterator" %} |
| getV 返回引用，x 就一定能修改原值吗？ | {% post_link modern-cpp-day-02-const-lifetime-memory "C++ Day 2 - Const Correctness, Lifetime & Dynamic Memory" %} |
| 初始化列表只是节省时间吗？const 能限制指针指向的数据吗？ | {% post_link modern-cpp-day-04-classes-const-correctness "C++ Day 4 - Classes & Const Correctness" %} |
| Entity* 和 Entity e = p 是一回事吗？ | {% post_link modern-cpp-day-05-inheritance-polymorphism "C++ Day 5 - Inheritance & Polymorphism" %} |
| 模板为什么不能接受任意自定义类型？ | {% post_link modern-cpp-day-06-class-templates "C++ Day 6 - Class Templates" %} |
| Lambda 与重载 operator() 有什么关系？ | {% post_link modern-cpp-day-07-lambda-algorithms-containers "C++ Day 7 - Lambda, Algorithms & Associative Containers" %} |
| operator= 为什么返回 Widget&？ | {% post_link modern-cpp-day-08-copy-semantics "C++ Day 8 - Special Member Functions & Copy Semantics" %} |
| const& 能接临时值，为什么还需要 &&？ | {% post_link modern-cpp-day-09-move-semantics "C++ Day 9 - Move Semantics" %} |
| 异常退出为什么还需要清理资源？ | {% post_link modern-cpp-day-10-raii-unique-ptr "C++ Day 10 - RAII & unique_ptr" %} |
| weak_ptr 有什么用，control block 何时消失？ | {% post_link modern-cpp-day-11-smart-pointer-ownership "C++ Day 11 - shared_ptr, weak_ptr & Ownership" %} |
| include 是否自动带入 cpp？make 是否就是编译器？ | {% post_link modern-cpp-day-12-cmake-project-structure "C++ Day 12 - CMake & C++ Project Structure" %} |
| TMP 如何操作类型？View 是函数还是类？to 做什么？ | {% post_link cs106l-concepts-tmp-ranges "CS106L 对话补充 - Concepts、TMP 与 Ranges" %} |

> [!note] 资料边界
> 已分页读取该对话文字记录。课件附件与最后生成的 Markdown 文件未在本次读取中获得完整可验证内容，因此没有复制附件或声称逐页核对课件。对话中的口语化解释经整理后写入笔记，不能把原回答当作 C++ 规范。

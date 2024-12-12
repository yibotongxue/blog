# 输出的那些事

说到输出，我们可能更多的熟悉了 `printf` 和 `std::cout` ，但事实上现代 `C++` 还有很多输出相关的方法和技巧，这里记录我遇到的一些。

## 回顾经典的输出方式

在介绍现代 `C++` 的输出相关的方法和技巧之前，我们先回顾 `C` 和 `C++` 的经典的输出方式，经典的输出方式无外乎就是 `printf` 和 `std::cout` 了。

### `printf`

`C` 语言最经典的输出方式就是 `printf` 了，很多学校开设的第一门计算机专业课教的都是 `C` 语言，第一节课经常都是输出 `Hello World` ，用的就是 `printf` ，可以说是很多同学第一个使用的函数，就打印 `Hello World` ，其程序可以写作这样

```c
#include <cstdio>

int main() {
    printf("Hello World");
    return 0;
}
```

但事实上，等到学到后面会发现 `printf` 除了简单的打印字符串，还有强大的格式化输出，其一般的函数原型为

```c
int printf( const char* format, ... );
```

其一般的作用可以描述为将一个格式化的字符串打印在标准输出，其参数 `format` 表示将要输出到标准输出的内容，可以包含以 `%` 开头的格式说明符，用以占位，并在实际输出的时候替换为额外的参数的值，其返回值在成功打印的时候为输出的字符数，否则为一个负数，并会设置一些标识信号区别不同的错误。更为具体的内容可以参考[这里](https://cplusplus.com/reference/cstdio/printf/)。

关于格式说明符，其一般的形式为

```
%[flags][width][.precision][length]specifier
```

中文的意思可以对应为（参考了[这篇文章](https://blog.csdn.net/qq_25544855/article/details/81146800)）

```
%[标志][最小宽度][.精度][类型长度]类型。
```

这里每一个部分可能的参数都有很多，更适合在需要的时候查阅，比较好的查阅资料可以是[这个网页](https://cplusplus.com/reference/cstdio/printf/)或者[这篇文章](https://blog.csdn.net/qq_25544855/article/details/81146800)。

### `std::cout`

`printf` 存在一些问题，比如使用起来也不方便，你需要指定所有的格式，错误处理能力有限，错误的格式只有到运行时才会被发现， `C++` 提供了更为安全和更加便捷的输出方式，也就是 `std::cout` 。

与 `printf` 不同的是， `std::cout` 实际上是一个 `std::ostream` 实例，而不是一个函数，其输出通过重载 `<<` 操作符实现，基本地介绍可以参考[这里](https://en.cppreference.com/w/cpp/io/cout)和[这里](https://cplusplus.com/reference/iostream/cout/)。

在 `C++` 程序中，我更推荐使用 `std::cout` 而不是 `printf` ，尽管很多人为了 `printf` 的高效性和格式化的方便而更倾向于使用 `printf` ，但事实上，我认为这个高效性的价值在很多地方并不是很大，除非你是在算法竞赛，但这不是这里要讨论的范围，而所谓格式化的方便，或许可以成为一个理由，但相比之下很多时候还是 `std::cout` 更为合适，具体的可以参考这个[c++ faq](https://isocpp.org/wiki/faq/input-output#iostream-vs-stdio)，其中介绍的 `std::cout` 的优点主要是：

1. 更强的类型安全。 `std::cout` 会在编译期就检查输出的对象是否有对应的 `<<` 运算符重载，而 `printf` 如果写错了只有在运行时才能发现。

2. 更不易错。 `printf` 要求你的格式说明符必须与值对应，而 `std::cout` 没有这个冗余的约束，降低了错误率。

3. 更强的可拓展性。 `std::cout` 通过重载 `<<` 运算符实现输出，因而你可以任意的重载自己想要的输出，而不需破坏已有的代码，而这在 `printf` 是很难实现的。

4. 可继承性。 `std::cout` 是一个 `std::ostream` 类的对象，你也可以继承自己的流类，实现很多奇怪的操作。

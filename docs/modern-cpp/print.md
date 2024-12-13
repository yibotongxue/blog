# 输出的那些事

说到输出，我们可能更多的熟悉了 `printf` 和 `std::cout` ，但事实上现代 `C++` 还有很多输出相关的方法和技巧，这里记录我遇到的一些。

## `printf`

在介绍现代 `C++` 的输出相关的方法和技巧之前，我们先回顾 `C` 和 `C++` 的经典的输出方式，经典的输出方式无外乎就是 `printf` 和 `std::cout` 了。

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

## `std::cout`

`printf` 存在一些问题，比如使用起来不方便，你需要指定所有的类型，错误处理能力有限，错误的格式只有到运行时才会被发现， `C++` 提供了更为安全和更加便捷的输出方式，也就是 `std::cout` 。

### 与 `printf` 的比较

与 `printf` 不同的是， `std::cout` 实际上是一个 `std::ostream` 实例，而不是一个函数，其输出通过重载 `<<` 操作符实现，基本地介绍可以参考[这里](https://en.cppreference.com/w/cpp/io/cout)和[这里](https://cplusplus.com/reference/iostream/cout/)。

在对于输出的处理上，二者的原理也是不同的。 `std::cout` 基于流的概念，而 `printf` 基于对格式字符串的解析和处理。关于 `C++` 中流的总体介绍，可以参考[这里](https://cplusplus.com/reference/iolibrary/)，对于流的概念，简单的理解是一个从源流向目的地的字节流，一般的介绍可以参考[微软文档](https://learn.microsoft.com/en-us/dotnet/api/system.io.stream?view=net-9.0&redirectedfrom=MSDN#remarks)。流事实上是对数据流动的抽象，这个数据的字符数通常是未知的，你在需要的时候从流中获取，流需要的时候想流发送，而不需要事先确定字符流的大小；同时流屏蔽了具体的输入和输出设备，用户不需要关心源和目的地的细节，而以统一的接口进行对流的数据的操作。流具有一个特别的特性就是它是单次传输的，你可以向流请求很多数据，但是当流提供给你了一个数据，那就不会再提供这个相同的数据，因而对于流的操作我们经常需要使用缓冲区，将从流获取的数据保存在缓冲区中。更为具体的内容可以参考这个[StackOverflow问答](https://stackoverflow.com/questions/25651924/what-is-a-stream-exactly)、这个[StackOverflow问答](https://stackoverflow.com/questions/12145357/what-is-a-stream-in-c?rq=3)和这个[StackOverflow问答](https://stackoverflow.com/questions/5144794/what-does-stream-mean-what-are-its-characteristics?rq=3)。

在 `C++` 程序中，更推荐使用 `std::cout` 而不是 `printf` ，尽管很多人为了 `printf` 的高效性和格式化的方便而更倾向于使用 `printf` ，但事实上，我认为这个高效性的价值在很多地方并不是很大，除非你是在算法竞赛，但这不是这里要讨论的范围，而所谓格式化的方便，或许可以成为一个理由，但相比之下很多时候还是 `std::cout` 更为合适，具体的可以参考这个[c++ faq](https://isocpp.org/wiki/faq/input-output#iostream-vs-stdio)，其介绍的是 `iostream` 与 `cstdio` 的选择问题，其中介绍的 `std::cout` 的优点主要是：

1. 更强的类型安全。 `std::cout` 会在编译期就检查输出的对象是否有对应的 `<<` 运算符重载，而 `printf` 如果写错了只有在运行时才能发现。

2. 更不易错。 `printf` 要求你的格式说明符必须与值对应，而 `std::cout` 没有这个冗余的约束，降低了错误率。

3. 更强的可拓展性。 `std::cout` 通过重载 `<<` 运算符实现输出，因而你可以任意的重载自己想要的输出，而不需破坏已有的代码，而这在 `printf` 是很难实现的。

4. 可继承性。 `std::cout` 是一个 `std::ostream` 类的对象，你也可以继承自己的流类，实现很多奇怪的操作。

### 重载新的输出函数

一般而言，内建完整类型的 `<<` 重载是定义在 `ostream` 类内，作为其成员函数（事实上是 `basic_ostream` 类），而对于我们自定义的类型可以通过定义 `<<` 函数来实现，而重载时就是重载为输出已经写入 `ostream` 的内建类型和你已经重载了的类型的组合，一般地定义为

```cpp
std::ostream& operator<<(std::ostream& o, const Object& val) {
    // ...
    return o;
}
```

一般我们打印一个类的对象，经常需要访问其私有变量，因而经常将这个函数定义为类的友元函数。

### 输入/输出操纵符

`printf` 通过格式说明符实现输出的格式控制，而 `C++` 也提供了许多的输出操纵符来实现对输出的控制，并且不仅仅是格式的控制，而有很多其他的作用，官方地介绍可以参考[这里](https://en.cppreference.com/w/cpp/io/manip)，但这很不详细，具体的内容可以参考这篇[知乎文章](https://zhuanlan.zhihu.com/p/682804225)。与 `printf` 通过格式说明符控制格式不同的是，这里大部分的输出操纵符都是函数或者函数模板，其原理相对也比较复杂（当然， `C++` 的封装屏蔽了大部分的细节，所以使用的时候不需要了解那么复杂的原理）。这里一并介绍输入/输出操纵符。

输入/输出操纵符使用的时候通常是通过 `>>` 和 `<<` 运算符重载，比如这样的使用

```cpp
std::cout << std::fixed << std::setprecision(2) << 3.14159 << std::endl;  // 输出 3.14 并换行
```

这里的 `std::fixed` 、 `std::setprecision` 和 `std::endl` 都是输出操纵符。

一般地输入/输出操纵符的原理可以根据是否带有参数分为两类，即不带参数和带有参数的。需要注意的是，作为函数，这些输入/输出操纵符都是带有参数的，这里所说的带不带参数指的是在使用的时候是否带参数，比如上面的例子中 `std::fixed` 和 `std::endl` 就是我们所说的所谓“不带参数”的输入/输出操纵符，而 `std::setprecision` 就是带参数的输入/输出操纵符。

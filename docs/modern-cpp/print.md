# 从 `printf` 到 `std::print`

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

一般地输入/输出操纵符根据是否带有参数分为两类，即不带参数和带有参数的。需要注意的是，作为函数，这些输入/输出操纵符都是带有参数的，这里所说的带不带参数指的是在使用的时候是否带参数，比如上面的例子中 `std::fixed` 和 `std::endl` 就是我们所说的所谓“不带参数”的输入/输出操纵符，而 `std::setprecision` 就是带参数的输入/输出操纵符。一般而言，这两种操纵符的操纵实现是不同的。

#### 不带参数的输入/输出操纵符

先给出总的回答，不带参数的输入/输出操纵符事实上是一个函数，接收一个流的引用，对齐进行操作后返回其。

正如我们上面所说，输入/输出操纵符的使用是通过重载实现与流的交互，但这个交互具体是什么呢？

一般地，我们使用的 `std::cin` 和 `std::cout` 都是输入或输出流的一种，而所有的输入或输出流的类都是 `std::ios_base` 类的子类，关于这个类，可以参考[这里](https://en.cppreference.com/w/cpp/io/ios_base)。而所谓的交互，事实上是通过重载 `<<` 或 `>>` 操作符实现的，在这个[页面](https://en.cppreference.com/w/cpp/io/basic_ostream/operator_ltlt)中有关于输出流类 `<<` 重载的情况，可以看到除了上面提到的完整内建类型，还有三个函数指针的重载，也即

```cpp
basic_ostream& operator<<(
    std::ios_base& (*func)(std::ios_base&) );

basic_ostream& operator<<(
    std::basic_ios<CharT, Traits>& (*func)(std::basic_ios<CharT, Traits>&) );

basic_ostream& operator<<(
    std::basic_ostream<CharT, Traits>& (*func)

        (std::basic_ostream<CharT, Traits>&) );
```

事实上，一般的不带参数的输入/输出操纵符的定义就是一个函数或函数模板，接受一个流的引用（比如第一个的 `std::ios_base&` ），然后返回一个流的引用（第一个中就是 `std::ios_base&` ），在使用的时候输入/输出操纵符会隐式转换为函数指针，而上面重载了的 `<<` 操作符就接受这样的函数指针作为参数，而重载的实现一般就是调用这个函数作用于 `*this` ，比如函数是 `func` ，即调用 `func(*this)` 。

操纵符函数又是如何实现对输入输出的操纵的呢？一般地就是调用具体的流对象的方法来实现，比如上面提到的三个重载支持三种流类型（事实上是继承的关系，也即 `std::basic_ios` 模板类是 `std::ios_base` 的子类，而 `std::basic_ostream` 模板类又是 `std::basic_ostream` 特定模板类的子类，值得一提的是第二个继承是虚继承）分别有各自的不同的方法可以实现改变输入和输出，具体的 `std::ios_base` 可以参考[这个页面](https://en.cppreference.com/w/cpp/io/ios_base)， `std::basic_ios` 可以参考[这个页面](https://en.cppreference.com/w/cpp/io/basic_ios)， `std::basic_ostream` 可以参考[这个页面](https://en.cppreference.com/w/cpp/io/basic_ostream)。当然， `C++` 标准没有具体的要求如何实现，上面仅仅是一种可能的实现。

上面讲的可能有些抽象，这里举 `std::endl` 的例子。这个输出操纵符相信我们经常用到，尽管很多人用的时候并没有追究过到底是什么原理，仅仅是作为一个换行符使用。这里我们可以指出 `std::endl` 事实上是一个函数模板，其定义为

```cpp
template< class CharT, class Traits >
std::basic_ostream<CharT, Traits>& endl( std::basic_ostream<CharT, Traits>& os );
```

`cppreference` 中对于这个函数的介绍是

> Inserts a newline character into the output sequence os and flushes it as if by calling os.put(os.widen('\n')) followed by os.flush().
>
> This is an output-only I/O manipulator, it may be called with an expression such as out << std::endl for any out of type std::basic_ostream.

也就是可以这样实现

```cpp
template< class CharT, class Traits >
std::basic_ostream<CharT, Traits>& endl( std::basic_ostream<CharT, Traits>& os ) {
    os.put(os.widen('\n'));
    return os.flush();
}
```

#### 带参数的输入/输出操纵符

我们上面分析了不带参数的输入/输出操纵符的实现原理，也就是流重载了接受函数指针作为参数的 `<<` 运算符，从而实现调用操纵符函数以实现，也就是说实际上代码中的操纵符不是作为函数而是作为函数指针，但如果操纵符带有参数呢？很显然，一方面 `C++` 没有重载适合其参数的函数指针的 `<<` 运算符，另一方面我们必须指定其参数，因而像上面那样的方法就行不通了。

事实上，带有参数的输入/输出操纵符的参数不再是流对象的引用，而是特定的参数类型，比如 `setsprecision` 需要接受精度，因而参数类型是 `int` ；返回值也不是流对象的引用，而是未明确的类型，具体的可以参考[这个页面](https://en.cppreference.com/w/cpp/io/manip)。

操纵的实现原理就是，操纵符根据参数返回一个对象（这个对象的具体类型标准没有规定，编译器厂商可以自行设计， `G++-13` 的 `setsprecision` 就是一个只包含精度数值的结构体），并重载这个对象类型与流的相应的 `<<` 和 `>>` 运算符，在这个运算符的实现中实现对流的修改和设置。

以 `std::setprecision` 为例，其函数原型就是

```cpp
/*unspecified*/ setprecision( int n );
```

`cppreference` 对其的介绍是

> When used in an expression out << setprecision(n) or in >> setprecision(n), sets the precision parameter of the stream out or in to exactly n.

一般地在重载 `<<` 和 `>>` 运算符的时候需要调用流对象的 `precision` 方法，这个方法定义在 `std::ios_base` ，参考[这里](https://zh.cppreference.com/w/cpp/io/ios_base/precision)。 `G++-13` 的实现为

```cpp
struct _Setprecision { int _M_n; };

/**
 *  @brief  Manipulator for @c precision.
 *  @param  __n  The new precision.
 *
 *  Sent to a stream object, this manipulator calls @c precision(__n) for
 *  that object.
*/
inline _Setprecision
setprecision(int __n)
{ return { __n }; }

template<typename _CharT, typename _Traits>
  inline basic_istream<_CharT, _Traits>&
  operator>>(basic_istream<_CharT, _Traits>& __is, _Setprecision __f)
  {
    __is.precision(__f._M_n);
    return __is;
  }

template<typename _CharT, typename _Traits>
  inline basic_ostream<_CharT, _Traits>&
  operator<<(basic_ostream<_CharT, _Traits>& __os, _Setprecision __f)
  {
    __os.precision(__f._M_n);
    return __os;
  }
```

:::tip
事实上我认为可以利用函数式编程的思想，返回一个函数对象，接受流引用作为参数，返回流引用，比如这样实现 `setprecision`

```cpp
using func_type = std::ios_base&(std::ios_base&);
inline func_type* setprecision(int n) {
    return [n](std::ios_base& str) -> std::ios_base& {
        str.precision(n);
        return str;
    };
}
```

当然，这是不能通过编译的，因为我们的 `lambda` 表达式是带捕获的，会被解释为函数对象而不是一般的函数，因而不能转换为函数指针。我不清楚 `C++` 标准规定重载的为什么是函数指针而不是函数对象，也就是为什么不用 `std::function` ，如果用 `std::function` 可以简化带参数的输入/输出操纵符的实现，复用不带参数的实现，可能是有别的考虑吧？
:::

## 现代 `C++` 中的输出

上面讲了 `C` 和 `C++` 的输出方法，我们看到了一些矛盾，就效率和格式化的方便性而言， `printf` 有一定的优势，但就代码的安全性、可读性、可拓展性等方面来看， `std::cout` 更好，可能会给选择带来一些纠结。但 `C++20` 则提供了更为方便的格式化方法 `std::format` ，以及 `C++23` 提供了更为易用和更易格式化的 `std::print` 和 `std::println` ，基本上已经可以让我们不需要使用 `printf` 了。

### `std::format`

`C++20` 引入了 `std::format` 方法，接受一个格式控制字符串和若干参数，返回一个替换了占位符的字符串，参考[这个页面](https://en.cppreference.com/w/cpp/utility/format/format)。一般我们使用的是这个定义

```cpp
template< class... Args >
std::string format( std::format_string<Args...> fmt, Args&&... args );
```

比较简单的使用示例可以是

```cpp
#include <format>
#include <iostream>

int main() {
    std::cout << std::format("Hello, C++{}\n", 23);  // 输出 Hello, C++23
    return 0;
}
```

事实上有些类似 `python` 中的如下代码

```python
print(f"Hello, C++{23}")
```

当然， `std::format` 还有很多更为复杂的用法，我也不是很了解，仅仅贴一个官方提供的使用示例如下

```cpp
#include <format>
#include <iostream>
#include <string>
#include <string_view>

template<typename... Args>
std::string dyna_print(std::string_view rt_fmt_str, Args&&... args)
{
    return std::vformat(rt_fmt_str, std::make_format_args(args...));
}

int main()
{
    std::cout << std::format("Hello {}!\n", "world");

    std::string fmt;
    for (int i{}; i != 3; ++i)
    {
        fmt += "{} "; // constructs the formatting string
        std::cout << fmt << " : ";
        std::cout << dyna_print(fmt, "alpha", 'Z', 3.14, "unused");
        std::cout << '\n';
    }
}
```

其实现原理比较复杂，远不是看起来那么简单，我也没有深入地了解，不在此讲述。关于更多的使用方法和介绍，可以参考这篇[文章](https://developer.aliyun.com/article/1463275)，写得很详细。读完这篇[文章](https://developer.aliyun.com/article/1463275)，你可能会觉得这个跟 `printf` 很像，在一些方面确实是这样，特别是作为输出的时候，但 `std::format` 更安全，也更符合 `C++` 程序设计的哲学，更为重要的， `std::format` 返回的是一个字符串，不仅可以用来输出，也可以直接使用字符串，比如作为异常的信息等。

可以说，引入了 `std::format` ， `printf` 的格式化方便的优势就已经不明显了，基本上可以实现用流输出和 `std::format` 替换 `printf` 了。

### `std::print` 和 `std::println`

`C++23` 引入了 `std::print` 和 `std::println` ，基本上使得输出变得十分方便，完全可以替代 `printf` 了。看到函数名我们就能反应过来，这可能是借鉴了 `python` 和 `Java` 的输出，特别是 `std::println` 的命名。来看 `cppreference` 的介绍，常用的应该是

```cpp
// std::print
template< class... Args >
void print( std::format_string<Args...> fmt, Args&&... args );

template< class... Args >
void print( std::FILE* stream,
            std::format_string<Args...> fmt, Args&&... args );

// std::println
template< class... Args >
void println( std::format_string<Args...> fmt, Args&&... args );

template< class... Args >
void println( std::FILE* stream,
              std::format_string<Args...> fmt, Args&&... args );

void println();

void println( std::FILE* stream );
```

可以参考这个[页面](https://en.cppreference.com/w/cpp/io/print)和这个[页面](https://en.cppreference.com/w/cpp/io/println)。比较常用的应该是使用跟 `std::format` 相似的参数，这事实上就跟 `python` 的输出十分类似了，同时支持更复杂的操作，比如对文件流的操作。

`std::print` 和 `std::println` 基本上是结合了 `printf` 和流输出的优势，方便格式化，更为安全，一般地推荐使用 `std::print` 和 `std::println` 作为输出方法。

## 总结

经过这么多的讨论，我们了解了 `printf` 、 `std::cout` 、 `std::format` 和 `std::print` 和 `std::println` 的一些内容，一般地认为，在 `C++` 程序中，一般可以用 `std::cout` 作为输出方法，当然，如果确实需要使用 `printf` ，也是没有问题的。如果编译器支持 `std::format` ，可以更好的实现格式化字符串，从而输出，将简化 `std::cout` 的使用，提高代码可读性。如果编译器支持 `std::print` 和 `std::println` ，则完全可以用 `std::print` 和 `std::println` 替换 `std::cout` 和 `std::format` 的组合或者 `printf` 。考虑到 `std::print` 和 `std::println` 的支持可能还不普遍，在日常的开发中推荐的是使用 `std::cout` 和 `std::format` ，除非对性能有特别的要求。

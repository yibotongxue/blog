# iota

一些时候我们需要对一个数组、一个链表或其他填充一个递增的序列，很多时候会是其下标，一些时候我们可能希望得到类似 `Python` 中的 `range` 的迭代器或者视图，等等，这是我们可以使用 `iota` 。

## `std::iota`

从 `C++11` 开始就可以使用 `std::iota` 了，其介绍可以参考[这里](https://en.cppreference.com/w/cpp/algorithm/iota)。简单的来说，其作用就是将两个迭代器之间的元素填充为从一系列依次自增的值。其定义为

```cpp
template< class ForwardIt, class T >
void iota( ForwardIt first, ForwardIt last, T value );
```

作用是将 [first, last) 之间的元素填充为从 `value` 开始的依次自增的值，也就是

```cpp
*first   = value;
*++first = ++value;
*++first = ++value;
*++first = ++value;
// repeats until “last” is reached
```

官方提供的一种可能的实现为

```cpp
template<class ForwardIt, class T>
constexpr // since C++20
void iota(ForwardIt first, ForwardIt last, T value)
{
    for (; first != last; ++first, ++value)
        *first = value;
}
```

这里提供一个可能的使用方法

```cpp
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
  std::vector<int> vec(10);
  std::iota(vec.begin(), vec.end(), 1);
  // 得到的 vec 为 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
}
```

官网还提到了可以用来生成一个容器的迭代器，有些类似指针，这样可以避免不必要的、昂贵的拷贝，同时可以对一些不支持 `shuffle` 或其他方法的容器进行支持，比如官网提供的示例

```cpp
#include <algorithm>
#include <iomanip>
#include <iostream>
#include <list>
#include <numeric>
#include <random>
#include <vector>
 
class BigData // inefficient to copy
{
    int data[1024]; /* some raw data */
public:
    explicit BigData(int i = 0) { data[0] = i; /* ... */ }
    operator int() const { return data[0]; }
    BigData& operator=(int i) { data[0] = i; return *this; }
    /* ... */
};
 
int main()
{
    std::list<BigData> l(10);
    std::iota(l.begin(), l.end(), -4);
 
    std::vector<std::list<BigData>::iterator> v(l.size());
    std::iota(v.begin(), v.end(), l.begin());
    // Vector of iterators (to original data) is used to avoid expensive copying,
    // and because std::shuffle (below) cannot be applied to a std::list directly.
 
    std::shuffle(v.begin(), v.end(), std::mt19937{std::random_device{}()});
 
    std::cout << "Original contents of the list l:\t";
    for (const auto& n : l)
        std::cout << std::setw(2) << n << ' ';
    std::cout << '\n';
 
    std::cout << "Contents of l, viewed via shuffled v:\t";
    for (const auto i : v)
        std::cout << std::setw(2) << *i << ' ';
    std::cout << '\n';
}
```

## `std::ranges::views::iota`, `std::ranges::iota_view`

有些时候我们可能不需要实际的容器，而可以使用视图，这更类似于 `Python` 中的 `range` ， `C++20` 提供了类似的方法，`std::ranges::views::iota` 和 `std::ranges::iota_view`，参考[这个](https://zh.cppreference.com/w/cpp/ranges/iota_view)。

这两者的区别，简单的一个理解就是 `std::ranges::views::iota` 实际上是一个工厂方法，返回一个视图，这个视图不持有数据，而是动态的计算数据，也就是懒计算；`std::ranges::iota_view` 是一个实际的数据结构，会创建一个对象，包含所有的数据，提供对这些数据的视图访问。通常的， `std::ranges::views::iota` 使用的时候不需要实例化对象，而 `std::ranges::iota_view` 应该将其实例化。

下面是官网提供的示例代码

```cpp
#include <algorithm>
#include <iostream>
#include <ranges>
 
struct Bound
{
    int bound;
    bool operator==(int x) const { return x == bound; }
};
 
int main()
{
    for (int i : std::ranges::iota_view{1, 10})
        std::cout << i << ' ';
    std::cout << '\n';
 
    for (int i : std::views::iota(1, 10))
        std::cout << i << ' ';
    std::cout << '\n';
 
    for (int i : std::views::iota(1, Bound{10}))
        std::cout << i << ' ';
    std::cout << '\n';
 
    for (int i : std::views::iota(1) | std::views::take(9))
        std::cout << i << ' ';
    std::cout << '\n';
 
    std::ranges::for_each(std::views::iota(1, 10),
                          [](int i){ std::cout << i << ' '; });
    std::cout << '\n';
}
```

事实上，这有些类似类似 `Python` 中的 `range` ，比如这样的代码

```cpp
#include <algorithm>
#include <iostream>
#include <ranges>

int main() {
  for (int i : std::views::iota(0, 10)) {
    std::cout << i << ' ';
  }
}
```

有些类似于下面的 `Python` 代码

```python
for i in range(10):
  print(i, ' ')
```

关于在 `C++` 中实现 `Python` 中的 `range` ，可以参考[这个代码审查](https://codereview.stackexchange.com/questions/268108/c20-python-like-range-class)。

## `std::ranges::iota`

`C++23` 引入了 `std::ranges::iota` ，可以更方便的填充一个数组为递增的序列，参考[这里](https://en.cppreference.com/w/cpp/algorithm/ranges/iota)。其作用基本与 `std::iota` 类似，但引入了范围的概念，从而可以不用给出输入和输出迭代器，而仅仅是给出一个范围，一般是一个容器等。

简单的使用可以是

```cpp
#include <algorithm>
#include <ranges>
#include <vector>
 
int main()
{
    std::vector<int> vec(10);
    std::ranges::iota(vec, 1);
}
```

下面是官方参考手册给出的示例代码，基本起到的作用与 `std::iota` 差不多

```cpp
#include <algorithm>
#include <functional>
#include <iostream>
#include <list>
#include <numeric>
#include <random>
#include <vector>
 
template <typename Proj = std::identity>
void println(auto comment, std::ranges::input_range auto&& range, Proj proj = {})
{
    for (std::cout << comment; auto const &element : range)
        std::cout << proj(element) << ' ';
    std::cout << '\n';
}
 
int main()
{
    std::list<int> list(8);
 
    // Fill the list with ascending values: 0, 1, 2, ..., 7
    std::ranges::iota(list, 0);
    println("List: ", list);
 
    // A vector of iterators (see the comment to Example)
    std::vector<std::list<int>::iterator> vec(list.size());
 
    // Fill with iterators to consecutive list's elements
    std::ranges::iota(vec.begin(), vec.end(), list.begin());
 
    std::ranges::shuffle(vec, std::mt19937 {std::random_device {}()});
    println("List viewed via vector: ", vec, [](auto it) { return *it; });
}
```

# 深入了解 Java 语言

本文介绍 Java 语言的一些知识，系课程第五章之笔记。

## 字段变量与局部变量

较简单的理解，字段变量定义在类中，而局部变量是方法中定义的变量或方法的参变量。从内存和语法两个角度理解，

1. 内存角度，字段变量系对象的一部分，因而存在堆中，而局部变量存在栈中。二者的生命周期亦有不同，并注意字段变量可以默认初始化，而局部变量不会，未经初始化不可使用。
2. 语法角度，字段变量系对象中的变量，可用 `public`, `private`, `static`, `final` 等修饰，而局部变量不可由访问控制符和 `static` 变量，二者都可用 `final` 修饰。

## 不定长参数

Java10 引入了不定长参数，基本的用法是 `func(type ...var)` ，比如

```java
int sum(int ...nums) {
    int s = 0;
    for (int n : nums) {
        s += n;
    }
    return s;
}
```

## 动态类型确定

动态类型之确定，可用 `instanceof` 关键字，基本的用法为 `var instanceof type` ，其结果为一个 `boolean` 类型，可直接用做 `if` 语句之条件。

## 虚方法调用

`Java` 默认进行虚方法调用，没有 `virtual` 标记，也无须添加注解 `Override` ，凡子类重写之父类方法，除 `static` 、 `private` 修饰之方法外，其调用不受调用者声明之类型影响，而仅取决于实例的实际类型。

## 构造顺序

类的实例构造，先构造父类，再按照声明顺序进行字段的初始化赋值，最后调用构造函数中的其他语句，父类之构造，也按此顺序进行。父类构造函数中存在虚方法调用的，仍遵循虚方法调用之规则，但调用之时子类之字段变量尚未赋值，故尽量不应在构造函数进行函数调用，仅 `final` 方法不会被子类覆盖，因而可以安全调用。

静态初始化没有确定的时机，但一定在实例初始化之前完成。

## 对象清除

`Java` 不需要程序员手动释放资源，而由 `JVM` 的单独的垃圾回收线程实现，每一个对象有一个引用计数器，当其引用计数为 0 时，则可以被清除，这会由 `JVM` 自动完成。程序员可以使用 `System.gc()` 建议 `JVM` 进行垃圾回收，但这仅是建议。

需要特殊关闭之资源，若为 `java.lang.AutoCloseable` 之实现，得使用 `try-with-resources` 语句，比如

```java
static String readFirstLineFromFile(String path) throws IOException {
	try (FileReader fr = new FileReader(path);
	    BufferedReader br = new BufferedReader(fr)) {
	    return br.readLine();
	}
}
```

更多的关于 `try-with-resources` 的内容，可以参考[这里](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html)。

## 内部类与匿名类

定义在一个类内部的类成为内部类，可以访问外部类的所有字段与方法，内部类的字段或方法与外部类相同的，可以使用 外部类.this.字段或方法 调用之。

内部类为 `static` 所修饰的，其对象之创建需写为 `new 外部类名.内部类名` ，不为 `static` 所修饰的，即依赖于具体的对象，因而为 `new 外部类对象名.内部类名` 。

定义在类的方法中的类，称为“方法中的内部类”或局部类。局部类不能访问方法中的局部变量，但 `final` 局部变量不在此限。

匿名类是一种特殊的内部类，没有类名，定义时需要有其实现之接口名或扩展之类名，定义类的同时创建实例，所定义之匿名类实际上是其父类之子类，其语法示例如下

```java
HelloWorld frenchGreeting = new HelloWorld() {
    String name = "tout le monde";
    public void greet() {
        greetSomeone("tout le monde");
    }
    public void greetSomeone(String someone) {
        name = someone;
        System.out.println("Salut " + name);
    }
};
```

一个比较常出现的场景是作为一些临时类的定义，比如排序算法中的比较器，但这在 `Java8` 退出 `lambda` 表达式之后不在常用。另一个场景即在创建对象的时候初始化多个字段，比如

```java
p = new Person(){{age=18; name="李明";}};
```

实际上定义了 `Person` 类的一个匿名子类，而该匿名子类于声明之时赋予了一些字段以初值。

更多的关于匿名类的内容，可以参考[这里](https://docs.oracle.com/javase/tutorial/java/javaOO/anonymousclasses.html)。

## lambda 表达式

Java8 引入了 lambda 表达式，其基本的写法为 (参数) -> 结果 ，实际上是一个匿名的实例，可以用来替代较简单的匿名类。 lambda 表达式实际上是一些 Java 定义好的或用户自己定义的函数接口（FunctionalInterface）的匿名子类，这些接口有 `@FunctionalInterface` 注解，并有一个未实现的方法（不得没有或多于一个）。关于 lambda 表达式及函数接口之更多内容，可以参考[博客](https://blog.csdn.net/linysuccess/article/details/104751843)。

## 包装类

`Java` 为每一个基本类型定义了其包装类，以适合一些需要引用类型之场合，共有8类，分别为 `Boolean`, `Byte`, `Short`, `Character`, `Integer`, `Long`, `Float`, `Double` 。一般的，基本类型转换为包装类可以通过包装类的一个工厂方法或构造方法实现，包装类转换为基本类型可以通过一个成员方法实现，就 `int` 和 `Integer` 而言，其可以为

```java
int x1 = 10;
Integer X1 = new Integer(x1);
Integer X2 = Integer.valueOf(x1);
int x2 = X1.intValue();
```

为方便程序的书写， `Java` 提供了语法糖——自动装箱和拆箱，可以直接将二者相互赋值，比如

```java
Integer X = 10;
int x = X;
```

实际上相当于

```java
Integer X = Integer.valueOf(10);
int x = X.intValue();
```

## 枚举

简单情形下， `Java` 的枚举类型写法与其他很多语言类似，比如

```java
enum Light { Red, Yellow, Green; }
```

实际上是一个继承自 `java.lang.Enum` 的子类。枚举可以作为 `switch` 的条件。 `Java` 提供了静态方法 `values` 获取所有的枚举值构成的数组，比如 `Light.values()` 。

## 注解

`Java` 注解是 `Java` 的一种注释形式，与 `Javadoc` 不同的是，注解可以会在编译器生成类文件的时候嵌入到字节码中。更多的内容参考[这里](https://www.runoob.com/w3cnote/java-annotation.html)，这里暂时不做过多介绍，或在之后应当另外总结。

<!--- TODO 完成注解部分之总结 -->

## 相等与不等

`Java` 语言中，相等与否之判断常由 `==` 符号实现，应用于基本类型，即判断值是否相等，应用于引用类型，则判断引用是否相等，这使得引用类型之判等常会与预料不一致。对于引用类型，特别是字符串，一般不使用 `==` ，而是使用 `equals` 方法，其为 `Object` 类的一个方法，其默认实现为判断引用相等，但可由子类覆盖重写， `String` 等类型都提供了基于值相等的覆盖重写，一般其比较应该使用 `equals` 方法。用户自己定义之引用类型，一般也应当覆盖重写 `equals` 方法，按照惯例，覆盖重写 `equals` 方法的同时应当覆盖重写 `hashCode` ，特别是当需要用到散列表时。

对于包装类 `Integer` ，自动装箱或工厂方法构造的时候如果值在 -128 到 127 之间，会产生缓存，即创建两个 `Integer` 类型实例时实际上只有一个，均为缓存的实例，这会导致一些不合预期的效果，比如

```java
Integer a = 9;
Integer b = 9;
if (a == b) {
    System.out.println("a == b");
} else {
    System.out.println("a != b");
}
```

输出结果会是 `a == b` 。构造方法创建的对象不会产生缓存现象，但构造方法已经被弃用，会得到编译器警告。

枚举类型内部进行了惟一实例化，可以直接使用 `==` 判等。字符串常量也会进行惟一实例化，同样可以使用 `==` 判等。

使用 `equals` 方法之前，需要先判断调用者是否为 `null` ，参数则不需要，通常推荐将可以确定不是 `null` 的实例作为 `equals` 方法的调用者，比如字符串常量。
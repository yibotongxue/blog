# Java 语言简介

## 历史和发展

Java 为最热门的语言之一，项目最多，其官网为[https://www.oracle.com/java/](https://www.oracle.com/java/)。 Java最初为 SUN 公司开发，后 SUN 公司被 Oracle 收购，现在属于 Oracle 。 Java 分为三大平台， 分别为 `Java SE`、`Java EE`、`Java ME` ，即标准版、企业版和微型版，实际中主要用到的是标准版，企业版比标准版多了很多功能和库，但由于十分复杂，不常用，最后 [Oracle](https://www.oracle.com) 将其捐赠给开源社区，发展为 `JakartaEE` 语言，而微型版则可以理解为标准版的一个子集，保留了核心的功能但去除了许多不必要的库等。

Java的版本号最初为 1.x ，1.0为初始的版本，1.2较之前有了很大改变，常被称为 Java2 ，一直陆陆续续发布新的版本，更新较慢，直至 Java1.8，之后则改为每半年发布一个版本，每三年发布一个长期支持版本，当前最新的长期支持版本为 Java 23 ，期间改变了版本的命名方式，事实上从 Java1.9 之后开始，其下一个版本不再命名为 Java1.10 ，而是 Java10 ，其后沿用，而 Java1.7 、 Java1.8 和 Java1.9 也相应的改称 Java7 、 Java8 和 Java9。

JDK 即 Java开发工具包，一般常用的有 Oracle 提供的 Oracle JDK ，也有开源的 Open JDK ，其在部分开源的 Oracle JDK 上由社区完善而成，很多企业也有自己的 JDK ，主要基于 Open JDK 基于自己的服务器等进行优化，基本上也是开源的。

## Java 语言特点

Java 语言是一门面向对象的语言，与 C/C++ 语法极为类似，但语法较为简单。

## Java 运行机制

Java 有三种核心机制，即 Java 虚拟机、代码安全性检测和垃圾收集机制。Java程序的运行需要经历编译和运行两个过程，先由编译器编译成字节码，而后在 Java 虚拟机 JVM 上解释运行字节码。字节码是一种高阶的语言，可以在 JVM 运行，而 JVM 可以在不同的平台解释运行字节码，这就实现了一次编写、到处运行（Write Once, Run Anywhere）。

比如我们有一个 Java 程序源文件 `Hello.java` ，其内容为

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

我们可以通过如下命令编译其

```bash
javac Hello.java
```

这会产生一个包含字节码的文件 `Hello.class` ，而后可以通过如下命令解释运行

```bash
java Hello
```

从 Java15 开始，对于单个文件，也可以用一个命令完成编译、运行

```bash
java Hello.java
```

这事实上还是先编译后运行，不过是合为一个命令而已。

如果要查看字节码，可以使用指令

```bash
javap -c Hello
```

JVM 和 API 构成了 Java 运行环境（JRE），可以运行字节码文件，JRE加上一些工具（包括编译器、压缩等）构成了 Java 开发工具包（JDK）。

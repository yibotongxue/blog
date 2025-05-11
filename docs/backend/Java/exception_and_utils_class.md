# 异常处理和常用工具类

本章介绍Java中的异常处理和常用工具类，系课程第六、第七章笔记。

## 异常处理

Java 藉由异常的抛出和捕获进行异常处理，我们常说的异常是 `Exception` 类，其为 `Throwable` 的子类，另一个子类是 `Error` ，一般是 JVM 的错误。 `Exception` 分为两种，一种是 `RuntimeException` 及其子类，它们表示运行时异常，在方法中被抛出时不必捕获，也不必标记 `throws` ，另一类称为受检异常，需要捕获或抛出（即标记 `throws`）。受检的异常异常最终都必须被捕获，这是语法层面约束的。

用户可以创建自己的异常类，通常是 `RuntimeException` 的子类，但也可以是 `Exception` 的子类。 `Exception` 对象通常可以有三种构造方式，默认构造方法、从字符串（消息）构造和从字符串和起因构造。

异常的捕获通常使用 `try-catch` 语句，基本的形式是

```java
try {
    // 可能抛出异常的程序
} catch (/**异常的类名和异常变量名 */) {
    // 异常处理，可能再次抛出异常
} catch (/**异常的类名和异常变量名 */) {
    // 异常处理，可能再次抛出异常
} finally {
    // finally逻辑
}
```

可以有多个 `catch` 以处理多异常，但需要注意子异常必须先于父异常被捕获。

`finally` 语句是可选的，其中的代码会在最后执行，无论是否有异常抛出。如果 `try` 或 `catch` 有 `continue` 、 `break` 或 `return` 语句， `finally` 语句也会执行，有 `return` 语句的，会在 `return` 后的代码运行后、 `return` 前执行，如果 `finally` 中出现了 `return` 语句，则会直接返回，而不是返回 `try` 或 `catch` 中的。 `finally` 中抛出异常的，也会导致 `catch` 中抛出的异常被屏蔽。

常用的 `try-with-resources` 其实就是相当于一个 `finally` 块，其中执行 `resources` 的 `close` 方法。

除了使用异常，我们也可以使用断言，即使用 `assert` 关键字，这通常是在开发和测试阶段使用，而不用于最终的应用。通常 `JVM` 会默认关闭 `assert` ，除非我们使用 `-enableassertions` （简写作  `-ea` ），可以用 `-ea:类名` 指定启用断言的类，也可以指定包。

## Java 语言基础类

### Java API

Java 提供了大量的基础类库，常用的有

1. `java.lang` 包：Java语言的核心库，包含基本数据类型、数学函数、字符串、线程、异常等，系统会默认加载
2. `java.io` 包：包含输入/输出相关内容，包括文件的操作
3. `java.util` 包：包括了一些底层的使用工具，比如时间、变长数组、栈等
4. `java.awt` 及 `javax.swing` 包：图形用户界面相关的类库
5. `java.applet` 包：运行与 Internet 浏览器的 Java Applet 的工具类库
6. `java.net` 包：实现网络功能的类库
7. `java.security` 包：Java程序安全性控制和管理的类库
8. `java.spl` 包：实现 JDBC 的类库

### Object 类

`Object` 类是 Java 程序中所有类的父类或间接父类，定义了一些方法：

1. `protected Object clone()`： 生成当前对象的一个备份，并返回这个复制对象
2. `public boolean equals(Object obj)`：比较两个对象是否相同，是则返回 `true`
3. `public final Class getClass()`：获取当前对象所属的类信息，返回 `Class` 对象
4. `protected void finalize()`：定义回收当前对象时所需完成的清理工作
5. `public String toString()`：返回当前对象本身的有关信息，按字符串对象返回
6. `public final void notify()`：唤醒线程
7. `public final void notifyAll()`：唤醒所有等待此对象的线程
8. `public final void wait() throws InterruptedException`：等待线程

其中 `equals` 方法默认调用 `==` ，即判断引用相等，许多类都会对其进行重写，改为判断对象相等。 `System.out.println()` 方法会默认调用 `toString` 方法。

### 基本数据类型的包装类

Java 对基本数据类型进行了封装，并提供一些常数、方法的支持。常有 `valueOf` 方法实现从字符串构造， `xxxxValue` 获取包装的值。

### Math 类

`Math` 类提供了一系列数学函数的静态方法和常用的数学常量。

### System 类

`System` 类提供输入输出和运行时系统信息等的支持，比如 `public static InputStream in` 获取系统的标准输入， `public static PrintStream out` 获取系统的标准输出， `public static PrintStream err` 获取系统的标准错误输出。 `public static long currentTimeMillis()` 获取自1970年1月1日零时之当前系统时刻的微秒数， `public static void exit(int status)` 强制Java虚拟机推出当前运行状态， `public static void gc()` 建议调用垃圾回收， `public static Properties getProterties()` 得到系统的属性。

其中的 `getProterties` 可以取得所有系统的可用属性，比如如下的程序

```java
import java.util.*;
class SystemProperties
{
	public static void main(String[] args) 
	{
		Properties props = System.getProperties();
		Enumeration keys = props.propertyNames();
		while(keys.hasMoreElements() ){
			String key = (String) keys.nextElement();
			System.out.println( key + " = " + props.getProperty(key) );
		}
	}
}
```

我们可以在编译的时候使用 `-D` 新增系统属性，比如

```bash
java –Dvar=value MyProg
```

## 字符串和日期

### 字符串

Java中，我们一般用 `String` 对象表示字符串常量，其内部是通过 `char[]` 实现的，但最近的 `JDK` 事实上用的是 `byte[]` ，可以从 `char[]` 构造，同时Java也对其做了特殊处理，可以直接用 `"..."` 表示。 `String` 对象的比较通常使用 `equals` 方法，而不使用 `==` 。由于 `String` 常量的内部化问题， `"abc" == "abc"` 但 `"abc" != new String("abc")` 。

`StringBuffer` 保存可以修改的字符串，即 `char[]` 可以修改，是线程安全的。 `StringBuilder` 接口与 `StringBuffer` 一致，但不是线程安全的，一般的字符串拼接都是调用的 `StringBuilder` 。

我们可以使用 `StringTokenizer` 实现字符串的分隔，由目标字符串和分隔字符串构造。

### 日期

`java.util` 包中的 `Calendar` 类提供时间的表示和简单的时间加减等操作，其 `getTime` 方法返回一个 `Date` 对象， `Date` 类也是 `java.util` 包中的类，表示具体的日期和时间，其 `getTime` 方法得到一个 `long` 数字。为了格式化日期，我们可以使用 `SimpleDateFormat` ，它通过类似 `SimpleDateFormat("yyyy-MM-dd HH:mm:ss")` 的方法构造，可以通过 `format` 方法得到日期时间的字符串表示。

从Java 8开始， `java.time` 包提供了新的日期和时间的API，包括表示本地日期和时间的 `LocalDataTime` 、 `LocalDate` 和 `LocalTime` ，表示带时区的日期和时间的 `ZonedDateTime` ，负责格式化的 `DateTimeFormater` ，表示时刻的 `Instant` ，表示时区的 `ZoneId` 和 `ZoneOffset` ，表示时间间隔的 `Duration` 。

## 集合类

`java.util` 包提供了集合类 `Collection` ，它是除了 `Map` 类外所有集合类的根接口。 `java.util` 包主要包括 `List` 、 `Set` 和 `Map` 三类集合类，其中 `List` 和 `Set` 是 `Collection` 的子类。 `Set` 有两个重要实现，分别是 `HashSet` 和 `TreeSet` ，其中 `HashSet` 基于哈希实现， `TreeSet` 基于红黑树实现。 `List` 有 `ArrayList` 和 `Vector` 两个重要实现，这两个都是动态数组，不同之处在于 `Vector` 是线程安全的。 `List` 还有一个实现是 `LinkedList` ，一般不常用，它同时还实现了 `Collection` 的另一个子接口， `Queue` 接口。 `Stack` 是 `Collection` 的子类，有 `push` 和 `pop` 方法。 `Queue` 接口有 `add` 和 `remove` 接口方法，以及不删除的 `element` 方法，同样提供了不抛出异常的 `offer` 和 `poll` 方法，以及不删除的 `peek` 方法。 `Map` 顾名思义表示键值映射，有 `put` 、 `get` 、 `remove` 等接口，常见的实现有 `HashMap` 和 `TreeMap` 类，还有一个 `HashTable` ，它同时实现了 `Dictionary` 接口。 `HashTable` 有一个子类 `Properties` ，用于读取配置文件。

集合类通常支持流，可以使用 `.stream` 方法获取流，从而进行流式操作。流式操作中常有Lambda表达式，可以使用Lambda表达式替代部分接口对象，这要求接口只有至多一个抽象函数。

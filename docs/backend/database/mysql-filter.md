# MySQL 过滤数据

使用关系数据库检索数据的时候，我们除了需要指定字段和行数等，还常常希望检索符合某些特征的记录，你可以对检索结果进行过滤，但这通常效率不高，而且当检索结果过多的时候你甚至不能一次读入内存，更常用的是使用数据库管理系统提供的过滤功能。这篇文章是《MySQL必知必会》第6、7、8章的学习笔记。

## 过滤基础

过滤数据通常需要使用 `WHERE` 字句，其后指定搜索条件，比如如下的语句将得到价格为 $2.50$ 的产品的名字和价格。

```sql
SELECT prod_name, prod_price FROM products WHERE prod_price = 2.50;
```

如果还需要对数据排序， `ORDER BY` 子句应加在 `WHERE` 之后，比如

```sql
SELECT prod_name, prod_price FROM products WHERE prod_price > 2.50 ORDER BY prod_name DESC;
```

`WHERE` 子句常用的条件操纵符如下表，表格取自《MySQL必知必会》

| 操纵符 | 说明 |
| :---: | :---: |
| = | 等于 |
| <> | 不等于 |
| != | 不等于 |
| < | 小于 |
| <= | 小于等于 |
| > | 大于 |
| >= | 大于等于 |
| BETWEEN | 在指定的两个值之间 |

以及一个比较特殊的子句 `IS NULL` ，用以检查值为NULL，比如

```sql
SELECT prod_name FROM products WHERE prod_price IS NULL;
```

:::warning
字符串匹配的时候默认不会考虑大小写
:::

## WHERE 子句组合及其他操纵符

### AND 和 OR

`AND` 操作符可以表示需要同时满足两个条件，而 `OR` 操作符可以表示需要满足至少一个条件。这两个操作符都只对近邻的条件有效，如果需要实现多个条件的组合，需要用到多个操作符，可以添加括号指定条件运算的顺序，不添加的话默认先执行 `AND` 。比如如下的语句

```sql
SELECT prod_name, prod_price FROM products WHERE (vend_id = 1002 OR vend_id = 1003) AND prod_price >= 10;
```

### IN

`IN` 操作符可以表示条件范围，其后跟一个范围（用圆括号包围起来的若干个数值），用以表示检索的数据是否在这个范围内（即是否为括号中某个数值），注意这不是区间，而是集合。比如如下的语句

```sql
SELECT prod_name, prod_price FROM products WHERE vend_id IN (1002,1003) ORDER BY prod_name;
```

事实上效果与

```sql
SELECT prod_name, prod_price FROM products WHERE vend_id = 1002 OR vend_id = 1003 ORDER BY prod_name;
```

一样，但更灵活，范围可以用 `SELECT` 语句得到，效率也比 `OR` 更高。

### NOT

`NOT` 操作符可以用来表示对条件取反，比如如下的语句

```sql
SELECT prod_name, prod_price FROM products WHERE NOT vend_id = 1002 ORDER BY prod_name;
```

也可以对 `IN` 、 `BETWEEN` 和 `EXISTS` 子句取反，比如如下的语句

```sql
SELECT prod_name, prod_price FROM products WHERE vend_id NOT IN (1002,1003) ORDER BY prod_name;
```

## 用通配符和正则表达式进行过滤

一些时候我们需要进行模糊的匹配，或者匹配一定的格式，就需要用到通配符和正则表达式，这通常是对于字符串而言的，不对于其他类型。

### 通配符

使用通配符进行匹配需要用到操作符 `LIKE` 操纵符，常用的通配符包括百分号通配符（%）和下划线通配符（_）， % 表示匹配任意数量的任意字符，而 _ 只匹配单个字符，比如下面的语句

```sql
SELECT prod_id, prod_name FROM products WHERE prod_name LIKE 'jet%';
```

可以查询表 `products` 中产品名以 `jet` 开头（不区分大小写）的行，而下面的语句

```sql
SELECT prod_id, prod_name FROM products WHERE prod_name LIKE '_ ton anvil';
```

可以匹配一个字符后接着 ` ton anvil` 组成的产品名的行。

需要注意的是， `LIKE` 匹配的是整个列，也就是通配符表达式必须能表示整个列的字符串，而不是仅仅是这个列的一部分。

如果要区分大小写，可以在 `LIKE` 后添加 `BINARY` 关键字。

使用通配符的时候要注意尽量不要将通配符放在字符串的开头，这往往会使得匹配效率降低。

### 正则表达式

上面提到的搜索和过滤已经足以应对基本的问题了，但还有些复杂的问题是不好解决的，比如匹配电话号码、URL等，这些往往需要使用正则表达式。正则表达式在很多编程语言或编辑器及其他软件中都会用到，可以参考[这个教程](https://www.runoob.com/regexp/regexp-tutorial.html)。SQL事实上支持的是正则表达式的一个子集。

#### 基本字符匹配

实现基本字符匹配，只需要将通配符匹配中的 `LIKE` 操纵符改为 `REGEXP` 操纵符。比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '1000' ORDER BY prod_name;
```

会检索到所有产品名含有 1000 的行。

也可以用 `.` 表示匹配任意的一个字符，比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '.000' ORDER BY prod_name;
```

与 `LIKE` 不同的是， `REGEXP` 匹配的是包含正则表达式表示的字符串的列，而不要求整个列可以有正则表达式匹配。与 `LIKE` 类似的是， `REGEXP` 不区分大小写，如果要区分大小写，需要在其后添加 `BINARY` 关键字。

#### 进行 OR 匹配

如果要匹配两个字符串中的任意一个，可以用 `|` 符号，比如

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '1000|2000' ORDER BY prod_name;
```

#### 匹配多个字符串

如果要匹配多个字符串中的任意一个，可以使用多个 `|` 符号，比如

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '1000|2000|3000' ORDER BY prod_name;
```

如果这些字符串是作为正则表达式的一部分，需要将它们用方括号包围，比如写作 `[1000|2000|3000]` ，如果每个字符串只有一个字符，也可以略去 `|` 符号，比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '[123] Ton' ORDER BY prod_name;
```

会匹配包含由1或2或3加上 ` Ton` 字符串的行。如果没有加方括号，写作

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '1|2|3 Ton' ORDER BY prod_name;
```

事实上匹配的是含有1或2或 `3 Ton` 的行。

字符集合也可以被否定，需要加 `^` 符号，比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '[^123] Ton' ORDER BY prod_name;
```

匹配的就是包含不是1或2或3的字符串加上 ` Ton`的字符串的行。

#### 匹配范围

对范围的匹配可以用 `-` 符号简化，比如 `[1-9]` 匹配的是数字1到9，比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '[1-5] Ton' ORDER BY prod_name;
```

#### 匹配特殊字符

我们上面接触到的 `[]` 特殊字符，以及用来匹配单个字符的 `.` 等，都是特殊字符，出现在正则表达式中会被解释为特殊的匹配含义，而不是直接匹配，如果要直接匹配，需要加 `\\` 进行转义。

:::details 为什么是 `\\`
使用两个 `\` ，其中一个是 `MySQL` 进行转义，一个是正则表达式的转义。
:::

比如下面的语句

```sql
SELECT vend_name FROM vendors WHERE vend_name REGEXP '\\.' ORDER BY vend_name;
```

`\\` 也可以用来引用元字符，如下表

| 元字符 | 说明 |
| :--: | :--: |
| \\f | 换页 |
| \\n | 换行 |
| \\r | 回车 |
| \\t | 制表 |
| \\v | 纵向制表 |

可以检索含有 `.` 的行。

#### 匹配字符类

MySQL有一些预定义的字符类，可以方便的匹配一些字符集合，如下表格

| 类 | 说明 |
| :-: | :-: |
| [:alnum:] | 任意字母和数字 |
| [:alpha:] | 任意字符 |
| [:blank:] | 空格和制表 |
| [:cntrl:] | ASCII控制字符（ASCII 0到31和127） |
| [:digit:] | 任意数字 |
| [:graph:] | 任意可打印字符，但不包括空格 |
| [:lower:] | 任意小写字母 |
| [:print:] | 任意可打印字符 |
| [:punct:] | 即不在[:alnum:]（任意字母和数字）又不在[:cntrl:]（ASCII控制字符）的任意字符 |
| [:space:] | 包含空格在内的任意空白字符 |
| [:upper:] | 任意大写字母 |
| [:xdigit:] | 任意十六进制数字（同[a-fA-F0-9]） |

#### 匹配多个实例

如果需要要求一个正则表达式匹配的次数，可以使用重复元字符，如下表

| 元字符 | 说明 |
| :--: | :--: |
| * | 0个或多个匹配 |
| + | 1个或多个匹配 |
| ? | 0个或1个匹配 |
| {n} | 指定数目的匹配 |
| {n,} | 不少于指定数目的匹配 |
| {n,m} | 匹配数目的范围（m不超过255） |

比如如果需要匹配一个单词，这个单词后面可以接有另外的字符，可以用 `?` ，比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '\\([0-9] sticks?\\)' ORDER BY prod_name;
```

可以方便的实现对 `stick` 和 `sticks` 的匹配。而 `{n}` 可以用来匹配连续的字符集，比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '[:digit:]{4}' ORDER BY prod_name;
```

匹配连续的4个数字。书中正则表达式写作 `[[:digit:]]{4}` ，但我感觉多的方括号似乎没有什么区别。

#### 定位符

如果需要指定匹配从字符串开头开始或者在字符串结尾，可以用定位符 `^` 表示开头，而 `$` 表示结尾，比如下面的语句

```sql
SELECT prod_name FROM products WHERE prod_name REGEXP '^[0-9\\.]' ORDER BY prod_name;
```

原书还包括了词首尾字符的定位符 `[[:<:]]` 和 `[[:>:]]` ，但这些在 `MySQL 8.0` 开始都已经被删除了。

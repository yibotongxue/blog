# 计算字段、数据处理函数、汇总数据和数据分组

一些情况下，我们需要的数据无法直接查询得到，或为数据库中没有对应的字段，或者对数据进行处理。把数据全部获取然后再处理得到我们想要的结果是可以的，但这不如使用数据库自带的处理方法方便，而且可能会带来网络带宽浪费，当数据量很大时甚至内存无法容纳，所以一般都应该先考虑在数据库处理的到我们想要的数据。这部分内容主要是《MySQL必知必会》第10、11、12、13章的学习笔记。

## 创建计算字段

计算字段是相对于实际字段的概念，计算字段并不是实际存储在数据库中，而是在查询的时候动态计算得到结果。客户机事实上不会知道得到的数据是实际字段还是计算字段。

### 拼接字段

在 MySQL 中，可以使用 `Concat` 函数将两个列拼接起来，这与很多SQL数据库使用 `+` 或 `||` 实现这一功能不同。一个示例是

```sql
SELECT Concat(vend_name, ' (', vend_country, ')') FROM vendors ORDER BY vend_name;
```

这会将 `vend_name` 和 `vend_country` 拼接起来，得到这样的输出

```
+--------------------------------------------+
| Concat(vend_name, ' (', vend_country, ')') |
+--------------------------------------------+
| ACME (USA)                                 |
| Anvils R Us (USA)                          |
| Furball Inc. (USA)                         |
| Jet Set (England)                          |
| Jouets Et Ours (France)                    |
| LT Supplies (USA)                          |
+--------------------------------------------+
6 rows in set (0.00 sec)

```

### 过滤空格

我们也可以对查询的结果过滤空格，这需要使用 `Trim` 函数，用以去掉串左右两边的空格；或者 `LTrim` 函数，用以去掉串左边的空格；或者 `RTrim` 函数，用以去掉串右边的空格。比如上面的语句可以用 `RTrim` 去掉每一个 `vend_name` 和 `vend_country` 右边的空格。

```sql
SELECT Concat(RTrim(vend_name), ' (', RTrim(vend_country), ')') FROM vendors ORDER BY vend_name;
```

### 使用别名

注意到上面我们得到的结果中，计算字段的列没有名字，而是直接使用我们给出的函数，没有命名的列无法在客户机中被引用，我们需要使用别名，这要用到 `AS` 关键字，使用如下的语句

```sql
SELECT Concat(RTrim(vend_name), ' (', RTrim(vend_country), ')') AS vend_title FROM vendors ORDER BY vend_name;
```

别名也可以在引用实际字段的时候使用，这通常是在一些列的命名不符合规定的字符（比如空格）的时候使用，或者原来的名字含混或容易误解的时候扩充它。别名有时也称导出列。

### 执行算术计算

MySQL同样支持对列进行算术计算，支持的算术操作包括加法(+)，减法(-)，乘法(*)和除法(/)，比如如下的语句

```sql
SELECT prod_id, quantity, item_price, quantity*item_price AS expanded_price FROM orderitems WHERE order_num = 20005;
```

## 使用数据处理函数

SQL支持使用函数处理数据，但不同的数据库可能支持不同的函数，代码可移植性上可能会受到影响，但很多时候还是应当使用函数，不过需要做好充分的注释，以便当不能直接移植的时候接受的人可以知道这段代码的目的。

### 文本处理函数

上一小节中提到的 `RTrim` 函数就是一种文本处理函数，常用的一些文本处理函数如下表

| 函数 | 说明 |
| :--: | :--: |
| Left() | 返回串左边的字符 |
| Length() | 返回串的长度 |
| Locate() | 找出串的一个子串 |
| Lower() | 将串转换为小写 |
| LTrim() | 去掉串左边的空格 |
| Right() | 返回串右边的字符 |
| RTrim() | 去掉串右边的空格 |
| Soundex() | 返回串的SOUNDEX值 |
| SubString() | 返回子串的字符 |
| Upper() | 将串转换为大写 |

比如如下的语句可以得到转换为大写之后的 `vend_name` ，

```sql
SELECT vend_name, Upper(vend_name) AS vend_name_upcase FROM vendors Order BY vend_name;
```

需要特殊注意的是 `Soundex` 函数，这个函数是一个将任何文本串转换为描述其语音表示的字母数字模式的算法，可以用于解决一些可能出现的输入的时候的错误。

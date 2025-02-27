# 计算字段、数据处理函数、汇总数据和分组数据

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

### 日期和时间处理函数

常用的日期和时间处理函数如下表

| 函数 | 说明 |
| :--: | :--: |
| AddDate() | 增加一个日期（天、周等） |
| AddTime() | 增加一个时间（时、分等） |
| CurDate() | 返回当前日期 |
| CurTime() | 返回当前时间 |
| Date() | 返回日期时间的日期部分 |
| DateDiff() | 计算两个日期之差 |
| Date_Add() | 高度灵活的日期运算函数 |
| Date_Format() | 返回一个格式化的日期或时间串 |
| Day() | 返回一个日期的天数部分 |
| DayOfWeek() | 对于一个日期，返回对应的是星期几 |
| Hour() | 返回一个时间的小时部分 |
| Minute() | 返回一个时间的分钟部分 |
| Month() | 返回一个日期的月份部分 |
| Now() | 返回当前日期和实践 |
| Second() | 返回一个时间的秒部分 |
| Time() | 返回一个日期时间的时间部分 |
| Year() | 返回一个日期的年份部分 |

比如如下的语句

```sql
SELECT cust_id, order_num FROM orders WHERE Date(order_date) = '2005-09-01';
```

### 数据处理函数

这部分的函数使用并不频繁，但却是所有数据库软件最为统一的部分。常用的如下表

| 函数 | 说明 |
| :--: | :--: |
| Abs() | 返回一个数的绝对值 |
| Cos() | 返回一个角度的余弦 |
| Exp() | 返回一个数的指数值 |
| Mod() | 返回除操作的余数 |
| Pi() | 返回圆周率 |
| Rand() | 返回一个随机数 |
| Sin() | 返回一个角度的正弦 |
| Sqrt() | 返沪一个数的平方根 |
| Tan() | 返回一个角度的正切 |

## 汇总数据

一些时候我们需要对数据进行汇总，而不是把所有数据输出，比如需要计数、求和等，这时需要用到聚集函数。

> 聚集函数（aggregate function） 运行在行组上，计算和返回单个值的函数。

### 聚集函数

SQL聚集函数有如下几个

| 函数 | 说明 |
| :--: | :--: |
| AVG() | 返回某列的平均值 |
| COUNT() | 返回某列的行数 |
| MAX() | 返回某列的最大值 |
| MIN() | 返回某列的最小值 |
| SUM() | 返回某列值之和 |

比如如下的语句可以查询价格的平均值

```sql
SELECT AVG(prod_price) AS avg_price FROM products;
```

如果要对一张表的列计数，可以使用 `COUNT(*)` ，比如如下的语句

```sql
SELECT COUNT(*) AS num_cust FROM customers;
```

可以查询客户的数目。如果要查询具体某一列的个数，可以使用 `COUNT(column)` ，比如如下的语句

```sql
SELECT COUNT(cust_email) AS num_cust FROM customers;
```

可以查询客户邮件地址的数目。

使用 `MAX` 函数可以查询某一列的最大值，只用 `MIN` 函数可以查询某一列的最小值，比如如下的语句

```sql
SELECT MAX(prod_price) AS max_price FROM products;
SELECT MIN(prod_price) AS min_price FROM products;
```

使用 `SUM` 函数可以查询某一列的和，比如如下的语句

```sql
SELECT SUM(quantity) AS items_ordered FROM orderitems WHERE order_num = 20005;
```

也可以查询某个计算结果的和，比如如下的语句

```sql
SELECT SUM(item_price*quantity) AS total_price FROM orderitems WHERE order_num = 20005;
```

### 聚集不同值

可以通过 `DISTINCT` 关键字，使得在汇总某一列数据的时候只考虑不同的值，比如如下的语句

```sql
SELECT AVG(DISTINCT prod_price) AS avg_price FROM products WHERE vend_id = 1003;
```

事实上上面没有使用 `DISTINCT` 关键字的地方默认使用了 `ALL` 关键字。

### 组合聚集函数

不同的聚集函数可以组合，比如如下的语句

```sql
SELECT COUNT(*) AS num_items, MIN(prod_price) AS price_min, MAX(prod_price) AS price_max, AVG(prod_price) AS price_avg FROM products;
```

## 分组数据

分组是在 `SELECT` 语句的子句完成的，比如如下的语句

```sql
SELECT vend_id, COUNT(*) AS num_prods FROM products GROUP BY vend_id;
```

其会得到每个 `vend_id` 及其对应的行的数目，输出如下

```
+---------+-----------+
| vend_id | num_prods |
+---------+-----------+
|    1001 |         3 |
|    1002 |         2 |
|    1003 |         7 |
|    1005 |         2 |
+---------+-----------+
4 rows in set (0.00 sec)

```

如果要对分组进行过滤，不能使用 `WHERE` 子句，因为 `WHERE` 子句是对行的过滤，无法对分组进行过滤，需要使用 `HAVING` 子句，比如如下的语句

```sql
SELECT cust_id, COUNT(*) AS orders FROM orders GROUP BY cust_id HAVING COUNT(*) >= 2;
```

得到如下的输出

```
+---------+--------+
| cust_id | orders |
+---------+--------+
|   10001 |      2 |
+---------+--------+
1 row in set (0.00 sec)

```

也可以使用 `WHERE` 子句在分组前先对行进行过滤，比如如下的语句

```sql
SELECT vend_id, COUNT(*) AS num_prods FROM products WHERE prod_price >= 10 GROUP BY vend_id HAVING COUNT(*) >= 2;
```

`GROUP` 得到的分组的顺序是没有保证的，一般使用 `GROUP BY` 的同时应该使用 `ORDER BY` ，比如如下的语句

```sql
SELECT order_num, SUM(quantity*item_price) AS ordertotal FROM orderitems GROUP BY order_num HAVING SUM(quantity*item_price) >= 50 ORDER BY ordertotal;
```

## `SELECT` 子句的顺序

`SELECT` 子句的顺序，可以按下表组织

| 子句 | 说明 | 是否必须使用 |
| :--: | :--: | :--: |
| SELECT | 要返回的列或表达式 | 是 |
| FROM | 从中检索数据的表 | 仅在从表选择数据时使用 |
| WHERE | 行级过滤 | 否 |
| GROUP BY | 分组说明 | 仅在按组计算聚集时使用 |
| HAVING | 组级过滤 | 否 |
| ORDER BY | 输出排序顺序 | 否 |
| LIMIT | 要检索的行数 | 否 |

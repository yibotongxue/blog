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

一样，但效果更灵活，范围可以用 `SELECT` 语句得到，效率也比 `OR` 更高。

### NOT

`NOT` 操作符可以用来表示对条件取反，比如如下的语句

```sql
SELECT prod_name, prod_price FROM products WHERE NOT vend_id = 1002 ORDER BY prod_name;
```

也可以对 `IN` 、 `BETWEEN` 和 `EXISTS` 子句取反，比如如下的语句

```sql
SELECT prod_name, prod_price FROM products WHERE vend_id NOT IN (1002,1003) ORDER BY prod_name;
```

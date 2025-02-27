# MySQL 检索相关

这里讲介绍 MySQL 检索相关的内容，主要为《MySQL必知必会》书籍第4、5章的学习笔记。

## 检索基础

`SQL` 中用于检索的关键字为 `SELECT` ，需要你提供数据的位置和检索的内容。

### 检索列

检索单个列可以通过语句

```sql
SELECT <colomnname> FROM <tablename>;
```

比如

```sql
SELECT prod_name FROM products;
```

检索多个列可以将多个列用逗号隔开，比如

```sql
SELECT prod_id, prod_name, prod_price FROM products;
```

检索所有列可以通过通配符 * ，比如

```sql
SELECT * FROM products;
```

### 限制检索结果

除了主键可以保证每一个记录只有一个值外，其他的字段检索出来很可能会有相同的行，如果要只显示不重复的行，可以使用关键字 `DISTINCT` ，比如

```sql
SELECT DISTINCT vend_id FROM products;
```

需要注意的是， `DISTINCT` 关键字的作用是全局的，不是只对紧跟的字段有效，如果检索多个列，只有每个字段都重复的行会被认为是重复的而不显示。

有时需要限制检索结果显示的范围，比如前若干行，从某行开始的若干行，可以用关键字 `LIMIT` ，比如语句

```sql
SELECT vend_id FROM products LIMIT 5;
```

可以限制检索前5行，语句

```sql
SELECT vend_id FROM products LIMIT 5,5;
```

可以限制检索从行5（第6行）开始的5行。

> [!IMPORTANT]
> SQL中第一行的行号为0

### 使用完全限定名

上面用到的直接的列名，你也可以用完全限定的列名，比如

```sql
SELECT products.vend_id FROM products;
```

使用完全限定的表明也是可以的，比如

```sql
SELECT products.vend_id FROM crashcourse.products;
```

## 排序检索数据

检索得到的记录的顺序并不是固定的，每个人可能在自己的机器上实验会得到不同的结果，但这也不是随机的，而是与文件的某种顺序有关，并可能随着数据库相关的操作而发生变动，所以，我们不能默认直接检索得到的数据的顺序，而需要自己指定排序。

对检索数据进行排序，需要用到 `ORDER BY` 子句，其后指定排序依据的列，默认是升序排序，比如下面的语句

```sql
SELECT prod_name FROM products ORDER BY prod_name;
```

可以得到按照 `prod_name` 升序排列的结果，如下

```
+----------------+
| prod_name      |
+----------------+
| .5 ton anvil   |
| 1 ton anvil    |
| 2 ton anvil    |
| Bird seed      |
| Carrots        |
| Detonator      |
| Fuses          |
| JetPack 1000   |
| JetPack 2000   |
| Oil can        |
| Safe           |
| Sling          |
| TNT (1 stick)  |
| TNT (5 sticks) |
+----------------+
14 rows in set (0.00 sec)

```

这个在每个人的机器上就应该是一样的了。当然，你也可以指定多个列进行排序，用逗号隔开每个列即可，会找语句中出现的顺序排序，比如下面的语句

```sql
SELECT prod_id, prod_price, prod_name FROM products ORDER BY prod_price, prod_name;
```

会得到先按价格排序，再按名字排序的结果

```
+---------+------------+----------------+
| prod_id | prod_price | prod_name      |
+---------+------------+----------------+
| FC      |       2.50 | Carrots        |
| TNT1    |       2.50 | TNT (1 stick)  |
| FU1     |       3.42 | Fuses          |
| SLING   |       4.49 | Sling          |
| ANV01   |       5.99 | .5 ton anvil   |
| OL1     |       8.99 | Oil can        |
| ANV02   |       9.99 | 1 ton anvil    |
| FB      |      10.00 | Bird seed      |
| TNT2    |      10.00 | TNT (5 sticks) |
| DTNTR   |      13.00 | Detonator      |
| ANV03   |      14.99 | 2 ton anvil    |
| JP1000  |      35.00 | JetPack 1000   |
| SAFE    |      50.00 | Safe           |
| JP2000  |      55.00 | JetPack 2000   |
+---------+------------+----------------+
14 rows in set (0.00 sec)

```

你也可以指定排序方向，默认是升序排列，如果要用降序排列可以用 `DESC` 关键字，加在需要降序的列之后，比如

```sql
SELECT prod_name FROM products ORDER BY prod_name DESC;
```

需要注意的是 `DESC` 关键字的只作用于直接跟在其前面的列上，如果多个列需要用降序排列，需要每一个都指定 `DESC` 关键字。

:::tip
排序的列不一定需要是选择的列，尽管大多数时候是这样的。
:::

配合 `LIMIT` 关键字，可以实现检索最大值或最小值，比如如下的语句

```sql
SELECT prod_price FROM products ORDER BY prod_price DESC LIMIT 1;
```

可以用来检索最昂贵的价格，结果如下

```
+------------+
| prod_price |
+------------+
|      55.00 |
+------------+
1 row in set (0.00 sec)

```

> [!IMPORTANT]
> 注意 `LIMIT` 关键字和 `ORDER BY` 的顺序不能反过来， `ORDER BY` 字句也必须在 `FROM` 字句之后。

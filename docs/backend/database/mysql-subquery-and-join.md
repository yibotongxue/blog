# 子查询和联结

在许多情况，我们需要在多张表中查询，可以使用子查询和联结。这部分主要为《MySQL必知必会》第14、15、16章的笔记。

## 子查询

子查询即将一个 `SELECT` 语句的结果应用于另一个 `SELECT` 语句，通常有两种方法，一种是作为 `WHERE` 子句的过滤条件的一部分，一是创建计算字段时。

### 利用子查询进行过滤

比如查询具有订单TNT2的用户的id，其中订单物品在表 `orderitems` 中，而订单在表 `orders` 中，因而可以使用如下的语句查询

```sql
SELECT cust_id FROM orders WHERE order_num IN (SELECT order_num FROM orderitems WHERE prod_id = 'TNT2');
```

### 作为计算字段使用子查询

比如要输出用户名、用户状态和用户的订单数，但用户状态在 `customers` 表中，用户的订单信息在 `orders` 表中，关联的是用户名，可以使用如下语句查询，其中的用户的订单数需要通过计算字段创建

```sql
SELECT cust_name, cust_state, (SELECT COUNT(*) FROM orders WHERE orders.cust_id = customers.cust_id) AS orders FROM customers ORDER BY cust_name;
```

其中的 `WHERE orders.cust_id = customers.cust_id` 设计外部查询，这种类型的子查询被称为相关子查询。

## 联结表

两张表常会有相关联的情况，即可以通过常用的值相互关联，常见的为一张表可能包含另一张表的主键作为其一列，这一列成为外键。在查询时，可以通过创建联结在输出时联结两张表中对应的行。比如如下的语句

```sql
SELECT vend_name, prod_name, prod_price FROM vendors, products WHERE vendors.vend_id = products.vend_id ORDER BY vend_name, prod_name;
```

只需要同时给出两张表中的列和表名，并给出联结的方式（这里是 `WHERE` 子句）即可创建联结。如果没有 `WHERE` 字句，将会得到两张表中输出的笛卡尔积，这显然不符合我们的需求。

上面用到的联结基于的是值的相等测试，也别成为等值联结，或者称为内部联结，对于内部联结，还可以用特殊的语法，比如如下的语句

```sql
SELECT vend_name, prod_name, prod_price FROM vendors INNER JOIN products ON vendors.vend_id = products.vend_id;
```

我们也可以创建多张表的联结，表之间的关系可以有多句，而以 `AND` 等连接，比如如下的语句

```sql
SELECT prod_name, vend_name, prod_price, quantity FROM orderitems, products, vendors WHERE products.vend_id = vendors.vend_id AND orderitems.prod_id = products.prod_id AND order_num = 20005;
```

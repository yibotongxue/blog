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

## 创建高级联结

### 使用表别名

别名除了可以用于列名和计算字段外，SQL还允许对表起别名，比如如下的语句

```sql
SELECT cust_name, cust_contact FROM customers AS c, orders AS o, orderitems AS oi WHERE c.cust_id = o.cust_id AND oi.order_num = o.order_num AND prod_id = 'TNT2';
```

表别名除了能缩短SQL语句，还能允许在单条SELECT语句中多次使用相同的表，这通常用于自联结，比如如下的例子（来自[腾讯元宝](https://yuanbao.tencent.com/)）

```sql
SELECT e.FirstName AS EmployeeFirstName, e.LastName AS EmployeeLastName,
       m.FirstName AS ManagerFirstName, m.LastName AS ManagerLastName
FROM Employees AS e
LEFT JOIN Employees AS m ON e.ManagerID = m.EmployeeID;
```

可以查询所有员工及其经理的姓名。

### 使用不同类型的联结

除了以上介绍过了的等值联结或内部联结，还有自联结、自然联结和外部联结。

#### 自联结

比如如下的语句

```sql
SELECT p1.prod_id, p1.prod_name FROM products AS p1, products AS p2 WHERE p1.vend_id = p2.vend_id AND p2.prod_id = 'DTNTR';
```

可以查找生产 DTNTR 的生产商的所有产品。这事实上也可以用子查询实现

```sql
SELECT prod_id, prod_name FROM products WHERE vend_id = (SELECT vend_id FROM products WHERE prod_id = 'DTNTR');
```

但更多时候我们推荐使用自联结而不是子查询，因为联结往往比子查询更快。

#### 自然联结

当两张表只有一个公共列的时候，我们可以使用自然联结，比如如下的情况（来自[腾讯元宝](https://yuanbao.tencent.com/)），我们有一张员工信息表

表：Employees（员工表）​
| EmployeeID | Name | DepartmentID |
| :--: | :--: | :--: |
| 1 | 张三 | 10 |
| 2 | 李四 | 20 |
| 3 | 王五 | 10 |

而有部门信息表如下

表：Departments（部门表）​
| DepartmentID | DepartmentName |
| :--: | :--: |
| 10 | 人力资源 |
| 20 | 财务 |
| 30 | 技术 |

可以使用如下的语句员工及其所属部门

```sql
SELECT *
FROM Employees
NATURAL JOIN Departments;
```

#### 外部联结

内部联结等往往需要两张表都有的记录才能查询到，而外部联结则可以实现检索出一张表所有的记录与另一张表对应的列，或者两张表中的所有记录及对应的列（但MySQL没有直接支持的）。左外部连接检索出左表中所有的记录及其右表中对应的列，如果没有则为 `NULL` ，右外部联结检索出右表中所有的记录及其左表中对应的列，如果没有则为 `NULL` ，全外部联结检索出两张表中所有的记录及其对应的列，如果没有则为 `NULL` ，需要注意的是， MySQL 不支持全外部联结，左外部联结和右外部联结分别通过 `LEFT OUTER JOIN` 、 `RIGHT OUTER JOIN`。比如如下的语句

```sql
SELECT customers.cust_id, orders.order_num FROM customers LEFT OUTER JOIN orders ON customers.cust_id = orders.cust_id;
```

### 使用带聚集函数的联结

聚集函数可以与联结表结合，比如如下的语句查询了所有客户和每个客户的订单数

```sql
SELECT customers.cust_name, customers.cust_id, COUNT(orders.order_num) AS num_ord FROM customers INNER JOIN orders ON customers.cust_id = orders.cust_id GROUP BY customers.cust_id;
```

但这有个问题是没有订单数的客户不会显示，这可以用外部联结解决，使用如下的语句

```sql
SELECT customers.cust_name, customers.cust_id, COUNT(orders.order_num) AS num_ord FROM customers LEFT OUTER JOIN orders ON customers.cust_id = orders.cust_id GROUP BY customers.cust_id;
```

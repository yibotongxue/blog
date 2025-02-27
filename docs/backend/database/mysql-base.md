# MySQL 基础

这里将介绍基础的 MySQL 的内容，主要为书籍《MySQL必知必会》的学习笔记。

## 基本概念

来看[Oracle中国](https://www.oracle.com/cn/)给出的的[定义](https://www.oracle.com/cn/database/what-is-database/)：

> 数据库是结构化信息或数据的有序集合，一般以电子形式存储在计算机系统中。通常由数据库管理系统 (DBMS) 来控制。在现实中，数据、DBMS 及关联应用一起被称为数据库系统，通常简称为数据库。

关系数据库指使用关系模型组织、管理数据的数据库，简单理解就是将数据视为二维表格，大部分的数据库都采用关系模型。SQL，亦即结构化查询语言，是一种管理和操作关系数据库的编程语言。

数据库软件，也称数据库管理系统或DBMS，用于帮助用户创建、查询和操纵数据库，而MySQL则是一个开源的用于管理关系型数据库的数据库软件。通常来说，数据库与数据库软件不是同一概念，数据库是用户通过数据库软件创建的容器，数据库指的是保存在磁盘中的数据，大多数时候是文件，但也可以不是，这不重要，因为你不会直接与它们打交道，而是通过数据库管理系统(DBMS)访问和管理它。

更为具体的内容参考[什么是数据库](https://www.oracle.com/cn/database/what-is-database/)等。

## 关系数据库基础

### 数据库

看《MySQL必知必会》的定义：

> **数据库**（database） 保存有组织的数据的容器（通常是一个文件或一组文件）。

### 关系数据库

关系数据库指基于关系模型建立的数据库。具体的可以参考[这里](https://www.oracle.com/cn/database/what-is-a-relational-database/)。

### 表

一个数据库通常包含多个表，表指的是

> 表（table） 某种特定类型数据的结构化清单。

数据库中每一个表都有自己的名字作为标识，同一个数据库不允许有相同名字的两张表。

### 模式

数据库的表具有一些特性，规定其如何存储等，这些信息通常记为**模式**，模式还可描述整个数据库的信息等。

> 模式（schema） 关于数据库和表的布局及特性的信息。

这个概念并不常用，也经常指代不明确，暂时没有需要深究其究竟是什么的需要。

### 列和行

一个表通常包含许多列，每一个列表示一个字段；包含许多行，每一行表示一个记录。简单的理解，比如一张存储用户信息的表，一般其行即为一个用户的信息，即记录，而其列则为某一项具体的信息，即字段。

> [!TIP]
> 对于以上内容一个简单的理解方式，可以参考Excel电子表格，一个表格文件通常有多张表，每一张表会有行和列，分别表示记录和字段。不同于Excel电子表格的一点是，数据库不同的表之间需要建立对应关系。

### 数据类型

对于关系数据库的每一列，我们需要规定其数据类型，关系数据库支持的标准数据类型包括数值、字符串、时间等，具体的参考[廖雪峰教程的这个网页](https://liaoxuefeng.com/books/sql/rdbms/index.html)。

### 主键

关系表中，不能有重复的记录，因而需要有一个字段或一组区分不同的记录，这个或这些字段称为主键。《MySQL必知必会》中的定义：

> 主键（primary key）一列（或一组列），其值能够唯一区分表中每个行。

几个需要注意的点是：

1. 主键不允许为NULL
2. 在表建立后尽量不要改动主键
3. 实际选择中主键通常不应带有业务含义
4. 主键可以是表中自然带有的，也可以是认为设计的，比如用一个自增的id
5. 主键应该包含尽量少的字段

两个常见的主键类型有

1. 自增整数类型
2. 全局唯一GUID类型，也称UUID，使用一种全局唯一的字符串作为主键

参考[廖雪峰教程的这个网页](https://liaoxuefeng.com/books/sql/relational/primary-key/index.html)和[这篇文章](https://developer.aliyun.com/article/1602420)。

## MySQL的安装和数据库的创建

:::info 环境
实验基于Ubuntu24.04系统，在服务器上使用，客户机和服务机都安装在一个计算机，没有安装图形界面相关。
:::

### MySQL的安装

这部分主要参考了[这篇文章](https://blog.csdn.net/hwx865/article/details/90287715)。

#### 安装MySQL服务机

```bash
sudo apt install mysql-server
```

#### 安装MySQL客户机

```bash
sudo apt install mysql-client
```

#### 配置基础的安装

```bash
sudo mysql_secure_installation
```

这里会设置一些基础的配置，你可以查看提示并自行决定配置，也可以直接采用默认配置，一直按Enter直至完成。

这里可能 `root` 用户会默认使用 `auth_socket` 插件验证登陆，所以密码设置可能需要手动完成，当然，这也不是必须的，毕竟这里只是一个学习用的数据库。如果要修改的话，可以[启动MySQL服务器](#启动服务)，然后在 `root` 用户登陆：

```bash
mysql -u root
```

再执行语句

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
```

刷新权限

```sql
FLUSH PRIVILEGES;
```

如果使用 `auth_socket` 验证方式，则可以通过

```bash
mysql -u root
```

登陆，如果改用密码验证方式，则可以通过

```bash
mysql -u root -p
```

输入密码登陆。

:::details auth_socket
auth_socket 插件验证不要求输入密码，即使输入了密码也不验证，而是通过操作系统用户进行身份验证，用户只能用 UNIX 的 socket 方式登陆，这就保证了只能本地登陆，并且限制了操作系统用户名和登陆的MySQL用户名必须相同，所以在某些情况是安全的，除非你需要限制登录服务器的用户访问数据库的权限。参考[这篇文章](https://zhuanlan.zhihu.com/p/307793416)和[这篇文章](https://blog.51cto.com/u_16213343/10014057)。
:::

#### 启动服务

执行命令

```bash
sudo service mysql start
```

### 创建数据库

#### 创建用户

为了实验的方便，我们创建新的用户，你当然可以用 `root` 用户实验，但不是很推荐。

```bash
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
```

我这里创建的用户名为 `learner` ，后续的实验也是按照这个用户名。

#### 安装数据库

首先创建数据库，这里命名为 `crashcourse` ，登陆 `root` 用户，然后执行

```sql
CREATE DATABASE crashcourse;
```

然后赋予 `learner` 用户权限

```sql
GRANT ALL PRIVILEGES ON crashcourse.* TO 'learner'@'localhost';
```

退出登陆，然后通过这个[链接](https://forta.com/wp-content/uploads/books/0672327120/mysql_scripts.zip)（这是书上给的链接，你可以到书上指定的官网找到这个链接）下载脚本压缩包，解压缩后得到两个 `sql` 脚本：`create.sql` 和 `populate.sql` ，分别负责创建数据库和写入数据。可以通过执行下面的命令（注意你可能需要替换用户名和数据库名字）安装数据库

```bash
mysql -u learner -p crashcourse < create.sql
mysql -u learner -p crashcourse < populate.sql
```

这里使用 `crashcourse` 作为数据库名，后续的内容也是基于这个数据库名。

然后可以登陆并使用数据库

```bash
mysql -u learner -p crashcourse
```

可以简单查看，执行语句

```sql
SELECT * FROM customers;
```

应该会列出

```
+---------+----------------+---------------------+-----------+------------+----------+--------------+--------------+---------------------+
| cust_id | cust_name      | cust_address        | cust_city | cust_state | cust_zip | cust_country | cust_contact | cust_email          |
+---------+----------------+---------------------+-----------+------------+----------+--------------+--------------+---------------------+
|   10001 | Coyote Inc.    | 200 Maple Lane      | Detroit   | MI         | 44444    | USA          | Y Lee        | ylee@coyote.com     |
|   10002 | Mouse House    | 333 Fromage Lane    | Columbus  | OH         | 43333    | USA          | Jerry Mouse  | NULL                |
|   10003 | Wascals        | 1 Sunny Place       | Muncie    | IN         | 42222    | USA          | Jim Jones    | rabbit@wascally.com |
|   10004 | Yosemite Place | 829 Riverside Drive | Phoenix   | AZ         | 88888    | USA          | Y Sam        | sam@yosemite.com    |
|   10005 | E Fudd         | 4545 53rd Street    | Chicago   | IL         | 54545    | USA          | E Fudd       | NULL                |
+---------+----------------+---------------------+-----------+------------+----------+--------------+--------------+---------------------+
5 rows in set (0.00 sec)

```

## MySQL 工具

### 服务机和客户机

MySQL的使用通常需要服务机和客户机。服务机是与数据打交道的软件，也就是数据库管理系统，而客户机则是用户用来与服务机交互的软件。服务机和客户机可以在两台计算机（通常是这样），也可以在同一台计算机。客户机软件不是数据库管理系统（DBMS），而是MySQL提供的工具。在 `Java` 中，常用于与数据库管理系统交互的是 `JDBC` 包。

### MySQL工具

比较常用的客户机有mysql命令行实用程序，MySQL Administrator和MySQL Query Browser，我目前只安装了mysql命令行实用程序，后续的实验基于此开展。

## 简单使用

这里简单介绍 mysql命令行实用程序的简单使用。

### 选择数据库

使用如下命令

```sql
USE <databasename>;
```

比如按照《MySQL必知必会》中的数据库以及我上面的操作，就应该是（后面的所有例子都不再说明这一点）

```sql
USE crashcourse;
```

会得到如下输出

```sql
Database changed
```

### 简单的显示

显示数据库可以用如下的语句

```sql
SHOW DATABASES;
```

显示数据库的表可以用如下的语句

```sql
SHOW TABLES;
```

显示一张表的列可以用如下的语句

```sql
SHOW COLUMN FROM <tablename>;
```

比如按照《MySQL必知必会》中的数据库可以如下显示 `customers` 表中的列

```sql
SHOW COLUMN FROM customers;
```

这可以用 `DESCRIBE` 语句替代

```sql
DESCRIBE customers;
```

还有其他的显示相关的语句，更具体的参考书籍。

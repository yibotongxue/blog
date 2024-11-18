# 使用 Docker Registry 搭建私有镜像仓库

在上一篇[文章](https://yibotongxue.github.io/blog/blog/docker-mindspore.html)中我们通过 `Docker` 安装了 `MindSpore` ，其中遇到的关于 `Docker` 的问题之一就是仓库问题，在中国大陆我们无法直接访问 DockerHub ，在上一篇[文章](https://yibotongxue.github.io/blog/blog/docker-mindspore.html)我们通过使用镜像源的方式解决了拉取镜像的问题，但 DockerHub 还有托管镜像的功能。比如我们在上一篇[文章](https://yibotongxue.github.io/blog/blog/docker-mindspore.html)里就构建了自己的 `MindSpore` 镜像，或者我们在容器进行了操作后会将容器导出镜像，我们有时会需要将其同步到云端，或者是为了在不同机器传输的方便，或者是为了备份，这时一般人就可以将其推送到 DockerHub ，然后需要的时候在 `pull` 下来。但是，由于特殊的原因，这里我们就不采取这个方式，而是分享以下几个方法：

## 打包镜像进行保存

由于 DockerHub 无法访问和使用，我们可以将镜像打包、压缩，将压缩后的文件上传网盘，比如[百度网盘](https://pan.baidu.com)等。关于 Docker 镜像的打包，可以参考[这篇文章](https://developer.aliyun.com/article/1376348)，但为了节省空间，我们可以在打包之后进行压缩。具体的可以执行下面的命令，以我们上一篇[文章](https://yibotongxue.github.io/blog/blog/docker-mindspore.html)构建的 `MindSpore` 镜像为例

```bash
# docker save -o [打包的tar名称，可以自己设定] [镜像名称]:[镜像标签]
docker save -o mindspore.tar mindspore:latest
```

然后可以进行压缩

```bash
# 替换成上面的得到的tar包名称
gzip mindspore.tar
```

而后将得到的 `.tar.gz` 文件上传网盘，即可实现备份和同步。使用的时候可以下载压缩包，然后执行

```bash
gunzip mindspore.tar.gz
docker load -i mindspore.tar
```

然后就可以看到镜像下载下来了。

## 通过国内云服务提供的容器镜像服务托管镜像

上面的方法虽然可行，但并不优雅，又需要打包，又需要压缩，使用的时候需要下载、解压缩和加载，远没有 `docker pull` 一条命令来得方便。虽然 DockerHub 使用不了，但国内很多云服务平台提供了容器镜像服务，对个人开发者也有免费的服务，可以实现对 Docker 镜像的托管，我使用的是[阿里云](https://www.aliyun.com/)提供的容器镜像服务，具体的可以参考[官方文档](https://help.aliyun.com/zh/acr/user-guide/use-a-container-registry-personal-edition-instance-to-push-and-pull-images?spm=a2c4g.11186623.0.nextDoc.6bd94e80baUKdS)和这篇[社区文章](https://developer.aliyun.com/article/1575426)，这里就不赘述了。当然，国内还有很多优秀的云服务平台，比如[腾讯云](https://cloud.tencent.com/)，[华为云](https://www.huaweicloud.com/)等，都有提供类似的服务，你可以根据自己的需求选择。

## 使用 Docker Registry 搭建私有镜像仓库

我们也可以使用 Docker Registry 在自己的服务器上搭建自己的私有镜像仓库。不过，其实性价比并不高，需要时间搭建不说，用起来也麻烦，而且服务器还是要付费的，国内的云服务平台提供的容器镜像服务的免费额度很充足，像[阿里云](https://www.aliyun.com/)可以拥有 300 个镜像仓库，如果是自己的服务器，想要能容纳 300 个镜像仓库，光是存储空间就是一笔不小的费用。我也主要只是自己搭建着玩，服务器用的也是学校提供的免费配额，所以可能并没有太大的参考意义，但还是分享一下我的方法。

### 服务器环境的搭建

我的服务器操作系统是 Rocky9.4 ，有 20G 的系统盘和一个 80G 的数据盘，1个核心，内存 1G。这里我从头讲一下服务器环境的搭建，主要是做一个记录，以便以后查阅。因为服务器用的是学校自己的平台提供的，所以很多操作可能并没有很大的通用性，参考意义不大，你可以直接跳过这一节。

#### 增加交换内存

由于我们的服务器内存不是很多，我们可以为其增加交换内存，以解决部分可能由内存不足带来的问题。关于交换内存，具体可以看[这篇文章](https://blog.csdn.net/whatday/article/details/108942838)，这里给出创建命令，相关方法来自[Kimi](https://kimi.moonshot.cn/)：

```bash
# 创建 Swap 文件，具体大小可以自己设定，一般内存不足 4G 的时候设置为 4G
sudo fallocate -l 4G /swapfile
# 设置权限，确保只有 root 用户可以访问（好吧，其实我也不清楚这方面的内容）
sudo chmod 600 /swapfile
# 格式化 Swap 文件
sudo mkswap /swapfile
# 启用 Swap 文件
sudo swapon /swapfile
# 确保 Swap 文件在开机启动时自动挂载
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

然后可以通过这个命令查看是否添加成功

```bash
free -h
```

如果添加成功，应该得到类似这样的输出

```bash
               total        used        free      shared  buff/cache   available
Mem:           1.9Gi       735Mi       490Mi       5.0Mi       906Mi       1.2Gi
Swap:          4.0Gi          0B       4.0Gi
```

#### 将家目录挂载数据盘

系统盘一般使用的是 SSD 类型，这个价格一般比较高，而数据盘可以使用 HDD 类型，价格比较低。很多时候我们可以把家目录挂载到数据盘，可以起到降低整体存储成本的作用。云服务平台一般可以在创建云主机的时候选择挂载数据盘，这里主要只是介绍将加目录挂再到数据盘的方法。相关方法来自[Kimi](https://kimi.moonshot.cn/)。

> [!WARNING]
> 下面的操作仅仅是我的记录，也仅在我的有限次数、有限环境种类内成功了，在你的环境、你的尝试的时候很可能是不正确的，请注意谨慎参考

> [!CAUTION]
> 下面的操作可能会破坏系统环境，请考虑风险，具体地建议查阅手册或者询问系统管理员，而不是直接复制我的命令

首先执行这条命令，

```bash
sudo fdisk -l
```

观察其输出，一般地会是这样

```bash
Disk /dev/sda: 40 GiB, 42949672960 bytes, 83886080 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 31748190-66BF-49ED-98E7-104532CBE235

Device       Start      End  Sectors  Size Type
/dev/sda1  2099200 83886046 81786847   39G Linux filesystem
/dev/sda14    2048    10239     8192    4M BIOS boot
/dev/sda15   10240   227327   217088  106M EFI System
/dev/sda16  227328  2097152  1869825  913M Linux extended boot

Partition table entries are not in disk order.


Disk /dev/sdb: 60 GiB, 64424509440 bytes, 125829120 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

注意到 `/dev/sdb` 下面并没有类似这样的输出

```bash
Device       Start      End  Sectors  Size Type
/dev/sda1  2099200 83886046 81786847   39G Linux filesystem
/dev/sda14    2048    10239     8192    4M BIOS boot
/dev/sda15   10240   227327   217088  106M EFI System
/dev/sda16  227328  2097152  1869825  913M Linux extended boot

Partition table entries are not in disk order.
```

> [!WARNING]
> 注意，你的磁盘名字可能不是 `sda` 和 `sdb`


这其实说明了 `/dev/sdb` 并没有分区，我们需要进行分区。如果是这样

```bash
Disk /dev/sda: 40 GiB, 42949672960 bytes, 83886080 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 31748190-66BF-49ED-98E7-104532CBE235

Device       Start      End  Sectors  Size Type
/dev/sda1  2099200 83886046 81786847   39G Linux filesystem
/dev/sda14    2048    10239     8192    4M BIOS boot
/dev/sda15   10240   227327   217088  106M EFI System
/dev/sda16  227328  2097152  1869825  913M Linux extended boot

Partition table entries are not in disk order.


Disk /dev/sdb: 60 GiB, 64424509440 bytes, 125829120 sectors
Disk model: QEMU HARDDISK   
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xf7411b02

Device     Boot Start       End   Sectors Size Id Type
/dev/sdb1        2048 125829119 125827072  60G 83 Linux
```

则不需要分区，可以直接跳过下面的一步了。如果需要分区，可以执行这样的命令，首先创建挂载点，具体的目录可以自己选择，这里选择 `/mnt/data` 。

```bash
sudo mkdir /mnt/data
```

然后确定分区

```bash
sudo fdisk /dev/sdb
```

这一步会带你进入分区的操作，可以参考[这篇文章](https://blog.csdn.net/u012964600/article/details/134603643)，或者简单的按下 `n` ，然后一直回车（选择默认），然后按 `w` 即可。

完成分区之后可以选择格式化磁盘，也就是执行这个命令

```bash
sudo mkfs.ext4 /dev/sdb1
```

然后挂载新分区，也就是执行下面的命令

```bash
sudo mount /dev/sdb1 /mnt/data
```

然后创建新的 `home` 目录，也就是执行

```bash
sudo mkdir /mnt/data/home
```

再将原来 `home` 目录的数据复制过去，也就是执行这条命令

```bash
sudo rsync -aXS --exclude='/*/.gvfs' /home/. /mnt/data/home/
```

可以测试一下新的 `home` 目录是否正常，执行这条命令

```bash
sudo mount --bind /mnt/data/home /home
```

然后重启服务器，登录并检查所有用户数据是否正常访问。如果测试结果正常，可以更新 `/etc/fstab` 文件，从而将 `home` 目录永久挂载到数据盘，具体的可以在 `/etc/fstab` 文件添加如下内容

```bash
UUID=UUID_OF_DATA_DISK /mnt/data ext4 defaults 0 2
/mnt/data/home /home none bind 0 0
```

然后重新挂载，也就是执行这条命令

```bash
sudo mount -a
```

然后就成功地将家目录挂载到数据盘了。

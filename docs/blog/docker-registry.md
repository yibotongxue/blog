# 使用 Docker Registry 搭建私有镜像仓库

在[这篇文章](./docker-mindspore)中我们通过 `Docker` 安装了 `MindSpore` ，其中遇到的关于 `Docker` 的问题之一就是仓库问题，在中国大陆我们无法直接访问 DockerHub ，[在这篇文章](./docker-mindspore)我们通过使用镜像源的方式解决了拉取镜像的问题，但 DockerHub 还有托管镜像的功能。比如我们在[这篇文章](./docker-mindspore)里就构建了自己的 `MindSpore` 镜像，或者我们在容器进行了操作后会将容器导出镜像，我们有时会需要将其同步到云端，或者是为了在不同机器传输的方便，或者是为了备份，这时一般人就可以将其推送到 DockerHub ，然后需要的时候在 `pull` 下来。但是，由于特殊的原因，这里我们就不采取这个方式，而是分享以下几个方法：

## 打包镜像进行保存

由于 DockerHub 无法访问和使用，我们可以将镜像打包、压缩，将压缩后的文件上传网盘，比如[百度网盘](https://pan.baidu.com)等。关于 Docker 镜像的打包，可以参考[这篇文章](https://developer.aliyun.com/article/1376348)，但为了节省空间，我们可以在打包之后进行压缩。具体的可以执行下面的命令，以我们[这篇文章](./docker-mindspore)构建的 `MindSpore` 镜像为例

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

参考[这篇文章](./server-setup)。

### 安装 Docker-ce 和替换镜像源

参考[这篇文章](./docker-mindspore)。

### 拉取 Registry 镜像并运行容器

首先执行下面的命令拉取 `Registry` 镜像，关于 `Registry` 镜像，可以参考[官方介绍](https://docs.docker.com/registry/)。

```bash
docker pull registry
```

然后执行下面的命令运行容器

```bash
docker run -itd -v /home/docker/registry/:/var/lib/registry -p 5000:5000 --restart=always --name registry registry:latest
```

这里 `-itd` 中 `-d` 选项是指定容器后台运行，而 `/home/docker/registry/:/var/lib/registry` 是将容器 `/var/lib/registry` 挂载到宿主机的 `/home/docker/registry` 目录， `/var/lib/registry` 是容器默认防止存储的镜像的地方，这样挂载一方面可以使用数据盘而不占用系统盘，另一方面也方便了后面我们删除容器镜像的操作。更具体地介绍可以参考[这篇文章](https://cloud.tencent.com/developer/article/1698396)。

同时，为了后面删除镜像的方便，我们进入容器修改其配置文件，也就是执行下面的命令

```bash
docker exec -it registry /bin/sh
```

然后打开配置文件目录，用 `vi` 编辑其，

```bash
cd /etc/docker/registry
vi config.yml
```

具体的编辑是， `config.yml` 默认的内容会是

```yaml
version: 0.1
log:
  fields:
    service: registry
storage:
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
http:
  addr: :5000
  headers:
    X-Content-Type-Options: [nosniff]
health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3
```

我们添加这条语句到 `storage` 条目下，

```yaml
delete:
  enabled: true
```

编辑后应该是

```yaml
version: 0.1
log:
  fields:
    service: registry
storage:
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
  delete:
    enabled: true
http:
  addr: :5000
  headers:
    X-Content-Type-Options: [nosniff]
health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3
```

然后保存并退出，再重启容器即可，重启容器可以执行这条命令

```bash
docker restart registry
```


另一个方法可以参考这篇[知乎文章](https://zhuanlan.zhihu.com/p/509797691)。

### 查看镜像仓库

可以通过这样的命令查看仓库里面的镜像，注意，这条命令应该在服务器执行

```bash
curl http://localhost:5000/v2/_catalog
```

或者在客户端（比如你的本地机器，也就是使用这个镜像托管服务的机器）上执行

```bash
curl http://[IP]:5000/v2/_catalog
```

其中 `[IP]` 应该替换为你的服务器 `ip` 地址。

### 上传镜像

#### 给镜像打标签

这里的操作需要在客户端机器进行（显然），首先给你要上传的镜像打 `tag` ，比如对于 `ubuntu:24.04` 镜像，我们这样打 `tag`，执行下面的命令

```bash
# docker tag [本地镜像名称]:[本地镜像标签] [服务器 ip]:[转发端口]/[你希望上传的镜像仓库名称]:[你希望上传的镜像版本号]
docker tag ubuntu:24.04 [IP]:5000/ubuntu:24.04
```

其中第二处的 `ubuntu:24.04` 你是可以修改的。

#### 推送镜像到服务器

然后可以尝试上传镜像，但我们这里服务器提供的是 `http` 服务，我们需要添加对其的信任才能推送（好吧，我也不了解这方面的知识），也就是在客户端的 `/etc/docker/daemon.json` 添加以下内容：

```json
"insecure-registries":["[IP]"]
```

具体的可以参考[这篇文章](https://cloud.tencent.com/developer/article/1698396)。

推送的时候比较容易，就是执行

```bash
docker push [打完标签的镜像]
```

即可，比如我们上面的示例得到的镜像是 `[ip]:5000/ubuntu:24.04` ，所以就是

```bash
docker push [ip]:5000/ubuntu:24.04
```

### 拉取镜像

拉取镜像也比较容易，在客户端执行下面的命令

```bash
# docker pull [ip]:[端口]/[镜像仓库名称]:[镜像版本]
docker pull [ip]:5000/ubuntu:24.04
```

注意替换你的服务器 `ip` 和镜像仓库名称、版本。

### 删除镜像

这就是一个比较麻烦的问题了。[这篇文章](https://zhuanlan.zhihu.com/p/509797691)写得比较好，可以参考其。这里简单按照其中的内容写一下文章中写到的两种方法，以下的方法可以在服务器上执行，或者在客户端执行。注意，这篇文章的这部分内容是参考[这篇文章](https://zhuanlan.zhihu.com/p/509797691)的，仅仅作为我自己学习的记录，如果你有类似的问题，建议直接参考[这篇文章](https://zhuanlan.zhihu.com/p/509797691)。

#### 官方方法

[这篇文章](https://zhuanlan.zhihu.com/p/509797691)首先介绍了官方方法。

##### 查询镜像标签列表

首先查询镜像标签列表，执行这条命令：

```bash
# 服务器上
# curl 'http://localhost:[端口]/v2/[镜像名称]/tags/list'
curl 'http://localhost:5000/v2/ubuntu/tags/list'

# 客户端上
# curl 'http://[服务器ip]:[端口]/v2/[镜像名称]/tags/list'
curl 'http://[ip]:5000/v2/ubuntu/tags/list'
```

##### 查询 `digest`

然后查询 `digest` ，注意，这条命令网上很多都不能正确得到结果，因为少了 `-sS -H 'Accept: application/vnd.docker.distribution.manifest.v2+json'` ，正确的应该执行

```bash
# 服务器上
# curl -i -sS -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' 'http://localhost:[端口]/v2/[镜像名称]/manifests/[镜像标签]'
curl -i -sS -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' 'http://localhost:5000/v2/ubuntu/manifests/24.04' | grep Docker-Content-Digest

# 客户端上
# curl -i -sS -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' 'http://[服务器ip]:[端口]/v2/[镜像名称]/manifests/[镜像标签]'
curl -i -sS -H 'Accept: application/vnd.docker.distribution.manifest.v2+json' 'http://[服务器ip]:5000/v2/ubuntu/manifests/24.04' | grep Docker-Content-Digest
```

正确的话应该会得到类似这样的输出

```bash
Docker-Content-Digest: sha256:744c384e95f65494cd8ce7b560dcce9cb4c2f46b49792fe3cb0dba603ff20522
```

其中 `sha256:744c384e95f65494cd8ce7b560dcce9cb4c2f46b49792fe3cb0dba603ff20522` 就是我们查询的 `digest` 值。

##### 删除镜像

然后删除镜像，也就是执行

```bash
# 服务器上
# curl -X DELETE http://localhost:[端口]/v2/centos/manifests/[上面得到的digest值]
curl -X DELETE http://localhost:5000/v2/centos/manifests/sha256:a1801b843b1bfaf77c501e7a6d3f709401a1e0c83863037fa3aab063a7fdb9dc

# 服务器上
# curl -X DELETE http://[服务器ip]:[端口]/v2/centos/manifests/[上面得到的digest值]
curl -X DELETE http://[服务器ip]:5000/v2/centos/manifests/sha256:a1801b843b1bfaf77c501e7a6d3f709401a1e0c83863037fa3aab063a7fdb9dc
```

##### 垃圾回收

然后进行垃圾回收，也就是执行下面的命令，注意这个需要在服务器执行

```bash
docker exec registry bin/registry garbage-collect /etc/docker/registry/config.yml
```

到这里我们就完成了删除。

##### 检查删除效果

这时如果查看标签列表，也就是执行下面的命令

```bash
# 服务器上
# curl 'http://localhost:[端口]/v2/[镜像名称]/tags/list'
curl 'http://localhost:5000/v2/ubuntu/tags/list'

# 客户端上
# curl 'http://[服务器ip]:[端口]/v2/[镜像名称]/tags/list'
curl 'http://[ip]:5000/v2/ubuntu/tags/list'
```

会发现 `tags` 为 `null` 了，也就是我们的删除成功了。但到这里我们还没有删除整个镜像仓库，只是删除了具体的某个标签的镜像，如果执行

```bash
# 服务器上
curl http://localhost:5000/v2/_catalog

# 客户端上
curl http://[IP]:5000/v2/_catalog
```

会发现即使没有镜像了，镜像仓库还是存在。当然，这是可以理解的，也是合理的。

#### 暴力方法

[这篇文章](https://zhuanlan.zhihu.com/p/509797691)还提供了暴力方法，直接删除镜像文件，这里也分享一下。

##### 删除镜像文件

简单的就可以进入容器删除，比如执行这条命令，注意这条命令需要在服务器执行

```bash
# docker exec registry rm -rf /var/lib/registry/docker/registry/v2/repositories/[镜像仓库名称]
docker exec registry rm -rf /var/lib/registry/docker/registry/v2/repositories/ubuntu
```

或者我们已经将容器的 `/var/lib/registry` 映射到了 宿主机的 `/home/docker/registry` （或者你映射的其他目录），那么我们可以直接删除，比如执行

```bash
# sudo rm -rf [挂载的本地目录]/docker/registry/v2/repositories/[镜像仓库名称]
sudo rm -rf /home/docker/registry/docker/registry/v2/repositories/ubuntu
```

注意，这里删除的是整个仓库，而无法删除某个具体的标签，同时你需要 `sudo` 权限。

##### 进行垃圾回收

然后进行垃圾回收，也就是执行

```bash
docker exec registry bin/registry garbage-collect /etc/docker/registry/config.yml
```

再重启容器，也就是执行

```bash
docker restart registry
```

就可以完成删除了。

##### 检查删除情况

你可以通过查看镜像仓库来检查是否删除好了，也就是执行

```bash
# 服务器上
curl http://localhost:5000/v2/_catalog

# 客户端上
curl http://[IP]:5000/v2/_catalog
```

会发现你删除的镜像仓库已经不出现在列表里面了。

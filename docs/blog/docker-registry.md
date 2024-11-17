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

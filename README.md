# xdk-cli

微信小程序cli脚手架，从目前小打卡的脚手架抽离出来的部分功能

目前只有快速创建模版（页面/组件）功能，后续会逐步增加自动化发布，版本号控制，环境变量切换，自动生成文档等一些有趣实用的功能


觉得有用的小伙伴希望可以点个star～ 😄😄😄

### 安装

使用npm进行全局安装
```bash
    npm install -g xdk-cli
```

当安装成功后可以使用查看当前版本号
```bash
    xdk-cli -v
```

使用 -h 查看当前提供的功能介绍
```bash
    xdk-cli -h
```

### 创建配置文件

需要在项目目录下创建xdk.config.js

```javacript
module.exports = {

    // 小程序路径(可选，默认当前目录)
    app: './',

    // 模版文件夹目录(可选，默认使用cli默认模版，使用默认模版情况下false即可)
    template: './template'
};
```


### 创建模版文件

提供自动识别分包，页面，添加到app.json, ${page}.json的功能



```bash

    # 输入创建命令
    xdk-cli create

    # 选择创建模式
    ? Select the mode you want to create (Use arrow keys)
    ❯ page
      component
```

#### 创建page

```bash
    # 输入页面名称
    ? Set page name (e.g: index):

    # 选择所属分包（none为主包）
    ? Set page ownership module (Use arrow keys or type to search)

    # 创建成功
    >> createPage success
```


#### 创建component

```bash
    # 输入组件名称
    ? Set component name (e.g: index):

    # 选择组件所属范围
    ? Select component scope (Use arrow keys)
    ❯ global
      module
      page

    # 选择所属页面/分包/全局范围
    Set component ownership pages
    ❯ index
    logs
    user

    # 创建成功
    >> createComponent success
```


#### 自定义模版文件

每个项目可能需要的模版都不太一致，xdk-cli提供一个文件夹插槽，方便自定义需要使用的模版

```javascript
    // 在xcli.config.js 中配置模版目录
    module.exports = {
        // 模版文件夹
        template: './template'
    };
```
小程序目录结构如下，component同理

![1563431286470.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/268444/1563431296214-3e22f795-aed5-4a6e-aa35-b31ed389ce2d.jpeg#align=left&display=inline&height=314&name=1563431286470.jpg&originHeight=314&originWidth=278&size=23556&status=done&width=278)

# 联系我

如果你有好的意见或建议，欢迎扫面下面二维码交流 👇

![image.png](https://cdn.nlark.com/yuque/0/2019/png/268444/1563369257803-52c9ac80-aa26-4d7d-83bf-f084db01ec5b.png#align=left&display=inline&height=896&name=image.png&originHeight=896&originWidth=674&size=232174&status=done&width=674)

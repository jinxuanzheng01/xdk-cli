# xdk-cli
微信小程序cli脚手架，目前只有快速创建模版（页面/组件）功能，后续会逐步增加自动化发布，版本号控制，环境变量切换，自动生成文档等一些有趣实用的功能


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

需要在项目目录下创建cli.config.js

```javacript
module.exports = {

    // 小程序路径(可选，默认当前目录)
    app: './',

    // 模版文件夹目录(可选，默认使用cli默认模版，使用默认模版情况下false即可)
    template: './template'
};
```


### 创建模版文件

```bash

    # 输入创建命令
    xdk-cli create

    # 选择创建模式
    ? Select the mode you want to create (Use arrow keys)
    ❯ page
      component
```

##### 创建page

```bash
    # 输入页面名称
    ? Set page name (e.g: index):

    # 选择所属分包（none为主包）
    ? Set page ownership module (Use arrow keys or type to search)

    # 创建成功
    >> createPage success
```


##### 创建component

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



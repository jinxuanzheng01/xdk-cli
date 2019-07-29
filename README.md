# xdk-cli

> 微信小程序cli脚手架，作者平时有些忙，如果有哪些同学对这个项目感兴趣，可以一起进行维护和开发

目前提供了：
- 快速创建启动模版功能【页面 / 组件】
- 发布体验版功能，
- 设置版本号，版本描述功能
- 自定义指令功能


注：自定义指令配合发布钩子可以做更多有趣的事情，例如下文配置文件中的的**更换环境变量**，**提交版本commit**等

觉得有用的小伙伴希望可以点个star～ 😄😄😄

![QQ20190716-183106-HD (1).gif](https://user-gold-cdn.xitu.io/2019/7/18/16c0438ebf8aeead?w=1140&h=660&f=gif&s=525160)

## 安装

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

### 项目目录结构

1. 小程序项目默认开发目录
``` 
    # 目录结构
    - app(小程序目录)
        - pages
        - app.js
        - app.json
        - project.config.json
    - xdk.config.js
    - xdk.verison.json

    # xdk.config.js 设置
    module.exports = {
        entry: './app'
    }
```

2. gulp/rollup/webpack 等编译形式目录
```
    # 目录结构
    - dist
    - src(小程序目录)
        - pages
        - app.js
        - app.json
        - project.config.json
    - xdk.config.js
    - xdk.verison.json

    # xdk.config.js 设置
    module.exports = {
        entry: './src',
        output: './dist'
    }
```




### 创建配置文件

需要在项目目录下创建xdk.config.js

```javacript
module.exports = {

    // 小程序路径(可选，默认当前目录)
    entry: './src',

    // 小程序输出文件(可选，默认等于entry)
    // 使用gulp，webpack等打包工具开发会导致开发者编辑文件目录和微信编辑器使用目录不同，需要手动进行指定
    output: './dist'

    // 模版文件夹目录(可选，默认使用cli默认模版，使用默认模版情况下false即可)
    template: './template',

    // 发布体验版功能的钩子
    publishHook: {

        // 发布之前（注：必须返回一个Promise对象）
        // 参数answer 为之前回答一系列问题的结果
        before(answer) {
            this.spawnSync('gulp', [`--env=${answer.isRelease ?'online' : 'stage'}`]);
            return Promise.resolve();
        },

        // 发布之后（注：必须返回一个Promise对象）
        after(answer) {
        
            // 是否提交git commit 
            let {isCommitGitLog} = await inquirerGitCommit.call(this);

            // 当为正式版本时进行的操作
            if (!!answer.isRelease) {
                // 修改本地version code
                await rewriteVersionCode.call(this);

                // 提交git log
                !!isCommitGitLog && await commitGitLog.call(this);
            }

            return Promise.resolve();
        }
    },

    // 自定义命令
    // 自定义指令需要用 run 来执行，例如 xdk-cli run dev
    customScripts: [
        {
            name: 'dev',
            desc: '开发模式',
            async callback() {
                let {env} = await inquirerEnvAsync.call(this);
                this.spawn('gulp', [`--env=${env}`, '--watch']);
                return Promise.resolve();    
            }
        },
        {
            name: 'sassDoc',
            desc: '生成sass文档',
            async callback() {
             
                // 生成文档
                await sassdoc([`./src/stylesheets/**/*.scss`, `./src/stylesheets/*.scss`], {
                    dest: './sassdoc',
                    verbose: true,
                    display: {
                        access: ['public'],
                        alias: true,
                    },
                    autofill: ["requires", "throws", "content"],
                });

                // 自动打开文件
                if (process.platform === 'darwin'){
                    this.spawnSync('open', [`./sassdoc/index.html`]);
                }else {
                    this.log(`目前自动打开浏览器功能只支持darwin内核, 当前内核为: ${process.platform}`);
                    this.log(`请打开当前路径下html，路径：./sassdoc/index.html`);
                }
                
                return Promise.resolve();
            }
        }
    ],
};

// 询问是否提交git记录
function inquirerGitCommit() {
    return this.inquirer.prompt([
        {
            type: 'confirm',
            name: 'isCommitGitLog',
            message: '是否提交git log ?'
        }
    ])
}

// 提交git commit 到log
function commitGitLog() {
    return new Promise((resolve, reject) => {
        this.spawnSync('git', ['add', '.']);
        this.spawnSync('git', ['commit', '-m', `docs: 更改版本号为${versionConf.version}`]);
        resolve();
    });
}

```


## 创建模版文件

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

## 自动发布体验版
> 目前只支持mac版本，作者缺乏windows开发环境（比较懒），如果有朋友对该项目感兴趣可以参与进来
1. 创建版本号文件，xdk.config.json

``` json
{
	"version": "0.1.9",
	"versionDesc": "版本描述"
}
```

2. 输入命令行 ``xdk-cli publish``


``` bash

# 正式版本会修改本地的xdk.config.json文件, 非正式版本不会，且体验版版本号默认为0.0.0
? 是否为正式发布版本? Yes         

# 设置版本号
? 设置上传的版本号 (当前版本号: 0.1.9.4): raise alter: 0.1.9

# 设置版本描述
? 写一个简单的介绍来描述这个版本的改动过: 提交了一个正式版

Initializing...
idePortFile: /Users/xuan/Library/Application Support/微信开发者工具/Default/.ide
IDE server has started, listening on http://127.0.0.1:27563
initialization finished
uploading project...

upload success
>> 上传体验版成功, 登录微信公众平台 https://mp.weixin.qq.com 获取体验版二维码
```

如果失败 
- 请确认是否登录微信开发者工具是否为**登录状态**
- **重启**开发者工具

3. 发布前/后的钩子函数
因为在发布体验版前，可能需要对小程序做一些前置/后置的操作，例如发布前重新打包编译，所以提供了一个钩子函数, 可在 ``xdk.config.js``进行设置
 
``` javascript
publishHook: {
    // 发布之前（注：必须返回一个Promise对象）
    before(answer) {
        console.log('要开始发布了');
        return Promise.resolve();
    },

    // 发布之后（注：必须返回一个Promise对象）
    after(answer) {
        console.log('发布结束了');
        return Promise.resolve();
    }
},
``` 


## 对外开放的API

所有的函数体内部的this指向继承了一些cli内部的一些基础方法

##### this.spawn            开启子进程（异步）

``` javascript
// this.spawn
// @param - String   命令行
// @param - Args     参数
// @param - Any      默认'ingerit' ['inherit' | null ]

publishHook: {
    before(answer) {
        this.spawn('gulp', [`--env=${env}`, '--watch']);
        return Promise.resolve();
    },
}
```

##### this.spawnSync            开启子进程（同步）

``` javascript
// this.spawnSync
// @param - String   命令行
// @param - Args     参数
// @param - Any      默认'ingerit' ['inherit' | null ]

publishHook: {
    before(answer) {
        this.spawnSync('git', ['add', '.']);
        this.spawnSync('git', ['commit', '-m', `docs: 更改版本号为${versionConf.version}`]);
        return Promise.resolve();
    },
}
```
##### this.log              日志输出

``` javascript
// this.log
// @param - String  文本内容
// @param - String  类型 success | error
publishHook: {
    after(answer) {
        this.log('成功了～');
        this.log('成功了～', 'error');
        return Promise.resolve();
    },
}
```
##### this.inquirer        交互命令行

详情查看 https://github.com/SBoudrias/Inquirer.js

``` javascript
publishHook: {
    async after(answer) {

        // 是否提交git commit 
        let {isCommitGitLog} = await inquirerGitCommit.call(this);
        return Promise.resolve();
    }
}
function inquirerEnvAsync() {
    return this.inquirer.prompt([
        {
            type: 'list',
            name: 'env',
            message: '选择当前所使用的环境:',
            choices: [
                'online',
                'stage',
            ],
        }
    ]);
}
```

# 联系我

如果你有好的意见或建议，欢迎扫面下面二维码交流 👇

![image.png](https://cdn.nlark.com/yuque/0/2019/png/268444/1563369257803-52c9ac80-aa26-4d7d-83bf-f084db01ec5b.png#align=left&display=inline&height=896&name=image.png&originHeight=896&originWidth=674&size=232174&status=done&width=674)

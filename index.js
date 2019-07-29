#!/usr/bin/env node

const version                       = require('./package').version;                 // 版本号

/* = package import
-------------------------------------------------------------- */

const program                       = require('commander');                         // 命令行解析
const path                          = require('path');                              // 路径
const chalk                         = require('chalk');                             // 控制台输出样式

const Util                          =  require('./util');                           // 工具函数
const Log                           =  require("./log");                            // 控制台输出

/* = task events
-------------------------------------------------------------- */
const createProgramFs               = require('./lib/create-program-fs');           // 创建项目文件
const publishWeApp                  = require('./lib/publish-weapp');               // 发布体验版

/* = config
-------------------------------------------------------------- */
const Config                        = require('./config');                          // 配置信息   
const originPrototype               = require('./lib/originPrototype');             // 继承原型

// 用户配置
let userConf = null;                                                

/* = set version
-------------------------------------------------------------- */

// 设置版本号
program.version(version, '-v, --version');

/* = deal receive command
-------------------------------------------------------------- */

// 快速生成模版 页面/组件
program
    .command('create')
    .description('创建页面或组件')
    .action((cmd, options) => createProgramFs());

// 发布体验版本
program
    .command('publish')
    .description('发布体验版')
    .action((cmd, options) => publishWeApp(getUserConf()));

// 自定义指令
program
    .command('run <cmd>')
    .description('当前<cmd>包含: ' + getCustomScriptsDesc(getUserConf({level: 1})))
    .action(async (cmd, options) => {
        // 当前命令
        let curScript = getUserConf().customScripts.find((el, idx) => el.name === cmd);

        // 执行回调
        await curScript.callback.call(originPrototype, cmd, options);
    });


/* = function
-------------------------------------------------------------- */

// 获取用户配置文件
function getUserConf({level = 2} = {}) {

   // 存在时，直接使用缓存
   if (!!userConf) return userConf;

   // 校验：当前是否存在配置文件
   let confPath = `${Config.dir_root}/xdk.config.js`;
   if (!Util.checkFileIsExists(confPath)) {
       if(level === 2) { 
            Log.error('当前项目尚未创建xdk.config.js文件');
            return process.exit(1);
       }else{   
           return null;
       }
    }
    
    // 获取的配置文件
    let data = userConf = require(confPath);

    // 模版文件目录
    !!data.template && (Config.template = path.resolve(path.join(Config.dir_root, data.template || '')));

    // 自定义指令默认值
    data.customScripts = data.customScripts || [], setConfig(data);

    return data;
}

// 设置配置
function setConfig(param) {
       // 小程序入口目录
       Config.entry  = path.resolve(path.join(Config.dir_root, param.entry || ''));

       // 小程序输出目录
       Config.output = path.resolve(path.join(Config.dir_root, param.output || param.entry || ''));
}

// 获取自定义指令描述信息     
function getCustomScriptsDesc(param) {
    return (param && !!param.customScripts.length) 
                ? (param.customScripts.map(el => chalk.yellow(el.name) + ' -> ' + chalk.blue(el.desc)).join(' | '))
                : '当前项目尚无自定义命令';
}



/* = main entrance
-------------------------------------------------------------- */
program.parse(process.argv);

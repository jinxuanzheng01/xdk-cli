const inquirer               =  require('inquirer');                     // 启动交互命令行
const fs                     =  require('fs');                           // 文件读取模块
const path                   =  require('path');                         // 路径模块
const fuzzy                  =  require('fuzzy');                        // 模糊查找
const jsonFormat             =  require("json-format");                  // json格式化（用来美化文件输出格式）
const Log                    =  require("../log");                       // 控制台输出
const Util                   =  require('../util');                      // 工具函数


/* = define variable
-------------------------------------------------------------- */
let Config                   =  require('../config');                    // 获取配置项

// 全局属性
const __Data__ = {
    // 小程序项目app.json
    appJson: '',

    // 小程序所有分包
    appModuleList: {},

    // 小程序所有页面
    appPagesList: {}
};

// 校验文件名称
const regEn = /[`~!@#$%^&*()+<>?:"{},.\/;'[\]]/im, regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;

// 解析app.json
function getAppJson() {
    let appJsonRoot = path.join(`${Config.appRoot}`, 'app.json');
    try {
        return require(appJsonRoot);
    }catch (e) {
        Log.error(`未找到app.json, 请检查当前文件目录是否正确，path: ${appJsonRoot}`);
        process.exit(1);
    }
}

// 获取文件名/模块名
function getPathSubSting(path) {
    let result = '', arr = path.split('/');
    for (let i = arr.length; i > 0; i--) {
        if (!!arr[i]) {
            result = arr[i];
            break;
        }
    }
    return result;
}


// app.json 业务对象
let parseAppJson = () => {

    // app Json 原文件
    let appJson = __Data__.appJson = getAppJson();

    // 获取主包页面
    appJson.pages.forEach(path => __Data__.appPagesList[getPathSubSting(path)] = path);

    // 获取分包，页面列表
    appJson.subPackages.forEach(item => {
        __Data__.appModuleList[getPathSubSting(item.root)] = item.root;
        item.pages.forEach(path => __Data__.appPagesList[getPathSubSting(path)] = item.root);
    });
};


/* = define plugin
-------------------------------------------------------------- */

// 注册插件
inquirer.registerPrompt('autocomplete', require('@moyuyc/inquirer-autocomplete-prompt'));


/* = Func
-------------------------------------------------------------- */
async function createPage(name, modulePath = '') {

    // 模版文件路径
    let templateRoot = `${Config.template}/page`;
    if (!Util.checkFileIsExists(templateRoot)) {
        Log.error(`未找到模版文件, 请检查当前文件目录是否正确，path: ${templateRoot}`);
        return;
    }


    // 业务文件夹路径
    let page_root = `${Config.appRoot}/` + modulePath + 'pages/' + name;

    // 查看文件夹是否存在
    let isExists = await Util.checkFileIsExists(page_root);
    if (isExists) {
        Log.error(`当前页面已存在，请重新确认, path: ` + page_root);
        return;
    }

    // 创建文件夹
    await Util.createDir(page_root);

    // 获取文件列表
    let files = await Util.readDir(templateRoot);

    // 复制文件
    await Util.copyFilesArr(templateRoot, `${page_root}/${name}`, files);

    // 填充app.json
    await writePageAppJson(name, modulePath);

    // 成功提示
    Log.success(`createPage success, path: ` + page_root);
}

// 创建组件
async function createComponent({name, scope, parentModule, parentPage = {}}) {

    // 小程序目录
    let appRoot = Config.appRoot;

    // 模版文件路径
    let templateRoot = `${Config.template}/component`;
    if (!Util.checkFileIsExists(templateRoot)) {
        Log.error(`未找到模版文件, 请检查当前文件目录是否正确，path: ${templateRoot}`);
        return;
    }

    // 业务文件夹路径
    let component_root = {
        'global': `${appRoot}/component/${name}`,
        'module': `${appRoot}/${parentModule}/component/${name}`,
        'page'  : `${appRoot}/${parentPage.root}pages/${parentPage.page}/component/${name}`
    }[scope];

    // 查看文件夹是否存在
    let isExists = await Util.checkFileIsExists(component_root);
    if (isExists) {
        Log.error('组件已存在，请重新确认，path:' + component_root);
        return;
    }

    // 创建文件夹
    await Util.createDir(component_root);

    // 获取文件列表
    let files = await Util.readDir(templateRoot);

    // 复制文件
    await Util.copyFilesArr(templateRoot, `${component_root}/${name}`, files);

    // 填充app.json
    scope === 'page' && await writeComponentPageJson(name, parentPage, `${appRoot}/${parentPage.root}pages/${parentPage.page}`);

    // 成功提示
    Log.success(`createPage success, path: ` + component_root);
}

// 新增页面写入app.json
function writePageAppJson(name, modulePath = '') {
    return new Promise((resolve, reject) => {
        let appJson = __Data__.appJson;

        // 填充主包
        if (!modulePath) {
            appJson.pages.push(`pages/${name}/${name}`);
        } else{
            // 当前下标q
            let idx = Object.values(__Data__.appModuleList).indexOf(modulePath);
            if (idx === -1) {
                Log.error('app.json不存在当前module, path: ' + modulePath);
                return;
            }
            appJson.subPackages[idx].pages.push(`pages/${name}/${name}`);
        }

        // 写入文件
        fs.writeFile(`${Config.appRoot}/app.json`, jsonFormat(appJson), (err) => {
            if(err){
                Log.error('自动写入app.json文件失败，请手动填写，并检查错误');
                reject();
            }else {
                resolve();
            }
        });
    });
}

// 新增页面组件写入page.json
function writeComponentPageJson(name, parentPage, path) {
    return new Promise(resolve => {
        let jsonPath = `${path}/${parentPage.page}.json`;
        let jsonConf = JSON.parse(fs.readFileSync(jsonPath));

        // 不存在时默值为对象
        !jsonConf.usingComponents && (jsonConf.usingComponents = {});

        // 添加路径
        jsonConf.usingComponents[name] = `./component/${name}/${name}`;

        // 写入文件
        fs.writeFile(jsonPath, jsonFormat(jsonConf), (err) => {
            if(err){
                console.log(chalk.red('自动写入page, json文件失败，请手动填写，并检查错误'));
                resolve();
            }else {
                resolve();
            }
        });

    });
}


/* = define question
-------------------------------------------------------------- */
// 问题队列
let question = [

    // 选择模式使用 page -> 创建页面 | component -> 创建组件
    {
        type: 'list',
        name: 'mode',
        message: 'Select the mode you want to create',
        choices: [
            'page',
            'component',
        ]
    },


    // 设置名称
    {
        type: 'input',
        name: 'name',
        message: answer => `Set ${answer.mode} name (e.g: index):`,
        validate(input) {
            let done = this.async();

            // 输入不得为空
            if (input === '') {
                done('You must input name!!!');
                return;
            }

            // 校验文件名是否符合规范
            if (regEn.test(input) || regCn.test(input)) {
                done('The name entered does not conform to the rule!!!');
                return;
            }

            done(null, true);
        }
    },

    // 设置page所属module
    {
        type: 'autocomplete',
        name: 'modulePath',
        message: 'Set page ownership module',
        choices: [],
        suggestOnly: false,
        source(answers, input) {
            return Promise.resolve(fuzzy.filter(input, ['none', ...Object.keys(__Data__.appModuleList)]).map(el => el.original));
        },
        filter(input) {
            if (input === 'none') {
                return '';
            }
            return __Data__.appModuleList[input];
        },
        when(answer) {
            return answer.mode === 'page';
        }
    },



    // 选择组件作用域
    {
        type: 'list',
        name: 'componentScope',
        message: 'Select component scope',
        choices: [
            'global',
            'module',
            'page',
        ],
        when(answer) {
            return answer.mode === 'component';
        }
    },

    // 设置组件所属module
    {
        type: 'autocomplete',
        name: 'parentModule',
        message: 'Set component ownership module',
        choices: [],
        suggestOnly: false,
        source(answers, input) {
            return Promise.resolve(fuzzy.filter(input, Object.keys(__Data__.appModuleList)).map(el => el.original));
        },
        filter(input) {
            if (input === 'none') {
                return '';
            }
            return __Data__.appModuleList[input];
        },
        when(answer) {
            return answer.mode === 'component' && answer.componentScope === 'module';
        }
    },

    // 设置组件所属pages
    {
        type: 'autocomplete',
        name: 'parentPage',
        message: 'Set component ownership pages',
        choices: [],
        suggestOnly: false,
        source(answers, input) {
            return Promise.resolve(fuzzy.filter(input, Object.keys(__Data__.appPagesList)).map(el => el.original));
        },
        filter(input) {
            if (input === 'none') {
                return '';
            }
            return {page: input, root: __Data__.appPagesList[input]};
        },
        when(answer) {
            return answer.mode === 'component' && answer.componentScope === 'page';
        }
    },
];


// Main
module.exports = function() {

    // 校验：当前是否存在配置文件
    let customConfPath = `${Config.dir_root}/xcli.Config.js`;
    if (!Util.checkFileIsExists(customConfPath)) {
        Log.error('当前项目尚未创建xcli.config.js文件');
        return;
    }

    // 获取用户配置项
    let {app, template = ''} = require(customConfPath);

    // 小程序目录
    Config.appRoot = path.join(Config.dir_root, app);

    // 模版文件目录
    !!template && (Config.template = path.join(Config.dir_root, template));

    // 解析appJson
    parseAppJson();

    // 问题执行
    inquirer.prompt(question).then(answers => {
        let {name, mode, componentScope, modulePath = '', parentModule, parentPage} = answers;
        switch (mode) {
            case 'page':
                createPage(name, modulePath);
                break;
            case 'component':
                createComponent({name, scope: componentScope, parentModule, parentPage});
        }
    });
};

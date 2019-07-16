#!/usr/bin/env node

const version                       = require('./package').version;                 // 版本号

/* = package import
-------------------------------------------------------------- */

const program                       = require('commander');                         // 命令行解析

/* = task events
-------------------------------------------------------------- */
const createProgramFs               = require('./lib/create-program-fs');           // 创建项目文件


/* = config
-------------------------------------------------------------- */

// 设置版本号
program.version(version, '-v, --version');

/* = deal receive command
-------------------------------------------------------------- */

program
    .command('create')
    .description('创建页面或组件')
    .action((cmd, options) => createProgramFs(cmd));


/* = main entrance
-------------------------------------------------------------- */
program.parse(process.argv);

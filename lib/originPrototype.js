
const spawn                  =  require('cross-spawn');                  // 开启子进程
const Log                    =  require("../log");                       // 控制台输出
const inquirer               =  require('inquirer');                     // 启动交互命令行
module.exports = {

    // 开启子进程（异步）
    spawn: function(cmd = '', args = [], stdio = 'inherit') {
        return spawn(cmd, args, { stdio });
    },

    // 开启子进程（同步）
    spawnSync: function(cmd = '', args = [], stdio = 'inherit') {
        let {status} = spawn.sync(cmd, args, { stdio });
        return !!status ? (Log.error('运行失败: ' + cmd + ' ' + args.join(' ')), process.exit(1)) : true;
    },

    // 日志输出
    log: function(content, type = 'success') {
        Log[type](content);
    },

    // 交互命令行
    inquirer: inquirer
};
const chalk                  =  require('chalk');                        // 命令行log样式

module.exports = {
    success(msg) {
        console.log(chalk.green(`>> ${msg}`));
    },
    error(msg) {
        console.log(chalk.red(`>> ${msg}`));
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
/**
 * 获取以本地时区为准的时间
 *
 * @param {number} excelNum 以天为单位
 * @returns {Date}
 */
function getLocalDate(excelNum) {
    // UTC 毫秒数
    var baseDate = Date.UTC(1900, 0, -1);
    var dateUTC = baseDate + excelNum * 24 * 60 * 60 * 1000;
    // 对应的本地毫秒数
    var tzOffset = new Date().getTimezoneOffset();
    var utcAsLocal = dateUTC + tzOffset * 60 * 1000;
    return new Date(utcAsLocal);
}
exports.getLocalDate = getLocalDate;
/**
 * To upper camel case 首字母转为大写
 * @param str
 * @returns string
 */
function toUpperCamelCase(str) {
    return str.replace(/^[a-z]/, function (f) { return f.toUpperCase(); });
}
exports.toUpperCamelCase = toUpperCamelCase;
var Logger = /** @class */ (function () {
    function Logger(prefix) {
        if (prefix === void 0) { prefix = ""; }
        this.prefix = prefix;
    }
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, [chalk.blue("    → " + this.prefix + ": ")].concat(args));
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=util.js.map
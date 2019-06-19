"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var models_1 = require("./models");
var resolve = require('path').resolve;
var _a = require('fs'), readdirSync = _a.readdirSync, statSync = _a.statSync;
var chalk = require('chalk');
/**
 * 根据列字段，解析字段类型
 * @param colKey 字段名
 */
function getTypeByColKey(colKey) {
    var bool = /bool/i;
    var dateTime = /datetime/i;
    var date = /date/i;
    var time = /time/i;
    return bool.exec(colKey)
        ? models_1.Type.Boolean
        : dateTime.exec(colKey)
            ? models_1.Type.DateTime
            : date.exec(colKey)
                ? models_1.Type.Date
                : time.exec(colKey)
                    ? models_1.Type.Time
                    : models_1.Type.String;
}
exports.getTypeByColKey = getTypeByColKey;
/**
 * 获取以本地时区为准的时间
 *
 * @param {number} excelNum 以天为单位
 * @returns {Date}
 */
function getLocalDate(excelNum, isTime) {
    if (isTime === void 0) { isTime = false; }
    // UTC 毫秒数
    var today = new Date();
    // TODO:待优化
    var baseDate = isTime
        ? Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        : Date.UTC(1900, 0, -1);
    var dateUTC = Math.round(baseDate + excelNum * 24 * 60 * 60 * 1000);
    // 对应的本地毫秒数
    var tzOffset = new Date().getTimezoneOffset();
    var utcAsLocal = Math.round(dateUTC + tzOffset * 60 * 1000);
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
function toLowerCamelCase(str) {
    return str.replace(/^[A-Z]/, function (f) { return f.toLowerCase(); });
}
exports.toLowerCamelCase = toLowerCamelCase;
function getXlsxFiles(dir) {
    var _a;
    var subDirs = readdirSync(dir);
    var files = subDirs.map(function (subDir) {
        var res = resolve(dir, subDir);
        return statSync(res).isDirectory() ? getXlsxFiles(res) : res;
    });
    return (_a = Array.prototype).concat.apply(_a, files).filter(function (file) { return file.match(/^[^\~\$]+\.xlsx/); });
}
exports.getXlsxFiles = getXlsxFiles;
var Logger = /** @class */ (function () {
    function Logger(prefix) {
        if (prefix === void 0) { prefix = ''; }
        this.prefix = prefix;
    }
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, [chalk.blue('    → ' + this.prefix + ': ')].concat(args));
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=util.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var xlsx_1 = require("xlsx");
var workBook_1 = require("./workBook");
var util_1 = require("./util");
/**
 * 提起 xlsx 文件中每个 Sheet 的信息
 * @param filePath  文件路径
 */
function parse(filePath) {
    var extname = path.extname(filePath);
    var basename = path.basename(filePath);
    var filename = basename.replace(extname, '');
    var workBook = xlsx_1.readFile(filePath, {
    // cellDates: true, //1900年以前采用的上海时区，导致时开启配置获取的时间不准 https://github.com/SheetJS/js-xlsx/issues/1470
    });
    return workBook_1.getSheetMap(filename, workBook);
}
exports.parse = parse;
var REG_GROUP_START = /!CASE_START/;
var REG_GROUP_END = /!CASE_END/;
exports.NAME_SUFFIX = 'Case';
/**
 * 获取目录下 xlsx 文件的数据
 * @param dir 文件夹路径
 */
function getCases(dir) {
    var data = new Map();
    util_1.getXlsxFiles(dir).forEach(function (file) {
        parse(file).forEach(function (sheet, name) {
            name = name + exports.NAME_SUFFIX;
            // 重新分组
            var groupStart = sheet.ungrouped
                .filter(function (item) { return REG_GROUP_START.exec(item.value); })
                .map(function (item) { return Number(item.cellName.replace(/[a-z]/gi, '')) - 2; });
            var groupEnd = sheet.ungrouped
                .filter(function (item) { return REG_GROUP_END.exec(item.value); })
                .map(function (item) { return Number(item.cellName.replace(/[a-z]/gi, '')) - 2; });
            var grouped = sheet.grouped;
            var reGrouped = groupStart.length === 0
                ? grouped
                : groupStart.map(function (st, i) {
                    var end = groupEnd[i];
                    return grouped.slice(st, end);
                });
            data.set(name, reGrouped);
        });
    });
    return data;
}
exports.getCases = getCases;
//# sourceMappingURL=index.js.map
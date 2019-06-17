"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var xlsx_1 = require("xlsx");
var sheet_1 = require("./sheet");
/**
 * 提起 xlsx 文件中每个 Sheet 的信息
 * @param filePath  文件路径
 */
function parse(filePath) {
    var extname = path.extname(filePath);
    var basename = path.basename(filePath);
    var filename = basename.replace(extname, "");
    var workBook = xlsx_1.readFile(filePath, {
    // cellDates: true, //1900年以前 采用的上海时区，导致时开启配置获取的时间不准 https://github.com/SheetJS/js-xlsx/issues/1470
    });
    return sheet_1.getSheetMap(filename, workBook);
}
exports.parse = parse;
//# sourceMappingURL=index.js.map
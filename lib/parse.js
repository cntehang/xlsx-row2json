// const log = require("./logger").logger("parse-xlsx", true);
import { format as dateFormat } from "date-fns";
import { Type } from "./model";
import { getLocalDate, toUpperCamelCase } from "./util";
// const log = new Logger("parse");
// const typeMap = new Map([
//   ["b", Type.Boolean],
//   ["s", Type.String],
//   ["e", Type.Error],
//   ["n", Type.Number],
//   ["d", Type.Date]
// ]);
/**
 * 从表的第一行读取列的信息
 * @param workSheet
 */
function getColsInfo(workSheet) {
    return Object.keys(workSheet)
        .filter(function (cellName) { return cellName.match(/[A-Z]+1$/); })
        .map(function (cellName) {
        var colName = cellName.replace(/\d/, "");
        var colKey = workSheet[cellName].v;
        var dateType = getTypeByColKey(colKey); //
        return {
            colName: colName,
            colKey: colKey,
            dataType: dateType
        };
    });
}
/**
 * 获取行数
 * @param workSheet
 * @returns row count
 */
function getRowCount(workSheet) {
    return workSheet["!ref"]
        ? Number(workSheet["!ref"].split(":")[1].replace(/[A-Z]+/, ""))
        : 0;
}
function getGrouped(workSheet, colsInfo, rowCount) {
    return new Array(rowCount).fill(undefined).map(function (_, index) {
        var row = {};
        colsInfo.forEach(function (k) {
            var dKey = k.colKey;
            var cellName = k.colName + (index + 2);
            var cell = workSheet[cellName];
            var dValue = cell ? cell.v : "";
            // 日期时间处理
            if (dValue && k.dataType === Type.Date) {
                var date = getLocalDate(dValue);
                var formats = dValue < 1
                    ? "HH:mm" // < 1 处理为时间
                    : Number.isInteger(dValue)
                        ? "YYYY-MM-DD" // 整数处理为日期
                        : "YYYY-MM-DD HH:mm"; // 有小数处理为日期 + 时间
                dValue = dateFormat(date, formats);
                // log("dValue format: ", dValue);
            }
            //数值处理为字符串 ungrouped
            row[dKey] =
                k.dataType === Type.Number
                    ? (k.dataType = Type.String) && String(dValue)
                    : dValue;
        });
        return row;
    });
}
/**
 * Gets sheet
 * @param workSheet
 * @returns sheet
 */
function getSheetInfo(workSheet) {
    // 列信息
    var colsInfo = getColsInfo(workSheet);
    // log("keys: ", cellInfos);
    // 行数
    var rowCount = getRowCount(workSheet);
    // log("rowCount: ", rowCount);
    // 全部单元格
    var cells = Object.keys(workSheet).filter(function (cellName) {
        return cellName.match(/[A-Z]+\d+$/);
    });
    var grouped = getGrouped(workSheet, colsInfo, rowCount);
    var ungrouped = cells.map(function (cellName) {
        return {
            cellName: cellName,
            value: workSheet[cellName].v
        };
    });
    return {
        colsInfo: colsInfo,
        grouped: grouped,
        ungrouped: ungrouped
    };
}
/**
 *
 * @param filename 文件名
 * @param workBook
 */
export function getSheetMap(filename, workBook) {
    var map = new Map();
    workBook.SheetNames.forEach(function (name) {
        var workSheet = workBook.Sheets[name];
        var sheet = getSheetInfo(workSheet);
        // 首字母大写
        var upperCamelCaseName = toUpperCamelCase(filename) +
            (name.match(/Sheet(?:\d+)/) ? "" : toUpperCamelCase(name));
        map.set(upperCamelCaseName, sheet);
    });
    // log(map);
    return map;
}
/**
 * 根据指定的字段名，解析字段类型
 * @param colKey 字段名
 */
function getTypeByColKey(colKey) {
    var bool = /bool/i;
    var dateOrTime = /date|time/i;
    return bool.exec(colKey)
        ? Type.Boolean
        : dateOrTime.exec(colKey)
            ? Type.Date
            : Type.String;
}
//# sourceMappingURL=parse.js.map
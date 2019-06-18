"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const log = require("./logger").logger("parse-xlsx", true);
var date_fns_1 = require("date-fns");
var models_1 = require("./models");
var util_1 = require("./util");
/**
 * 从表的第一行读取列的信息
 * @param workSheet
 */
function getColsInfo(workSheet) {
    return Object.keys(workSheet)
        .filter(function (cellName) { return cellName.match(/[A-Z]+1$/); })
        .map(function (cellName) {
        var colName = cellName.replace(/\d/, '');
        var colKey = workSheet[cellName].v;
        var dateType = util_1.getTypeByColKey(colKey);
        return {
            colName: colName,
            colKey: colKey,
            dataType: dateType,
        };
    });
}
/**
 * 获取行数
 * @param workSheet
 * @returns row count
 */
function getRowCount(workSheet) {
    return workSheet['!ref']
        ? Number(workSheet['!ref'].split(':')[1].replace(/[A-Z]+/, ''))
        : 0;
}
function getCellValue(cell, col) {
    var originalValue = cell ? cell.v : '';
    var value;
    if (typeof originalValue === 'boolean') {
        value = originalValue;
    }
    else if (!originalValue) {
        value = '';
    }
    else if (col.dataType === models_1.Type.DateTime ||
        col.dataType === models_1.Type.Date ||
        col.dataType === models_1.Type.Time) {
        var date = util_1.getLocalDate(originalValue, col.dataType === models_1.Type.Time);
        var formats = col.dataType === models_1.Type.Time
            ? 'HH:mm'
            : col.dataType === models_1.Type.Date
                ? 'YYYY-MM-DD'
                : 'YYYY-MM-DD HH:mm';
        value = date_fns_1.format(date, formats);
    }
    else {
        value = String(originalValue);
    }
    return value;
}
/**
 * 获取以列头字段分组的数据
 * @param workSheet
 * @param colsInfo
 * @param rowCount
 */
function getGrouped(workSheet, colsInfo, rowCount) {
    return new Array(rowCount).fill(undefined).map(function (_, index) {
        var row = {};
        colsInfo.forEach(function (col) {
            var colKey = col.colKey;
            var cellName = col.colName + (index + 2);
            var cell = workSheet[cellName];
            var cellValue = getCellValue(cell, col);
            if (col.dataType !== models_1.Type.Boolean) {
                col.dataType = models_1.Type.String;
            }
            row[colKey] = cellValue;
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
            value: workSheet[cellName].v,
        };
    });
    return {
        colsInfo: colsInfo,
        grouped: grouped,
        ungrouped: ungrouped,
    };
}
/**
 *
 * @param filename 文件名
 * @param workBook
 */
function getSheetMap(filename, workBook) {
    var map = new Map();
    workBook.SheetNames.forEach(function (name) {
        var workSheet = workBook.Sheets[name];
        var sheet = getSheetInfo(workSheet);
        // 首字母大写
        var upperCamelCaseName = util_1.toUpperCamelCase(filename) +
            (name.match(/Sheet(?:\d+)/) ? '' : util_1.toUpperCamelCase(name));
        map.set(upperCamelCaseName, sheet);
    });
    return map;
}
exports.getSheetMap = getSheetMap;
//# sourceMappingURL=workBook.js.map
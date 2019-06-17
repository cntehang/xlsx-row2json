// const log = require("./logger").logger("parse-xlsx", true);
import { format as dateFormat } from "date-fns";
import { WorkBook, WorkSheet } from "xlsx";

import { ColInfo, Type, SheetInfo, UngroupedCell } from "./model";
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
function getColsInfo(workSheet: any): ColInfo[] {
  return Object.keys(workSheet)
    .filter(cellName => cellName.match(/[A-Z]+1$/))
    .map(cellName => {
      const colName = cellName.replace(/\d/, "");
      const colKey = workSheet[cellName].v;
      const dateType = getTypeByColKey(colKey); //
      return {
        colName,
        colKey,
        dataType: dateType
      };
    });
}
/**
 * 获取行数
 * @param workSheet
 * @returns row count
 */
function getRowCount(workSheet: WorkSheet): number {
  return workSheet["!ref"]
    ? Number(workSheet["!ref"].split(":")[1].replace(/[A-Z]+/, ""))
    : 0;
}

function getGrouped(
  workSheet: WorkSheet,
  colsInfo: ColInfo[],
  rowCount: number
) {
  return new Array(rowCount).fill(undefined).map((_, index) => {
    const row: { [key: string]: string } = {};

    colsInfo.forEach(k => {
      const dKey = k.colKey;
      const cellName = k.colName + (index + 2);
      const cell = workSheet[cellName];
      let dValue = cell ? cell.v : "";
      // 日期时间处理
      if (dValue && k.dataType === Type.Date) {
        const date = getLocalDate(dValue);
        const formats =
          dValue < 1
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
function getSheetInfo(workSheet: WorkSheet): SheetInfo {
  // 列信息
  const colsInfo = getColsInfo(workSheet);
  // log("keys: ", cellInfos);
  // 行数
  const rowCount = getRowCount(workSheet);
  // log("rowCount: ", rowCount);
  // 全部单元格
  const cells = Object.keys(workSheet).filter(cellName =>
    cellName.match(/[A-Z]+\d+$/)
  );
  const grouped = getGrouped(workSheet, colsInfo, rowCount);
  const ungrouped: UngroupedCell[] = cells.map(cellName => {
    return {
      cellName,
      value: workSheet[cellName].v
    };
  });
  return {
    colsInfo: colsInfo,
    grouped,
    ungrouped
  };
}

/**
 *
 * @param filename 文件名
 * @param workBook
 */
export function getSheetMap(
  filename: string,
  workBook: WorkBook
): Map<string, SheetInfo> {
  const map = new Map();

  workBook.SheetNames.forEach((name: string) => {
    const workSheet = workBook.Sheets[name];
    const sheet = getSheetInfo(workSheet);
    // 首字母大写
    const upperCamelCaseName =
      toUpperCamelCase(filename) +
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
function getTypeByColKey(colKey: string): Type {
  const bool = /bool/i;
  const dateOrTime = /date|time/i;
  return bool.exec(colKey)
    ? Type.Boolean
    : dateOrTime.exec(colKey)
    ? Type.Date
    : Type.String;
}

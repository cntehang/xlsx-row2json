// const log = require("./logger").logger("parse-xlsx", true);
import { format as dateFormat } from 'date-fns'
import { WorkBook, WorkSheet, CellObject } from 'xlsx'

import { ColInfo, Type, SheetInfo, UngroupedCell, Row } from './models'
import { getLocalDate, toUpperCamelCase, getTypeByColKey } from './util'

/**
 * 从表的第一行读取列的信息
 * @param workSheet
 */
function getColsInfo(workSheet: any): ColInfo[] {
  return Object.keys(workSheet)
    .filter(cellName => cellName.match(/[A-Z]+1$/))
    .map(cellName => {
      const colName = cellName.replace(/\d/, '')
      const colKey = workSheet[cellName].v
      const dateType = getTypeByColKey(colKey)

      return {
        colName,
        colKey,
        dataType: dateType,
      }
    })
}
/**
 * 获取行数
 * @param workSheet
 * @returns row count
 */
function getRowCount(workSheet: WorkSheet): number {
  return workSheet['!ref']
    ? Number(workSheet['!ref'].split(':')[1].replace(/[A-Z]+/, ''))
    : 0
}

function getCellValue(cell: CellObject, col: ColInfo): string | boolean {
  const originalValue = cell ? cell.v : ''
  let value

  if (typeof originalValue === 'boolean') {
    value = originalValue
  } else if (!originalValue) {
    value = ''
  } else if (
    col.dataType === Type.DateTime ||
    col.dataType === Type.Date ||
    col.dataType === Type.Time
  ) {
    const date = getLocalDate(
      originalValue as number,
      col.dataType === Type.Time,
    )
    const formats =
      col.dataType === Type.Time
        ? 'HH:mm'
        : col.dataType === Type.Date
        ? 'YYYY-MM-DD'
        : 'YYYY-MM-DD HH:mm'
    value = dateFormat(date, formats)
  } else {
    value = String(originalValue)
  }
  return value
}
/**
 * 获取以列头字段分组的数据
 * @param workSheet
 * @param colsInfo
 * @param rowCount
 */
function getGrouped(
  workSheet: WorkSheet,
  colsInfo: ColInfo[],
  rowCount: number,
) {
  return new Array(rowCount).fill(undefined).map((_, index) => {
    const row: Row = {}

    colsInfo.forEach(col => {
      const colKey = col.colKey
      const cellName = col.colName + (index + 2)
      const cell = workSheet[cellName]
      const cellValue = getCellValue(cell, col)
      if (col.dataType !== Type.Boolean) {
        col.dataType = Type.String
      }
      row[colKey] = cellValue
    })
    return row
  })
}

/**
 * Gets sheet
 * @param workSheet
 * @returns sheet
 */
function getSheetInfo(workSheet: WorkSheet): SheetInfo {
  // 列信息
  const colsInfo = getColsInfo(workSheet)
  // log("keys: ", cellInfos);
  // 行数
  const rowCount = getRowCount(workSheet)
  // log("rowCount: ", rowCount);
  // 全部单元格
  const cells = Object.keys(workSheet).filter(cellName =>
    cellName.match(/[A-Z]+\d+$/),
  )
  const grouped = getGrouped(workSheet, colsInfo, rowCount)
  const ungrouped: UngroupedCell[] = cells.map(cellName => {
    return {
      cellName,
      value: workSheet[cellName].v,
    }
  })
  return {
    colsInfo,
    grouped,
    ungrouped,
  }
}

/**
 *
 * @param filename 文件名
 * @param workBook
 */
export function getSheetMap(
  filename: string,
  workBook: WorkBook,
): Map<string, SheetInfo> {
  const map = new Map()

  workBook.SheetNames.forEach((name: string) => {
    const workSheet = workBook.Sheets[name]
    const sheet = getSheetInfo(workSheet)
    // 首字母大写
    const upperCamelCaseName =
      toUpperCamelCase(filename) +
      (name.match(/Sheet(?:\d+)/) ? '' : toUpperCamelCase(name))

    map.set(upperCamelCaseName, sheet)
  })
  return map
}

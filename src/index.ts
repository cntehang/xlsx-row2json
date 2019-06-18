const path = require('path')
import { readFile as XLSXReadFile } from 'xlsx'
import { SheetInfo, Row } from './models'
import { getSheetMap } from './workBook'
import { getXlsxFiles } from './util'
/**
 * 提起 xlsx 文件中每个 Sheet 的信息
 * @param filePath  文件路径
 */
export function parse(filePath: string): Map<string, SheetInfo> {
  const extname = path.extname(filePath)
  const basename = path.basename(filePath)
  const filename = basename.replace(extname, '')

  const workBook = XLSXReadFile(filePath, {
    // cellDates: true, //1900年以前采用的上海时区，导致时开启配置获取的时间不准 https://github.com/SheetJS/js-xlsx/issues/1470
  })
  return getSheetMap(filename, workBook)
}

const REG_GROUP_START = /!CASE_START/
const REG_GROUP_END = /!CASE_END/
const NAME_SUFFIX = 'Case'
/**
 * 获取目录下 xlsx 文件的数据
 * @param dir 文件夹路径
 */
export function getData(dir: string): Map<string, Row[] | Row[][]> {
  const data = new Map()
  getXlsxFiles(dir).forEach(file => {
    parse(file).forEach((sheet, name) => {
      name = name + NAME_SUFFIX
      // 重新分组
      const groupStart = sheet.ungrouped
        .filter(item => REG_GROUP_START.exec(item.value))
        .map(item => Number(item.cellName.replace(/[a-z]/gi, '')) - 2)
      const groupEnd = sheet.ungrouped
        .filter(item => REG_GROUP_END.exec(item.value))
        .map(item => Number(item.cellName.replace(/[a-z]/gi, '')) - 2)

      const grouped = sheet.grouped

      const reGrouped =
        groupStart.length === 0
          ? grouped
          : groupStart.map((st, i) => {
              const end = groupEnd[i]
              return grouped.slice(st, end)
            })

      data.set(name, reGrouped)
    })
  })
  return data
}

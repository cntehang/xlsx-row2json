const path = require("path");
import { readFile as XLSXReadFile } from "xlsx";
import { SheetInfo } from "./model";
import { getSheetMap } from "./sheet";
/**
 * 提起 xlsx 文件中每个 Sheet 的信息
 * @param filePath  文件路径
 */
export function parse(filePath: string): Map<string, SheetInfo> {
  const extname = path.extname(filePath);
  const basename = path.basename(filePath);
  const filename = basename.replace(extname, "");

  const workBook = XLSXReadFile(filePath, {
    // cellDates: true, //1900年以前 采用的上海时区，导致时开启配置获取的时间不准 https://github.com/SheetJS/js-xlsx/issues/1470
  });
  return getSheetMap(filename, workBook);
}

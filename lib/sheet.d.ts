import { WorkBook } from "xlsx";
import { SheetInfo } from "./model";
/**
 *
 * @param filename 文件名
 * @param workBook
 */
export declare function getSheetMap(filename: string, workBook: WorkBook): Map<string, SheetInfo>;

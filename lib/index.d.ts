import { SheetInfo } from "./model";
/**
 * 提起 xlsx 文件中每个 Sheet 的信息
 * @param filePath  文件路径
 */
export declare function parse(filePath: string): Map<string, SheetInfo>;

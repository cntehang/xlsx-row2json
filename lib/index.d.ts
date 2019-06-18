import { SheetInfo, Row } from './models';
/**
 * 提起 xlsx 文件中每个 Sheet 的信息
 * @param filePath  文件路径
 */
export declare function parse(filePath: string): Map<string, SheetInfo>;
/**
 * 获取目录下 xlsx 文件的数据
 * @param dir 文件夹路径
 */
export declare function getData(dir: string): Map<string, Row[] | Row[][]>;

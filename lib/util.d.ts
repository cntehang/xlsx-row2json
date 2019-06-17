/**
 * 获取以本地时区为准的时间
 *
 * @param {number} excelNum 以天为单位
 * @returns {Date}
 */
export declare function getLocalDate(excelNum: number): Date;
/**
 * To upper camel case 首字母转为大写
 * @param str
 * @returns string
 */
export declare function toUpperCamelCase(str: string): string;
export declare class Logger {
    private prefix;
    constructor(prefix?: string);
    log(...args: any[]): void;
}

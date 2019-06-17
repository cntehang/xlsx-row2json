const chalk = require("chalk");
/**
 * 获取以本地时区为准的时间
 *
 * @param {number} excelNum 以天为单位
 * @returns {Date}
 */
export function getLocalDate(excelNum: number): Date {
  // UTC 毫秒数
  const baseDate = Date.UTC(1900, 0, -1);
  const dateUTC = baseDate + excelNum * 24 * 60 * 60 * 1000;
  // 对应的本地毫秒数
  const tzOffset = new Date().getTimezoneOffset();
  const utcAsLocal = dateUTC + tzOffset * 60 * 1000;
  return new Date(utcAsLocal);
}
/**
 * To upper camel case 首字母转为大写
 * @param str
 * @returns string
 */
export function toUpperCamelCase(str: string): string {
  return str.replace(/^[a-z]/, f => f.toUpperCase());
}

export class Logger {
  constructor(private prefix: string = "") {}
  log(...args: any[]) {
    console.log(chalk.blue("    → " + this.prefix + ": "), ...args);
  }
}

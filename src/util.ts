import { Type } from './models'

const { resolve } = require('path')
const { readdirSync, statSync } = require('fs')
const chalk = require('chalk')
/**
 * 根据列字段，解析字段类型
 * @param colKey 字段名
 */
export function getTypeByColKey(colKey: string): Type {
  const bool = /bool/i
  const dateTime = /datetime/i
  const date = /date/i
  const time = /time/i
  return bool.exec(colKey)
    ? Type.Boolean
    : dateTime.exec(colKey)
    ? Type.DateTime
    : date.exec(colKey)
    ? Type.Date
    : time.exec(colKey)
    ? Type.Time
    : Type.String
}
/**
 * 获取以本地时区为准的时间
 *
 * @param {number} excelNum 以天为单位
 * @returns {Date}
 */
export function getLocalDate(excelNum: number, isTime = false): Date {
  // UTC 毫秒数
  const today = new Date()
  // TODO:待优化
  const baseDate = isTime
    ? Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    : Date.UTC(1900, 0, -1)

  const dateUTC = Math.round(baseDate + excelNum * 24 * 60 * 60 * 1000)

  // 对应的本地毫秒数
  const tzOffset = new Date().getTimezoneOffset()
  const utcAsLocal = Math.round(dateUTC + tzOffset * 60 * 1000)

  return new Date(utcAsLocal)
}
/**
 * To upper camel case 首字母转为大写
 * @param str
 * @returns string
 */
export function toUpperCamelCase(str: string): string {
  return str.replace(/^[a-z]/, f => f.toUpperCase())
}
export function toLowerCamelCase(str: string): string {
  return str.replace(/^[A-Z]/, f => f.toLowerCase())
}

export function getXlsxFiles(dir: string) {
  const subDirs = readdirSync(dir)
  const files = subDirs.map((subDir: string) => {
    const res = resolve(dir, subDir)
    return statSync(res).isDirectory() ? getXlsxFiles(res) : res
  })
  return Array.prototype
    .concat(...files)
    .filter(file => file.match(/^[^\~\$]+\.xlsx/))
}

export class Logger {
  constructor(private prefix: string = '') {}
  log(...args: any[]) {
    console.log(chalk.blue('    → ' + this.prefix + ': '), ...args)
  }
}

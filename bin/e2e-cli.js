#! /usr/bin/env node

const program = require('commander')

const { resolve } = require('path')
const { readFileSync, writeFileSync, existsSync } = require('fs')
const { toLowerCamelCase } = require('../lib/util')

const fieldReg = /([A-Z_]+)(?:\s*)=/g
const classNameReg = /class(?:\s+)(\w+)(?:\s+)\{/

program
  .command('page')
  // .alias("p")
  .description('根据 locator 文件中生成 page 文件')
  .option('-p, --loc [file]', 'locator 文件')
  .action(option => {
    const dir = process.cwd()
    const fileName = option.loc
    const locPath = resolve(dir, fileName)
    existsSync(locPath, dir)
      ? writePage(locPath, dir, fileName)
      : console.error('error: file not found ' + locPath)
  })

function writePage(locPath, dir, fileName) {
  const fileContent = readFileSync(locPath, 'utf-8')
  const fields = []
  while ((re = fieldReg.exec(fileContent))) {
    fields.push(re[1])
  }
  const locClassName = classNameReg.exec(fileContent)[1]
  const pageName = locClassName.replace('Loc', 'Page')
  const pageContent = pageTpl(pageName, locClassName, fields)

  const writeFileName = fileName.replace('loc', 'po')
  writeFileSync(dir + '/' + writeFileName, pageContent)
}

function pageTpl(Name, LocName, fields) {
  const locName = toLowerCamelCase(LocName)
  return (
    `import { element, browser, ExpectedConditions as EC } from 'protractor'

export class ${Name} extends AppPage {
  private ${locName} = new ${LocName}()
  ${fields
    .map(FIELD => `${FIELD.toLowerCase()} = element(this.${locName}.${FIELD})`)
    .join('\n  ')}` + '\n}'
  )
}

program.parse(process.argv)

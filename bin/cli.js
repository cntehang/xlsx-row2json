#! /usr/bin/env node

const { resolve } = require('path')
const { writeFileSync } = require('fs')
const program = require('commander')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')

const { parse, NAME_SUFFIX } = require('../lib/index')
const { Logger, getXlsxFiles } = require('../lib/util')
const logger = new Logger('xlsx2models')

updateNotifier({ pkg }).notify()

program.version(pkg.version)
program
  .command('models')
  // .alias("p")
  .description('从 xlsx 文件中解析出 interface')
  .option('-d, --dir [dirPath]', 'xlsx 目录')
  .option('-o ,--outDir [filePath]', '输出目录')
  .action(option => {
    writeModels(option.dir, option.outDir)
  })

function writeModels(src, dist) {
  const basePath = process.cwd()
  src = resolve(basePath, src)
  dist = resolve(basePath, dist)
  logger.log('src ', src)
  logger.log('dis', dist)

  const files = getXlsxFiles(src)
  const content = getModelContent(files)

  writeFileSync(dist, content.join('\n'))
}

function getModelContent(files) {
  const content = []
  files.forEach(file => {
    parse(file).forEach((val, name) => {
      const str = val.colsInfo
        .map(k => {
          return `  ${k.colKey}: ${k.dataType}`
        })
        .join('\n')
      name = name + NAME_SUFFIX
      content.push(`export interface ${name} {\n${str}\n}\n`)
    })
  })
  return content
}

program.parse(process.argv)

#! /usr/bin/env node

const { resolve } = require("path");
const { writeFileSync, readdirSync, statSync } = require("fs");
const program = require("commander");
const updateNotifier = require("update-notifier");
const pkg = require("../package.json");

const { parse } = require("../lib/index");
const { Logger } = require("../lib/util");
const logger = new Logger("xlsx2models");

updateNotifier({ pkg }).notify();

program.version(pkg.version);
program
  .command("parse")
  // .alias("p")
  .description("从 xlsx 文件中解析出 interface")
  .option("-d, --dir [dirPath]", "xlsx 目录")
  .option("-o ,--outDir [filePath]", "输出目录")
  .action(option => {
    writeModel(option.dir, option.outDir);
  });

function writeModel(src, dist) {
  const basePath = process.cwd();
  src = resolve(basePath, src);
  dist = resolve(basePath, dist);
  const files = getFiles(src);
  const content = getModelContent(files);
  logger.log("src ", src);
  logger.log("dis", dist);
  writeFileSync(dist, content.join("\n"));
}
function getFiles(dir) {
  const subDirs = readdirSync(dir);
  const files = subDirs.map(subDir => {
    const res = resolve(dir, subDir);
    return statSync(res).isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype
    .concat(...files)
    .filter(file => file.match(/^[^\~\$]+\.xlsx/));
}
function getModelContent(files) {
  const content = [];
  files.forEach(file => {
    const sheetMap = parse(file);
    // console.log(sheetMap);
    sheetMap.forEach((val, name) => {
      const str = val.colsInfo
        .map(k => {
          return `  ${k.colKey}: ${k.dataType}`;
        })
        .join("\n");
      name = name + "Case";
      content.push(`export interface ${name} {\n${str}\n}\n`);
    });
  });
  return content;
}

program.parse(process.argv);

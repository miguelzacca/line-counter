import { isUtf8 } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'

const EXCLUDE_QUERIES = fs
  .readFileSync('.ignore', 'utf-8')
  .split('\n')
  .filter(Boolean)

function searchFiles(startPath, includeQuery = '*') {
  const queryIsAll = includeQuery === '*'
  const queries = queryIsAll ? includeQuery : includeQuery.split(',')

  const files = []

  function deepSearch(dir) {
    const list = fs.readdirSync(dir, { withFileTypes: true })

    for (const item of list) {
      if (EXCLUDE_QUERIES.some((q) => item.name.includes(q))) {
        continue
      }

      const fullpath = path.join(dir, item.name)

      if (item.isDirectory()) {
        deepSearch(fullpath)
        continue
      }

      const include = queryIsAll || queries.some((q) => fullpath.endsWith(q))
      if (include) {
        files.push(fullpath)
      }
    }
  }

  deepSearch(startPath)
  return files
}

function countAllLines(files) {
  let count = 0

  for (const file of files) {
    const buf = fs.readFileSync(file)
    if (isUtf8(buf)) {
      count += buf.toString().split('\n').length
    }
  }

  return count
}

const [startPath, query] = process.argv.slice(2)

const files = searchFiles(startPath, query)
const lines = countAllLines(files)

console.log(lines)

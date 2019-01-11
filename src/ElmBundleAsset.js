const path = require('path')
const fs = require('fs')
const elm = require('node-elm-compiler')
const terser = require('terser')
const Asset = require('parcel/src/Asset')

class ElmBundleAsset extends Asset {
  constructor (name, options) {
    super(name, options)
    this.type = 'js'
  }

  async parse () {
    const contents = await readFileContents(this.name)
    const bundle = JSON.parse(contents)

    if (!(bundle.modules instanceof Array) || bundle.modules.length === 0) {
      throw new Error(`Elm bundle "${this.name}" must define "modules" non-empty array property.`)
    }

    this.elmBundle = bundle
    await this.getConfig(['elm.json'], {load: false})
  }

  async collectDependencies () {
    const baseDir = path.dirname(this.name)

    const foundDependencies = this.elmBundle.modules
      .map(m => path.join(baseDir, m))
      .map(m => elm.findAllDependencies(m).then(deps => [m, ...deps]))

    const dependencyTree = await Promise.all(foundDependencies);
    const allDependencies = dependencyTree.reduce((a, deps) => [...a, ...deps], [])

    allDependencies.forEach(dep => this.addDependency(dep, { includedInParent: true }));
  }

  async generate () {
    const elmOptions = {
      debug: !this.options.production,
      optimize: this.options.minify,
      cwd: path.dirname(this.name)
    }

    const baseDir = path.dirname(this.name)
    const modules = this.elmBundle.modules.map(m => path.join(baseDir, m))

    const compiled = await elm.compileToString(modules, elmOptions)
    this.contents = `var output = {}; (function() {${compiled.toString()}}).call(output); module.exports = output.Elm;`

    return {
      [this.type]: this.options.minify
        ? minify(this.contents)
        : this.contents
    }
  }
}

function minify (contents) {
  const options = {
    compress: {
      keep_fargs: false,
      passes: 2,
      pure_funcs: [
        'F2',
        'F3',
        'F4',
        'F5',
        'F6',
        'F7',
        'F8',
        'F9',
        'A2',
        'A3',
        'A4',
        'A5',
        'A6',
        'A7',
        'A8',
        'A9'
      ],
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true
    },
    mangle: true,
    rename: false
  }

  const result = terser.minify(contents, options)

  if (result.error) throw result.error

  return result.code
}

function readFileContents (filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}


module.exports = ElmBundleAsset
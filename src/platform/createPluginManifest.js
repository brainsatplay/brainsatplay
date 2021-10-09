const fs = require('fs')
const path = require('path')
let pluginDir = path.join(__dirname,'..','libraries','js','src','plugins')
let pluginDict = {}

const createPluginManifest = () => {

  // Generate Applet Manifest
  let categories = fs.readdirSync(pluginDir)
  categories = categories.filter(c => ((fs.existsSync(path.join(pluginDir,c)) && fs.lstatSync(path.join(pluginDir,c)).isDirectory())))
  
  categories.forEach((category,indOut) => {

    let categoryDir = path.join(pluginDir,category)
    let files = fs.readdirSync(categoryDir)

    // let fileTypes = getFileTypes(files, categoryDir)
    // files = fileTypes.files

    var bar = new Promise((resolve, reject) => {
      handleFiles(files, categoryDir, () => {
        resolve()
      })
    })
    bar.then(() => {
      if (indOut === categories.length-1){

      fs.writeFile('./src/libraries/js/src/plugins/pluginManifest.js', 'export const pluginManifest = ' + JSON.stringify(pluginDict), err => {
        if (err) {
          console.error(err)
          return
        }
        console.log('Plugin manifest written.');
      })
    }
    })
  })
  }

  const getFileTypes = (files, dir) => {
    let directories = []
    files = files.filter(f => {
      if(fs.existsSync(path.join(dir,f)) && fs.lstatSync(path.join(dir,f)).isDirectory()){
        directories.push(f)
        return false
      } else {
        return true
      }
    })

    return {files, directories}
  }

  const handleFiles = (files, dir, onsuccess, category) => {

    let fileTypes = getFileTypes(files ,dir)
    let pathComps = dir.replace(/\\/g,'/').split('/')
    category = (category == null) ? pathComps[pathComps.length - 1] : category

    fileTypes.files.forEach((file,indIn) => {
      let pluginFile = path.join(dir,file)


      // let pluginFile = path.join(dir,file)
      if(fs.existsSync(pluginFile) && file !== 'index.js'){
        let data = fs.readFileSync(pluginFile)
        let decoded = data.toString('utf-8')

        // Get Classname
        let classreg =  /class\s*([^\{\s]+)/g;
        let m1 = classreg.exec(decoded);
        let name = (m1 == null) ? undefined : m1[1]

        // Get Types
        let types = []
        let typereg = /type:\s*([^\},]+)/g;
        let m2

        do {
          m2 = typereg.exec(decoded);
          if (m2) {

            let type = m2[1]              
            types.push(type)
            if (decoded.replaceAll instanceof Function) decoded = decoded.replaceAll(m2[0],"")
          }
      } while (m2);


      types = types.map(t => {
        try {
          if (t.includes('Element')) return t
          else return eval(t)
        } catch (e) {
          return 'TOREMOVE'
          // console.log(e)
        }
      })

      types = types.filter(t => {
        if (t === 'TOREMOVE') return false
        else return true
      })

      types = Array.from(new Set(types))

      let hidden = decoded.match(/static hidden = ([^\n].+)/)
      if (hidden) hidden = eval(hidden[1])

      pluginDict[name] = {name, types, category, hidden}
      pluginDict[name].folderUrl = '../../../../../' + pluginFile.split(path.join(__dirname,'/../'))[1]
      pluginDict[name].folderUrl.replace(/\\/g,'/');
      }
      if (indIn === files.length-1) onsuccess()
      });

      fileTypes.directories.forEach((dirName) => {
        let nextDir = path.join(dir, dirName)
        let files = fs.readdirSync(nextDir)
        handleFiles(files, nextDir, onsuccess, category)
      })
  }
  
  module.exports = createPluginManifest
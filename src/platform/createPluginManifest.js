const fs = require('fs')
const path = require('path')

const createPluginManifest = () => {

  // Generate Applet Manifest
  let pluginDict = {}
  let pluginDir = path.join(__dirname,'..','libraries','js','src','plugins')
  let categories = fs.readdirSync(pluginDir)
  categories = categories.filter(c => ((fs.existsSync(path.join(pluginDir,c)) && fs.lstatSync(path.join(pluginDir,c)).isDirectory())))
  
  categories.forEach((category,indOut) => {

    let categoryDir = path.join(pluginDir,category)
    let files = fs.readdirSync(categoryDir)
    let directories = []
    
    files = files.filter(f => {
      if(fs.existsSync(path.join(categoryDir,f)) && fs.lstatSync(path.join(categoryDir,f)).isDirectory()){
        directories.push(f)
        return false
      } else {
        return true
      }
    })

    var bar = new Promise((resolve, reject) => {
      files.forEach((file,indIn) => {

        let pluginFile = path.join(pluginDir,category,file)
        // let pluginFile = path.join(dir,file)
        if(fs.existsSync(pluginFile)){
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
              if (!types.includes(type)){
                types.push(type)
              }
            }
        } while (m2);

        pluginDict[name] = {types, category}
        pluginDict[name].folderUrl = '../../../../../' + pluginFile.split(path.join(__dirname,'/../'))[1]
        pluginDict[name].folderUrl.replace(/\\/g,'/');
        }
        if (indIn === files.length-1) resolve()
        });
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
  
  module.exports = createPluginManifest
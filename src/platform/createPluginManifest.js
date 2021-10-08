const fs = require('fs')
const path = require('path')

const createPluginManifest = () => {

  // Generate Applet Manifest
  let pluginDict = {}
  let pluginDir = path.join(__dirname,'..','libraries','js','plugins')
  let categories = fs.readdirSync(pluginDir)
  categories = categories.filter(c => ((fs.existsSync(path.join(pluginDir,c)) && fs.lstatSync(path.join(pluginDir,c)).isDirectory())))
  
  console.log(categories)
  categories.forEach((category,indOut) => {
    let categoryDir = path.join(pluginDir,category)
    let files = fs.readdirSync(categoryDir)
    files = files.filter(f => (fs.existsSync(path.join(categoryDir,f)) && fs.lstatSync(path.join(categoryDir,f)).isDirectory()))
  
    var bar = new Promise((resolve, reject) => {
      files.forEach((file,indIn) => {
        let dir = path.join(pluginDir,category,file)
        console.log(dir)
        let Plugin = path.join(dir,`${file}.js`)
        if(fs.existsSync(Plugin)){
          let instance = new Plugin()
          let data = fs.readFileSync(plugin)
          let decoded = data.toString('utf-8')
            let afterName = decoded.split('"name": ')[1]
            if (afterName == null) afterName = decoded.split('name: ')[1]
            let nameStr = afterName.split('\n')[0]
            let name = nameStr.slice(1,nameStr.lastIndexOf(nameStr[0]))
            pluginDict[name] = {}
            pluginDict[name].folderUrl = '../../../../../' + dir.split(path.join(__dirname,'/src/'))[1]
  
            // let afterDevices = decoded.split('"devices": [')[1]
            // if (afterDevices == null) afterDevices = decoded.split('devices: [')[1]
            // let devicesString1 = afterDevices.split('\n')[0]
            // let deviceSubstring = devicesString1.substring(0,devicesString1.lastIndexOf(']'))
            // let deviceArray = Array.from(deviceSubstring.replace(/'|"|`/g,'').split(','))
            // pluginDict[name].devices = deviceArray 
  
            // let afterCategories = decoded.split('"categories": [')[1]
            // if (afterCategories == null) afterCategories = decoded.split('categories: [')[1]
            // let categoryString1 = afterCategories.split('\n')[0]
            // let categorySubstring = categoryString1.substring(0,categoryString1.lastIndexOf(']'))
            // let categoryArray = Array.from(categorySubstring.replace(/'|"|`/g,'').split(','))
            // pluginDict[name].categories = categoryArray 
        }
        if (indIn === files.length-1) resolve()
        });
    })
    bar.then(() => {
      if (indOut === categories.length-1){
      for(const prop in pluginDict){
        pluginDict[prop]['folderUrl'] = pluginDict[prop]['folderUrl'].replace(/\\/g,'/');
      }
      fs.writeFile('./src/libraries/js/plugins/pluginManifest.js', 'export const pluginManifest = ' + JSON.stringify(pluginDict), err => {
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
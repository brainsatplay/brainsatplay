const fs = require('fs')
const path = require('path')

const createAppletManifest = () => {

// Generate Applet Manifest
let appletDict = {}
let appletDir = path.join(__dirname,'..','applets')
let categories = fs.readdirSync(appletDir)
categories = categories.filter(c => ((fs.existsSync(path.join(appletDir,c)) && fs.lstatSync(path.join(appletDir,c)).isDirectory())))

categories.forEach((category,indOut) => {
  let categoryDir = path.join(appletDir,category)
  let files = fs.readdirSync(categoryDir)
  files = files.filter(f => (fs.existsSync(path.join(categoryDir,f)) && fs.lstatSync(path.join(categoryDir,f)).isDirectory()))

  var bar = new Promise((resolve, reject) => {
    files.forEach((file,indIn) => {
      let dir = path.join(appletDir,category,file)
      let settingsFile = path.join(dir,'settings.js')
      if(fs.existsSync(settingsFile)){
        let data = fs.readFileSync(settingsFile)
        let decoded = data.toString('utf-8')
          let afterName = decoded.split('"name": ')[1]
          if (afterName == null) afterName = decoded.split('name: ')[1]
          let nameStr = afterName.split('\n')[0]
          let name = nameStr.slice(1,nameStr.lastIndexOf(nameStr[0]))
          appletDict[name] = {}
          appletDict[name].folderUrl = '../../../../../' + dir.split(path.join(__dirname,'/../'))[1]

          let afterDevices = decoded.split('"devices": [')[1]
          if (afterDevices == null) afterDevices = decoded.split('devices: [')[1]
          let devicesString1 = afterDevices.split('\n')[0]
          let deviceSubstring = devicesString1.substring(0,devicesString1.lastIndexOf(']'))
          let deviceArray = Array.from(deviceSubstring.replace(/'|"|`/g,'').split(','))
          appletDict[name].devices = deviceArray 

          let afterCategories = decoded.split('"categories": [')[1]
          if (afterCategories == null) afterCategories = decoded.split('categories: [')[1]
          let categoryString1 = afterCategories.split('\n')[0]
          let categorySubstring = categoryString1.substring(0,categoryString1.lastIndexOf(']'))
          let categoryArray = Array.from(categorySubstring.replace(/'|"|`/g,'').split(','))
          appletDict[name].categories = categoryArray 
      }
      if (indIn === files.length-1) resolve()
      });
  })
  bar.then(() => {
    if (indOut === categories.length-1){
    for(const prop in appletDict){
      appletDict[prop]['folderUrl'] = appletDict[prop]['folderUrl'].replace(/\\/g,'/');
    }
    fs.writeFile('./src/platform/appletManifest.js', 'export const appletManifest = ' + JSON.stringify(appletDict), err => {
      if (err) {
        console.error(err)
        return
      }
      console.log('Applet manifest written.');
    })
  }
  })
})
}


module.exports = createAppletManifest
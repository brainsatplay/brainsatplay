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

          let namereg1 =  /['"]?name['"]?:\s*([^\{\,]+)/g;
          let match = namereg1.exec(decoded);
          let name = (match == null) ? undefined : eval(match[1])    

          appletDict[name] = {}
          appletDict[name].folderUrl = '../../../../../' + dir.split(path.join(__dirname,'/../'))[1]

          let devicereg =  /['"]?devices['"]?:\s*([^\{\]]+)]/g;
          match = devicereg.exec(decoded);
          appletDict[name].devices = (match == null) ? undefined : eval(match[1] + ']')
          
          let categoryreg =  /['"]?categories['"]?:\s*([^\{\]]+)]/g;
          match = categoryreg.exec(decoded);
          appletDict[name].categories = (match == null) ? undefined : eval(match[1] + ']')
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
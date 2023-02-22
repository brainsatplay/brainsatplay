// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')

const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const myip = require('quick-local-ip');

// Config
const Config = {
    http_port: '8080',
    socket_port: '3030'
};

// Http server
const _app = express();
const server = require('http').Server(_app);
server.listen(Config.http_port);

// WSS server
const wss = new WebSocket.Server({port: Config.socket_port});

// Console print
console.log('[SERVER]: WebSocket on: ' + myip.getLocalIP4() + ':' + Config.socket_port); // print websocket ip address
console.log('[SERVER]: HTTP on: ' + myip.getLocalIP4() + ':' + Config.http_port); // print web server ip address



const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.




// Register Protocol
if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('brainsatplay', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('brainsatplay')
  }

//   Windows
  const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // Handle the protocol. In this case, we choose to show an Error Box.
  app.on('open-url', (event, url) => {
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
  })
}

  // Handle window controls via IPC
ipcMain.on('shell:open', () => {
    const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
    const pagePath = path.join('file://', pageDirectory, 'index.html')
    shell.openExternal(pagePath)
  })


/**
 * EXPRESS
 */
 _app.use(bodyParser.urlencoded({
  extended: false
}));

_app.use('/assets', express.static(__dirname + '/www/assets'))

_app.get('/', function (req, res) {
  res.sendFile(__dirname + '/www/index.html');
});

/**
* WEBSOCKET
*/
wss.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4();
};


const echo = (input) => input

wss.on('connection', function connection(ws, req) {
  ws.id = wss.getUniqueID();

  ws.on('close', function close() {
      console.log('[SERVER]: Client disconnected.');
  });

  ws.on('message', function incoming(recieveData) {
      const parsed = JSON.parse(recieveData);
      console.log('[SERVER] Message:', parsed);
      const result = echo(parsed)
      send(result);
  });

  // Send back to client
  function send(data) {
      data = JSON.stringify(data);
      
      ws.send(data);
  }

  // // Send to all clients
  // function sendAll(data) {
  //     data = JSON.stringify(data);

  //     wss.clients.forEach(function each(client) {
  //         client.send(data);
  //     });
  // }
});
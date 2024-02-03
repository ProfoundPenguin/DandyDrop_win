const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const express = require('express');
const qr = require('qr-image-color');
const fs = require('fs');
const ip = require('ip');
const { networkInterfaces } = require('os');

var files = [];
var id = 0;

const server = express()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
var mainWindow;
const createWindow = () => {

  mainWindow = new BrowserWindow({
    minWidth: 700,
    minHeight: 400,
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // mainWindow.webContents.openDevTools();
};

ipcMain.handle("close", (_) => {
    app.quit();
})
ipcMain.handle("max", (_) => {
  if (!mainWindow.isMaximized()) {
    mainWindow.maximize();
  }
})
ipcMain.handle("unmax", (_) => {
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
  }
})
ipcMain.handle("min", (_) => {
  mainWindow.minimize();
})

ipcMain.handle("share-file", async (_, fileStatus) => {
  const [path, name, size] = fileStatus;
  
  try {
    const stats = await new Promise((resolve, reject) => {
      fs.lstat(path, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats);
        }
      });
    });

    if(!stats.isFile()){
      return false
    }
  } catch (error) {
    console.error('Error checking file status:', error);
    return false;
  }
  var duplicate = false
  files.forEach(file=> {
    if (file['path'] == path) {
      duplicate = true
    }
  })
  let thefileStatus = {
    "id": ++id,
    "path": path,
    "name": name,
    "size": size
  }
  if(!duplicate) {
    files.push(thefileStatus)
  }
  return true
  
});

ipcMain.handle("stop", (_) => {
  files = []
})

ipcMain.handle("get-sharing-files", (_) => {
  return files;
})

ipcMain.handle("delete-files", (_, list) => {
  list.forEach(file=> {
    for(var x = 0;x < files.length;x++) {
      if(file == files[x]['id']) {
        files.splice(x, 1);
      }
    }
  })

  return files
})

ipcMain.handle("qr-ip",(_) => {
  const ip = getLocalNetworkIpAddress()
  if (ip == undefined) {
    return [``, false];
  }
  const dataToEncode = `http://${ip[0]}:3000`;
  
  const qrCode = qr.image(dataToEncode, { type: 'png', color: "#E8E2E2", transparent: true, margin: 0 });
  const qrCodePath = 'qrcode.png';
  qrCode.pipe(fs.createWriteStream(qrCodePath));

  return [`../${qrCodePath}`, dataToEncode];
})

ipcMain.handle("bug-report", (_) => {
  shell.openExternal("https://github.com/ProfoundPenguin/DandyDrop_win/issues/new");
})

function getLocalNetworkIpAddress() {
  // Get the IP address of the first non-internal network interface
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
          if (net.family === familyV4Value && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results[name].push(net.address);
          }
      }
  }
  return results['Wi-Fi']
}


app.on('ready', () => {
  createWindow();

  

  server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'template/index.html'));
  })
  server.get('/getfiles', function (req, res) {
    res.send(files)
  })
  server.get('/file/:tagId', function (req, res) {
    let fileFound = false;
  
    files.forEach(file => {
      if (file['id'] == parseInt(req.params.tagId)) {
        res.sendFile(file['path']);
        fileFound = true;
      }
    });
  
    // If the loop finishes and no matching file is found, send "Not Found"
    if (!fileFound) {
      res.status(404).send("Not Found");
    }
  });

  server.listen(3000)

  console.log("Starting server on port 3000");

  app.on('before-quit', () => {
    server.close();
  });
});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

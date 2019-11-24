const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// TODO configure from database.json
const db = new sqlite3.Database(__dirname + '/dev.db');

// IPC handlers

function sendUpdatedSounds(event = null) {
  db.all('SELECT id, title, text, url, filepath, recordOrder FROM sounds ORDER BY recordOrder ASC LIMIT 100', (err, data) => {
    if (err) {
      console.error(err);
    }

    if (event) {
      event.sender.send('soundsUpdated', data);
    }
  });
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

ipcMain.on('ping', (event) => {
  event.sender.send('pong');
});

ipcMain.once('ping', (event) => {
  sendUpdatedSounds(event);
});

const basepath = __dirname + '/';

ipcMain.on('addSound', (event, sound) => {
  // strip off the data: url prefix to get just the base64-encoded bytes
  const data = sound.fileContents.replace(/^data:audio\/\w+;base64,/, "");
  const buf = Buffer.alloc(data.length, data, 'base64');
  // Subpath is relative to the filesystem root of the project (needs to match up in frontend + backend)
  const subpath = 'uploads/' + sound.title + '-' + guid() + '.mp3';
  const filepath = basepath + subpath;

  fs.writeFile(filepath, buf, () => {
    const stmt = db.prepare("INSERT INTO sounds(title, text, url, filepath) VALUES ($1, $2, $3, $4)");
    stmt.run(sound.title, sound.text, sound.url, subpath);
    stmt.finalize();
  
    sendUpdatedSounds(event);
  });
});

ipcMain.on('deleteSound', (event, sound) => {
  const getSoundStmt = db.prepare('SELECT filepath FROM sounds WHERE id = $1');
  getSoundStmt.get(sound.id, (err, data) => {
    if (err) {
      console.error('Failed to get sound by ID');
      console.error(err);
      return;
    }
    fs.unlink(basepath + data.filepath, (err) => {
      if (err) {
        console.error('Failed to delete file, maybe already deleted?');
        console.error(err);
      }
      const stmt = db.prepare("DELETE FROM sounds WHERE id = $1");
      stmt.run(sound.id);
      stmt.finalize();
    
      sendUpdatedSounds(event);
    });
  });
});

ipcMain.on('reorderSound', (event, sound, newPosition) => {
  const updateSoundStmt = db.prepare('UPDATE sounds SET recordOrder = $1 WHERE id = $2');
  updateSoundStmt.run(newPosition, sound.id);
  updateSoundStmt.finalize();
  sendUpdatedSounds(event);
});

// Browser window handlers

let win;

function createWindow() {
  win = new BrowserWindow({ 
    width: 1024, 
    height: 768,
    webPreferences: {
      preload: __dirname + '/preload.js'
    }
  });

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // The following is optional and will open the DevTools:
  // win.webContents.openDevTools()

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
  if (db) {
    db.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// initialize the app's main window
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

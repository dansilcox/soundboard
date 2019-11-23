// Only expose what we need in the renderer process
window.ipcRenderer = require('electron').ipcRenderer;

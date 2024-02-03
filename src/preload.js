// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {ipcRenderer, contextBridge} = require("electron")

const api = {
    shareFile: (files) => ipcRenderer.invoke("share-file", files),
    getSharingFiles: () => ipcRenderer.invoke("get-sharing-files"),
    qrIp: () => ipcRenderer.invoke("qr-ip"),
    close: ()=> ipcRenderer.invoke("close"),
    max: ()=> ipcRenderer.invoke("max"),
    unmax: ()=> ipcRenderer.invoke("unmax"),
    min: ()=> ipcRenderer.invoke("min"),
    
    delete_files: (list) => ipcRenderer.invoke("delete-files", list),

    bug_report: ()=> ipcRenderer.invoke("bug-report"),

    stop: ()=> ipcRenderer.invoke("stop"),
}

contextBridge.exposeInMainWorld("api", api);
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        center: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "Chord Cheat",
        autoHideMenuBar: true,
        backgroundColor: '#0d0d12' // Matching app background
    });

    win.loadFile(path.join(__dirname, 'dist/index.html'));

    // Optional: win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

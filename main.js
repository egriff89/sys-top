const path = require('path');
const { app, Menu, ipcMain } = require('electron');
const Store = require('./Store');
const MainWindow = require('./MainWindow');
const AppTray = require('./AppTray');
const { platform } = require('os');

// Set env
const env = process.env.NODE_ENV;

const isDev = env === 'development' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let tray;

// Init store and defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
});

function createMainWindow() {
  mainWindow = new MainWindow(`${__dirname}/app/index.html`, isDev);
}

app.on('ready', () => {
  createMainWindow();

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'));
  });

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('close', (e) => {
    if (!isMac) {
      if (!app.isQuitting) {
        e.preventDefault();
        mainWindow.hide();
      }
    }
    return true;
  });

  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');

  // Create tray
  tray = new AppTray(icon, mainWindow);
});

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => mainWindow.send('nav:toggle'),
      },
    ],
  },
  {
    role: 'editMenu',
  },
  {
    label: 'Options',
    submenu: [{ role: 'reload' }, { role: 'forceReload' }],
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { type: 'separator' },
            { role: 'toggleDevTools' },
          ],
        },
      ]
    : []),
];

// Set settings
ipcMain.on('settings:set', (e, value) => {
  store.set('settings', value);
  mainWindow.webContents.send('settings:get', store.get('settings'));
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (MainWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;

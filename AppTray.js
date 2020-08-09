const { app, Menu, Tray } = require('electron');

class AppTray extends Tray {
  constructor(icon, mainWindow) {
    super(icon);

    this.setToolTip('SysTop');
    this.mainWindow = mainWindow;

    this.on('click', this.onClick.bind(this));
    this.on('right-click', this.onRightClick.bind(this));
  }

  onClick() {
    // Hide/Show window when clicking tray icon
    if (this.mainWindow.isVisible() === true) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
    }
  }

  onRightClick() {
    // Create context menu when right-clicking on task icon
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    // Show context menu
    this.popUpContextMenu(contextMenu);
  }
}

module.exports = AppTray;

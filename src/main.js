const path = require('path');
const fs = require('fs/promises');
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  Notification,
} = require('electron');
const Store = require('electron-store').default;

const store = new Store({
  defaults: {
    theme: 'dark',
  },
});

let mainWindow;
let canCloseWindow = false;
let hasUnsavedChanges = false;

function updateWindowTitle(fileName = null) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const suffix = fileName ? ` - ${fileName}` : ' - Sans titre';
  mainWindow.setTitle(`Bloc-Notes${suffix}`);
}

async function openTextFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Ouvrir un fichier texte',
    properties: ['openFile'],
    filters: [{ name: 'Textes', extensions: ['txt'] }, { name: 'Tous', extensions: ['*'] }],
  });

  if (canceled || !filePaths.length) {
    return { canceled: true };
  }

  const filePath = filePaths[0];
  const content = await fs.readFile(filePath, 'utf8');
  const fileName = path.basename(filePath);

  updateWindowTitle(fileName);
  hasUnsavedChanges = false;

  return {
    canceled: false,
    filePath,
    fileName,
    content,
  };
}

async function saveTextFile(payload) {
  const content = payload?.content ?? '';
  let targetPath = payload?.filePath || null;

  if (!targetPath) {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Sauvegarder le fichier',
      defaultPath: 'nouveau-fichier.txt',
      filters: [{ name: 'Textes', extensions: ['txt'] }, { name: 'Tous', extensions: ['*'] }],
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }
    targetPath = filePath;
  }

  await fs.writeFile(targetPath, content, 'utf8');

  const fileName = path.basename(targetPath);
  updateWindowTitle(fileName);
  hasUnsavedChanges = false;

  if (Notification.isSupported()) {
    new Notification({
      title: 'Bloc-Notes',
      body: `Fichier sauvegarde: ${fileName}`,
    }).show();
  }

  return {
    canceled: false,
    filePath: targetPath,
    fileName,
  };
}

function buildMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new'),
        },
        {
          label: 'Ouvrir',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open'),
        },
        {
          label: 'Sauvegarder',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Quitter' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 700,
    minHeight: 500,
    title: 'Bloc-Notes - Sans titre',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  buildMenu();

  mainWindow.on('close', (event) => {
    if (canCloseWindow || !hasUnsavedChanges) {
      return;
    }

    event.preventDefault();

    dialog
      .showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Sauvegarder', 'Quitter sans sauvegarder', 'Annuler'],
        defaultId: 0,
        cancelId: 2,
        title: 'Modifications non sauvegardees',
        message: 'Vous avez des modifications non sauvegardees.',
        detail: 'Voulez-vous sauvegarder avant de quitter ?',
      })
      .then(async ({ response }) => {
        if (response === 2) {
          return;
        }

        if (response === 0) {
          const saved = await mainWindow.webContents.executeJavaScript(
            'window.__notepadSaveBeforeClose ? window.__notepadSaveBeforeClose() : false',
            true
          );

          if (!saved) {
            return;
          }
        }

        canCloseWindow = true;
        mainWindow.close();
      })
      .catch((error) => {
        console.error('Erreur lors de la fermeture:', error);
      });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      canCloseWindow = false;
      hasUnsavedChanges = false;
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('file:open', async () => openTextFile());
ipcMain.handle('file:save', async (_, payload) => saveTextFile(payload));
ipcMain.handle('window:setTitle', async (_, payload) => {
  updateWindowTitle(payload?.fileName || null);
  return { ok: true };
});
ipcMain.handle('editor:setDirty', async (_, dirty) => {
  hasUnsavedChanges = Boolean(dirty);
  return { ok: true };
});
ipcMain.handle('theme:get', async () => {
  return { theme: store.get('theme') };
});
ipcMain.handle('theme:toggle', async () => {
  const current = store.get('theme');
  const next = current === 'dark' ? 'light' : 'dark';
  store.set('theme', next);
  return { theme: next };
});

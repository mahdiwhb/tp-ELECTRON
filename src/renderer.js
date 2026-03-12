const editor = document.getElementById('editor');
const openBtn = document.getElementById('openBtn');
const saveBtn = document.getElementById('saveBtn');
const newBtn = document.getElementById('newBtn');
const charCountEl = document.getElementById('charCount');
const themeBtn = document.getElementById('themeBtn');

let currentFilePath = null;
let currentFileName = null;
let isDirty = false;

function getCharCount(text) {
  return text.length;
}

function refreshCharCount() {
  const total = getCharCount(editor.value);
  charCountEl.textContent = `${total} ${total > 1 ? 'caracteres' : 'caractere'}`;
}

async function refreshWindowTitle() {
  await window.noterAPI.setWindowTitle({ fileName: currentFileName });
}

async function markDirty(nextDirty) {
  isDirty = nextDirty;
  await window.noterAPI.setDirty(isDirty);
}

function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  themeBtn.textContent = theme === 'light' ? '\u263D Sombre' : '\u2600 Clair';
}

async function openFileAction() {
  const result = await window.noterAPI.openFile();
  if (result?.canceled) return false;

  editor.value = result.content || '';
  currentFilePath = result.filePath || null;
  currentFileName = result.fileName || null;

  refreshCharCount();
  await markDirty(false);
  await refreshWindowTitle();
  return true;
}

async function saveFileAction() {
  const result = await window.noterAPI.saveFile({
    filePath: currentFilePath,
    content: editor.value,
  });

  if (result?.canceled) {
    return false;
  }

  currentFilePath = result.filePath || currentFilePath;
  currentFileName = result.fileName || currentFileName;

  await markDirty(false);
  await refreshWindowTitle();
  return true;
}

async function newFileAction() {
  if (isDirty) {
    const shouldDiscard = window.confirm('Le fichier a des modifications non sauvegardees. Continuer ?');
    if (!shouldDiscard) return false;
  }

  editor.value = '';
  currentFilePath = null;
  currentFileName = null;

  refreshCharCount();
  await markDirty(false);
  await refreshWindowTitle();
  editor.focus();
  return true;
}

editor.addEventListener('input', async () => {
  refreshCharCount();
  if (!isDirty) {
    await markDirty(true);
  }
});

openBtn.addEventListener('click', () => {
  openFileAction();
});

saveBtn.addEventListener('click', () => {
  saveFileAction();
});

newBtn.addEventListener('click', () => {
  newFileAction();
});

themeBtn.addEventListener('click', async () => {
  const result = await window.noterAPI.toggleTheme();
  applyTheme(result.theme);
});

window.noterAPI.onMenuOpen(() => {
  openFileAction();
});

window.noterAPI.onMenuSave(() => {
  saveFileAction();
});

window.noterAPI.onMenuNew(() => {
  newFileAction();
});

window.__notepadSaveBeforeClose = async () => {
  if (!isDirty) return true;
  return saveFileAction();
};

async function initialize() {
  const themeResult = await window.noterAPI.getTheme();
  applyTheme(themeResult.theme);

  const brandDateEl = document.getElementById('brandDate');
  if (brandDateEl) {
    brandDateEl.textContent = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  }

  refreshCharCount();
  await markDirty(false);
  await refreshWindowTitle();
}

initialize();

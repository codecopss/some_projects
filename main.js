let notes = JSON.parse(localStorage.getItem('minimalist_notes') || '[]');
let activeId = null;
let saveTimeout = null;

if (notes.length === 0) {
  notes.push({ id: Date.now(), title: "Welcome Note", body: "Type your notes here. Everything auto-saves!" });
}
activeId = notes[0].id;

const notesListEl = document.getElementById('notesList');
const titleInput = document.getElementById('noteTitle');
const bodyInput = document.getElementById('noteBody');
const wordCountEl = document.getElementById('wordCount');
const charCountEl = document.getElementById('charCount');
const saveStatusEl = document.getElementById('saveStatus');
const newNoteBtn = document.getElementById('newNoteBtn');
const themeToggleBtn = document.getElementById('themeToggle');

function saveToStorage() {
  localStorage.setItem('minimalist_notes', JSON.stringify(notes));
  saveStatusEl.textContent = 'Saved';
}

function renderList() {
  notesListEl.innerHTML = '';
  notes.forEach(note => {
    const item = document.createElement('div');
    item.className = `note-item ${note.id === activeId ? 'active' : ''}`;
    item.innerHTML = `
      <span class="note-item-title">${note.title || 'Untitled'}</span>
      <button class="btn-delete" data-id="${note.id}">✕</button>
    `;
    item.onclick = (e) => {
      if (e.target.classList.contains('btn-delete')) {
        e.stopPropagation();
        deleteNote(note.id);
      } else {
        selectNote(note.id);
      }
    };
    notesListEl.appendChild(item);
  });
}

function selectNote(id) {
  activeId = id;
  const note = notes.find(n => n.id === activeId);
  if (note) {
    titleInput.value = note.title;
    bodyInput.value = note.body;
    updateMetrics();
    renderList();
  }
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  if (notes.length === 0) {
    notes.push({ id: Date.now(), title: "Untitled Note", body: "" });
  }
  activeId = notes[0].id;
  saveToStorage();
  selectNote(activeId);
}

function updateMetrics() {
  const text = bodyInput.value;
  charCountEl.textContent = `${text.length} chars`;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCountEl.textContent = `${words} words`;
}

function handleInput() {
  saveStatusEl.textContent = 'Unsaved Changes';
  updateMetrics();
  const note = notes.find(n => n.id === activeId);
  if (note) {
    note.title = titleInput.value;
    note.body = bodyInput.value;
    renderList();
  }

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveStatusEl.textContent = 'Saving...';
    setTimeout(saveToStorage, 300);
  }, 600);
}

newNoteBtn.onclick = () => {
  const newNote = { id: Date.now(), title: "Untitled Note", body: "" };
  notes.unshift(newNote);
  activeId = newNote.id;
  saveToStorage();
  selectNote(activeId);
};

themeToggleBtn.onclick = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'light' ? 'dark' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('app_theme', nextTheme);
};

titleInput.oninput = handleInput;
bodyInput.oninput = handleInput;

// Keyboard Shortcut: Ctrl+S / Cmd+S
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    clearTimeout(saveTimeout);
    saveToStorage();
  }
});

// Initial load
selectNote(activeId);

// Load saved theme preference on boot (defaulting to 'dark')
const savedTheme = localStorage.getItem('app_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

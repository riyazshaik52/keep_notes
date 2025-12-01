/* -----------------------------------------
   Notes App - FULL WORKING JAVASCRIPT LOGIC
   ----------------------------------------- */

const STORAGE_KEY = "my_notes_v1";

/* ----------- SELECT ELEMENTS ----------- */
const notesContainer = document.querySelector(".cards");
const searchInput = document.getElementById("searchInput");

// modal elements
const addFormBtn = document.getElementById("add-form");
const modal = document.getElementById("noteModal");
const closeBtn = document.querySelector(".close-btn");
const cancelBtn = document.getElementById("cancelNoteBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

let editingNoteId = null;

/* ----------- UTIL HELPERS ----------- */

function formatDate(ts = Date.now()) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeHTML(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ----------- STORAGE FUNCTIONS ----------- */

function loadNotes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  renderNotes(notes);
}

function addNote(note) {
  const notes = loadNotes();
  notes.unshift(note); // add to top
  saveNotes(notes);
}

function updateNote(id, updatedData) {
  const notes = loadNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updatedData };
  }
  saveNotes(notes);
}

function deleteNote(id) {
  let notes = loadNotes();
  notes = notes.filter((n) => n.id !== id);
  saveNotes(notes);
}

/* ----------- RENDER NOTE CARDS ----------- */

function createCard(note) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-head">
        <h1>${escapeHTML(note.title)}</h1>
        <div class="star ${note.starred ? "starred" : ""}" data-id="${note.id}" title="Toggle favorite">★</div>
    </div>

    <div class="card-content">
        <p>${escapeHTML(note.text)}</p>
    </div>

    <div class="card-foot">
        <div class="actions">
          <button class="edit-btn" data-id="${note.id}">✏️</button>
        </div>
        <div class="date">${formatDate(note.date)}</div>
    </div>
  `;

  // star toggle
  const starEl = card.querySelector(".star");
  starEl.addEventListener("click", (e) => {
    updateNote(note.id, { starred: !note.starred });
    e.stopPropagation();
  });

  // edit -> open modal prefilled and show delete button
  const editBtn = card.querySelector(".edit-btn");
  editBtn.addEventListener("click", (e) => {
    editingNoteId = note.id;
    modalTitle.value = note.title || "";
    modalText.value = note.text || "";
    deleteNoteBtn.style.display = "block";
    openModal();
    e.stopPropagation();
  });

  return card;
}

function renderNotes(notes) {
  notesContainer.innerHTML = "";

  if (!notes || notes.length === 0) {
    notesContainer.innerHTML = `<div class="empty-state">No notes yet — click + to add one.</div>`;
    return;
  }

  notes.forEach((n) => {
    notesContainer.appendChild(createCard(n));
  });
}

/* ----------- MODAL FUNCTIONS ----------- */

function openModal() {
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  modalTitle.focus();
}
function closeModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  editingNoteId = null;
  deleteNoteBtn.style.display = "none";
}

/* ----------- EVENTS ----------- */

// open modal (add new)
addFormBtn.addEventListener("click", () => {
  editingNoteId = null;
  modalTitle.value = "";
  modalText.value = "";
  deleteNoteBtn.style.display = "none";
  openModal();
});

// close modal
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "flex") closeModal();
});

// Save note (create or update)
saveNoteBtn.addEventListener("click", () => {
  const title = modalTitle.value.trim();
  const text = modalText.value.trim();

  if (!title || !text) {
    alert("Please fill both Title and Description.");
    return;
  }

  if (editingNoteId) {
    updateNote(editingNoteId, { title, text, date: Date.now() });
  } else {
    addNote({
      id: "n_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      title,
      text,
      starred: false,
      date: Date.now(),
    });
  }

  closeModal();
});

// Delete note from modal (visible only in edit mode)
deleteNoteBtn.addEventListener("click", () => {
  if (!editingNoteId) return;
  const ok = confirm("Delete this note?");
  if (!ok) return;
  deleteNote(editingNoteId);
  closeModal();
});

/* ----------- SEARCH ---------- */

searchInput.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const notes = loadNotes();
  if (!q) {
    renderNotes(notes);
    return;
  }
  const filtered = notes.filter((n) => (n.title + " " + n.text).toLowerCase().includes(q));
  renderNotes(filtered);
});

/* -------- INITIAL LOAD -------- */

document.addEventListener("DOMContentLoaded", () => {
  renderNotes(loadNotes());
});

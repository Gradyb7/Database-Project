// Runs in users.html. The same form adds new usernames or edits the selected user.

import { getJSON, sendJSON, renderTable } from './common.js';
const results = document.querySelector('#user-results');
const form = document.querySelector('#user-form');
const status = document.querySelector('#status');
// Track the selected user ID so saving knows whether to add or update.
let editingID = null;

// Return to add mode after saving or clicking New user.
function resetForm() {
  editingID = null;
  form.reset();
  document.querySelector('#form-heading').textContent = 'Add user';
}
document.querySelector('#new-user').addEventListener('click', resetForm);

async function loadUsers() {
  const rows = await getJSON('/api/users');
  renderTable(results, rows);
  // Add one edit button to each row so the same form can update an existing user.
  const header = results.querySelector('thead tr');
  if (header) {
    const cell = document.createElement('th'); cell.textContent = 'Action'; cell.scope = 'col'; header.append(cell);
  }
  const tableRows = results.querySelectorAll('tbody tr');
  rows.forEach((user, index) => {
    const button = document.createElement('button');
    button.textContent = 'Edit';
    button.addEventListener('click', () => {
      editingID = user.UserID;
      form.elements.UserName.value = user.UserName;
      document.querySelector('#form-heading').textContent = `Edit user ${editingID}`;
      form.elements.UserName.focus();
    });
    tableRows[index].insertCell().append(button);
  });
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    // FormData reads named inputs. Object.fromEntries turns them into a plain object.
    await sendJSON(editingID ? `/api/users/${editingID}` : '/api/users', editingID ? 'PUT' : 'POST', Object.fromEntries(new FormData(form)));
    resetForm();
    status.textContent = 'User saved.';
    await loadUsers();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
try { await loadUsers(); status.textContent = 'Add a user or choose Edit below.'; }
catch (error) { status.textContent = error.message; }

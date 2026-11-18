// Runs in manage.html. One form changes fields for authors, producers, or publishers.

import { getJSON, sendJSON, renderTable } from './common.js';

const selector = document.querySelector('#record-type');
const form = document.querySelector('#record-form');
const results = document.querySelector('#record-results');
const status = document.querySelector('#status');
// Remember which row is being edited. Null means the form will add a new record.
let editingID = null;
// Each entry lists the ID column and the input fields for one kind of record.
// Each field entry is [input name, maximum length, required].
const definitions = {
  authors: { id: 'AuthorID', fields: [['FirstName', 50, true], ['LastName', 50, true], ['Location', 100, false]] },
  producers: { id: 'ProducerID', fields: [['FirstName', 50, true], ['LastName', 50, true]] },
  publishers: { id: 'PublisherID', fields: [['Name', 100, true], ['Website', 200, true]] }
};

function newRecord() {
  editingID = null;
  form.reset();
  document.querySelector('#form-heading').textContent = 'Add record';
}
document.querySelector('#new-record').addEventListener('click', newRecord);

// Changing the dropdown rebuilds the form and loads the matching database table.
async function loadRecords() {
  const name = selector.value;
  const definition = definitions[name];
  selector.disabled = true;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    newRecord();
    results.replaceChildren();
    const fields = document.querySelector('#record-fields');
    fields.replaceChildren();
    // Create a label and input for each field instead of keeping three separate HTML forms.
    for (const [field, length, required] of definition.fields) {
      const label = document.createElement('label');
      label.htmlFor = field;
      label.textContent = field.replace(/([a-z])([A-Z])/g, '$1 $2');
      const input = document.createElement('input');
      input.name = field; input.id = field; input.maxLength = length; input.required = required;
      fields.append(label, input);
    }
    const rows = await getJSON(`/api/${name}`);
    renderTable(results, rows);
    const header = results.querySelector('thead tr');
    if (header) { const cell = document.createElement('th'); cell.textContent = 'Action'; cell.scope = 'col'; header.append(cell); }
    const tableRows = results.querySelectorAll('tbody tr');
    // Pair each database row with its displayed table row and attach an Edit button.
    rows.forEach((row, index) => {
      const button = document.createElement('button'); button.textContent = 'Edit';
      button.addEventListener('click', () => {
        // Remember the selected ID and copy its values into the existing form.
        editingID = row[definition.id];
        for (const [field] of definition.fields) form.elements[field].value = row[field] || '';
        document.querySelector('#form-heading').textContent = `Edit record ${editingID}`;
        form.scrollIntoView({ behavior: 'smooth' });
      });
      tableRows[index].insertCell().append(button);
    });
    status.textContent = 'Add a record or choose Edit below.';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    selector.disabled = false;
    submit.disabled = false;
  }
}
selector.addEventListener('change', loadRecords);
form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  selector.disabled = true;
  try {
    // Append /ID only for an edit. A new record is posted to the collection URL.
    const path = `/api/${selector.value}${editingID ? `/${editingID}` : ''}`;
    await sendJSON(path, editingID ? 'PUT' : 'POST', Object.fromEntries(new FormData(form)));
    await loadRecords();
    status.textContent = 'Record saved.';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
    selector.disabled = false;
  }
});
await loadRecords();

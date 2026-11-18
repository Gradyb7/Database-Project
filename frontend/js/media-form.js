// Runs in media-form.html for both adding a title and editing an existing title.

import { getJSON, sendJSON } from './common.js';

const form = document.querySelector('#media-form');
const status = document.querySelector('#status');
const fields = document.querySelector('#media-fields');
const typeSelect = form.elements.TypeName;
// An ?id=12 in the URL means edit title 12. No ID means create a new title.
const id = new URLSearchParams(location.search).get('id');

// Only the chosen type's fields should be visible, validated, and submitted.
function showTypeFields() {
  for (const group of form.querySelectorAll('[data-type]')) {
    const active = group.dataset.type === typeSelect.value;
    group.hidden = !active;
    group.disabled = !active;
  }
}
typeSelect.addEventListener('change', showTypeFields);

// Display readable names in the dropdown while keeping the value the API expects.
function options(name, rows, valueKey, labelKey) {
  const select = form.elements[name];
  select.replaceChildren(new Option('Choose an option', ''));
  for (const row of rows) select.add(new Option(row[labelKey], row[valueKey]));
}

try {
  // Load choices before filling existing values so the matching options are available.
  const data = await getJSON('/api/lookups');
  options('TypeName', data.types, 'TypeName', 'TypeName');
  options('GenreID', data.genres, 'GenreID', 'GenreName');
  options('MPAID', data.ratings, 'MPAID', 'Rating');
  options('AuthorID', data.authors, 'AuthorID', 'Name');
  options('ProducerID', data.producers, 'ProducerID', 'Name');
  options('PublisherID', data.publishers, 'PublisherID', 'Name');
  if (id) {
    const media = await getJSON(`/api/media/${encodeURIComponent(id)}`);
    // Match each database field to the form input with the same name.
    for (const input of form.elements) {
      if (input.name && media[input.name] != null) input.value = media[input.name];
    }
    form.elements.CreationDate.value = media.ReleaseDate || '';
    typeSelect.disabled = true;
    document.querySelector('h1').textContent = 'Edit media';
  }
  fields.disabled = false;
  showTypeFields();
  status.textContent = id ? 'Update the details below. Media type stays the same.' : 'Enter the details for a new title.';
} catch (error) {
  status.textContent = error.message;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  // FormData returns strings, which the backend validates before saving.
  const values = Object.fromEntries(new FormData(form));
  values.TypeName = typeSelect.value; // Disabled controls are not included in FormData.
  fields.disabled = true;
  try {
    const result = await sendJSON(id ? `/api/media/${encodeURIComponent(id)}` : '/api/media', id ? 'PUT' : 'POST', values);
    // After saving, navigate to the details page for the returned MediaID.
    location.href = `media.html?id=${result.MediaID}`;
  } catch (error) {
    status.textContent = error.message;
    fields.disabled = false;
  }
});

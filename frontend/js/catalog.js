// Runs when index.html loads and connects the search form to /api/media.

import { connectForm, fillSelect } from './common.js';

// querySelector finds the HTML element with this ID so JavaScript can use it.
const form = document.querySelector('#catalog-form');
const results = document.querySelector('#catalog-results');
// Send search filters to the media API and place results below the form.
connectForm(form, '/api/media', results);
try {
  await fillSelect(document.querySelector('#genre'), '/api/genres',
    'GenreID', 'GenreName', 'All genres');
  // Load the catalog when the page first opens.
  form.requestSubmit();
} catch (error) {
  results.textContent = error.message;
}

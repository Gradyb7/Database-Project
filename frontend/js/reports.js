// Runs in reports.html. Each form identifies its report using a data-report attribute.

import { connectForm, fillSelect } from './common.js';

// Use each form's data-report attribute to choose its backend report route.
for (const form of document.querySelectorAll('form[data-report]')) {
  connectForm(form, `/api/reports/${form.dataset.report}`,
    form.closest('section').querySelector('.results'));
}

const notice = document.querySelector('.notice');
// Load both dropdowns independently so one failure does not cancel the other.
const lookups = await Promise.allSettled([
  fillSelect(document.querySelector('#movie-genre'), '/api/genres',
    'GenreName', 'GenreName', 'Choose a genre'),
  fillSelect(document.querySelector('#report-user'), '/api/users',
    'UserID', 'UserName', 'Choose a user')
]);
// allSettled returns a status for each request. Display an error if a dropdown failed.
const failure = lookups.find(result => result.status === 'rejected');
if (failure) notice.textContent = failure.reason.message;

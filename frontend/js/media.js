// Runs in media.html: loads title details and manages the review form and buttons.

import { getJSON, sendJSON, fillSelect } from './common.js';

// Read the title ID from the query string, for example media.html?id=12.
const id = new URLSearchParams(location.search).get('id');
const status = document.querySelector('#status');
const form = document.querySelector('#review-form');
const fields = document.querySelector('#review-fields');
const user = form.elements.UserID;
const reviews = document.querySelector('#reviews');
// null means the next save adds a review. A ReviewID means it updates that review.
let editingReview = null;
const base = `/api/media/${encodeURIComponent(id || '')}`;

// Clear editing state and allow a profile to be selected for a new review.
function newReview() {
  editingReview = null;
  form.reset();
  user.disabled = false;
  document.querySelector('#review-heading').textContent = 'Write a review';
}
document.querySelector('#cancel-review').addEventListener('click', newReview);

async function loadDetails() {
  const media = await getJSON(base);
  document.querySelector('#media-title').textContent = media.Title;
  const edit = document.querySelector('#edit-media');
  edit.href = `media-form.html?id=${media.MediaID}`;
  edit.hidden = false;
  const details = document.querySelector('#details');
  details.replaceChildren();
  // Show shared fields first, then add only the fields relevant to this title type.
  const names = ['TypeName', 'GenreName', 'Platform', 'ReleaseDate', 'AverageRating'];
  if (media.TypeName === 'Movie') names.push('Director', 'Runtime', 'ProducerName', 'Studio', 'Rating', 'BoxOfficeRevenue');
  if (media.TypeName === 'Show') names.push('EpisodeCount', 'SeasonCount');
  if (media.TypeName === 'Book') names.push('AuthorName', 'PublisherName', 'Description', 'CopiesSold');
  for (const name of names) {
    const label = document.createElement('dt');
    const value = document.createElement('dd');
    label.textContent = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    value.textContent = media[name] == null ? '—' : String(media[name]);
    details.append(label, value);
  }
}

// Rebuild the review list from the latest database results after each change.
async function loadReviews() {
  const rows = await getJSON(`${base}/reviews`);
  reviews.replaceChildren();
  if (!rows.length) reviews.textContent = 'No reviews yet.';
  for (const row of rows) {
    const article = document.createElement('article');
    const title = document.createElement('h3');
    const body = document.createElement('p');
    title.textContent = `${row.UserName} — ${row.Score}/5 — ${row.ReviewDate}`;
    body.textContent = row.ReviewText || 'No written review.';
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.type = 'button';
    // An event listener runs later, when the user clicks this particular review button.
    edit.addEventListener('click', () => {
      editingReview = row.ReviewID;
      user.value = String(row.UserID);
      // Keep the original reviewer selected while editing their review.
      user.disabled = true;
      form.elements.Score.value = row.Score;
      form.elements.ReviewText.value = row.ReviewText || '';
      document.querySelector('#review-heading').textContent = `Edit ${row.UserName}'s review`;
      form.scrollIntoView({ behavior: 'smooth' });
    });
    const remove = document.createElement('button');
    remove.textContent = 'Delete';
    remove.type = 'button';
    remove.addEventListener('click', async () => {
      if (!confirm(`Delete ${row.UserName}'s review?`)) return;
      remove.disabled = true;
      try {
        await sendJSON(`${base}/reviews/${row.ReviewID}`, 'DELETE', { UserID: String(row.UserID) });
        if (editingReview === row.ReviewID) newReview();
        status.textContent = 'Review deleted.';
        await loadReviews();
        await loadDetails();
      } catch (error) {
        status.textContent = error.message;
        remove.disabled = false;
      }
    });
    article.append(title, body, edit, remove);
    reviews.append(article);
  }
}

// Collect the form values and choose POST for a new review or PUT for an edit.
form.addEventListener('submit', async event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  // Disabled inputs are left out of FormData, so include the reviewer explicitly.
  values.UserID = user.value;
  fields.disabled = true;
  try {
    const url = `${base}/reviews${editingReview ? `/${editingReview}` : ''}`;
    await sendJSON(url, editingReview ? 'PUT' : 'POST', values);
    newReview();
    status.textContent = 'Review saved.';
    await loadReviews();
    await loadDetails();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    fields.disabled = false;
  }
});

try {
  if (!id) throw new Error('Choose a title from the catalog first.');
  await loadDetails();
  await loadReviews();
  await fillSelect(user, '/api/users', 'UserID', 'UserName', 'Choose a user');
  fields.disabled = false;
  status.textContent = 'View details and manage reviews below.';
} catch (error) {
  status.textContent = error.message;
}

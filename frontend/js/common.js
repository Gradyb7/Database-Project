// Browser helpers shared by several pages. These functions do not connect directly to SQL Server.
// They send HTTP requests to the Node backend and turn its JSON responses into page content.

// Request data from the backend and check for errors.
export async function getJSON(url) {
  const response = await fetch(url);
  // await waits for the response body. Json() turns JSON text into JavaScript data.
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to load data.');
  return data;
}

// Use textContent so titles, usernames, and other database values remain plain text.
export function renderTable(container, rows) {
  // Clear the old results before displaying the new table or empty message.
  container.replaceChildren();
  if (!rows.length) {
    container.textContent = 'No results found.';
    return;
  }
  const table = document.createElement('table');
  const head = table.createTHead().insertRow();
  // Use the returned field names as table headings.
  const columns = Object.keys(rows[0]);
  for (const column of columns) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = column.replace(/([a-z])([A-Z])/g, '$1 $2');
    head.append(cell);
  }
  const body = table.createTBody();
  for (const row of rows) {
    const tr = body.insertRow();
    for (const column of columns) {
      const value = row[column];
      const cell = tr.insertCell();
      // Media titles open the details page for that row's ID.
      if (column === 'Title' && row.MediaID) {
        const link = document.createElement('a');
        link.href = `media.html?id=${row.MediaID}`;
        link.textContent = value;
        cell.append(link);
      } else {
        cell.textContent = value == null ? '—' : String(value);
      }
    }
  }
  container.append(table);
}

// Fill a dropdown with values from the database.
export async function fillSelect(select, url, valueKey, labelKey, placeholder) {
  select.disabled = true;
  try {
    const rows = await getJSON(url);
    select.replaceChildren(new Option(placeholder, ''));
    // Show the label to the user while submitting the matching value.
    for (const row of rows) select.add(new Option(row[labelKey], row[valueKey]));
  } finally {
    select.disabled = false;
  }
}

// Submit a form without reloading the page and display its results.
export function connectForm(form, endpoint, results) {
  form.addEventListener('submit', async event => {
    // Stop the browser from doing a normal form submission that would reload the page.
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    results.textContent = 'Loading…';
    try {
      // Turn form fields into URL parameters such as userId=1.
      const params = new URLSearchParams(new FormData(form));
      renderTable(results, await getJSON(`${endpoint}?${params}`));
    } catch (error) {
      results.textContent = error.message;
    // finally runs on both success and failure, so the button becomes usable again.
    } finally {
      button.disabled = false;
    }
  });
}

// Send form values as JSON for creating, updating, or deleting a record.
export async function sendJSON(url, method, values) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    // JSON.stringify turns the form object into text that Express can read as req.body.
    body: JSON.stringify(values)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Unable to save changes.');
  return result;
}

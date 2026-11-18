// These helpers reject invalid form values before a route sends them to SQL Server.
// Throwing an error stops the route. Server.js turns that error into an HTTP response.

// Mark invalid input as an HTTP 400 error for server.js to return.
function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

// Convert a whole-number URL value to a number and check its allowed range.
function integer(value, name, min = 1, max = 2147483647) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw badRequest(`${name} must be a whole number.`);
  }
  // Form fields arrive as strings. Convert only after checking they contain digits.
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw badRequest(`${name} must be between ${min} and ${max}.`);
  }
  return number;
}

// Trim surrounding spaces, check text length, and allow empty optional filters.
function text(value, name, maxLength, optional = false) {
  if (optional && (value === undefined || value === '')) return null;
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw badRequest(`${name} must contain 1 to ${maxLength} characters.`);
  }
  return value.trim();
}

module.exports = { badRequest, integer, text };

// Optional whole numbers can be left blank, but still follow the SQL column limits.
function optionalInteger(value, name, min = 0) {
  if (value === undefined || value === '') return null;
  return integer(value, name, min);
}

// Keep money as a decimal string so large values do not lose cents in JavaScript.
function money(value) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{1,16}(\.\d{1,2})?$/.test(value)) {
    throw badRequest('Box office revenue must be a nonnegative amount with at most 16 digits and 2 decimal places.');
  }
  return value;
}

function date(value) {
  if (value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) {
    throw badRequest('Enter a valid date as YYYY-MM-DD.');
  }
  // Compare the parsed date back to the input to reject dates such as February 30.
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw badRequest('Enter a valid calendar date.');
  }
  return value;
}
module.exports.optionalInteger = optionalInteger;
module.exports.money = money;
module.exports.date = date;

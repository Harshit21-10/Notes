const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function check(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res;
}

export async function listNotes() {
  const res = await fetch(`${BASE}/api/notes`);
  await check(res);
  return res.json();
}

export async function createNote(note) {
  const res = await fetch(`${BASE}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  await check(res);
  return res.json();
}

export async function updateNote(id, note) {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  await check(res);
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(`${BASE}/api/notes/${id}`, { method: 'DELETE' });
  await check(res);
}

import { useEffect, useState } from 'react';
import { listNotes, createNote, updateNote, deleteNote } from './api';
import './App.css';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true); setError('');
    try { setNotes(await listNotes()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        // include version so backend can detect stale write if needed
        const payload = { title, content, version: editing.version };
        const updated = await updateNote(editing.id, payload);
        setNotes(notes.map(n => n.id === updated.id ? updated : n));
      } else {
        const created = await createNote({ title, content });
        setNotes([created, ...notes]);
      }
      setTitle(''); setContent(''); setEditing(null);
    } catch (e) { setError(e.message); }
  }

  function startEdit(n) {
    setEditing(n); setTitle(n.title); setContent(n.content || '');
  }

  async function remove(id) {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="container">
      <h1>Notes</h1>
      <form onSubmit={onSubmit} className="form">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" />
        <div className="actions">
          <button type="submit">{editing ? 'Update' : 'Add'} Note</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setTitle(''); setContent(''); }}>Cancel</button>}
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading…</p> : (
        <ul className="list">
          {notes.map(n => (
            <li key={n.id} className="card">
              <div className="card-head">
                <h3>{n.title}</h3>
                <div>
                  <button onClick={() => startEdit(n)}>Edit</button>
                  <button onClick={() => remove(n.id)}>Delete</button>
                </div>
              </div>
              {n.content && <p>{n.content}</p>}
              <small>
                created {new Date(n.createdAt).toLocaleString()} | updated {new Date(n.updatedAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

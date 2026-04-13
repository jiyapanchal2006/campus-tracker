import React, { useEffect, useState } from 'react';
import { eventAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const typeColors = {
  academic: 'badge-blue', sports: 'badge-green', cultural: 'badge-purple',
  holiday: 'badge-yellow', exam: 'badge-red', other: 'badge-gray'
};

const typeEmoji = {
  academic: '🎓', sports: '⚽', cultural: '🎭',
  holiday: '🎉', exam: '📝', other: '📌'
};

const emptyForm = { title: '', description: '', date: '', endDate: '', location: '', type: 'academic', isPublic: true };

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    let data = events;
    if (typeFilter) data = data.filter(e => e.type === typeFilter);
    if (search) data = data.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || (e.location || '').toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  }, [search, typeFilter, events]);

  const fetchEvents = async () => {
    try {
      const { data } = await eventAPI.getAll();
      setEvents(data);
      setFiltered(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (ev) => {
    setEditing(ev);
    setForm({ title: ev.title, description: ev.description || '', date: ev.date?.split('T')[0] || '', endDate: ev.endDate?.split('T')[0] || '', location: ev.location || '', type: ev.type, isPublic: ev.isPublic });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await eventAPI.update(editing._id, form);
      else await eventAPI.create(form);
      await fetchEvents();
      setModal(false);
    } catch (err) { alert('Failed to save event'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await eventAPI.delete(id); await fetchEvents(); } catch { alert('Delete failed'); }
  };

  const isUpcoming = (date) => new Date(date) >= new Date();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Campus Events</h1><p>{events.length} total events</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Event</button>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="🔍  Search events…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="search-input" style={{ minWidth: 'unset', width: 150 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {['academic', 'sports', 'cultural', 'holiday', 'exam', 'other'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📅</div><p>No events found</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(ev => (
            <div className="card" key={ev._id} style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: ev.type === 'exam' ? 'var(--danger)' : ev.type === 'sports' ? 'var(--success)' : ev.type === 'holiday' ? 'var(--warning)' : ev.type === 'cultural' ? '#a78bfa' : 'var(--accent)'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{typeEmoji[ev.type] || '📌'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${typeColors[ev.type] || 'badge-gray'}`}>{ev.type}</span>
                  {isUpcoming(ev.date) ? <span className="badge badge-green">Upcoming</span> : <span className="badge badge-gray">Past</span>}
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{ev.title}</div>
              {ev.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>{ev.description}</div>}

              <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>📅 {new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                {ev.endDate && <div>⏰ Until {new Date(ev.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>}
                {ev.location && <div>📍 {ev.location}</div>}
                {ev.createdBy?.name && <div>👤 {ev.createdBy.name}</div>}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ev)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Event' : 'Create Event'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Annual Sports Day" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details about the event…" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date (optional)</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['academic', 'sports', 'cultural', 'holiday', 'exam', 'other'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Main Auditorium" />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title || !form.date}>
                {saving ? 'Saving…' : editing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

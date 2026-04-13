import React, { useEffect, useState } from 'react';
import { studentAPI } from '../api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    ));
  }, [search, students]);

  const fetchStudents = async () => {
    try {
      const { data } = await studentAPI.getAll();
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, department: s.department || '', semester: s.semester || '', phone: s.phone || '', rollNumber: s.rollNumber || '' });
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentAPI.update(editing._id, form);
      await fetchStudents();
      setModal(null);
    } catch (err) {
      setError('Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await studentAPI.delete(id);
      await fetchStudents();
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>{students.length} registered students</p>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="🔍  Search by name, roll number, department…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Email</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state"><div className="empty-icon">👤</div><p>No students found</p></div>
              </td></tr>
            ) : filtered.map(s => (
              <tr key={s._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                      {s.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <span>{s.name}</span>
                  </div>
                </td>
                <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{s.rollNumber || '—'}</span></td>
                <td style={{ color: 'var(--text2)' }}>{s.email}</td>
                <td>{s.department ? <span className="badge badge-blue">{s.department}</span> : '—'}</td>
                <td>{s.semester ? `Sem ${s.semester}` : '—'}</td>
                <td style={{ color: 'var(--text2)' }}>{s.phone || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Student</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            {['name', 'department', 'rollNumber', 'phone'].map(field => (
              <div className="form-group" key={field}>
                <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input className="form-input" value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input type="number" className="form-input" min={1} max={8} value={form.semester || ''} onChange={e => setForm({ ...form, semester: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

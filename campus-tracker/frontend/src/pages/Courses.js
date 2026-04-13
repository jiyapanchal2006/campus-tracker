import React, { useEffect, useState } from 'react';
import { courseAPI, studentAPI } from '../api';

const empty = { name: '', code: '', description: '', department: '', semester: 1, credits: 3, schedule: { days: [], time: '', room: '' } };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollModal, setEnrollModal] = useState(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(courses.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.department || '').toLowerCase().includes(q)
    ));
  }, [search, courses]);

  const fetchAll = async () => {
    try {
      const [cRes, sRes] = await Promise.all([courseAPI.getAll(), studentAPI.getAll()]);
      setCourses(cRes.data);
      setFiltered(cRes.data);
      setStudents(sRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(empty); setModal('form'); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, code: c.code, description: c.description || '', department: c.department, semester: c.semester, credits: c.credits, schedule: c.schedule || { days: [], time: '', room: '' } });
    setModal('form');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editing) await courseAPI.update(editing._id, form);
      else await courseAPI.create(form);
      await fetchAll();
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await courseAPI.delete(id); await fetchAll(); } catch { alert('Delete failed'); }
  };

  const handleEnroll = async () => {
    if (!enrollStudentId) return;
    try {
      await courseAPI.enroll(enrollModal._id, enrollStudentId);
      await fetchAll();
      setEnrollModal(null);
      setEnrollStudentId('');
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const setSchedule = (field, val) => setForm({ ...form, schedule: { ...form.schedule, [field]: val } });

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>{courses.length} courses available</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Course</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="toolbar">
        <input className="search-input" placeholder="🔍  Search by name, code, department…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Code</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Credits</th>
              <th>Enrolled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📚</div><p>No courses found</p></div></td></tr>
            ) : filtered.map(c => (
              <tr key={c._id}>
                <td>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    {c.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{c.description.slice(0, 50)}…</div>}
                  </div>
                </td>
                <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{c.code}</span></td>
                <td>{c.department ? <span className="badge badge-blue">{c.department}</span> : '—'}</td>
                <td>Sem {c.semester}</td>
                <td>{c.credits} cr</td>
                <td>{c.students?.length || 0} students</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn btn-success btn-sm" onClick={() => { setEnrollModal(c); setEnrollStudentId(''); }}>Enroll</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Course Form Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Course' : 'Create New Course'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Data Structures" />
              </div>
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="CS301" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief course description…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" />
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Credits</label>
                <input type="number" className="form-input" min={1} max={6} value={form.credits} onChange={e => setForm({ ...form, credits: parseInt(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Schedule Time</label>
                <input className="form-input" value={form.schedule?.time || ''} onChange={e => setSchedule('time', e.target.value)} placeholder="Mon/Wed 10:00–11:00" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Room / Location</label>
              <input className="form-input" value={form.schedule?.room || ''} onChange={e => setSchedule('room', e.target.value)} placeholder="Room 301, Block B" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Course' : 'Create Course'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModal && (
        <div className="modal-overlay" onClick={() => setEnrollModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enroll Student — {enrollModal.name}</h3>
              <button className="modal-close" onClick={() => setEnrollModal(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select className="form-select" value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)}>
                <option value="">— Choose a student —</option>
                {students.filter(s => !enrollModal.students?.some(en => (en._id || en) === s._id)).map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.rollNumber || s.email})</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
              Currently enrolled: {enrollModal.students?.length || 0} students
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEnrollModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEnroll} disabled={!enrollStudentId}>Enroll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

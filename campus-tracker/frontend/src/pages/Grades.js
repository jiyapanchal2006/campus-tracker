import React, { useEffect, useState } from 'react';
import { gradeAPI, courseAPI, studentAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const gradeMap = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };

export default function Grades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', courseId: '', assessments: [], finalGrade: '', gpa: '' });
  const [saving, setSaving] = useState(false);
  const [filterStudent, setFilterStudent] = useState(user?.role === 'student' ? user._id : '');
  const [filterCourse, setFilterCourse] = useState('');

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchGrades(); }, [filterStudent, filterCourse]);

  const fetchAll = async () => {
    try {
      const [cRes, sRes] = await Promise.all([courseAPI.getAll(), studentAPI.getAll()]);
      setCourses(cRes.data);
      setStudents(sRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStudent) params.studentId = filterStudent;
      if (filterCourse) params.courseId = filterCourse;
      const { data } = await gradeAPI.get(params);
      setGrades(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openModal = () => {
    setForm({ studentId: '', courseId: '', assessments: [{ type: 'assignment', name: '', score: '', maxScore: 100 }], finalGrade: '', gpa: '' });
    setModal(true);
  };

  const addAssessment = () => setForm(f => ({ ...f, assessments: [...f.assessments, { type: 'assignment', name: '', score: '', maxScore: 100 }] }));
  const removeAssessment = (i) => setForm(f => ({ ...f, assessments: f.assessments.filter((_, idx) => idx !== i) }));
  const updateAssessment = (i, field, val) => {
    const a = [...form.assessments];
    a[i] = { ...a[i], [field]: val };
    setForm(f => ({ ...f, assessments: a }));
  };

  const calcGPA = () => {
    const g = gradeMap[form.finalGrade];
    return g !== undefined ? g : '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await gradeAPI.save({ ...form, gpa: calcGPA() || form.gpa });
      await fetchGrades();
      setModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save grades');
    } finally { setSaving(false); }
  };

  const gradeColor = (g) => {
    if (!g) return 'badge-gray';
    if (['A+', 'A'].includes(g)) return 'badge-green';
    if (['B+', 'B'].includes(g)) return 'badge-blue';
    if (['C+', 'C'].includes(g)) return 'badge-yellow';
    return 'badge-red';
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Grades</h1><p>Academic performance records</p></div>
        {user?.role !== 'student' && (
          <button className="btn btn-primary" onClick={openModal}>+ Add Grade</button>
        )}
      </div>

      {/* Filters */}
      <div className="toolbar">
        {user?.role !== 'student' && (
          <select className="search-input" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
            <option value="">All Students</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        )}
        <select className="search-input" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {user?.role !== 'student' && <th>Student</th>}
                <th>Course</th>
                <th>Assessments</th>
                <th>Final Grade</th>
                <th>GPA Points</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">📊</div><p>No grade records found</p></div></td></tr>
              ) : grades.map(g => (
                <tr key={g._id}>
                  {user?.role !== 'student' && <td>{g.student?.name || '—'} <span style={{ fontSize: 11, color: 'var(--text3)' }}>{g.student?.rollNumber}</span></td>}
                  <td>
                    <div style={{ fontWeight: 600 }}>{g.course?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{g.course?.code}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(g.assessments || []).map((a, i) => (
                        <span key={i} className="badge badge-gray" title={a.name}>
                          {a.type}: {a.score}/{a.maxScore}
                        </span>
                      ))}
                      {g.assessments?.length === 0 && '—'}
                    </div>
                  </td>
                  <td>{g.finalGrade ? <span className={`badge ${gradeColor(g.finalGrade)}`}>{g.finalGrade}</span> : '—'}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{g.gpa ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add / Update Grade</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student</label>
                <select className="form-select" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
                  <option value="">— Select student —</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-select" value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
                  <option value="">— Select course —</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Assessments</label>
                <button className="btn btn-secondary btn-sm" onClick={addAssessment}>+ Add</button>
              </div>
              {form.assessments.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                  <select className="form-select" value={a.type} onChange={e => updateAssessment(i, 'type', e.target.value)}>
                    {['quiz', 'assignment', 'midterm', 'final', 'project'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input className="form-input" placeholder="Name" value={a.name} onChange={e => updateAssessment(i, 'name', e.target.value)} />
                  <input type="number" className="form-input" placeholder="Score" value={a.score} onChange={e => updateAssessment(i, 'score', e.target.value)} />
                  <input type="number" className="form-input" placeholder="Max" value={a.maxScore} onChange={e => updateAssessment(i, 'maxScore', e.target.value)} />
                  <button className="btn btn-danger btn-sm" onClick={() => removeAssessment(i)}>×</button>
                </div>
              ))}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Final Grade</label>
                <select className="form-select" value={form.finalGrade} onChange={e => setForm(f => ({ ...f, finalGrade: e.target.value }))}>
                  <option value="">— Select —</option>
                  {Object.keys(gradeMap).map(g => <option key={g} value={g}>{g} ({gradeMap[g]} pts)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">GPA Points (auto)</label>
                <input className="form-input" readOnly value={calcGPA()} style={{ opacity: 0.7 }} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.studentId || !form.courseId}>
                {saving ? 'Saving…' : 'Save Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

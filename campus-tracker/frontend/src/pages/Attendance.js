import React, { useEffect, useState } from 'react';
import { attendanceAPI, courseAPI, studentAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('mark'); // 'mark' | 'records' | 'summary'

  useEffect(() => {
    courseAPI.getAll().then(r => setCourses(r.data)).catch(console.error);
    if (user?.role !== 'student') {
      studentAPI.getAll().then(r => setStudents(r.data)).catch(console.error);
    }
    if (user?.role === 'student') {
      attendanceAPI.summary(user._id).then(r => setSummary(r.data)).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    attendanceAPI.get({ courseId: selectedCourse }).then(r => {
      setRecords(r.data);
      // Pre-fill bulk data for today
      const today = {};
      r.data.filter(rec => rec.date?.split('T')[0] === selectedDate).forEach(rec => {
        today[rec.student?._id] = rec.status;
      });
      setBulkData(today);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedCourse, selectedDate]);

  const getEnrolledStudents = () => {
    const course = courses.find(c => c._id === selectedCourse);
    if (!course) return [];
    return students.filter(s => course.students?.some(en => (en._id || en) === s._id));
  };

  const handleBulkSave = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    const enrolled = getEnrolledStudents();
    const recordsToSave = enrolled.map(s => ({ studentId: s._id, status: bulkData[s._id] || 'absent' }));
    try {
      await attendanceAPI.bulkMark({ courseId: selectedCourse, date: selectedDate, records: recordsToSave });
      alert('Attendance saved!');
    } catch (err) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const enrolledStudents = getEnrolledStudents();
  const statusColor = { present: 'badge-green', absent: 'badge-red', late: 'badge-yellow' };

  return (
    <div>
      <div className="page-header">
        <div><h1>Attendance</h1><p>Mark and track student attendance</p></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg2)', padding: 4, borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content' }}>
        {(user?.role === 'student' ? [['summary', 'My Summary'], ['records', 'Records']] : [['mark', 'Mark Attendance'], ['records', 'View Records']]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 600, background: tab === key ? 'var(--accent)' : 'transparent', color: tab === key ? '#fff' : 'var(--text2)', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Mark Attendance (faculty/admin) */}
      {tab === 'mark' && user?.role !== 'student' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Select Course</label>
                <select className="form-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                  <option value="">— Choose a course —</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>
            </div>
          </div>

          {selectedCourse && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div className="card-title">Mark Attendance</div>
                  <div className="card-sub">{enrolledStudents.length} enrolled students</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const all = {};
                    enrolledStudents.forEach(s => all[s._id] = 'present');
                    setBulkData(all);
                  }}>All Present</button>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    const all = {};
                    enrolledStudents.forEach(s => all[s._id] = 'absent');
                    setBulkData(all);
                  }}>All Absent</button>
                </div>
              </div>

              {loading ? <div className="spinner" style={{ margin: '20px auto' }}></div> : enrolledStudents.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">👤</div><p>No students enrolled in this course</p></div>
              ) : (
                <>
                  {enrolledStudents.map(s => (
                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0 }}>
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.rollNumber || s.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['present', 'absent', 'late'].map(status => (
                          <button key={status} onClick={() => setBulkData(prev => ({ ...prev, [s._id]: status }))}
                            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Sora, sans-serif', transition: 'all 0.15s',
                              background: bulkData[s._id] === status ? (status === 'present' ? 'var(--success)' : status === 'absent' ? 'var(--danger)' : 'var(--warning)') : 'transparent',
                              borderColor: status === 'present' ? 'var(--success)' : status === 'absent' ? 'var(--danger)' : 'var(--warning)',
                              color: bulkData[s._id] === status ? '#fff' : (status === 'present' ? 'var(--success)' : status === 'absent' ? 'var(--danger)' : 'var(--warning)'),
                            }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleBulkSave} disabled={saving}>
                      {saving ? 'Saving…' : '💾 Save Attendance'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary for students */}
      {tab === 'summary' && user?.role === 'student' && (
        <div>
          {summary.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📊</div><p>No attendance data yet</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {summary.map(s => (
                <div className="card" key={s.course._id}>
                  <div className="card-title">{s.course.name}</div>
                  <div className="card-sub" style={{ marginBottom: 16 }}>{s.course.code}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{s.present}/{s.total} classes attended</span>
                    <span style={{ fontWeight: 700, color: s.percentage >= 75 ? 'var(--success)' : 'var(--danger)', fontFamily: 'JetBrains Mono, monospace' }}>{s.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.percentage}%`, background: s.percentage >= 75 ? 'var(--success)' : s.percentage >= 50 ? 'var(--warning)' : 'var(--danger)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <span className="badge badge-green">✓ {s.present} present</span>
                    <span className="badge badge-red">✗ {s.absent} absent</span>
                    {s.late > 0 && <span className="badge badge-yellow">⏱ {s.late} late</span>}
                  </div>
                  {s.percentage < 75 && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6, fontSize: 12, color: '#fca5a5' }}>
                      ⚠ Below 75% threshold
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Records view */}
      {tab === 'records' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Filter by Course</label>
                <select className="form-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Course</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty-state"><div className="empty-icon">📋</div><p>No records found</p></div></td></tr>
                ) : records.map(r => (
                  <tr key={r._id}>
                    <td>{r.student?.name || '—'}</td>
                    <td>{r.course?.name || '—'} <span style={{ fontSize: 11, color: 'var(--text3)' }}>({r.course?.code})</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{new Date(r.date).toLocaleDateString()}</td>
                    <td><span className={`badge ${statusColor[r.status]}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

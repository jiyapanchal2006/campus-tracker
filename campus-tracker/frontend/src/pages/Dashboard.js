import React, { useEffect, useState } from 'react';
import { studentAPI, courseAPI, eventAPI, attendanceAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, courses: 0, events: 0 });
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [studRes, courseRes, eventRes] = await Promise.all([
          studentAPI.getAll(),
          courseAPI.getAll(),
          eventAPI.getAll(),
        ]);
        setStats({
          students: studRes.data.length,
          courses: courseRes.data.length,
          events: eventRes.data.length,
        });
        setEvents(eventRes.data.slice(0, 5));
        setCourses(courseRes.data.slice(0, 4));

        if (user?.role === 'student') {
          const attRes = await attendanceAPI.summary(user._id);
          setAttendanceSummary(attRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const eventTypeColor = {
    academic: 'badge-blue', sports: 'badge-green', cultural: 'badge-purple',
    holiday: 'badge-yellow', exam: 'badge-red', other: 'badge-gray'
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening on campus today.</p>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-icon">👤</span>
          <span className="stat-label">Total Students</span>
          <span className="stat-value blue">{stats.students}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-label">Active Courses</span>
          <span className="stat-value green">{stats.courses}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <span className="stat-label">Campus Events</span>
          <span className="stat-value yellow">{stats.events}</span>
        </div>
        {user?.role === 'student' && (
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Avg Attendance</span>
            <span className="stat-value purple">
              {attendanceSummary.length > 0
                ? Math.round(attendanceSummary.reduce((a, b) => a + b.percentage, 0) / attendanceSummary.length) + '%'
                : 'N/A'}
            </span>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Upcoming Events */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <div className="card-title">📅 Upcoming Events</div>
            <div className="card-sub">Next scheduled campus activities</div>
          </div>
          {events.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>No upcoming events</p></div>
          ) : (
            <div className="recent-list">
              {events.map(ev => (
                <div className="recent-item" key={ev._id}>
                  <span className="recent-item-icon">
                    {ev.type === 'exam' ? '📝' : ev.type === 'sports' ? '⚽' : ev.type === 'holiday' ? '🎉' : ev.type === 'cultural' ? '🎭' : '📌'}
                  </span>
                  <div className="recent-item-info">
                    <strong>{ev.title}</strong>
                    <span>{ev.location || 'Campus'}</span>
                  </div>
                  <span className={`badge ${eventTypeColor[ev.type] || 'badge-gray'}`}>{ev.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Courses */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <div className="card-title">📚 Active Courses</div>
            <div className="card-sub">Currently running subjects</div>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>No courses found</p></div>
          ) : (
            <div className="recent-list">
              {courses.map(c => (
                <div className="recent-item" key={c._id}>
                  <span className="recent-item-icon">📖</span>
                  <div className="recent-item-info">
                    <strong>{c.name}</strong>
                    <span>{c.code} · {c.department}</span>
                  </div>
                  <span className="badge badge-blue">{c.credits} cr</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Summary for students */}
        {user?.role === 'student' && attendanceSummary.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ marginBottom: 16 }}>
              <div className="card-title">✅ My Attendance Summary</div>
              <div className="card-sub">Your attendance percentage per course</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {attendanceSummary.map(s => (
                <div key={s.course._id} style={{ padding: 14, background: 'var(--bg3)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.course.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>{s.course.code}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span>{s.present}/{s.total} classes</span>
                    <span style={{ color: s.percentage >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${s.percentage}%`,
                      background: s.percentage >= 75 ? 'var(--success)' : s.percentage >= 50 ? 'var(--warning)' : 'var(--danger)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/students',  icon: '👤', label: 'Students' },
  { to: '/courses',   icon: '📚', label: 'Courses' },
  { to: '/attendance',icon: '✅', label: 'Attendance' },
  { to: '/grades',    icon: '📊', label: 'Grades' },
  { to: '/events',    icon: '📅', label: 'Events' },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/students':  'Student Management',
  '/courses':   'Course Management',
  '/attendance':'Attendance Tracker',
  '/grades':    'Grade Management',
  '/events':    'Campus Events',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Campus Tracker';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🎓 CampusTrack</h1>
          <p>Academic Management System</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <p>{user?.name}</p>
              <span>{user?.role}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>Sign Out</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

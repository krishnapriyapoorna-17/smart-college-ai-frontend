import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  History,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`portal-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={onClose}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <span>Smart College</span>
          </NavLink>

          <button
            type="button"
            className="btn btn-ghost btn-sm mobile-menu-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/request/new"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <PlusCircle size={18} />
            <span>New Request</span>
          </NavLink>

          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <History size={18} />
            <span>Request History</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
            <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.15rem' }}>
              Smart College Administration
            </p>
            <p>Student Portal</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="portal-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <span className="navbar-context-title">
          Smart College Administration &bull; Student Portal
        </span>
      </div>

      <div className="navbar-right">
        {/* Neutral Student Context Badge */}
        <div className="user-badge" title={user?.email ? user.email : 'Student Account'}>
          <div className="user-avatar" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.fullName || user?.name || 'Student'}</span>
            <span className="user-meta">{user?.studentId || user?.student_id || 'Portal User'}</span>
          </div>
        </div>

        {/* Visual Logout Button */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          title="Sign out of student portal"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <LogOut size={16} />
          <span style={{ fontSize: '0.8125rem' }}>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

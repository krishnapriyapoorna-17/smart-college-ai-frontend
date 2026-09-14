import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="portal-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="portal-main-area">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="portal-content">
          {children}
        </main>

        <footer className="portal-footer">
          <p>
            AI-Powered Multi-Agent System for Smart College Administration &bull; Final Year B.Tech CSE Project &bull; Student Portal
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

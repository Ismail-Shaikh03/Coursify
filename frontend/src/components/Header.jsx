import React from 'react';

const Header = () => {
  return (
    <header className="coursify-header">
      <div className="header-left">
        <div className="brand-logo">
          <img src="/coursify-logo.jpg" alt="Coursify Logo" className="logo-icon" />
          Coursify
        </div>
        <h1 className="header-title">A Better NJIT Schedule Builder</h1>
      </div>
    </header>
  );
};

export default Header;
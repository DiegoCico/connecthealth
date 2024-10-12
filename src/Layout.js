import React from 'react';
import Ruff from './components/Ruff'; 

const Layout = ({ children }) => {
  return (
    <div>
      {children} {/* This will render the content of each page */}
      <Ruff /> {/* This makes Ruff appear on every page */}
    </div>
  );
};

export default Layout;

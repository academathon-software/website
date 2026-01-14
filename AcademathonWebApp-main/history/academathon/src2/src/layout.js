// Layout component that includes the footer
import React from 'react';
import Footer from './footer.js';
import "./layout.css"
import Header from './header.js';

const Layout = ({ children }) => {
  return (
    <div className='all-div'>
      <Header/>
      <main className='main'>{children}</main>
    </div>
  );
};

export default Layout;
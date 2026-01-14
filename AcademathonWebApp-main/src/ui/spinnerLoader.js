import React from 'react';
import './spinner.css'; // Assuming your CSS file is named Spinner.css

const Spinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default Spinner;

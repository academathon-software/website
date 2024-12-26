import React from 'react';
import './filterButton.css'; // Import CSS for styling

function FilterButton({ text, onClick, type, isActive }) {
  return (
    <button
      className={`filter-toggle-button ${isActive ? 'active' : ''}`}
      type={type}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default FilterButton;
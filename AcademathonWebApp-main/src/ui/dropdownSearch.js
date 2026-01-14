import React, { useState, useEffect } from 'react';
import "./dropdownSearch.css";

const DropdownSearch = ({subjects, onSubjectSelect}) => {
    const [selectedSubject,setSelectedSubject] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const handleSelectSubject = subject => {
        onSubjectSelect(subject);
        setShowDropdown(false);
        setSelectedSubject(subject);
    };
    return (
        <div className="simple-dropdown">
            <div className="dropdown">
                <button className="dropdown-btn" onClick={() => setShowDropdown(!showDropdown)}>
                    {selectedSubject ? selectedSubject.name : 'Select Subject'}
                </button>
                {showDropdown && (
                    <div className="dropdown-content">
                        {subjects.map(subject => (
                            <div
                                key={subject.id}
                                className="dropdown-item"
                                onClick={() => handleSelectSubject(subject)}
                            >
                                {subject.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DropdownSearch;
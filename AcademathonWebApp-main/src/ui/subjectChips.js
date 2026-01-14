import React from 'react';
import { Chip, Stack } from '@mui/material';
import './subjectChips.css';

const SubjectChips = ({ subjects, onDelete }) => {
    console.log("Subject Chips:", subjects);

    // Check if subjects exist before rendering the component
    if (!subjects || subjects.length === 0) {
        return null; // Return null if subjects are not present
    }
//Update UI below to reflect name and grade
    return (
        <Stack direction="row" spacing={1} className="subject-chips-container">
            {subjects.map((subject, index) => (
                <Chip
                    key={index}
                    label={subject.name}
                    onDelete={() => onDelete(subject)}
                    className="subject-chip"
                />
            ))}
        </Stack>
    );
};

export default SubjectChips;
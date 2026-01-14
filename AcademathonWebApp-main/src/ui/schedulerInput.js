import React from 'react';
import './schedulerInput.css'; // Import CSS for styling

function TimeSlotInput({ selectedTime, setSelectedTime, type}) {
  return (
    <input
        type={type}
        value={selectedTime}
        onChange={(e) => setSelectedTime}/>
  );
}

export default TimeSlotInput;
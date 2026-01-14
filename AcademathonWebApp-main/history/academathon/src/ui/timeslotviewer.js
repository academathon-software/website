import React, { useState } from 'react';
import './timeslotviewer.css'; // Import your CSS file for styling

const TimeSlotViewer = ({ day, timeSlots, onSlotSelect }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (slotIndex) => {
    const slot = timeSlots[slotIndex];
    setSelectedSlot(slot);
    onSlotSelect(slotIndex); // Notify parent component of the selected slot
  };

  return (
    <div className="timeslot-container">
      <div className="timeslot-header">
        <h2>{day}</h2>
      </div>
      <div className="timeslot-body">

        {timeSlots.map((slot, index) => (
          <div key={index} className="day-timeslots">
            <div className="timeslot-list">
            <div
                key={index}
                className={`timeslot-item ${selectedSlot === slot ? 'selected' : ''}`}
                onClick={() => handleSlotClick(index)}>
                <p>{slot.time} - {slot.duration} min</p>
            </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotViewer;
import React, { useState } from 'react';
import './timeslotviewer.css'; // Import your CSS file for styling

const TimeSlotViewer = ({ date, day, timeSlots, onSlotSelect, disabledTimeSlots = [] }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Function to check if the given day and time slot conflict with any disabled time slot
  const dateCheck = (givenDay, givenTimeSlot) => {
    const timeStringToMinutes = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };

    /*
    if return_value = 0 then exclude the div
    if return_value = 1 then make it yellow
    if return_value = 2 then keep it as is.

    */
    // Check if the given day and time slot combination overlaps with any of the disabled time slots
    let return_value = 2;//do nothing
    console.log("Disabled days:",disabledTimeSlots);

    if(date === null){
      return 2;
    }

    for(let disabledSlot of disabledTimeSlots){
      const disabledSlotDate = new Date(disabledSlot.date);
      const disabledSlotDay = daysOfWeek[disabledSlotDate.getDay()];
      
      //console.log(disabledSlotDay,givenDay,disabledSlotDate,date,isSameDate(disabledSlotDate,date))
      if (disabledSlotDay === givenDay && isSameDate(disabledSlotDate, date)) {
        const givenSlotStart = timeStringToMinutes(givenTimeSlot.time);
        const disabledSlotStart = timeStringToMinutes(disabledSlot.time);
        const disabledSlotEnd = disabledSlotStart + Number(disabledSlot.duration);

        const overlapStart = disabledSlotStart - 60; // 59 minutes before
        const overlapEnd = disabledSlotEnd + 60; // 59 minutes after the disabled slot end time

        console.log("Time:",givenSlotStart,overlapStart,overlapEnd);
        //if we found overlap, then gotta return one of the two 
        if(givenSlotStart >= overlapStart && givenSlotStart <= overlapEnd){
          console.log("Paid:",disabledSlot.paid);
          if(disabledSlot.paid === true){
            return 0; //disable the slot
          }else{
            return  1;//warn that there is a confirmed meeting
          }

        }
      }
    };
    return 2;
    

  };

  const handleSlotClick = (slotIndex) => {
    
    const slot = timeSlots[slotIndex];
    if(selectedSlot === slot){
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot(slot);
    onSlotSelect(slotIndex); // Notify parent component of the selected slot
  };

  return (
    <div className="timeslot-container">
      <div className="timeslot-header">
        <h2>{day}</h2>
      </div>
      <div className="timeslot-body">
        {timeSlots
          .map((slot, index) => {
            const checkResult = dateCheck(day, slot); // Save result in a variable

            // Filter out time slots that return 0
            console.log("Check Result:",checkResult);
            if (checkResult === 0) return null;
            
            
            if(checkResult === 1){//yellow
              console.log("YELLOW SLOT!");
              return (<div className="timeslot-body">
              {timeSlots
                .filter((slot) => dateCheck(day, slot)) // Filter out time slots that conflict with disabled ones
                .map((slot, index) => (
                  <div key={index} className="day-timeslots">
                    <div className="timeslot-list">
                      <div
                        className={`timeslot-item-yellow ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => handleSlotClick(index)}
                      >
                        <p>{slot.time} - {slot.duration} min</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>);
            }

            //return normal otherwise

            console.log("NORMAL SLOT");
            return (<div className="timeslot-body">
              {timeSlots
                .filter((slot) => dateCheck(day, slot)) // Filter out time slots that conflict with disabled ones
                .map((slot, index) => (
                  <div key={index} className="day-timeslots">
                    <div className="timeslot-list">
                      <div
                        className={`timeslot-item ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => handleSlotClick(index)}
                      >
                        <p>{slot.time} - {slot.duration} min</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            );
            /*
            return (
              <div key={index} className="day-timeslots">
                <div className="timeslot-list">
                  <div
                    className={`timeslot-item ${selectedSlot === slot ? 'selected' : ''}`}
                    style={{
                      backgroundColor: checkResult === 1 ? 'yellow' : 'transparent', // Highlight yellow if checkResult is 1
                    }}
                    onClick={() => handleSlotClick(index)}
                  >
                    <p>{slot.time} - {slot.duration} min</p>
                  </div>
                </div>
              </div>
            );*/
          })}
      </div>
    </div>
  );
};

export default TimeSlotViewer;


/*
import React, { useState } from 'react';
import './timeslotviewer.css'; // Import your CSS file for styling

const TimeSlotViewer = ({ date, day, timeSlots, onSlotSelect, disabledTimeSlots = [] }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  
  const isSameDate = (date1,date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Function to check if the given day and time slot conflict with any disabled time slot
  const dateCheck = (givenDay, givenTimeSlot) => {
    // Helper function to convert "HH:MM" time string to total minutes
    const timeStringToMinutes = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    // Check if the given day and time slot combination overlaps with any of the disabled time slots
    return !disabledTimeSlots.some((disabledSlot) => {

      const disabledSlotDate = new Date(disabledSlot.date);
      const disabledSlotDay = daysOfWeek[disabledSlotDate.getDay()];

      console.log("Info:",disabledSlotDay,givenDay,date,disabledSlotDate);
      if (disabledSlotDay === givenDay && isSameDate(disabledSlotDate,date)) {

        const givenSlotStart = timeStringToMinutes(givenTimeSlot.time);
        const disabledSlotStart = timeStringToMinutes(disabledSlot.time);
        const disabledSlotEnd = disabledSlotStart + Number(disabledSlot.duration);
 
        // Check if the given time slot starts within 59 minutes before or after the disabled slot
        const overlapStart = disabledSlotStart - 60; // 59 minutes before
        const overlapEnd = disabledSlotEnd + 60; // 59 minutes after the disabled slot end time
        console.log(givenSlotStart,overlapStart,overlapEnd);
        //return and paid.
        //if confirmed make it yellow. i guess
        return (
          (givenSlotStart >= overlapStart && givenSlotStart <= overlapEnd) // Overlaps or is within 59 minutes
        );
      }
      return false; // No conflict with this disabled slot
    });
  };

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
        {timeSlots
          .filter((slot) => dateCheck(day, slot)) // Filter out time slots that conflict with disabled ones
          .map((slot, index) => (
            <div key={index} className="day-timeslots">
              <div className="timeslot-list">
                <div
                  className={timeslot-item ${selectedSlot === slot ? 'selected' : ''}}
                  onClick={() => handleSlotClick(index)}
                >
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


*/
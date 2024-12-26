import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Using react-icons for custom icons

const dayinv = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
const today = new Date(); // Get today's date

const tileFunction = ({ date, view, selectedValue, schedule, bookings }) => {
  const day_number = date.getDay();
  const day = dayinv[day_number];

  if (view !== 'month') {
    return 'normal-month-tile';
  }

  if (schedule.hasOwnProperty(day)) {
    if(date < today){
      return "normal-tile";
    }
    if (
      date.getDate() === selectedValue.getDate() &&
      date.getMonth() === selectedValue.getMonth() &&
      schedule[day].length > 0
    ) {
      return 'selected-tile'; // Apply custom class for selected date
    }

    if (schedule[day].length > 0) {
      return 'notfree-tile';
    }
  } else {
    if (
      date.getDate() === selectedValue.getDate() &&
      date.getMonth() === selectedValue.getMonth()
    ) {
      return 'selected-tile'; // Apply custom class for selected date
    }

    
  }

  return 'normal-tile';
};

function CalendarUI({
  onSelection = () => {},
  setSelectedDates = () => {},
  handleDateChange = () => {},
  schedule = {},
  applyTileFunction = tileFunction,
  disabledDates = [], // Add disabledDates as a prop
}) {
  const [value, onChange] = useState(new Date());

  // Function to handle selection of a date
  const mySelection = (v) => {
    onSelection(v);
    onChange(v);
  };

  // Function to apply custom classes to tiles
  const tileClassName = ({ date, view }) => {
    // Apply tile function based on the current date and view
    return applyTileFunction({
      date: date,
      view: view,
      selectedValue: value,
      schedule: schedule,
    });
  };

  // Disable tiles before today and specific disabled dates
  const tileDisabled = ({ date, view }) => {
    // Disable past dates
    if (view === 'month' && date <= today) {
      return true; // Disable past dates
    }

    // Disable specific dates passed in disabledDates prop
    return disabledDates.some(
      (disabledDate) =>
        new Date(disabledDate).toDateString() === date.toDateString()
    );
  };

  return (
    <main className="Sample__container__content">
      <Calendar
        className={'custom-calendar'}
        onChange={mySelection}
        value={value}
        tileClassName={tileClassName} // Apply custom tile classes
        tileDisabled={tileDisabled}   // Apply tileDisabled for disabling dates
        setSelectedDates={setSelectedDates}
        handleDateChange={handleDateChange}
        nextLabel={<FaChevronRight color="#0F6F00" />} // Custom next icon
        prevLabel={<FaChevronLeft color="#0F6F00" />}  // Custom prev icon
        next2Label={null}
        prev2Label={null}
      />
    </main>
  );
}

export default CalendarUI;
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "./calendar.css"


const day = {
  'Sunday':0,
  'Monday':1,
  'Tuesday':2,
  'Wednesday':3,
  'Thursday':4,
  'Friday':5,
  'Saturday':6
};
const dayinv = {
  0:'Sunday',
  1:'Monday',
  2:'Tuesday',
  3:'Wednesday',
  4:'Thursday',
  5:'Friday',
  6:'Saturday'
};


const tileFunction = ({date,view,selectedValue,schedule}) => {
  const day_number = date.getDay();
  const day = dayinv[day_number];
  if(view !== 'month'){
    return 'normal-month-tile';
  }
  if(schedule.hasOwnProperty(day)){
  if (date.getDate() === selectedValue.getDate() &&  date.getMonth() === selectedValue.getMonth() && schedule[day].length > 0) {
      return 'selected-tile'; // Apply custom class for selected date
  }
  if(schedule[day].length > 0){
    return 'notfree-tile';
  }
}else{
  if (date.getDate() === selectedValue.getDate() &&  date.getMonth() === selectedValue.getMonth()) {
    return 'selected-tile'; // Apply custom class for selected date
}
}
  
  return 'normal-tile';
};

function CalendarUI({onSelection = () => {}, setSelectedDates = () => {}, handleDateChange = () => {} , schedule={}, applyTileFunction=tileFunction}) {
    const [value,onChange] = useState(new Date());

    

    const mySelection = (v) => {
      onSelection(v);
      onChange(v);
    }
    
    
    const tileClassName = ({ date, view }) => {
        /*
        Later on this must get booking information and color based on that.

        */
        // Check if the current date is selected
      return applyTileFunction({date:date,view:view,selectedValue:value,schedule:schedule});
    };
  return (
      <div className="Sample__container">
        <main className="Sample__container__content">
          <Calendar onChange={mySelection} showWeekNumbers value={value} tileClassName={tileClassName} setSelectedDates={setSelectedDates} handleDateChange={handleDateChange}/>
        </main>
      </div>
  );
}

export default CalendarUI;
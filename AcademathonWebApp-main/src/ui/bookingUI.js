import React from 'react';

import "./bookingUI.css"

import {useState} from 'react';


function BookingUI({subject, onTimeSelect}) {

    const [selectedTime,setSelectedTime] = useState('');

    const handleTimeChange = (event) => {
        const time = event.target.value;
        setSelectedTime(time);
        onTimeSelect(time);

    };

    //Function to handle form submission

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Form submitted");
    };



    return (
        <div className='booking-ui'>
            <div className="booking-ui-content">
                <h2>{subject}</h2>
                <div className="booking-time-picker">
                    <label htmlFor="time">Select Time:</label>
                    <input
                        type="time"
                        id="time"
                        name="time"
                        value={selectedTime}
                        onChange={handleTimeChange}
                    />
                </div>
            </div>
            <button onClick={handleSubmit}>Submit</button>

        </div>
    );
    /*
    Subject
    Time
    Book
    */
}

export default BookingUI;
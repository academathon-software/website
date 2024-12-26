import React, { useState } from 'react';
import './scheduler.css'; // Import your CSS file for styling
import Button from './button';
import firebase from '../auth/firebase';
import { doc, updateDoc, collection,getDoc } from 'firebase/firestore';
import {db} from '../auth/firebase';
import { useEffect } from 'react';


const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Scheduler = () => {

  const user = firebase.auth().currentUser;
  
  console.log("USER:",user);
  console.log("USER ID",user.uid);
  const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch data from Firestore when the component mounts
        const fetchData = async () => {
        try {
            const docRef = doc(collection(db,"profiles"),user.uid);
            await getDoc(docRef,"test").then((snapshot) => {
                console.log("Snapshot:",snapshot.data());
                const fetchedData={id:snapshot.id, ...snapshot.data()};
                setData(fetchedData);

            });
            console.log("HI");

            

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
        };

        fetchData();

        // Clean up the listener when the component unmounts
        return () => {};
    }, []);
    
    const initialSchedule = daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
    
    

  //const initialSchedule=data.schedule;

  console.log(initialSchedule);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  
  for(const key in data.schedule){
    schedule[key] = data.schedule[key];
  }
  
  
  const handleUpdate= () => {
    
    const document = doc(db,'profiles',user.uid);
    updateDoc(document,{schedule:schedule}).catch((error) => {
      console.log("Error:",error);
    });
    
  }

  const handleAddTimeSlot = () => {
    if (selectedDay && selectedTime && selectedDuration) {
      const newTimeSlot = {
        time: selectedTime,
        duration: selectedDuration,
      };
      const updatedSchedule = { ...schedule };
      updatedSchedule[selectedDay].push(newTimeSlot);
      console.log("Updated Schedule:",updatedSchedule);
      setSchedule(updatedSchedule);
      handleUpdate();
    }
  };

  const handleRemoveTimeSlot = (day, index) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day].splice(index, 1);
    setSchedule(updatedSchedule);
    handleUpdate();
  };
  console.log("WED:",schedule);
  return (
    <div className="scheduler-container">
      <div className="scheduler-header">
        <h1>Full Page Scheduler</h1>
      </div>
      <div className="scheduler-body">
        <div className="day-selector">
          <label>Select Day:</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Select Day</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div className="time-slot-input">
          <label>Select Time:</label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>
        <div className="duration-input">
          <label>Select Duration (mins):</label>
          <input
            type="number"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
          />
        </div>
        <div className="add-button-container">
        <Button onClick={handleAddTimeSlot} text="Add Time Slot"/>
        </div>
        <div className="schedule">
          {daysOfWeek.map((day) => (
            <div key={day} className="day-schedule">
              <h2>{day}</h2>
              {schedule[day].map((slot, index) => (
                <div key={index} className="time-slot">
                  <p>{slot.time} - {slot.duration} mins</p>
                  <button className="remove-button" onClick={() => handleRemoveTimeSlot(day, index)}>Remove</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
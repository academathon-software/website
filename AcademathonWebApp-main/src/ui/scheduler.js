import React, { useState } from 'react';
import './scheduler.css'; // Import your CSS file for styling
import Button from './button';
import firebase from '../auth/firebase';
import { doc, updateDoc, collection,getDoc } from 'firebase/firestore';
import {db} from '../auth/firebase';
import { useEffect } from 'react';
import { BsFillXCircleFill } from "react-icons/bs";
import Modal from 'react-modal';
import LoginPage from '../auth/login';





const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Scheduler = () => {

  const user = firebase.auth().currentUser;
  

  const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch data from Firestore when the component mounts
        const fetchData = async () => {
        try {
            const docRef = doc(collection(db,"profiles"),user.uid);
            await getDoc(docRef,"test").then((snapshot) => {
                //console.log("Snapshot:",snapshot.data());
                const fetchedData={id:snapshot.id, ...snapshot.data()};
                setData(fetchedData);

            });
            //console.log("HI");

            

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
    


  //console.log(initialSchedule);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        });
    
        return () => unsubscribe();
      }, []);
  
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
    
    const minutes = selectedTime.split(':')[1]; // Extract the minutes part
    if (minutes === "00" || minutes === "30") {
      setSelectedTime(selectedTime); // Only allow valid times
    } else {
      alert("Please select a time ending in :00 or :30"); // Show error or handle invalid input
      setSelectedTime('');
      return;
    }
    //console.log("SCHEDULE:", selectedDuration);
    if (selectedDay && selectedTime && selectedDuration) {
      const newTimeSlot = {
        time: selectedTime,
        duration: selectedDuration,
      };
      const updatedSchedule = { ...schedule };
      updatedSchedule[selectedDay].push(newTimeSlot);
      //console.log("Updated Schedule:",updatedSchedule);
      setSchedule(updatedSchedule);
      handleUpdate();
      setModalIsOpen(false);
    }



  };

  const handleRemoveTimeSlot = (day, index) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day].splice(index, 1);
    setSchedule(updatedSchedule);
    handleUpdate();
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };



  return (
   isAuthenticated ?  <div className="scheduler-container">
      <div className="scheduler-body">
      
        <div className="add-button-container">
        <Button  onClick={openModal} text="Add Time Slot"/>
        </div>

        <div className="schedule">
          {daysOfWeek.map((day) => (
            <div key={day} className="day-schedule">
              <h2>{day}</h2>
              {schedule[day].map((slot, index) => (
                <div key={index} className="time-slot">
                  <p>{slot.time} - {slot.duration} mins</p>
                  <BsFillXCircleFill className="remove-button" onClick={() => handleRemoveTimeSlot(day, index)}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleAddTimeSlot}
        contentLabel="Example Modal"
        className="custom-modal"
        overlayClassName="custom-overlay">

        <button className="close-button" onClick={() => setModalIsOpen(false)}>x</button>


        <h2>Add Time Slot</h2>


        <div className="day-selector">
          <label>Select Day:</label>
          <select
          className='custom-input'
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}>

            <option value="">Select Day</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>{day}</option>

            ))}
          </select>
        </div>
        <div className="time-slot-input">
  <label className="label-spacing">Select Time:</label>
  <input
  className="custom-input"
  type="time"
  value={selectedTime}
  step="1800"
  onChange={(e) => setSelectedTime(e.target.value)}
/>
</div>
        <div className="duration-input"> 
  <label>Select Duration (hours):</label>
  <select
    className="custom-input"
    value={selectedDuration}
    onChange={(e) => {
       setSelectedDuration(Number(e.target.value));
       }}
  >
    <option value="60">1h</option>
    <option value="120">2h</option>
    <option value="180">3h</option>
    <option value="240">4h</option>
  </select>
</div>
        <Button onClick={handleAddTimeSlot} text="Add Time Slot"></Button>
      </Modal>
    </div>
 : <LoginPage></LoginPage> );
};

export default Scheduler;
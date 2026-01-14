import React from 'react';
//import './myprofile.css'; // Import CSS for styling
import './viewprofile.css';
import SubjectPost from './subjectPost';
import BookingUI from '../ui/bookingUI';
import CalendarUI from '../ui/calendar';
import {db} from "../auth/firebase";
import firebase from "../auth/firebase";
import {collection, doc, updateDoc,getDoc, addDoc} from "firebase/firestore";
import { useState,useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TimeSlotViewer from '../ui/timeslotviewer';
import Button from '../ui/button';


function ViewProfilePage() {
    const navigate = useNavigate();
    const user=firebase.auth().currentUser;
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

    const posts = [
    ]; 
    const [searchParams] = useSearchParams();
    const uid= searchParams.get("uid");
    const myuser = firebase.auth().currentUser;
    const [data, setData] = useState([]);
    useEffect(() => {
        // Fetch data from Firestore when the component mounts
        console.log("USE EFFECT");

        const fetchData = async () => {
        try {
            console.log("FETCHING");
            const docRef = doc(collection(db,"profiles"),uid);
            await getDoc(docRef).then((snapshot) => {
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
    }, [uid]);
    const initialTimeSlots = [
          { startTime: '9:00 AM', duration: '60' },
          { startTime: '10:00 AM', duration: '70' },
        ];
    
    const [timeSlots, setTimeSlots] = useState(initialTimeSlots);
    const [selectedDay,setSelectedDay] = useState(null);
    const [selectedDate,setSelectedDate] = useState('');
    const [indexSelected,setIndexSelected] = useState('');
    

    const setNewTimeSlot = (new_date) => {
        setTimeSlots(schedule[dayinv[new_date.getDay()]]);
        setSelectedDate(new_date);
        setSelectedDay(dayinv[new_date.getDay()]);
        console.log("New time slot",timeSlots);
    }

  // Function to update time slots
    const updateTimeSlot = (day, index, updatedSlot) => {
        const updatedTimeSlots = { ...timeSlots };
        updatedTimeSlots[day][index] = updatedSlot;
        setTimeSlots(updatedTimeSlots);
    };

    useEffect(() => {
        if (data && data.schedule) {
            setTimeSlots([]);
            setSelectedDay('Select Day');
            //also set the selected date, so that when you book in firebase it shows.
        }
    }, [data]);


    //When the student books
    const onBook = async () => {
        try {

            const dateISO = selectedDate.toISOString();
            const theTime = timeSlots[indexSelected].time;
            
            const id = `${myuser.uid}.${dateISO}.${theTime}`;

            const newItem = {date:dateISO,
                            time:timeSlots[indexSelected].time,
                            duration:timeSlots[indexSelected].duration,
                            student: myuser.uid,
                            tutor:uid,
                            deny:false,
                        confirmed:false};

            const newDocRef = await addDoc(collection(db, "bookings"), newItem);

            
          // Step 1: Retrieve the document from Firestore
          const docRef = doc(db, 'profiles', uid);
          const docSnap = await getDoc(docRef);
          newItem['booking_doc_id']=newDocRef.id;
          if (docSnap.exists()) {
            // Step 2: Modify the array by adding the new item
            const currentArray = docSnap.data()["bookings"] || []; // Get current array or initialize as empty array
            const updatedArray = [...currentArray, newItem]; // Add the new item to the array
            
            // Step 3: Update the document in Firestore with the modified array
            console.log("UPDATED:",updatedArray );
            await updateDoc(docRef, {
              bookings: updatedArray // Update the array field with the modified array
            });
            
            console.log('Item added to array field successfully');

            
        
        } else {
            console.log('Document does not exist');
        }
        const myDocRef = doc(db, 'profiles', user.uid);
        const myDocSnap = await getDoc(docRef);
        const currentBookingIDs = myDocSnap.data()["my_bookings_id"] || []; // Get current array or initialize as empty array
        const updatedBookingIDs = [...currentBookingIDs, newDocRef.id];
        await updateDoc(myDocRef,{my_bookings_id:updatedBookingIDs});//HERE!



          navigate("/profile");
        } catch (error) {
          console.error('Error adding item to array field:', error);
        }
    };
    
    if(!data){
        return <div>Loading...</div>;
    }
    

    const name = data.name;
    const bio = data.bio;
    const schedule = data.schedule;

    

    return (
        <div className='full-profile-page'>
            <div className="profile-container">

                <div className="profile-header">
                    <img src="profile.jpg" alt="Profile" className="profile-picture" />
                    <div className="profile-info">
                        <h2 className="profile-name">{name}</h2>
                        <p className="profile-bio">{bio}</p>
                    </div>
                </div>

            </div>
            <div className="booking">
                <CalendarUI onSelection={setNewTimeSlot} schedule={schedule} />
                <TimeSlotViewer day={selectedDay} timeSlots={timeSlots} onSlotSelect={(ind) => {
                    console.log("Slot Selected:",ind);
                    setIndexSelected(ind);
                }}/>
                <Button text="Book" onClick={onBook}/>
            </div>
            
            <div className="subject-posts-list">
                {posts.map(post => (
                    <div className="subject-post-div"> 
                
                        <SubjectPost subject={post.subject} year_level={post.year_level} description={post.description} />
                    </div>
                        ))}
            </div>
            
        </div>
    );
}

export default ViewProfilePage;
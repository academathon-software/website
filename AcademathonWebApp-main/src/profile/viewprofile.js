import React from 'react';
//import './myprofile.css'; // Import CSS for styling
import './viewprofile.css';
import UserProfile from './userProfile'
import profilePic from './profile.jpg'
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
import { getProfileInfo, bookTutor , getTutorInfo} from '../firefunc/firebaseFuncs';
import Loading from '../loading';


function ViewProfilePage() {
    const navigate = useNavigate();
    const user=firebase.auth().currentUser;
    
    const [isLoading,setIsLoading] = useState(false);

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
    const [data, setData] = useState([]);
    const [myData,setMyData] = useState([]);

    useEffect(() => {
        // Fetch data from Firestore when the component mounts
        console.log("USE EFFECT");

        const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await getTutorInfo({tutorID:uid});///Get tutor info here

            setData(data);
            console.log("HI HAS BEEN CHANGED");

            const mysnapshot = await getProfileInfo(user.uid);
           setMyData(mysnapshot.data());
            setIsLoading(false);

            

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
    //const [grade,setGrade] = useState(null);//grade selected
    

    const setNewTimeSlot = (new_date) => {
        //Fix time slots here, if they match bookings, then you must not allow it.
        console.log("")
        setTimeSlots(data.schedule[dayinv[new_date.getDay()]]);
        setSelectedDate(new_date);
        setSelectedDay(dayinv[new_date.getDay()]);
        console.log("Selected Date:",selectedDate);
        console.log("New time slot",timeSlots);
    }

  // Function to update time slots
    const updateTimeSlot = (day, index, updatedSlot) => {
        const updatedTimeSlots = { ...timeSlots };
        updatedTimeSlots[day][index] = updatedSlot;
        setTimeSlots(updatedTimeSlots);
    };

    useEffect(() => {
        console.log("THE BOOKINGS:",data);
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
            
            console.log("data",data)
            //creating new item to add to data
            const booking_data = {date:dateISO,
                            time:timeSlots[indexSelected].time,
                            duration:timeSlots[indexSelected].duration,
                            grade:myData.grade,
                            tutorID:uid,
                        };


            console.log("booking tutor");
            try{
                setIsLoading(true);
                await bookTutor(booking_data);
            }catch(error){
                console.log("Error:",error);
            }
            console.log("booking done,");
            setIsLoading(false);
            navigate("/profile");

            /*
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
        const myDocSnap = await getDoc(myDocRef);
        const myDocData = myDocSnap.data()["bookings"] || [];
        const currentBookingIDs = myDocSnap.data()["my_bookings_id"] || []; // Get current array or initialize as empty array
        const updatedBookingIDs = [...currentBookingIDs, newDocRef.id];
        const updatedBookingData = [...myDocData, newItem];
        console.log("PREV:",updatedBookingData);
        console.log("NEW ITEM:",newItem);
        await updateDoc(myDocRef,{my_bookings_id:updatedBookingIDs,bookings:updatedBookingData});//HERE!

        */

        } catch (error) {
          console.error('Error adding item to array field:', error);
        }
    };
    
    if(!data){
        return <div>Loading...</div>;
    }

    //console.log("THE DATA VIEW PROFILE:", data);

    //unavailabilities here in TimeslotViewer and Calendar UI
    return (
        <div>{isLoading? (<Loading></Loading>) : <div className='full-profile-page'>

            <UserProfile name={data.name} bio={data.bio} profileImage={data.image_path}></UserProfile>
            
            <div className="booking">
                <CalendarUI onSelection={setNewTimeSlot} schedule={data.schedule} />
                <div className="selection-wrapper">
                    <TimeSlotViewer date ={selectedDate} day={selectedDay} timeSlots={timeSlots} disabledTimeSlots={data.bookings} onSlotSelect={(ind) => {
                        console.log("Slot Selected:", ind);
                        setIndexSelected(ind);
                    }}/>
                    <div className="button-wrapper">
                        <Button text="Book" onClick={onBook} />
                    </div>
                </div>

            </div>
            
            
        </div>}</div>
        
    );
}

/*
            <div className="subject-posts-list">
                {posts.map(post => (
                    <div className="subject-post-div"> 
                
                        <SubjectPost subject={post.subject} year_level={post.year_level} description={post.description} />
                    </div>
                        ))}
            </div>
*/

export default ViewProfilePage;

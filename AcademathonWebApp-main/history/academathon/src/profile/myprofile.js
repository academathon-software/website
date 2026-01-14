import React from 'react';
//import './myprofile.css'; // Import CSS for styling
import './myprofile.css';
import SubjectPost from './subjectPost';
import BookingUI from '../ui/bookingUI';
import CalendarUI from '../ui/calendar';
import {db} from "../auth/firebase";
import firebase from "../auth/firebase";
import {collection, doc,getDoc, updateDoc} from "firebase/firestore";

import { useState,useEffect } from 'react';


function ProfilePage() {
    const [data, setData] = useState([]);
      
    const [bookings, setBookings] = useState([
    ]);

    const user= firebase.auth().currentUser;
    const [accType,setAccType] = useState('');
     
    useEffect(() => {
        // Fetch data from Firestore when the component mounts

        const fetchData = async () => {
        try {
            const docRef = doc(collection(db,"profiles"),user.uid);
            await getDoc(docRef).then((snapshot) => {
                //console.log("Snapshot:",snapshot.data());
                const fetchedData={id:snapshot.id, ...snapshot.data()};
                setData(fetchedData);
                setAccType(fetchedData.type);
                if(fetchedData.type === "tutor"){
                    const newBooking = [];
                    for(let b of fetchedData.bookings){
                        const isoString = b.date;
                        const dateObject = new Date(isoString);
                        const dateString = dateObject.toDateString();
                        const id = `${b.uid}.${b.date}.${b.time}`;
                        newBooking.push({id:id,dateString:dateString,date:b.date,time:b.time,duration:b.duration,confirmed:b.confirmed,booking_doc_id:b.booking_doc_id,
                            deny:b.deny
                        });

                    }
                    
                    setBookings(newBooking);

                }else{
                    const newBooking = [];
                    for(let b of fetchedData.bookings){
                        const isoString = b.date;
                        const dateObject = new Date(isoString);
                        const dateString = dateObject.toDateString();
                        const id = `${b.uid}.${b.date}.${b.time}`;
                        newBooking.push({id:id,dateString:dateString,date:b.date,time:b.time,duration:b.duration,confirmed:b.confirmed,booking_doc_id:b.booking_doc_id,
                            deny:b.deny
                        });

                    }
                    console.log(fetchedData.booking);
                    setBookings(newBooking);
                    //student
                    //loop through updatedBookingIDs
                    //get the information from each document
                    //put it in a list
                    //set bookings to it.
                }

            });

            

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
        };

        fetchData();

        // Clean up the listener when the component unmounts
        return () => {};
    }, []);
    console.log("NEW PROFILE!");
    if(!accType){
        return <h3>Loading...</h3>
    }
    if(accType==='tutor'){
        return TutorProfile({data,bookings,user,setBookings});
    }else{
        return StudentProfile({data,bookings,user,setBookings});
    }
}



function StudentProfile({data,bookings,user,setBookings}){
    //value={email}
    const posts = [
        {
           subject:"Mathematics",
            year_level: 12,
            description:"Hello bello! aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
        },

        {
            subject:"Mathematics",
             year_level: 12,
             description:"Hello bello! aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
         },

    ];

    const handleSignOut = () => {
        firebase.auth().signOut()
          .then(() => {
            console.log('User signed out successfully');
          })
          .catch((error) => {
            console.error('Error signing out:', error);
          });
      };



    const name = data.name;
    const bio = data.bio;

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
            <div className="bookings-container">
                {bookings.map((booking) => (
                <div className="booking-card" key={booking.id}>
                    <h3>Booking On: {booking.dateString}</h3>
                    <p>At: {booking.time} for {booking.duration} min</p>
                    <div className="button-container">
                        {booking.confirmed && <h3 class="meeting-confirmed">Meeting confirmed!</h3>}
                        {booking.deny && <h3 class="meeting-denied">Meeting denied!</h3>}
                        {!booking.confirmed && !booking.deny && <h3>Still Pending...</h3>}
                    </div>
                </div>
                ))}
            </div>

            <button onClick={handleSignOut}>Sign Out</button>

            
        </div>
    );
}



function TutorProfile({data,bookings,user,setBookings}){
    //value={email}
    const posts = [
        {
           subject:"Mathematics",
            year_level: 12,
            description:"Hello bello! aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
        },

        {
            subject:"Mathematics",
             year_level: 12,
             description:"Hello bello! aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
         },

    ];

    const handleSignOut = () => {
        firebase.auth().signOut()
          .then(() => {
            console.log('User signed out successfully');
          })
          .catch((error) => {
            console.error('Error signing out:', error);
          });
      };

    
/*
Bookings should have their own collection
*/

const handleConfirm = (id) => {
    let wantedBooking;
    console.log("PREVIOUS BOOKINGS", bookings);
    
    // Check if bookings is initialized
    if (!bookings) {
        console.log("Bookings not initialized");
        return;
    }
    
    const newBookings = bookings.map((booking) => {
        if (booking.id === id) {
            wantedBooking = booking;
            return { ...booking, confirmed: true };
        }
        return booking;
    });
    console.log("CONFIRMED NEW BOOKINGS:", newBookings);
    setBookings(newBookings);
    if (!wantedBooking) {
        console.log("Wanted booking not found");
        return;
    }

    //update /profiles
    const document = doc(db, 'profiles', user.uid);
    updateDoc(document, { bookings: newBookings })
        .catch((error) => {
            console.log("Error updating profile document:", error);
        });
    
    //Update /bookings
    console.log("WANTED BOOKING:",data.bookings);
    const documentBookings = doc(db, 'bookings', wantedBooking.booking_doc_id);
    updateDoc(documentBookings, wantedBooking)
        .catch((error) => {
            console.log("Error updating booking document:", error);
        });
    };

    const handleDeny = (id) => {
    // Check if bookings is initialized
    if (!bookings) {
        console.log("Bookings not initialized");
        return;
    }

    // Check if wantedBooking is defined before proceeding
    let wantedBooking;
    for (let b of bookings) {
        if (b.id === id) {
            wantedBooking = b;
            break; // Once found, exit the loop
        }
    }

    const newBookings = bookings.filter((booking) => booking.id !== id);
    setBookings(newBookings);
    console.log("NEW BOOKINGS:", newBookings);

    const document = doc(db, 'profiles', user.uid);
    updateDoc(document, { bookings: newBookings })
        .catch((error) => {
            console.log("Error updating profile document:", error);
        });

    // Check if wantedBooking is defined before updating document
    if (wantedBooking) {
        const documentBookings = doc(db, 'bookings', wantedBooking.booking_doc_id);
        updateDoc(documentBookings, wantedBooking)
            .catch((error) => {
                console.log("Error updating booking document:", error);
            });
    } else {
        console.log("Wanted booking not found");
    }
    };

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
                <CalendarUI onSelection={(v) => {

                }} schedule={schedule}
                />
            </div>
            
            <div className="bookings-container">
                {bookings.map((booking) => (
                <div className="booking-card" key={booking.id}>
                    <h3>Booking On: {booking.dateString}</h3>
                    <p>At: {booking.time} for {booking.duration} min</p>
                    <div className="button-container">
                        {!booking.confirmed && <button onClick={() => handleConfirm(booking.id)}>Confirm</button>}
                        <button onClick={() => handleDeny(booking.id)}>Deny</button>
                    </div>
                </div>
                ))}
            </div>

            <button onClick={handleSignOut}>Sign Out</button>
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

export default ProfilePage;
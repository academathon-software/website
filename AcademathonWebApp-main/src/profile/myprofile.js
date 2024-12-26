import React from 'react';
import './myprofile.css';
import CalendarUI from '../ui/calendar';
import UserProfile from './userProfile'
import {db} from "../auth/firebase";
import firebase from "../auth/firebase";
import {collection, doc,getDoc, updateDoc} from "firebase/firestore";
import DropdownSearch from '../ui/dropdownSearch';
import { useState,useEffect } from 'react';
import Button from '../ui/button';
import SubjectChips from '../ui/subjectChips';
import { getProfileInfo, studentRemoveBooking, tutorConfirmMeeting, tutorDeclineMeeting, updateProfile } from '../firefunc/firebaseFuncs';
import BookingCard from './ui/bookingCard';
import { getImageURL, isBookingPaid } from '../firefunc/firebaseFuncs';
import LoginPage from '../auth/login';
import Spinner  from '../ui/spinnerLoader';
import { Link } from 'react-router-dom';






function ProfilePage() {
    const [data, setData] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [subjects,setSubjects] = useState([]);
    const user = firebase.auth().currentUser;
    const uid = user?.uid;
    const [accType,setAccType] = useState('');
    const [selectedSubject,setSelectedSubject] = useState('');
    const [mySubjects,setMySubjects] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [imageURL,setImageURL] = useState('');



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

    const handleAddSubject = async (subject) =>  {
        //logic going on.
            for(let b of mySubjects){
                if(b.name === subject.name && b.grade === subject.grade){
                    return;
                }
            }
            const newSubjects = [...mySubjects,{grade:subject.grade,name:subject.name,real_name:subject.real_name}];
            setMySubjects(newSubjects);
            console.log("SELECTED SUBJECT:",subject);
            console.log("NEW SUBJECTS:",newSubjects)
            console.log("UID:",uid);
            
          // Step 1: Retrieve the document from Firestore
         if(!(await updateProfile(uid,{subjects:newSubjects}))){
            console.log("something went wrong while updating profile data for subject");
         };
         
    };

    useEffect(() => {
        // Fetch data from Firestore when the component mounts

        const fetchData = async () => {
        try {
            const docRef = doc(collection(db,"info"),"subjects");
            await getDoc(docRef).then((snapshot) => {
                //console.log("Snapshot:",snapshot.data());
                const fetchedData={id:snapshot.id, ...snapshot.data()};
                setSubjects(fetchedData.subjects);
            });

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
        };

        fetchData();

        // Clean up the listener when the component unmounts
        return () => {};
    }, []);


     
    useEffect(() => {
        // Fetch data from Firestore when the component mounts
        const runFunc = async () => {
        const snapshot = await getProfileInfo(user?.uid);//returns snapshot
        const dataSnap = snapshot.data();
        const img_path = dataSnap.image_path;
        if(img_path){
            setImageURL(img_path);
            console.log("Image URL:",imageURL,"Image Path:",img_path);
        }
        const fetchedData={id:snapshot.id, image_url:imageURL, ...snapshot.data()};
        setData(fetchedData);
        setAccType(fetchedData.type);

        if(fetchedData.type === "tutor"){
            const newBooking = [];
            for(let b of fetchedData.bookings){
                const isoString = b.date;
                const dateObject = new Date(isoString);
                const dateString = dateObject.toDateString();
                const id = `${b.uid}.${b.date}.${b.time}`;
                const student = b.student;
                newBooking.push({id:id,student:student,dateString:dateString,date:b.date,time:b.time,duration:b.duration,confirmed:b.confirmed,booking_doc_id:b.booking_doc_id,
                    deny:b.deny, meeting_link:b.meeting_link, grade:b.grade
                });
            }

            setBookings(newBooking);
            //console.log("MY SUBJECTS",fetchedData.subjects);
            setMySubjects(fetchedData.subjects);

        } else {
            //get booking doc id and show its confirmed if confirmed
            const newBooking = [];
            for(let b of fetchedData.bookings){
                const isoString = b.date;
                const dateObject = new Date(isoString);
                const dateString = dateObject.toDateString();
                const id = `${b.uid}.${b.date}.${b.time}`;
                let mlink = b.meeting_link;
                let paid = b.paid;
                
                if(!b.meeting_link){
                    mlink = "UNCONFIRMED";
                }
                newBooking.push({id:id,dateString:dateString,date:b.date,time:b.time,duration:b.duration,confirmed:b.confirmed,booking_doc_id:b.booking_doc_id,
                    deny:b.deny, meeting_link:mlink, paid: paid,grade:b.grade
                });

            }
            setBookings(newBooking);
            console.log("New Booking:",newBooking);
            //student
            //loop through updatedBookingIDs
            //get the information from each document
            //put it in a list
            //set bookings to it.
        }
    }

    runFunc();
       
        // Clean up the listener when the component unmounts
        return () => {};
    }, []);

    if(!accType ){
        return <Spinner></Spinner>
    }
   
    if(!isAuthenticated){
        return <LoginPage></LoginPage>
    }
    if(accType ==='tutor'){
        return TutorProfile({data,bookings,user,setBookings,subjects,handleAddSubject,selectedSubject,setSelectedSubject,mySubjects,
            setMySubjects, imageURL
        });
    }else{
        return StudentProfile({data,bookings,user,setBookings,imageURL});
    }

    
}



function StudentProfile({data, bookings, user, setBookings, imageURL}) { 
    console.log("STUDENT BOOKINGS:", bookings);

    const name = data.name;
    const bio = data.bio;

    // Function to handle the "X" button click, takes booking ID as parameter
    const handleRemoveBooking = async (bookingId) => {
        console.log("Remove booking with ID:", bookingId);
        // Implement the logic to remove or update bookings here
        setBookings((prevBookings) => prevBookings.filter(booking => booking.booking_doc_id !== bookingId));
        await studentRemoveBooking({booking_doc_id:bookingId});
        //remove it from index.js
    };

    return (
        <div className='full-profile-page'>
            <UserProfile name={name} bio={bio} profileImage={imageURL}></UserProfile>

            <div className="bookings-container">
                {bookings.map((booking) => {
                    return (
                        <div className="booking-card" key={booking.booking_doc_id}>
                            <button className="close-button" onClick={() => handleRemoveBooking(booking.booking_doc_id)}>X</button> 
                            <h3>Booking On: {booking.dateString}</h3>
                            <h3>Grade: {booking.grade}</h3>
                            <p>At: {booking.time} for {booking.duration} min</p>
                            <div className="button-container">
                                {booking.confirmed && <h3 className="meeting-confirmed">Meeting confirmed!</h3>}
                                {booking.confirmed && booking.paid && <h3 className="meeting-link">Meeting link: {booking.meeting_link}</h3>}
                                {booking.confirmed && !booking.paid && <Link to={`/payment?booking=${booking.booking_doc_id}`}>Meeting Confirmed! Click To Pay</Link>}
                                {booking.deny && <h3 className="meeting-denied">Meeting denied!</h3>}
                                {!booking.confirmed && !booking.deny && <h3>Still Pending...</h3>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}



function TutorProfile({data,bookings,user,setBookings,subjects, handleAddSubject,selectedSubject,setSelectedSubject,mySubjects, setMySubjects,imageURL}){

    
/*
Bookings should have their own collection
*/

const handleConfirm = async (id,meeting_link) => {
    //request.body.data = {studentID,booking_id,meeting_link}

    let wantedBooking;
    console.log("PREVIOUS BOOKINGS", bookings);
    
    // Check if bookings is initialized
    if (!bookings) {
        console.log("Bookings not initialized");
        return;
    }
    let studentID="";
    let bookingDocId;
    const newBookings = bookings.map((booking) => {
        if (booking.id === id) {
            wantedBooking = booking;
            console.log()
            studentID=booking.student;
            bookingDocId=booking.booking_doc_id;
            const theNewBooking = { ...booking, confirmed: true, meeting_link:meeting_link};
            wantedBooking=theNewBooking;
            return theNewBooking;
        }
        return booking;
    });
    console.log("NEW BOOKINGS:",newBookings);
    setBookings(newBookings);
    if (!wantedBooking) {
        console.log("Wanted booking not found");
        return;
    }
    console.log("WANTED BOOKINGS:",wantedBooking)

    console.log("HERE!!$@#$@#$");
    //update /profiles
    //Here we call the cloud function instead.
    //...
    if(studentID == ""){
        console.error("Error confirming");
    }
    await tutorConfirmMeeting({studentID:studentID,booking_id:bookingDocId,meeting_link:meeting_link});

    /*

    const document = doc(db, 'profiles', user.uid); //update my tutor profile
    updateDoc(document, { bookings: newBookings })
        .catch((error) => {
            console.log("Error updating profile document:", error);
        });
    



    //update /profiles of student
    let studentBookings;
    console.log("STUDENT ID: ",studentID);
    const docRef = doc(collection(db,"profiles"),studentID);
    await getDoc(docRef).then((snapshot) => {
                //console.log("Snapshot:",snapshot.data());
                const fetchedData={id:snapshot.id, ...snapshot.data()};
                studentBookings=fetchedData.bookings;
              
    }).catch((error) => {
        console.log("ERROR GETTING STUDENT PROFILE:",error);
    });

    console.log("STUDENT BOOKINGS:",studentBookings);
    const studentNewBookings = studentBookings.map((booking) => {
        console.log(booking.id,id,booking.id===id);
        if (booking.booking_doc_id === bookingDocId) {
            return { ...booking, confirmed: true, meeting_link:meeting_link };
        }
        return booking;
    });
    console.log("the student new bookings:",studentNewBookings);
    updateDoc(docRef, { 'bookings': studentNewBookings })
        .catch((error) => {
            console.log("Error updating profile document:", error);
        });
    //till here --- updating the student profile


    //Update /bookings
    console.log("data bookings:",wantedBooking);
    */
    

};

const handleDeny = async (id) => {

    console.log("PREVIOUS BOOKINGS", bookings);
    let deny_confirm = window.confirm("Are you sure you want to deny?");

    if(!deny_confirm){
        return;
    }
    // Check if bookings is initialized
    if (!bookings) {
        console.log("Bookings not initialized");
        return;
    }

    let studentID;
    const newBookings = bookings.filter((booking) => 
        {
            if(booking.booking_doc_id == id){
                studentID = booking.student;
            }
            return booking.booking_doc_id !== id});


    setBookings(newBookings);
    console.log("NEW BOOKINGS:", newBookings);

    return tutorDeclineMeeting({studentID:studentID, booking_id:id});



    };//end of handleDeny


    
    //subject delete:
    const handleSubjectDelete = async (subjectToDelete) => {
        const document = doc(db, 'profiles', user.uid);
        const newSubjects = mySubjects.filter(subject => subject !== subjectToDelete);
        console.log("new subs",newSubjects);
        await setMySubjects(newSubjects);
        //console.log("NEW SUBJECTS",mySubjects);
        updateDoc(document, { subjects: newSubjects })
        .catch((error) => {
            console.log("Error updating profile document:", error);
        });
    };

    const name = data.name;
    const bio = data.bio;
    const schedule = data.schedule;
    //img_url
    let the_subjects = [];
    let id=0;
    
    for(let subject of subjects){{
        //fix this its ugly
        const the_name = subject.name + ` g(${subject.grade})`;
        the_subjects.push({id:id,name:the_name,real_name:subject.name,grade:subject.grade});
        id+=1;
    }};



    console.log("SUBJECTSAG",subjects);
    return (
        <div className='full-profile-page'>
            
            <div>
                <UserProfile name={name} bio={bio} profileImage={imageURL}></UserProfile>
            </div>

            <div className="booking">
                <CalendarUI 
                schedule={schedule}
                />
            </div>
            
            <div className="bookings-container">
                {bookings.map((booking) => (
                    <BookingCard booking={booking} handleConfirm={handleConfirm} handleDeny={handleDeny} key={booking.booking_doc_id}/>
                
                ))}
            </div>
            <div className='login-button'>
            </div>
           
            <div className="subject-selection">
                    <h3>Add Subject:</h3>
                    <DropdownSearch subjects={the_subjects} onSubjectSelect={(subject) => {
                        setSelectedSubject(subject);
                    }}/>
                    <div className="subject-selection-button">
                        <Button text="Add" onClick={() => {handleAddSubject(selectedSubject)}}/>
                    </div>
            </div>
            <div className="subject-show">
                <SubjectChips subjects={mySubjects} onDelete={handleSubjectDelete} />
            </div>
            
        </div>
    );
}

export default ProfilePage;

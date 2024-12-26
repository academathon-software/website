const functions = require("firebase-functions");
//const express = require("express");
const Stripe = require("stripe");
//const cors = require("cors");
const admin = require('firebase-admin');
admin.initializeApp();
const cors = require('cors')({origin:true});
//require('dotenv').config();


const stripe = Stripe("sk_test_51OaQU6F1ibQofTuIL5M2zZMswAdmTTmQB520XFabeNaMYNN1dtl1LZfxRbZO4PNy1tpAb56eeCjZbMGTEx3b658C00zaFseWVa");

const error_email = "academathontutoring@gmail.com";

const nodemailer = require('nodemailer');


const db = admin.firestore();

if (!admin.apps.length) {
  admin.initializeApp();
}
//zcws lcex ilkk vhct

// Nodemailer transport configuration
//console.log("Email user:",process.env.EMAIL_USER);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "academathontutoring@gmail.com",
    pass: "zcws lcex ilkk vhct",
  },
});


async function getProfileData(uid){
  const data = await admin.firestore().collection('profiles').doc(uid).get().then((snapshot) => {
    //get the data
    const fetchedData={id:snapshot.id, ...snapshot.data()};
    return fetchedData;
  });
  return data;
}


async function updateProfileData(uid,data){
  const doc_to_update = await admin.firestore().collection('profiles').doc(uid).update(data)
      .catch((error) => {
           console.log("Error updating booking document:", error);
           return false;
    });
    return true;

}

async function updateBooking(booking_id, wantedBooking){
  const doc_to_update = await admin.firestore().collection('bookings').doc(booking_id).update(wantedBooking)
      .catch((error) => {
          console.log("Error updating booking document:", error);
          return false;
        });
  return true;

}

async function getBookingData(booking_id){
  const data = await admin.firestore().collection('bookings').doc(booking_id).get().then((snapshot) => {
    const fetchData={id:snapshot.id,...snapshot.data()};
    return fetchData;
  })
      .catch((error) => {
          console.log("Error retreiving booking doc:", error);
          return false;
        });
  return data;

}


async function updateProfileBooking(uid,booking_id,data){
  const tutorData = await getProfileData(uid);
  //search for tutor booking
  const newBookings=[];
  for(let b of tutorData.bookings){
        const id = b.booking_doc_id; //booking id should be created.
        if(booking_id == id){
          b = {...b,...data};
          newBookings.push(b)
        }else{
          newBookings.push(b);
        }
  }
  //Now we need to update tutor profile.

  if(!(await updateProfileData(uid, {bookings: newBookings}))){
    console.log("Error Tutor Update");
    return false;
  }
  return true;

}

async function createBooking(data){
  const newDocRef = await admin.firestore().collection('bookings').doc();
  const booking_doc_id = newDocRef.id;
  const new_data = {...data,booking_doc_id:booking_doc_id};
  console.log("DOCUMENT TO UPDATE:",booking_doc_id,"data:",new_data);
  if(!(await admin.firestore().collection('bookings').doc(booking_doc_id).set(new_data))){
    console.log("ERROR, SOMETHING WENT WRONG");
    return false;
  }
  return booking_doc_id;
}






async function sendEmail(to_email,subject,text){
  const mailOptions = {
    from: 'academathontutoring@gmail.com',
    to: to_email,
    subject:subject,
    text:text
  };
  return transporter.sendMail(mailOptions).then(() => console.log("Email sent")).catch((error) => console.error("Error sending email:",error));
}


function removeStudentBooking(booking_id,studentID){
  //function to remove booking from student information, and denying booking doc.
  //this is the same as denying the booking.
}


async function decline_meeting_quick(booking_id,studentID){

  //UPDATE STUDENT PROFILE
  //console.log("STUDENT ID:", studentID);
  const studentData = await getProfileData(studentID);

  const studentEmail = studentData.email;
  const studentNewBookings = [];
  //console.log("student bookings:",studentData.bookings);
  for(let b of studentData.bookings){
        const id =b.booking_doc_id; //booking id should be created.
        if(booking_id != id){
          studentNewBookings.push(b);
        }
  }

  if(!(await updateProfileData(studentID,{bookings:studentNewBookings}))){
    return false;
  }


  //UPDATE BOOKING COLLECTION
  //console.log("Wanted booking:",wantedBooking);
  if(!(await updateBooking(booking_id,{status:"declined"}))){//status denied
    return false;
  };
  
  //SEND EMAIL HERE..............
  console.log("EMAIL SENT");



  sendEmail(studentEmail,"Meeting Denied!","Your meeting with the tutor has been denied.");

  return true;

}

async function remove_meeting_quick(booking_id,tutorID){

  //UPDATE STUDENT PROFILE
  //console.log("STUDENT ID:", studentID);
  const tutorData = await getProfileData(tutorID);

  const tutorEmail =  tutorData.email;
  const tutorNewBookings = [];
  //console.log("student bookings:",studentData.bookings);
  let was_confirmed=false;
  for(let b of tutorData.bookings){
        const id =b.booking_doc_id; //booking id should be created.
        if(booking_id != id){
          tutorNewBookings.push(b);
        }else{
          was_confirmed = b.confirmed;
        }
  }

  if(!(await updateProfileData(tutorID,{bookings:tutorNewBookings}))){
    console.log("remove_meeting_quick: error updating profile data")
    return false;
  }


  //UPDATE BOOKING COLLECTION
  //console.log("Wanted booking:",wantedBooking);
  if(!(await updateBooking(booking_id,{status:"declined"}))){//status denied
    console.log("remove_meeting_quick: error updating booking");
    return false;
  };
  
  //SEND EMAIL HERE..............
  console.log("EMAIL SENT");


  if(was_confirmed){
    sendEmail(tutorEmail,"Meeting Denied!","Your meeting with a student has been cancelled.");
  }
  return true;
}

exports.updateProfileInfo = functions.https.onRequest(async (request,response) => {

  cors(request,response, async ()=> {
    response.set("Access-Control-Allow-Origin",'*');


    const idToken = request.headers.authorization?.split('Bearer ')[1];

      if (!idToken) {
        return response.status(401).send({data:{text:"Unauthorized"}});
      }
      let requestor_id=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          requestor_id = decodedToken.uid;

          // Now you have the UID of the authenticated user
          
          //return res.send(`Hello user with UID: ${uid}`);
      
      } catch (error) {
        return response.status(403).send({data:{text:"Unauthorized"}});
      }

    const request_data = request.body.data;
    const name = request_data['name'];
    const bio = request_data['bio'];

    await updateProfileData(requestor_id,{name:name,name_lowercase: name.toLowerCase() ,bio:bio});
    //profile updates

    response.status(200).send({data:{text:"Profile Updated"}});
  });

});


exports.updateProfileImage = functions.https.onRequest(async (request,response) => {

  cors(request,response, async ()=> {
    response.set("Access-Control-Allow-Origin",'*');

    const request_data = request.body.data;
    const name = request_data['name'];
    const bio = request_data['bio'];    

  });

});


exports.updatePaymentStatus = functions.https.onRequest(async (request,response) => {

  cors(request,response, async () =>
    {console.log("Request Received, updating payment status.");
      response.set('Access-Control-Allow-Origin', '*');

      const request_data = request.body.data;
      //console.log("DATA:", request_data);
      const idToken = request.headers.authorization?.split('Bearer ')[1];

      if (!idToken) {
        return response.status(401).send({data:{text:"Unauthorized"}});
      }
      let requestor_id=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          requestor_id = decodedToken.uid;

          // Now you have the UID of the authenticated user
          
          //return res.send(`Hello user with UID: ${uid}`);
      
      } catch (error) {
        return response.status(403).send({data:{text:"Unauthorized"}});

      }
      const booking_doc_id = request_data.booking_doc_id;
      const payment_intent_id = request_data.payment_intent_id;

      const bookingData = await getBookingData(booking_doc_id);
      const tutorEmail = bookingData.tutor_email;
      const tutorID = bookingData.tutor;
      
      const studentID = bookingData.student;
      console.log("Booking data:",bookingData);
      if(requestor_id != studentID){
        console.log("Requestor:",requestor_id);
        console.log("StudentID:",studentID);
        //change to academathontutoring@gmail.com
        sendEmail(error_email,`Payment Error: ${booking_doc_id}`,`Payment Error: requestor id ${requestor_id} and student id ${studentID} do not match`);

        return response.status(506).send({data:{text:"Requestor id did not match student id"}});


      }

      if(bookingData.payment_intent_id != payment_intent_id){
        sendEmail(error_email,`Payment Error: ${booking_doc_id}`,`Booking doc #${booking_doc_id} payment_intent_id #${bookingData.payment_intent_id} did not match with given payment_intent_id ${payment_intent_id}`);
        return response.status(500).send({data:{text:"Something went wrong check with IT services"}});
      }

      if(!(await updateBooking(booking_doc_id,{paid:true}))){
        return response.status(500).send({data:{text:"Something went wrong with updating booking"}});
      };

      
      const studentData = await getProfileData(studentID);
      const studentEmail = studentData.email;
      const newBookings=[];
      for(let b of studentData.bookings){
            const id = b.booking_doc_id; //booking id should be created.
            if(booking_doc_id == id){
              console.log("Created new meeting link:", bookingData.meeting_link);
              b = {...b,paid:true,meeting_link:bookingData.meeting_link};
              newBookings.push(b)
            }else{
              newBookings.push(b);
            }
      }


      

      //Now we need to update tutor profile.

      if(!(await updateProfileData(studentID, {bookings: newBookings}))){
        console.log("Error Tutor Update");
        return response.status(500).send({data:{text:"Error updating Student information"
        }});
      }



  
      // Save the payment record to Firestore
      const serverTime = new Date();
      const string_time = serverTime.toISOString();
      await admin.firestore().collection('payments').doc(payment_intent_id).set({
        payment_intent_id: payment_intent_id,
        tutor: tutorID,
        student: studentID,
        status: 'succeed',
        timestamp: string_time,  // Properly access FieldValue
    });

      console.log("SENDING EMAIL TO BOTH STUDENT AND TUTOR")
      sendEmail(studentEmail,"Payment Confirmation","Payment confirmed.");
      sendEmail(tutorEmail, "Payment Confirmation","Meeting Payment Confirmed");


      const tutorData = await getProfileData(tutorID);
      
      const tutor_booking_data = tutorData.bookings;
      
      let new_booking_data = [];
      //this method that is fucking up badly.
      for(booking of tutor_booking_data){
        //check if the same booking as the current one.

        if(booking.booking_doc_id != booking_doc_id){
            const studentID = booking.student;
            if(booking.date === bookingData.date && booking.time === bookingData.time){
              //remove.
              
              await decline_meeting_quick(booking.booking_doc_id,studentID);
              //once declined, the function automatically sends the email.
            }else{
              //keep in new_booking_data
              new_booking_data.push(booking);
            }

        }else{
          the_booking = {...booking,paid:true};
          new_booking_data.push(the_booking);
        }

      }

      await updateProfileData(tutorID,{bookings:new_booking_data});
      //do a check here.
      //this should be it.

      //update tutor profile.

      //send emails to all the students who had the same booking date but were not confirmed, and update booking.
      //for each.




      return response.status(200).send({data:{text:"Payment Confirmed"
      }});

    });
  


  /*
  get payment intent id
  get booking doc
  check that the payment intent matches the booking doc
  if it does, change the status to confirmed if the payment intent status is confirmed.

  get meeting_link
  update student information
  put it into the meeting
  and confirm it.




  try {
    // Assuming you have a collection 'payments' where you store payment records
   
    // Update user document or any other relevant document
    await admin.firestore().collection('bookings').doc(bookingId).update({
      paid: true,
      lastPayment: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await admin.firestore().collection("profiles").doc(studentID).update({
      bookings.bookings:
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating Firestore after payment:', error);
    return { success: false, error: error.message };
  }
  */
});


//Create new collection of payments, to update payments, when booking is updated 


exports.createPaymentIntent = functions.https.onRequest(async (request, response) => {
  cors(request,response, async () => 
  {console.log("REQUEST RECEIVED");
    response.set('Access-Control-Allow-Origin', '*');
    const request_data = request.body.data;
    const grade = request_data.grade;
    const booking_doc_id = request_data.booking_doc_id;
    console.log("Booking Data",request_data);
    const grade_to_price = {
      8:2000,
      9:2500,
      10:2500,
      11:3000,
      12:3000
    };
    //console.log(request.body);
    const amount = grade_to_price[grade];
    console.log(`Received request to create payment intent for amount: ${amount}`);
  
    try {
      console.log("Creating payment intent");
      const paymentIntent = await stripe.paymentIntents.create({
        amount:amount,
        currency: "usd",
      });
      console.log("Payment Intent:", paymentIntent);
      await updateBooking(booking_doc_id,{payment_intent_id:paymentIntent.id});
      //update booking doc with paymentIntent.id;
      console.log("Sending Response");

      return response.status(200).send({data:{
        clientSecret: paymentIntent.client_secret,
      }});
      
    } catch (error) {
      console.log("ERROR:", error);
      return response.status(500).send({
        error: error.message,
      });
    }});
  
});

//Helper function to get data of user:




//Finish this.
function filterBookingData(document){
  const booking_data=document["bookings"];
  const result = []
  for(let b of booking_data){
    const date = b["date"];
    const duration = b["duration"];
    const time = b["time"];
    const paid = b["paid"];
    const confirmed = b["confirmed"];//if confirmed then tile should be yellow.

    const info = {date:date,time:time,duration:duration,time:time,confirmed:confirmed,paid:paid};
    result.push(info);
  }

  document = {...document,bookings:result};
  return document;
};


exports.getTutorInfo = functions.https.onRequest(async (request,response) => {
  //Search Tutors here, dont give out all information.
  cors(request,response, async () => 
    {
      response.set('Access-Control-Allow-Origin', '*');
      const request_data = request.body.data;
      const idToken = request.headers.authorization?.split('Bearer ')[1];

      if (!idToken) {
        return response.status(401).send({data:{text:"Unauthorized"}});
      }
      let studentID=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          studentID = decodedToken.uid;
          // Now you have the UID of the authenticated user
          //return res.send(`Hello user with UID: ${uid}`);
      } catch (error) {
        return response.status(500).send({data:{text:"Unauthorized"}});
      }
      //search for tutors.
      const tutorID = request_data.tutorID;
      const tutorData = await getProfileData(tutorID);

      const final_data = filterBookingData(tutorData);

      return response.status(200).send({data:final_data});


    });


});

exports.searchDocumentByDate = functions.https.onRequest(async (request, response) => {

  cors(request,response, async () => 
    {
      response.set('Access-Control-Allow-Origin', '*');
      try {
      // Get the day name
      console.log("REquest dreceived");
      const request_data = request.body.data;
      const idToken = request.headers.authorization?.split('Bearer ')[1];
      if (!idToken) {
        return response.status(401).send({data:{text:"Unauthorized"}});
      }
      let tutorID=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          studentID = decodedToken.uid;
          // Now you have the UID of the authenticated user
          //return res.send(`Hello user with UID: ${uid}`);
      } catch (error) {
        return response.status(500).send({data:{text:"Unauthorized"}});

      }
      
      const searchDate = request_data.searchDate;



      const dayName = new Date(searchDate).toLocaleDateString('en-US', { weekday: 'long' });
      console.log(`DAY NAME: ${dayName}`);

      // Firestore query based on the day name
      const profilesRef = db.collection('profiles');
      const querySnapshot = await profilesRef
          .where('type','==','tutor').where(`schedule.${dayName}`, '!=', [])
          .get();

      console.log('Documents found:', querySnapshot.size);

      // Process the query results and fetch image URLs
      const fetchedData = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const docData = filterBookingData(doc.data());

          //filter booking data
          //remove booking ids.
          

      const imagePath = docData.image_path;
         
          // const imageUrl = imagePath ? await getImageURL(imagePath) : null;


      
      console.log("Document Search Data:", docData);



          return {
              id: doc.id,
              ...docData
          };


      }));

      console.log('Fetched Data:', fetchedData);
      return response.status(200).send({data:fetchedData});
      return { success: true, data: fetchedData };
  } catch (error) {
      console.error('Error searching documents:', error);
      return { success: false, error: error.message };
  }


  
});

});





exports.tutorConfirmMeeting = functions.https.onRequest(async (request,response) => {
  //request.body.data = {studentID,booking_id,meeting_link}
  cors(request,response, async () => 
    {
      response.set('Access-Control-Allow-Origin', '*');
      const request_data = request.body.data;
      const booking_id = request_data.booking_id;//Need booking id
      const meeting_link = request_data.meeting_link;
      const studentID = request_data.studentID;
      //console.log("DATA:", request_data);
      const idToken = request.headers.authorization?.split('Bearer ')[1];

      if (!idToken) {
        return response.status(401).send({data:{text:"Unauthorized"}});
      }
      let tutorID=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          tutorID = decodedToken.uid;
          // Now you have the UID of the authenticated user
          //return res.send(`Hello user with UID: ${uid}`);
      } catch (error) {
        return response.status(500).send({data:{text:"Unauthorized"}});

      }

      const tutorData = await getProfileData(tutorID);
      const tutorName = tutorData.name;
      //search for tutor booking
      const newBookings=[];
      for(let b of tutorData.bookings){
            const isoString = b.date;
            const dateObject = new Date(isoString);
            const dateString = dateObject.toDateString();
            const id = b.booking_doc_id; //booking id should be created.
            if(booking_id == id){
              b = {...b,confirmed:true, meeting_link:meeting_link};
              newBookings.push(b)
            }else{
              newBookings.push(b);
            }
      }
      //Now we need to update tutor profile.

      if(!(await updateProfileData(tutorID, {bookings: newBookings}))){
        console.log("Error Tutor Update");
        return response.status(404).send({data:{text:"Something went wrong while confirming"}});

      }





      //UPDATE STUDENT PROFILE
      //console.log("STUDENT ID:", studentID);
      const studentData = await getProfileData(studentID);

      const studentEmail = studentData.email;
      const studentNewBookings = [];
      let wantedBooking = "";
      //console.log("student bookings:",studentData.bookings);
      for(let b of studentData.bookings){
            const isoString = b.date;
            const dateObject = new Date(isoString);
            const dateString = dateObject.toDateString();
            const id =b.booking_doc_id; //booking id should be created.
            if(booking_id == id){
              b = {...b,confirmed:true, meeting_link:"NOT PAID YET"}; //Will have to update once paid.
              wantedBooking={...b,confirmed:true,meeting_link:meeting_link};
              studentNewBookings.push(b);
            }else{
              studentNewBookings.push(b);
            }
      }

      if(!(await updateProfileData(studentID,{bookings:studentNewBookings}))){
        console.log("Error Student Update");

        return response.status(404).send({data:{text:"Something went wrong while confirming"}});
      }


      //UPDATE BOOKING COLLECTION
      //console.log("Wanted booking:",wantedBooking);
      if(!(await updateBooking(wantedBooking.booking_doc_id,wantedBooking))){
        console.log("Error Bookings Update");

        return response.status(404).send({data:{text:"Something went wrong while updating bookings"}});
      };
      
      //SEND EMAIL HERE..............
      sendEmail(studentEmail,"Meeting Confirmation","Your meeting with the tutor has been confirmed.");
      return response.status(200).send({data:"Confirmation sucessful."});

    });
});



//create a similar function to this that is more efficient for denying locally.
exports.tutorDeclineMeeting = functions.https.onRequest(async (request,response) => {
  
  cors(request,response, async () => 
    {console.log("REQUEST RECEIVED, CONFIRMING MEETING");
      response.set('Access-Control-Allow-Origin', '*');
      const request_data = request.body.data;
      console.log("request_data:", request_data);
      const booking_id = request_data.booking_id;//Need booking id
      const studentID = request_data.studentID;
      //console.log("DATA:", request_data);
      const idToken = request.headers.authorization?.split('Bearer ')[1];

      if (!idToken) {
        return response.status(404).send({data:{text:"Unauthorized"}});
      }
      let tutorID=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          tutorID = decodedToken.uid;
          // Now you have the UID of the authenticated user
          //return res.send(`Hello user with UID: ${uid}`);
      } catch (error) {
        return response.status(403).send({data:{text:"Unauthorized"}});
      }

      const tutorData = await getProfileData(tutorID);

      //search for tutor booking
      const newBookings=[];
      for(let b of tutorData.bookings){
            const id = b.booking_doc_id; //booking id should be created.
            if(booking_id != id){
              newBookings.push(b);
            }
      }
      //Now we need to update tutor profile.

      if(!(await updateProfileData(tutorID, {bookings: newBookings}))){
        console.log("Error Tutor Update");
        return response.status(404).send({data:{text:"Something went wrong while confirming"}});
      }





      //UPDATE STUDENT PROFILE
      //console.log("STUDENT ID:", studentID);
      const studentData = await getProfileData(studentID);

      const studentEmail = studentData.email;
      const studentNewBookings = [];
      //console.log("student bookings:",studentData.bookings);
      for(let b of studentData.bookings){
            const id =b.booking_doc_id; //booking id should be created.
            if(booking_id != id){
              studentNewBookings.push(b);
            }
      }

      if(!(await updateProfileData(studentID,{bookings:studentNewBookings}))){
        console.log("Error Student Update");

        return response.status(404).send({data:{text:"Something went wrong while confirming"}});
      }


      //UPDATE BOOKING COLLECTION
      //console.log("Wanted booking:",wantedBooking);
      console.log("Booking_id:",booking_id);
      if(!(await updateBooking(booking_id,{status:"declined"}))){//status denied
        console.log("Error Bookings Update");
        return response.status(404).send({data:{text:"Something went wrong while updating bookings"}});
      };
      
      //SEND EMAIL HERE..............
      console.log("EMAIL SENT");



      sendEmail(studentEmail,"Meeting Denied!","Your meeting with the tutor has been denied.");

      return response.status(200).send({data:"Declination sucessful."});

    });

});


exports.studentRemoveBooking = functions.https.onRequest(async (request,response) => {
  
  cors(request,response, async () => 
    {console.log("REQUEST RECEIVED, CONFIRMING MEETING");
      response.set('Access-Control-Allow-Origin', '*');
      const request_data = request.body.data;
      console.log("request_data:", request_data);
      const booking_id = request_data.booking_doc_id;//Need booking id
      //console.log("DATA:", request_data);
      const idToken = request.headers.authorization?.split('Bearer ')[1];

      if (!idToken) {
        return response.status(404).send({data:{text:"Unauthorized"}});
      }
      let tutorID=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          studentID = decodedToken.uid;
          // Now you have the UID of the authenticated user
          //return res.send(`Hello user with UID: ${uid}`);
      } catch (error) {
        return response.status(403).send({data:{text:"Unauthorized"}});
      }

      //UPDATE STUDENT PROFILE
      //console.log("STUDENT ID:", studentID);
      const studentData = await getProfileData(studentID);

      const studentEmail = studentData.email;
      const studentNewBookings = [];
      //console.log("student bookings:",studentData.bookings);
      for(let b of studentData.bookings){
            const id =b.booking_doc_id; //booking id should be created.
            if(booking_id != id){
              studentNewBookings.push(b);
            }else{
              tutorID = b.tutor;//Get the tutor ID
            }
      }

      if(!(await updateProfileData(studentID,{bookings:studentNewBookings}))){
        console.log("Error Student Update");
        return response.status(404).send({data:{text:"Something went wrong while confirming"}});
      }


      //UPDATE BOOKING COLLECTION
      //console.log("Wanted booking:",wantedBooking);

      //SEND EMAIL HERE..............
      //console.log("EMAIL SENT");
      //booking already updated here
      if(!(await remove_meeting_quick(booking_id,tutorID))){//status removed
        console.log("tutorID");
        return response.status(404).send({data:{text:"Something went wrong while updating bookings"}});
      };
      

      //sendEmail(studentEmail,"Meeting Denied!","Your meeting with the tutor has been denied.");

      return response.status(200).send({data:"Declination sucessful."});

    });

});




exports.bookTutor = functions.https.onRequest(async (request,response) => {
  //student ID
  //tutorID
  console.log("Calling Book Tutor");
  cors(request,response, async () => 
    {
    
      response.set('Access-Control-Allow-Origin', '*');
      const request_data = request.body.data;
      //console.log("DATA:",request_data);
      const date = request_data.date;
      const time = request_data.time;
      const duration = request_data.duration;
      const tutorID = request_data.tutorID;
      const grade = request_data.grade;
      //console.log("DATA:", request_data);
      const idToken = request.headers.authorization?.split('Bearer ')[1];
      console.log("CHECKING ID TOKEN");
      if (!idToken) {
        return response.status(401).send({data:{text:"Unauthorized"}});
      }
      let studentID=0;
      try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          studentID = decodedToken.uid;
          // Now you have the UID of the authenticated user
          //return res.send(`Hello user with UID: ${uid}`);
      } catch (error) {
        return response.status(403).send({data:{text:"Unauthorized"}});
      }
      console.log("TOKEN CHECKED");
      const tutorData = await getProfileData(tutorID);
      const studentData = await getProfileData(studentID);
      const tutorEmail = tutorData.email;
      const studentEmail = studentData.email;
      let booking_data = {date:date,time:time,duration:duration,tutor:tutorID,student:studentID,student_email:studentEmail,tutor_email:tutorEmail,grade:grade,
        paid:false,
        deny:false,
        confirmed:false
      };

      const booking_doc_id = await createBooking(booking_data);//booking created
      if(booking_doc_id == false){
        console.log("COULD NOT CREATE BOOKING");
        return response.status(500).send({data:{text:"Could not create booking"}});
      }

      //search for tutor booking
      booking_data = {...booking_data,booking_doc_id:booking_doc_id};
      const tutor_new_bookings = [...tutorData.bookings,booking_data];
      const student_new_bookings = [...studentData.bookings,booking_data];
      console.log("tutor_new_bookings:",tutor_new_bookings);
      console.log("studnet_new_bookings",student_new_bookings);
      if(!(await updateProfileData(tutorID,{bookings:tutor_new_bookings}))){
        return response.status(401).send({data:{text:"Error updating profile data"}});
      }
      if(!(await updateProfileData(studentID,{bookings:student_new_bookings}))){
        return response.status(401).send({data:{text:"Error updating profile data"}});
      }

      sendEmail(tutorEmail,"New Booking",`You have a new booking from ${studentData.name}`);
      
      return response.status(200).send({data:{text:"Booking successful"}});

    });






}
);




// Export your Express server function wrapped with `functions.https.onRequest`
//exports.api = functions.https.onRequest(app);
//exports.api = functions.https.onRequest(() => {});
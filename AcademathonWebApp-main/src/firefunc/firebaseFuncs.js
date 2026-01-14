
import {db,storage} from "../auth/firebase";
import {collection, doc,getDoc, addDoc,updateDoc} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions } from "../auth/firebase.js";
import { httpsCallable } from "firebase/functions";

export const getProfileInfo = async (uid) => {
    //user uid
    try {
        const docRef = doc(collection(db,"profiles"),uid);
        let snap;
        await getDoc(docRef).then((snapshot) => {
            snap = snapshot
        });
        console.log("snapshot",snap);
        return snap;

    } catch (error) {
        console.error('Error fetching data: ', error);
        alert("Error fetching profile data!");
        return null;
    }
};




export const isBookingPaid = async (booking_id) => {
  try {
        const docRef = doc(collection(db,"bookings"),booking_id);
        let snap;
        await getDoc(docRef).then((snapshot) => {
            snap = snapshot
        });
        console.log("snapshot",snap.data());
        return snap.data().paid;
    } catch (error) {
        console.error('Error fetching data: ', error);
        alert("Error fetching profile data!");
        return null;
    }
};



export const getImageURL = async (path) => {
        console.log("IMAGE PATH:",path);
          const imageRef = ref(storage, path);
          try{
            const url = await getDownloadURL(imageRef);
            return url;
          }catch (err){
            console.log("Error downloading image:",err);
            return null;
          }
          
}



export const updateProfileImage = async (file, uid) => {
  if (!file) {
    throw new Error("No file selected");
  }

  try {
    // Create a reference to the storage location with the given path/name
    const storageRef = ref(storage, `Images/profileImage_${uid}`);

    // Upload the file to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, file);

    // Get the download URL of the uploaded image
    const downloadUrl = await getDownloadURL(uploadResult.ref);

    console.log('File uploaded successfully. File available at:', downloadUrl);

    // Optionally, update the Firestore user profile document with the new image URL
    // Assuming you have a Firestore document structure for the user profile
    const userProfileRef = doc(db, 'profiles', uid); // Assuming 'users' collection, and fileName as doc ID
    await updateDoc(userProfileRef, { image_path: downloadUrl });

    console.log('Firestore updated with new profile image URL.');
    return downloadUrl; // Return the URL if needed for further use
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload image");
  }
};

export const updateProfile = (uid,data) => {//data: {image:..., name:...}
    const document = doc(db, 'profiles', uid);
    updateDoc(document, data)
        .catch((error) => {
            console.log("Error updating profile document:", error);
        });

};

export const updateProfileInfo = async (data) => {
  
  const functionCall = httpsCallable(functions, 'updateProfileInfo');
  
  await functionCall(data);

}

export const updateBooking = (booking_id,data) => {

  const document = doc(db,'bookings',booking_id);
  updateDoc(document,data).catch((error) => {
    alert("Error updating booking! Please email academathonsoftware@gmail.com");
    console.log("Error updating booking!");
  });

};

export const getProfileImage = async (user_id) => {

  const imageRef = ref(storage, `Images/profileImage_${user_id}`);
        
  // Get the download URL
  const url = await getDownloadURL(imageRef);

  return url;

};


export const uploadImage = (name,image,uid) => {
    if (!image) {
      alert('Please choose an image first.');
      return;
    }

    const storageRef = ref(storage, `profileImages/${name}`);
    const uploadTask = uploadBytes(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress function
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        // Error function
        console.log(error);
        alert(error.message);
      },
      () => {
        // Complete function
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          // Save the image URL to account
            updateProfile(uid,{image_url:url});
        });
      }
    );
};



//fire cloud functions

export const tutorConfirmMeeting = async (data) => {
  const functionCall = httpsCallable(functions, 'tutorConfirmMeeting');
  await functionCall(data);
};


export const studentRemoveBooking = async (data) => {
  const functionCall = httpsCallable(functions,'studentRemoveBooking');
  await functionCall(data);
};

export const tutorDeclineMeeting = async (data) => {
  const functionCall = httpsCallable(functions, 'tutorDeclineMeeting');
  await functionCall(data);
};

export const updatePaymentStatus = async (data) => {
  const functionCall = httpsCallable(functions,"updatePaymentStatus");
  await functionCall(data);
};

export const bookTutor = async (data) => {
  const functionCall = httpsCallable(functions,"bookTutor");
  await functionCall(data);
}


export const searchDocumentByDateFunction = async (data) => {
  const functionCall = httpsCallable(functions,"searchDocumentByDate");
  const ret = await functionCall(data);
  return ret['data'];
}

export const getTutorInfo = async (data) => {
  const functionCall = httpsCallable(functions,"getTutorInfo");
  const ret = await functionCall(data);
  return ret['data'];
}


import firebase from "firebase/compat/app";

const firestore = firebase.firestore();


/*

bio:

bookings:[{}]

name:

email:

pic:

subjects:[]




*/




async function createUserProfile(uid, email, name, bio, bookings, pic, subjects) {
    try {
        const userProfileRef = firestore.collection('profiles').doc(uid);
        await userProfileRef.set({
            email: email,
            displayName: displayName,
            // You can add more fields as needed
        });
        console.log('User profile created successfully');
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
}
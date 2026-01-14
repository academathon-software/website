import { React } from 'react';
import { useNavigate } from 'react-router-dom'
import firebase from "../auth/firebase";



const DropdownProfile = () => {
   
    const navigate = useNavigate()

    const handleSignOut = () => {
        firebase.auth().signOut()
          .then(() => {
            console.log('User signed out successfully');
            window.location.reload();
          })
          .catch((error) => {
            console.error('Error signing out:', error);
          });
       
      };
      
    return (
            <ul className='flex flex-col gap-4 dropdownProfile'>
                <li className='dropdown-item' onClick={() => navigate('/profile')}>Profile</li>
                <li className='dropdown-item' onClick={() => navigate('/settings')}>Settings</li>
                <li className='dropdown-item' onClick={handleSignOut}>Logout</li>
            </ul>
 );
};

export default DropdownProfile;
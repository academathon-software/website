import React from 'react';
import './post.css'; // Import CSS for styling

function ProfilePost({name,bio,subjects,picture,onClick=() => {}}) {
    return (
        <div className="profile-post">
            <div className="profile-picture">
                <img src={picture} alt="Profile" />
            </div>
            <div className="post-profile-info">
                <h2 className="post-profile-name">{name}</h2>
                <p className="profile-description">{bio}</p>
                <p className="teaching-subjects">Teaching: {subjects}</p>
            </div>
            <button className="book-button" onClick={onClick}>Book</button>
        </div>
    );
}

export default ProfilePost;
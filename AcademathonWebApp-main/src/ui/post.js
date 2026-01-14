import profilePic from "../assets/profile.jpg";
import "./post.css";
import Button from "./button";

function ProfilePost({ name, bio, subjects, picture, onClick = () => {} }) {
    let image;
    if(!picture){
        image=profilePic;
    }else{
        image=picture;
    }

    return (
        <div className="profile-post">
            <div className="profile-row profile-picture-post">
                <img src={image} />
            </div>
            <div className="profile-row post-profile-info">
                <h2 className="post-profile-name">{name}</h2>
                <p className="profile-description">{bio}</p>
                <p className="teaching-subjects">Teaching: {subjects}</p>
            </div>
            <div className="profile-row">
                <Button className="book-button" onClick={onClick} text="Book" />
            </div>
        </div>
    );
    
    
}

export default ProfilePost;
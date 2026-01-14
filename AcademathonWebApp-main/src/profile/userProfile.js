
import profilePic from "./profile.jpg"
import "./userProfile.css"

const userProfile = ( {name, bio, profileImage} ) => {
    let image;
    console.log("Profile image:",profileImage);
    if(!profileImage){
        image = profilePic;
    }else{
        image=profileImage;
    }
    
    return (
        <div className="container">
        <div className="profile-container">
        <img src={image} alt="Profile" className="profile-picture" />
        <div className="profile-info">
        <h2 className="profile-name">{name}</h2>
        <p className="profile-bio">{bio}</p>
        </div>
        </div>
        </div>

    )
}

export default userProfile;


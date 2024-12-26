
import profilePic from "./profile.jpg"
import "./userProfile.css"

const userProfile = ( {name, bio} ) => {
    return (
        <div className="container">
        <div className="profile-container">
        <img src={profilePic} alt="Profile" className="profile-picture" />
        <div className="profile-info">
        <h2 className="profile-name">{name}</h2>
        <p className="profile-bio">{bio}</p>
        </div>
        </div>
        </div>

    )
}

export default userProfile;


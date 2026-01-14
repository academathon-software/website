import React from 'react';
//import './myprofile.css'; // Import CSS for styling
import './subjectPost.css';

function SubjectPost({subject,year_level,description}) {
    return (


        <div className="subjectPost">
            <img src="ad" alt={`${subject} Logo`} className="logo" />
            <div className="content">
                <h2>{subject}</h2>
                <p className="year-level">Year Level: {year_level}</p>
                <p className="description">{description}</p>
                <p className="qualifications">Tutor Qualifications: rfwe</p>
            </div>
    </div>


    );
    /*
    
    */
}
//            


export default SubjectPost;
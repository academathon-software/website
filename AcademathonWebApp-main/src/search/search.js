import React, { useState, useEffect } from 'react';
import 'react-calendar/dist/Calendar.css';
import "./search.css"
import CalendarUI from '../ui/calendar';
import ProfilePost from '../ui/post';
import Button from '../ui/button';
import FilterButton from '../ui/filterButton';
import {db} from "../auth/firebase";
import {collection,query,where,getDocs,doc,getDoc} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import DropdownSearch from '../ui/dropdownSearch.js';
import { getImageURL, searchDocumentByDateFunction } from '../firefunc/firebaseFuncs.js';
import firebase from "../auth/firebase";
import LoginPage from '../auth/login';
import Loading from '../loading.js';



function SearchPage() {
    const [selectedOption,setSelectedOption] = useState(null);
    const [selectedGrade,setSelectedGrade] = useState(0);//if selected grade is 0, means no selected grade
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [searchDate, setSearchDate] = useState(new Date()); // Set your search date here
    const [searchName, setSearchName] = useState('');
    const [subjects,setSubjects] = useState([]);
    const [selectedSubject,setSelectedSubject] = useState('all');
    const [activeButton, setActiveButton] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading,setIsLoading] = useState(false);
    const grades=[{id:0,name:"all",value:0},
        {id:1,name:1,value:1},
        {id:10,name:10,value:10},
         {id:11,name:11,value:11},
          {id:12,name:12,value:12}];

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


    useEffect(() => {
        // Fetch data from Firestore when the component mounts

        const fetchData = async () => {
        try {
            const docRef = doc(collection(db,"info"),"subjects");
            await getDoc(docRef).then((snapshot) => {
                //console.log("Snapshot:",snapshot.data());
                const fetchedData={id:snapshot.id, ...snapshot.data()};
                const newData = [{id:0,name:"all"}];
                const previousSubjects = [];
                for(let i =0; i < fetchedData.subjects.length; i++){
                    const subjName = fetchedData.subjects[i].name;
                    if(previousSubjects.includes(subjName)){
                        continue;
                    };
                    newData.push({id:i+1,name:subjName});
                    previousSubjects.push(subjName);
                    //keep only the name information
                }

                setSubjects(newData);
                setSelectedSubject('all');
            });

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
        };

        fetchData();

        // Clean up the listener when the component unmounts
        return () => {};
    }, []);

    const set_the_posts = (fetchedData) => {
        //handle setting the posts
        const newData = [];
        for(let post of fetchedData){
            const subjects = post.subjects;
            console.log('Subjects:',subjects);
            const subjectNames = [];
            for(let k of subjects){
                console.log("A Subject:",k);
                if(k.real_name){
                    if(subjectNames.includes(k.real_name)){
                        continue;
                    }
                    subjectNames.push(k.real_name);
                }else{
                    //to deal with old accounts
                    if(subjectNames.includes(k)){
                        continue;
                    }
                    console.log("Adding to subject names");
                    subjectNames.push(k);
                }
            };
            console.log(`${post.name}:`,subjectNames);
            newData.push({...post,subjectNames:subjectNames});
            console.log("New data:",newData);
        }
        console.log("Setting posts");
        setPosts(newData);
        console.log("The Posts:",newData);
    };

    const handleDateSearchCalendar = async () => {
        try {
            setIsLoading(true);
            const fetchedData = await searchDocumentByDate(searchDate);
            //FIX DATA HERE, posts make them download the images immediately
            set_the_posts(fetchedData);
            setIsLoading(false);
        } catch (error) {
        // Handle error
            console.log("ERROR:",error);
        }
    };
    
    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setActiveButton(option);
    };
    const onSelection = (date) => {
        setSearchDate(date);
        console.log("Selected date:", searchDate);
    } ;

    const colorTile = ({date,view,selectedValue}) => {
        if(view ==='month' && date.getDate() === selectedValue.getDate() &&  date.getMonth() === selectedValue.getMonth()){
            return 'selected-tile';
        }
        return 'white-tile';
    };

    /*
    implement fuzzy search later on.

    */

    const handleDataSearchName = async () => {
            const searchName_lowercase = searchName.toLowerCase();
            const q = query(
                collection(db, 'profiles'),
                where('name_lowercase', '>=' , searchName_lowercase),
              );
              console.log("Searching",searchName_lowercase);
            setIsLoading(true);
            const querySnapshot = await getDocs(q);
            console.log("query docs:",querySnapshot);
            const fetchedData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Client-side filtering for better matches
        console.log("handleDataSearchName fetchedData: ", fetchedData);
        //for(let p in fetchedData){
        //    console.log("handleDataSearchName Post: ");
        //}
        const filteredData = fetchedData.filter(item => (item.type === "tutor" && item.name_lowercase.includes(searchName_lowercase)));
        set_the_posts(filteredData);
        setIsLoading(false);
        //setPosts(filteredData);
    };
    const search = async () => {
        if(selectedOption==='calendar-option'){
            handleDateSearchCalendar();
        }else{
            //text option
            handleDataSearchName();
        }
    };

    const goToProfile = (profile_uid) => {
        navigate(`/viewprofile?uid=${profile_uid}`);
    }

    const onTextSearch = (text) =>{
        setSearchName(text);
    };

    return (
        isAuthenticated ? 
        <div>
     {isLoading? (<Loading></Loading>) : <div className="search-container">

            <div className="main-content">
                {/* Main content area */}
                <h2>I would like to find a tutor by</h2>

                <div className='button-row'>
                    <FilterButton text="Date" onClick={() => handleOptionClick('calendar-option')} isActive={activeButton === 'calendar-option'}/>
                    <FilterButton text="Name" onClick={() => handleOptionClick('text-option')} isActive={activeButton === 'text-option'}/>
                </div>
               

                <div className="search-fields">
                    {selectedOption === 'calendar-option' ? <CalendarUIOption onSelectionFunction={onSelection} coloringFunction={colorTile}/> : <TextUIOption onSearch={onTextSearch}/>}
                </div>
       
                <Button text="Search" onClick={search}/>

                <div className="subject-selection">
                    <h3>Filter By Subject:</h3>
                    <DropdownSearch subjects={subjects} onSubjectSelect={(s) => {
                        console.log("Subject:", s.name);
                        return setSelectedSubject(s.name);}}/>
                </div>
                <div className="grade-selection">
                    <h3>Filter By Grade:</h3>
                    <DropdownSearch subjects={grades} onSubjectSelect={(s) => {
                        return setSelectedGrade(s.value);}}/>
                </div>
                <div className="posts">
                {posts.map(post => {
        // Check if the current post's ID (or any other unique property) is in the allowedPosts list
        //will need to fix below if I want to change subject to an array
                    console.log("POST:",post.subjectNames,selectedSubject);
                    if (post.subjects != null && (post.subjectNames.includes(selectedSubject) || (selectedSubject === "all"))) {
                        //second if state to check if there is a selected grade
                        if(selectedGrade !== 0){//this should be working for now.
                            //if it does not include the desired shit, remove.
                            let skip = true;
                            console.log("POST.SUBJECTS:", post.subjects,selectedSubject,selectedGrade);
                            for(let s of post.subjects){
                                if((selectedSubject === "all" || s.real_name === selectedSubject) && s.grade === selectedGrade){
                                    skip=false;
                                    break;
                                }
                            }
                            if(skip){
                                return null;
                            }
                        }
                        return (
                            <div key={post.id} className="profile-post-container">
                                <ProfilePost 
                                    name={post.name} 
                                    bio={post.bio} 
                                    subjects={post.subjectNames.join(', ')} 
                                    picture={post.image_url} 
                                    onClick={() => goToProfile(post.id)} 
                                />
                            </div>
                        );
                    } else {
                        return null; // Do not render anything if the post is not in the allowedPosts list
                    }
                })}
                </div>
            </div>
    </div> }</div>
   : <LoginPage></LoginPage>);
}

async function searchDocumentByDate(searchDate){
    try {

        console.log("Searching...");
        const temp = await searchDocumentByDateFunction({searchDate:searchDate});
        let to_return = [];

        for(let b of temp){
            const I_url = await getImageURL(b.image_path);
            const new_doc = {image_url: I_url,...b};
            to_return.push(new_doc);
        }


        console.log("Got return: ", to_return);
        return to_return;

        const dayName = searchDate.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`DAY NAME: ${dayName}`);
        //send information to server here.
        const q = query(
            collection(db, 'profiles'),
            where(`schedule.${dayName}`, '!=', [])
        );
        //query here.
        //check availability by day...

        console.log("BEFORE AWAIT");
        const querySnapshot = await getDocs(q);
        console.log("query docs:", querySnapshot);

        // Use Promise.all to wait for all promises to resolve
        const fetchedData = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const I_url = await getImageURL(doc.data().image_path); 
            const new_doc = {image_url: I_url, ...doc.data()};
            console.log("NEW DOC", new_doc);


            return {
                id: doc.id,
                ...new_doc
            };
        }));

        console.log("Fetched Data after", fetchedData);
        return fetchedData;
    
    
    
    } catch (error) {
        console.error(error);
    }
}

function CalendarUIOption({onSelectionFunction, coloringFunction}){
    console.log("Selection:",onSelectionFunction);
    return (
        <CalendarUI
        onSelection={onSelectionFunction} 
        applyTileFunction={coloringFunction}
        />
  );
}

function TextUIOption({onSearch}){
    return (
        <input
          className='custom-input'
          type="text"
          placeholder="Name"
          onChange={(e) => onSearch(e.target.value)}
        />
    );
}

export default SearchPage;
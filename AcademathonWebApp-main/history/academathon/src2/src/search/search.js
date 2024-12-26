import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "./search.css"
import CalendarUI from '../ui/calendar';
import Layout from '../layout';
import ProfilePost from '../ui/post';
import Button from '../ui/button';
import {db} from "../auth/firebase";
import {collection,query,where,getDocs, doc,getDoc} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import DropdownSearch from '../ui/dropdownSearch.js';


async function searchDocumentByDate(searchDate){
    try{
        const dayName = searchDate.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`DAY NAME: ${dayName}`);
        const q = query(
            collection(db, 'profiles'),
            where(`schedule.${dayName}`, '!=', [])
          );
        console.log("BEFORE AWAIT");
        const querySnapshot = await getDocs(q);
        console.log("query docs:",querySnapshot);
        const fetchedData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return fetchedData;
    }catch(error){
        console.error(error);
    }
}


function SearchPage() {
    const [value,onChange] = useState(new Date());
    const [selectedOption,setSelectedOption] = useState("calendar-option");
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [searchDate, setSearchDate] = useState(new Date()); // Set your search date here
    const [searchName, setSearchName] = useState('');
    const [subjects,setSubjects] = useState([]);
    const [selectedSubject,setSelectedSubject] = useState('');


    useEffect(() => {
        // Fetch data from Firestore when the component mounts

        const fetchData = async () => {
        try {
            const docRef = doc(collection(db,"info"),"subjects");
            await getDoc(docRef).then((snapshot) => {
                //console.log("Snapshot:",snapshot.data());
                const fetchedData={id:snapshot.id, ...snapshot.data()};
                const newData = [];
                for(let i =0; i < fetchedData.subjects.length; i++){
                    newData.push({id:i,name:fetchedData.subjects[i]});
                }

                setSubjects(newData);
            });

            

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
        };

        fetchData();

        // Clean up the listener when the component unmounts
        return () => {};
    }, []);



    const handleDateSearchCalendar = async () => {
        try {
        const fetchedData = await searchDocumentByDate(searchDate);
        console.log("data:",fetchedData);
        
        setPosts(fetchedData);
        } catch (error) {
        // Handle error
        }
    };
    const tileClassName = ({ date, view }) => {
        // Check if the current date is selected
        if (view === 'month' && date.getDate() === value.getDate() &&  date.getMonth() === value.getMonth()) {
            return 'selected-tile'; // Apply custom class for selected date
        }else{
            return 'normal-tile';
        }
    };
    
    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };
    const onSelection = (date) => {
        setSearchDate(date);
        console.log("Selected date:", searchDate);
    } ;


    const colorTile = ({date,view,selectedValue,schedule}) => {
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
                where('name_lowercase', '==' , searchName_lowercase),
              );
              console.log("Searching",searchName_lowercase);
            const querySnapshot = await getDocs(q);
            console.log("query docs:",querySnapshot);
            const fetchedData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Client-side filtering for better matches
        const filteredData = fetchedData.filter(item => item.name.includes(searchName_lowercase));
        setPosts(filteredData);
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
    

     <div className="search-container">
            
            <div className="left-column">
                {/* Filter options */}
                <h3>Filters</h3>
                <ul>
                    <li onClick={() => handleOptionClick('calendar-option')}>Calendar Search</li>
                    <li onClick={() => handleOptionClick('text-option')}>Name Search</li>
                    {/* Add more filter options */}
                </ul>
            </div>

            <div className="main-content">
                {/* Main content area */}
                <h2>Search Results</h2>
                <div className="search-fields">
                    {selectedOption === 'calendar-option' && <CalendarUIOption onSelectionFunction={onSelection} coloringFunction={colorTile}/>}
                    {selectedOption === 'text-option' && <TextUIOption onSearch={onTextSearch}/>}
                    <div className="search-button">
                        <Button text="Search" onClick={search}/>
                    </div>
                    
                </div>
                <div className="subject-selection">
                    <h3>Filter By Subject:</h3>
                    <DropdownSearch subjects={subjects} onSubjectSelect={setSelectedSubject}/>
                </div>
                <div className="posts">
                    {posts.map(post => (
                        <div className="profile-post-container">
                            <ProfilePost name={post.name} bio={post.bio} subjects={post.subjects} picture={post.picture} onClick= {() => {
                                goToProfile(post.id);
                            } }/>
                        </div>
                    ))}
                </div>
            </div>
    </div>
  );
}

function CalendarUIOption({onSelectionFunction, coloringFunction}){
    console.log("Selection:",onSelectionFunction);
    return (<div className="calendar">
        <CalendarUI onSelection={onSelectionFunction} applyTileFunction={coloringFunction}/>
    </div>);
}

function TextUIOption({onSearch}){
    //value={email}
    return (<div className="text-search">
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => onSearch(e.target.value)}
        />
    </div>);
}



export default SearchPage;
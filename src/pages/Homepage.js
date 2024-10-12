import React from 'react';
import '../css/Homepage.css';  // Import CSS for styling the Homepage
import SideNav from '../components/SideNav';  // Import the SideNav component
import News from '../components/News';  // Import the News component

export default function Homepage() {
    return (
        <div className="homepage-container">  {/* Main container for the homepage */}
            <SideNav className="side-nav" />  {/* Side navigation bar */}
            <div className="news-content">  {/* Section for the news content */}
                <News />  {/* Display the News component */}
            </div>
        </div>
    );
}

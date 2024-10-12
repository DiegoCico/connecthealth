import React from 'react';
import '../css/Homepage.css'; 
import SideNav from '../components/SideNav'; 
import News from '../components/News';

export default function Homepage() {
    return (
        <div className="homepage-container">
            <SideNav className="side-nav" /> {/* Side navigation */}
            <div className="news-content"> {/* Main content section */}
                <News />
            </div>
        </div>
    );
}

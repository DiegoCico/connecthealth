import React from 'react';
import '../css/HeadlineCard.css';  // Import the CSS for styling

export default function TopHeadlineCard(props) {
    const { headline } = props;  // Destructure the 'headline' prop

    return (
        <div className='headline-card' onClick={() => { /* Click action can be added here later */ }}>
            <img src={headline.imageUrl} alt={headline.title} className='headline-image' />  {/* Display the image */}
            <h3 className='headline-title'>{headline.title}</h3>  {/* Display the headline title */}
        </div>
    );
}

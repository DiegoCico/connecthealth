import React from 'react';
import '../css/HeadlineCard.css';

/**
 * HeadlineCard Component
 * 
 * This component renders a card with a headline image and title, linking to an external article.
 * 
 * Props:
 * - title (string): The headline title displayed on the card.
 * - imageUrl (string): URL of the image to display in the card.
 * - articleURL (string): The URL of the article that the headline card links to.
 * 
 * @param {Object} props - The properties passed into the component.
 * @returns {JSX.Element} - A card component containing a headline image and title.
 */
const HeadlineCard = ({ title, imageUrl, articleURL }) => {
    return (
        <div className="headline-card">
            {/* Link that wraps the image and title, opens in a new tab */}
            <a href={articleURL} target="_blank" rel="noopener noreferrer">
                {/* Image element displaying the headline image */}
                <img src={imageUrl} alt={title} className="headline-image" />
                
                {/* Title element displaying the headline title */}
                <h3 className="headline-title">{title}</h3>
            </a>
        </div>
    );
};

export default HeadlineCard;

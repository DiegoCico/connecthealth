import React from 'react';
import '../css/HeadlineCard.css';

const HeadlineCard = ({ title, imageUrl, articleURL }) => {
    return (
        <div className="headline-card">
            <a href={articleURL} target="_blank" rel="noopener noreferrer">
                <img src={imageUrl} alt={title} className="headline-image" />
                <h3 className="headline-title">{title}</h3>
            </a>
        </div>
    );
};

export default HeadlineCard;
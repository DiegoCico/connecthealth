import React from 'react';
import '../css/HeadlineCard.css'; 

export default function TopHeadlineCard(props) {
    const { headline } = props
    return (
        <div className='headline-card' onClick={() => { /* Do nothing for now */ }}>
            <img src={headline.imageUrl} alt={headline.title} className='headline-image' />
            <h3 className='headline-title'>{headline.title}</h3>
        </div>
    )
}
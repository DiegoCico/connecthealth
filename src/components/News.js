import React, { useEffect, useState } from 'react';
import HeadlineCard from './HeadlineCard';

export default function News() {
    const [headlines, setHeadlines] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('http://127.0.0.1:5000/get-news')
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                setHeadlines(data.data)
                setLoading(false)
            })
            .catch((error) => {
                console.log('Error fetching news', error)
            })
    }, []);

    return (
        <div className="news-container">
            <h1>News Headlines</h1>
            {loading ? (
                <h2>Loading...</h2>
            ) : (
                <div className="headline-list">
                    {headlines.map((headline, index) => (
                        <HeadlineCard 
                            key={index}
                            title={headline.title}
                            imageUrl={headline.urlToImage}
                            articleURL={headline.articleURL}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

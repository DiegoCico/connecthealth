import React, { useEffect, useState } from 'react';
import HeadlineCard from './HeadlineCard';

export default function News() {
    const [headlines, setHeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch medicine-related news articles from the backend
        fetch('http://localhost:5005/api/get-news')
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched news:', data);
                // Filter out articles with the title '[REMOVED]'
                const filteredHeadlines = data.data.filter(headline => headline.title !== '[REMOVED]');
                setHeadlines(filteredHeadlines); // Set the filtered headlines state
                setLoading(false); // Stop loading once the data is fetched
            })
            .catch((error) => {
                console.log('Error fetching news', error);
                setLoading(false); // Stop loading even if there is an error
            });
    }, []);

    return (
        <div className="news-container">
            <h1>Medicine-Related News Headlines</h1>
            {loading ? (
                <h2>Loading...</h2>
            ) : (
                <div className="headline-list">
                    {headlines.map((headline, index) => (
                        <a
                            key={index}
                            href={headline.url} // This makes the article clickable
                            target="_blank" // Opens the link in a new tab
                            rel="noopener noreferrer" // Adds security to the link
                        >
                            <HeadlineCard 
                                title={headline.title}
                                imageUrl={headline.urlToImage}
                                articleURL={headline.url} // The URL of the article
                            />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

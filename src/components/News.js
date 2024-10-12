import React, { useEffect, useState } from 'react';

export default function News() {
    const [headlines, setHeadlines] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/get-news')
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                setHeadlines(data.data)
            })
            .catch((error) => {
                console.log('Error fetching news', error)
            })
    }, []);

    return (
        <div className="news-container">
            <h1>News Headlines</h1>
            <ul>
                {headlines.map((headline, index) => (
                    <li key={index}>
                        <h3>{headline.title}</h3>
                    </li>
                ))}
            </ul>
        </div>
    );
}

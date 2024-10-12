import React from 'react';

export default function News() {
    const NewsAPI = require('newsapi')
    const newsapi = new NewsAPI('032d2785a65a4ba1abc90f793cfd0a75')
    newsapi.v2.topHeadlines({
        q:'medicine',
        language:'en',
    }).then(response => {
        console.log(response)
    })

    return (
        <div className='news-container'>
            <div className='top-headlines'>

            </div>
        </div>
    )
}
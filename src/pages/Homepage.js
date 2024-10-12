import React, {useState, useEffect} from 'react';
import '../css/Homepage.css'; 
import SearchPatient from '../components/SearchPatient';
import axios from 'axios';

export default function Homepage() {
    const [topHeadlines, setTopHeadlines] = useState([])
    const [isInputVisible, setIsInputVisible] = useState(false);

    const fetchTopHeadlines = async() => {
        try {
            const response = await axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    q:'medicine',
                    language:'en',
                    apiKey:process.env.NEWS_API_KEY
                }
            })
            setTopHeadlines(response.data.articles)
            // console.log(topHeadlines)
            console.log(response.data.status)
        } catch (error) {
            console.log("Error fetching top headlines: ", error)
        }
    }

    useEffect(() => {
        fetchTopHeadlines()
    }, [])

    

}

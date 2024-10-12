// import React, { useState, useEffect } from 'react';
// import '../css/Homepage.css'; 
// import SearchPatient from '../components/SearchPatient';
// import SideNav from '../components/SideNav'; 
// import axios from 'axios';
// import News from '../components/News';

// export default function Homepage() {
//     const [topHeadlines, setTopHeadlines] = useState([]);
//     const [isInputVisible, setIsInputVisible] = useState(false);

//     const fetchTopHeadlines = async () => {
//         try {
//             const response = await axios.get('https://newsapi.org/v2/top-headlines', {
//                 params: {
//                     q: 'medicine',
//                     language: 'en',
//                     apiKey: '032d2785a65a4ba1abc90f793cfd0a75'
//                 }
//             });
//             setTopHeadlines(response.data.articles);
//             console.log(response.data);
//         } catch (error) {
//             console.log("Error fetching top headlines: ", error);
//         }
//     };

//     useEffect(() => {
//         fetchTopHeadlines();
//     }, []);

//     return (
//         <div className="homepage-container">
//             <SideNav /> {/* Include the side navigation here */}
//             <News />
//         </div>
//     );
// }
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MedicineNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `http://api.mediastack.com/v1/news?access_key=YOUR_API_KEY&keywords=medicine&categories=health&languages=en&limit=10`
        );
        setArticles(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Top Medicine News (English)</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {articles.map((article, index) => (
          <li key={index} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                style={{ width: '100%', height: 'auto', maxWidth: '400px', marginBottom: '10px' }}
              />
            )}
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicineNews;

// Polyfill for ReadableStream
if (typeof ReadableStream === 'undefined') {
    global.ReadableStream = require('web-streams-polyfill').ReadableStream;
    console.log('ReadableStream polyfill applied');
} else {
    console.log('ReadableStream is already defined');
}

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NewsAPI = require('newsapi');
require('dotenv').config(); // Load environment variables from .env file

console.log('Modules imported successfully');

const app = express();
const port = 5005;

// Middleware
app.use(cors());
app.use(express.json());
console.log('CORS and JSON middleware set up');

// News API Client
const newsapi = new NewsAPI("032d2785a65a4ba1abc90f793cfd0a75"); // Use your News API key

// Helper function to introduce a delay
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper function to fetch all pages of articles with delay
const fetchAllArticles = async (q, category, language, country) => {
    let allArticles = [];
    let currentPage = 1;
    const pageSize = 20; // Number of articles per page
    let totalResults = 0;

    do {
        console.log(`Fetching page ${currentPage}`);
        // Fetch each page of articles
        const response = await newsapi.v2.topHeadlines({
            category,
            language,
            country,
            pageSize,
            page: currentPage,
        });

        if (response.status === 'ok') {
            if (currentPage === 1) {
                totalResults = response.totalResults; // Get total number of available results
            }

            // Collect articles from the current page
            allArticles = allArticles.concat(response.articles);
            console.log(`Fetched ${response.articles.length} articles from page ${currentPage}`);
            
            // Delay between API calls to avoid hitting rate limits
            await sleep(1000); // Wait for 1 second (1000 ms)
            currentPage++;
        } else {
            throw new Error('Failed to fetch articles from NewsAPI');
        }
    } while (allArticles.length < totalResults && currentPage <= Math.ceil(totalResults / pageSize));

    return allArticles;
};

// API route to get all news articles on Medicine
app.get('/api/get-news', async (req, res) => {
    console.log('Request received to get all medicine-related news articles from News API');
    try {
        // Fetch all articles related to 'medicine'
        const allArticles = await fetchAllArticles('medicine', 'health', 'en', 'us');

        console.log(`Fetched a total of ${allArticles.length} articles.`);
        res.json({ data: allArticles }); // Respond with all articles
    } catch (error) {
        console.error(`Error in get-news: ${error}`);
        res.status(500).json({ error: `Failed to fetch articles: ${error.message}` });
    }
});

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Call OpenAI API
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are assisting doctors and nurses. Provide clear and actionable medical feedback about medications, prescriptions, and other medical decisions based on symptoms or inquiries.'
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 100, // Adjust based on your needs
                temperature: 0.7, // Adjust based on desired creativity
            },
            {
                headers: {
                    Authorization: `Bearer ${"sk-Z_yDNUjEtQLPCQxXkNRWrdCKmIrbi1kpuuCwLyewJuT3BlbkFJz0OEODAbbXzzrfqgxJdIEactiPDyaDTuZ--V-GnEwA"}`,
                },
            }
        );

        const reply = response.data.choices[0].message.content.trim();
        res.json({ reply });
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).json({ error: 'Error with OpenAI API' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

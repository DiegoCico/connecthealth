from flask import Flask, jsonify
import yfinance as yf
from flask_cors import CORS

import urllib.parse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

def get_articles():
    chrome_options = Options()
    chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)

    news_link = 'https://prhi.org/news?&page=1'
    driver.get(news_link)
    time.sleep(1)
    soup = BeautifulSoup(driver.page_source, 'html.parser')

    page = soup.find_all('ul')
    news = page[6]

    articles = news.find_all('a', class_='block')
    # print(articles)
    # print()
    to_send = []
    for article in articles:
        headline = article.find('h3').text.strip()
        img_url = article.find('img')['src']
        date_published = article.find('div', class_='mb-4').find('time').text.strip()

        article_url = article['href']
        parsed = urllib.parse.urlparse(img_url)
        query_params = urllib.parse.parse_qs(parsed.query)
        final_url = query_params['url'][0]

        article_json = {
            'title':headline,
            'articleURL':f'https://prhi.org{article_url}',
            'urlToImage':final_url,
            'datePublished':date_published
        }

        for i in article_json:
            print(f'{i}: {article_json[i]}')
        print('-' * 50)
        to_send.append(article_json)

    return to_send

app = Flask(__name__)
CORS(app)

@app.route('/get-news', methods=['GET'])
def get_news():
    try:
        articles = get_articles()
        return jsonify({'data': articles})
    except Exception as e:
        # Log the error for debugging
        print(f"Error in get_news: {e}")
        return jsonify({'error': f'Failed to fetch articles {str(e)}'}), 500  # Return a 500 error with a message


if __name__ == '__main__':
    app.run(debug=True)

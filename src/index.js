import React from 'react'; // Importing the React library for building user interfaces
import ReactDOM from 'react-dom/client'; // Importing ReactDOM to render React components to the DOM
import './index.css'; // Importing the CSS file for global styling
import App from './App'; // Importing the main App component
import reportWebVitals from './reportWebVitals'; // Importing the function to measure performance metrics
import { BrowserRouter } from 'react-router-dom'; // Importing BrowserRouter to enable routing in the app

// Creating a root DOM node to render the application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendering the application within the root element
root.render(
  <React.StrictMode>
    {/* React.StrictMode helps identify potential problems in the application during development */}
    <BrowserRouter>
      {/* BrowserRouter provides the routing context for the app */}
      <App />
      {/* The main application component that contains the routes */}
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); // Calling reportWebVitals to measure and log performance metrics

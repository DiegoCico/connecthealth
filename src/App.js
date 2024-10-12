import './App.css'; // Importing the CSS for styling the application
import { Routes, Route, Navigate } from 'react-router-dom'; // Importing necessary components from 'react-router-dom' for routing
import Homepage from './pages/Homepage'; // Importing the Homepage component
import Patient from './pages/Patient'; // Importing the Patient component
import Layout from './Layout'; // Importing the Layout component which wraps the page content

function App() {
  return (
    <div className='site'> 
      {/* Main wrapper div with a class of 'site' for CSS styling */}
      <Layout>
        {/* Layout component that wraps around the routed pages */}
        <Routes>
          {/* Define the different routes for the application */}
          
          {/* Redirect the root path ('/') to '/home' */}
          <Route path='/' element={<Navigate to='/home' replace />} />
          
          {/* Route for the homepage component */}
          <Route path='/home' element={<Homepage />} />
          
          {/* Route for the Patient component, with a dynamic parameter ':uid' to display specific patient data */}
          <Route path='/patient/:uid' element={<Patient />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App; // Export the App component as the default export

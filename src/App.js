import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Patient from './pages/Patient';
import Layout from './Layout'; 

function App() {
  return (
    <div className='site'>
      <Layout>
        <Routes>
          <Route path='/' element={<Navigate to='/home' replace />} />
          <Route path='/home' element={<Homepage />} />
          <Route path='/patient/:uid' element={<Patient />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;

import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Patient from './pages/Patient';
import Layout from './Layout'; 
import Diagnost from './pages/Diagnose';

function App() {
  return (
    <div className='site'>
      <Layout>
        <Routes>
          <Route path='/' element={<Navigate to='/home' replace />} />
          <Route path='/home' element={<Homepage />} />
          <Route path='/patient/:uid' element={<Patient />} />
          <Route path='/diagnost' element={<Diagnost />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;

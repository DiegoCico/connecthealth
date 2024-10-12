import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Homepage from './pages/Homepage'
import Patient from './pages/Patient';

function App() {
  return (
    <div className='site'>
      <Routes>
        <Route path='/' element={<Navigate to='/home' replace/>} />
        <Route path='/home' element={<Homepage />}/>
        <Route path='/patient/:uid' element={<Patient />} />
      </Routes>
    </div>
  );
}

export default App;

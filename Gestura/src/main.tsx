import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import MainWindow from './Main-window';
import Register from './Register';
import AdminPanel from './AdminPanel';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/main-window" element={<MainWindow />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/admin-panel" element={<AdminPanel/>}/>
      </Routes>
    </Router>
  </React.StrictMode>
);
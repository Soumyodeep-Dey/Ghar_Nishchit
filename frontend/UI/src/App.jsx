import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Landing from './components/landing';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { DarkModeProvider } from './DarkModeContext';

export default function App() {
  return (
    <DarkModeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </DarkModeProvider>
  );
}

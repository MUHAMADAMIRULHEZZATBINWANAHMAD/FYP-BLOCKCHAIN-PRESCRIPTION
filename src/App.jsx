<<<<<<< HEAD
import { useState } from 'react';
import Home from './pages/home';
import Credit from './pages/credit';
import Record from './pages/record';
import Profile from './pages/profile';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'credit':
        return <Credit setCurrentPage={setCurrentPage} />;
      case 'record':
        return <Record setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <Profile setCurrentPage={setCurrentPage} />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return renderPage();
}

export default App;

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Mint from "./pages/listing"; // Import your listing page component

// A simple temporary Home component
function Home() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Welcome to Sunday Clothing</h1>
      <p>This is the customer storefront (To be built later).</p>
      
      <Link to="/listing">
        <button style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}>
          Go to Admin Listing Page
        </button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The default home page (http://localhost:5173/) */}
        <Route path="/" element={<Home />} />
        
        {/* The admin minting page (http://localhost:5173/listing) */}
        <Route path="/listing" element={<Mint />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


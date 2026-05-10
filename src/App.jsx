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

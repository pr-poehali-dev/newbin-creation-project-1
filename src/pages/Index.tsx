import { useState } from 'react';
import AuthScreen from '@/components/AuthScreen';
import MainLayout from '@/components/MainLayout';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser('');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <MainLayout currentUser={currentUser} onLogout={handleLogout} />;
};

export default Index;

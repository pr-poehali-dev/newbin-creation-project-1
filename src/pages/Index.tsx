import { useState, useEffect } from 'react';
import AuthScreen from '@/components/AuthScreen';
import MainLayout from '@/components/MainLayout';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('newbin_user');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: any) => {
    localStorage.setItem('newbin_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('newbin_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <MainLayout currentUser={currentUser} onLogout={handleLogout} />;
};

export default Index;
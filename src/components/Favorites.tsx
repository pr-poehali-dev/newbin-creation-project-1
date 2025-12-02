import { useState, useEffect } from 'react';
import PinCard from '@/components/PinCard';
import PinDetail from '@/components/PinDetail';

interface Pin {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: number;
  views: number;
  reports: number;
}

interface FavoritesProps {
  currentUser: string;
  language: 'en' | 'ru' | 'zh';
}

const translations = {
  en: {
    title: 'Favorite Pins',
    noFavorites: 'No favorite pins yet',
  },
  ru: {
    title: 'Избранные пины',
    noFavorites: 'Избранных пинов пока нет',
  },
  zh: {
    title: '收藏的代码片段',
    noFavorites: '还没有收藏',
  },
};

const Favorites = ({ currentUser, language }: FavoritesProps) => {
  const [favoritePins, setFavoritePins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const t = translations[language];

  useEffect(() => {
    const loadFavorites = () => {
      const favoriteIds = JSON.parse(localStorage.getItem(`newbin_favorites_${currentUser}`) || '[]');
      const allPins = JSON.parse(localStorage.getItem('newbin_pins') || '[]') as Pin[];
      const favorites = allPins.filter((pin) => favoriteIds.includes(pin.id) && pin.reports < 10);
      setFavoritePins(favorites);
    };
    loadFavorites();
    const interval = setInterval(loadFavorites, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handlePinClick = (pin: Pin) => {
    const allPins = JSON.parse(localStorage.getItem('newbin_pins') || '[]') as Pin[];
    const updatedPins = allPins.map((p) => (p.id === pin.id ? { ...p, views: p.views + 1 } : p));
    localStorage.setItem('newbin_pins', JSON.stringify(updatedPins));
    setSelectedPin({ ...pin, views: pin.views + 1 });
  };

  if (selectedPin) {
    return (
      <PinDetail
        pin={selectedPin}
        currentUser={currentUser}
        language={language}
        onClose={() => setSelectedPin(null)}
        onUpdate={(updatedPin) => {
          const allPins = JSON.parse(localStorage.getItem('newbin_pins') || '[]') as Pin[];
          const updatedPins = allPins.map((p) => (p.id === updatedPin.id ? updatedPin : p));
          localStorage.setItem('newbin_pins', JSON.stringify(updatedPins));
          setSelectedPin(updatedPin);
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <div className="flex-1 overflow-y-auto space-y-3">
        {favoritePins.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">{t.noFavorites}</div>
        ) : (
          favoritePins.map((pin) => <PinCard key={pin.id} pin={pin} onClick={() => handlePinClick(pin)} />)
        )}
      </div>
    </div>
  );
};

export default Favorites;

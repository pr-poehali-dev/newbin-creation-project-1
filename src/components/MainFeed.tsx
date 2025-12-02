import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import PinCard from '@/components/PinCard';
import PinDetail from '@/components/PinDetail';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Pin {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: number;
  views: number;
  reports: number;
}

interface MainFeedProps {
  currentUser: string;
  language: 'en' | 'ru' | 'zh';
}

const translations = {
  en: {
    search: 'Search by title...',
    sortBy: 'Sort by',
    views: 'Most viewed',
    newest: 'Newest',
    oldest: 'Oldest',
    noPins: 'No pins yet. Create the first one!',
  },
  ru: {
    search: 'Поиск по заголовку...',
    sortBy: 'Сортировка',
    views: 'По просмотрам',
    newest: 'Новые',
    oldest: 'Старые',
    noPins: 'Пока нет пинов. Создайте первый!',
  },
  zh: {
    search: '按标题搜索...',
    sortBy: '排序',
    views: '最多浏览',
    newest: '最新',
    oldest: '最旧',
    noPins: '还没有代码片段。创建第一个！',
  },
};

const MainFeed = ({ currentUser, language }: MainFeedProps) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'newest' | 'oldest'>('newest');
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const t = translations[language];

  useEffect(() => {
    const loadPins = () => {
      const stored = localStorage.getItem('newbin_pins');
      if (stored) {
        const allPins = JSON.parse(stored) as Pin[];
        const validPins = allPins.filter(pin => pin.reports < 10);
        setPins(validPins);
      }
    };
    loadPins();
    const interval = setInterval(loadPins, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredPins = pins
    .filter((pin) => pin.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      return 0;
    });

  const handlePinClick = (pin: Pin) => {
    const updatedPins = pins.map((p) =>
      p.id === pin.id ? { ...p, views: p.views + 1 } : p
    );
    setPins(updatedPins);
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
          const updatedPins = pins.map((p) => (p.id === updatedPin.id ? updatedPin : p));
          setPins(updatedPins);
          localStorage.setItem('newbin_pins', JSON.stringify(updatedPins));
          setSelectedPin(updatedPin);
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="pl-10 bg-input text-foreground"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px] bg-card">
            <Icon name="ArrowUpDown" size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">{t.views}</SelectItem>
            <SelectItem value="newest">{t.newest}</SelectItem>
            <SelectItem value="oldest">{t.oldest}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredPins.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">{t.noPins}</div>
        ) : (
          filteredPins.map((pin) => (
            <PinCard key={pin.id} pin={pin} onClick={() => handlePinClick(pin)} />
          ))
        )}
      </div>
    </div>
  );
};

export default MainFeed;

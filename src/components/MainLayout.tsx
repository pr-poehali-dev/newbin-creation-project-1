import { useState } from 'react';
import Icon from '@/components/ui/icon';
import MainFeed from '@/components/MainFeed';
import CreatePinNew from '@/components/CreatePinNew';
import Favorites from '@/components/Favorites';
import Settings from '@/components/Settings';
import AdminPanel from '@/components/AdminPanel';

interface MainLayoutProps {
  currentUser: any;
  onLogout: () => void;
}

const MainLayout = ({ currentUser, onLogout }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState<'main' | 'create' | 'favorites'>('main');
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ru' | 'zh'>('en');
  
  const isAdmin = currentUser?.username === 'Developer';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
          Newbin
        </h1>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAdmin(true)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="Shield" size={20} />
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="Settings" size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'main' && <MainFeed currentUser={currentUser} language={language} />}
        {activeTab === 'create' && <CreatePinNew currentUser={currentUser} language={language} />}
        {activeTab === 'favorites' && <Favorites currentUser={currentUser} language={language} />}
      </main>

      <nav className="border-t border-border px-4 py-3 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('main')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'main' ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Home" size={24} />
          <span className="text-xs font-medium">Main</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'create' ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Hammer" size={24} />
          <span className="text-xs font-medium">Create</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'favorites' ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Star" size={24} />
          <span className="text-xs font-medium">Favorite</span>
        </button>
      </nav>

      {showSettings && (
        <Settings
          language={language}
          onLanguageChange={setLanguage}
          onLogout={onLogout}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAdmin && <AdminPanel currentUser={currentUser} onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default MainLayout;
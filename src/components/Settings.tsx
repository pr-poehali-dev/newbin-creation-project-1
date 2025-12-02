import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsProps {
  language: 'en' | 'ru' | 'zh';
  onLanguageChange: (lang: 'en' | 'ru' | 'zh') => void;
  onLogout: () => void;
  onClose: () => void;
}

const translations = {
  en: {
    settings: 'Settings',
    language: 'Language',
    logout: 'Logout',
    english: 'English',
    russian: 'Russian',
    chinese: 'Chinese',
  },
  ru: {
    settings: 'Настройки',
    language: 'Язык',
    logout: 'Выйти',
    english: 'Английский',
    russian: 'Русский',
    chinese: 'Китайский',
  },
  zh: {
    settings: '设置',
    language: '语言',
    logout: '退出',
    english: 'English',
    russian: 'Русский',
    chinese: '中文',
  },
};

const Settings = ({ language, onLanguageChange, onLogout, onClose }: SettingsProps) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-6 animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t.settings}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.language}</label>
            <Select value={language} onValueChange={(value: any) => onLanguageChange(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 {t.english}</SelectItem>
                <SelectItem value="ru">🇷🇺 {t.russian}</SelectItem>
                <SelectItem value="zh">🇨🇳 {t.chinese}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => {
              onLogout();
              onClose();
            }}
            variant="destructive"
            className="w-full"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            {t.logout}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

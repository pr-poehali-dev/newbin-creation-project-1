import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface AuthScreenProps {
  onLogin: (user: any) => void;
}

const translations = {
  en: {
    title: 'Newbin',
    subtitle: 'Share code snippets with the world',
    username: 'Username',
    password: 'Password',
    register: 'Register',
    login: 'Login',
    switchToLogin: 'Already have an account? Log in',
    switchToRegister: "Don't have an account? Register",
    usernameTaken: 'Username already taken',
    invalidCredentials: 'Invalid username or password',
    registrationSuccess: 'Registration successful!',
    loginSuccess: 'Welcome back!',
    accountBanned: 'Your account has been banned',
  },
  ru: {
    title: 'Newbin',
    subtitle: 'Делитесь кодом с миром',
    username: 'Имя пользователя',
    password: 'Пароль',
    register: 'Зарегистрироваться',
    login: 'Войти',
    switchToLogin: 'Уже есть аккаунт? Войти',
    switchToRegister: 'Нет аккаунта? Зарегистрироваться',
    usernameTaken: 'Имя пользователя занято',
    invalidCredentials: 'Неверное имя или пароль',
    registrationSuccess: 'Регистрация успешна!',
    loginSuccess: 'С возвращением!',
    accountBanned: 'Ваш аккаунт заблокирован',
  },
  zh: {
    title: 'Newbin',
    subtitle: '与世界分享代码片段',
    username: '用户名',
    password: '密码',
    register: '注册',
    login: '登录',
    switchToLogin: '已有账号？登录',
    switchToRegister: '没有账号？注册',
    usernameTaken: '用户名已被占用',
    invalidCredentials: '用户名或密码无效',
    registrationSuccess: '注册成功！',
    loginSuccess: '欢迎回来！',
    accountBanned: '您的账户已被封禁',
  },
};

const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lang] = useState<'en' | 'ru' | 'zh'>('en');
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) return;

    setLoading(true);

    try {
      const action = isLoginMode ? 'login' : 'register';
      const result = await api.auth(action, username, password);

      if (result.error) {
        if (result.error === 'Username already taken') {
          toast.error(t.usernameTaken);
        } else if (result.error === 'Invalid credentials') {
          toast.error(t.invalidCredentials);
        } else if (result.error === 'Account is banned') {
          toast.error(t.accountBanned);
        } else {
          toast.error(result.error);
        }
      } else if (result.user) {
        toast.success(isLoginMode ? t.loginSuccess : t.registrationSuccess);
        onLogin(result.user);
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.username}</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.username}
              className="bg-input text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.password}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              className="bg-input text-foreground"
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full gradient-button text-white font-medium" disabled={loading}>
            {loading ? '...' : isLoginMode ? t.login : t.register}
          </Button>

          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="w-full text-sm text-primary hover:underline"
            disabled={loading}
          >
            {isLoginMode ? t.switchToRegister : t.switchToLogin}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default AuthScreen;
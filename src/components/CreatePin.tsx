import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface CreatePinProps {
  currentUser: string;
  language: 'en' | 'ru' | 'zh';
}

const translations = {
  en: {
    title: 'Create New Pin',
    pinTitle: 'Title',
    pinContent: 'Code or text content',
    uploadFile: 'Upload .txt file',
    publish: 'Publish',
    titlePlaceholder: 'Enter pin title...',
    contentPlaceholder: 'Paste your code here...',
    published: 'Pin published successfully!',
    fillFields: 'Please fill in all fields',
  },
  ru: {
    title: 'Создать новый пин',
    pinTitle: 'Заголовок',
    pinContent: 'Содержимое кода или текста',
    uploadFile: 'Загрузить .txt файл',
    publish: 'Опубликовать',
    titlePlaceholder: 'Введите заголовок...',
    contentPlaceholder: 'Вставьте код здесь...',
    published: 'Пин успешно опубликован!',
    fillFields: 'Заполните все поля',
  },
  zh: {
    title: '创建新代码片段',
    pinTitle: '标题',
    pinContent: '代码或文本内容',
    uploadFile: '上传 .txt 文件',
    publish: '发布',
    titlePlaceholder: '输入标题...',
    contentPlaceholder: '在此粘贴代码...',
    published: '发布成功！',
    fillFields: '请填写所有字段',
  },
};

const CreatePin = ({ currentUser, language }: CreatePinProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const t = translations[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      toast.error(t.fillFields);
      return;
    }

    const pin = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      author: currentUser,
      createdAt: Date.now(),
      views: 0,
      reports: 0,
    };

    const pins = JSON.parse(localStorage.getItem('newbin_pins') || '[]');
    pins.push(pin);
    localStorage.setItem('newbin_pins', JSON.stringify(pins));

    toast.success(t.published);
    setTitle('');
    setContent('');
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t.pinTitle}</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.titlePlaceholder}
          className="bg-input text-foreground"
        />
      </div>

      <div className="flex-1 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t.pinContent}</label>
          <label className="cursor-pointer">
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Icon name="Upload" size={16} className="mr-2" />
                {t.uploadFile}
              </span>
            </Button>
          </label>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.contentPlaceholder}
          className="flex-1 bg-input text-foreground code-editor resize-none"
        />
      </div>

      <Button onClick={handlePublish} className="gradient-button text-white font-medium">
        <Icon name="Send" size={16} className="mr-2" />
        {t.publish}
      </Button>
    </div>
  );
};

export default CreatePin;

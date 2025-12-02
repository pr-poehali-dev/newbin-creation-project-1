import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CreatePinProps {
  currentUser: any;
  language: 'en' | 'ru' | 'zh';
}

const translations = {
  en: {
    title: 'Create New Pin',
    pinTitle: 'Title',
    pinContent: 'Code or text content',
    uploadFile: 'Upload .txt file',
    tags: 'Tags (comma separated)',
    isPrivate: 'Private pin',
    privateHint: 'Only you can see this pin',
    publish: 'Publish',
    titlePlaceholder: 'Enter pin title...',
    contentPlaceholder: 'Paste your code here...',
    tagsPlaceholder: 'javascript, react, typescript',
    published: 'Pin published successfully!',
    fillFields: 'Please fill in all fields',
  },
  ru: {
    title: 'Создать новый пин',
    pinTitle: 'Заголовок',
    pinContent: 'Содержимое кода или текста',
    uploadFile: 'Загрузить .txt файл',
    tags: 'Теги (через запятую)',
    isPrivate: 'Приватный пин',
    privateHint: 'Только вы видите этот пин',
    publish: 'Опубликовать',
    titlePlaceholder: 'Введите заголовок...',
    contentPlaceholder: 'Вставьте код здесь...',
    tagsPlaceholder: 'javascript, react, typescript',
    published: 'Пин успешно опубликован!',
    fillFields: 'Заполните все поля',
  },
  zh: {
    title: '创建新代码片段',
    pinTitle: '标题',
    pinContent: '代码或文本内容',
    uploadFile: '上传 .txt 文件',
    tags: '标签（逗号分隔）',
    isPrivate: '私有片段',
    privateHint: '只有您可以看到',
    publish: '发布',
    titlePlaceholder: '输入标题...',
    contentPlaceholder: '在此粘贴代码...',
    tagsPlaceholder: 'javascript, react, typescript',
    published: '发布成功！',
    fillFields: '请填写所有字段',
  },
};

const CreatePinNew = ({ currentUser, language }: CreatePinProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error(t.fillFields);
      return;
    }

    setLoading(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const result = await api.createPin({
        title: title.trim(),
        content: content.trim(),
        author_id: currentUser.id,
        is_private: isPrivate,
        tags,
      });

      if (result.pin) {
        toast.success(t.published);
        setTitle('');
        setContent('');
        setTagsInput('');
        setIsPrivate(false);
      } else {
        toast.error(result.error || 'Error creating pin');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t.tags}</label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder={t.tagsPlaceholder}
          className="bg-input text-foreground"
          disabled={loading}
        />
        {tagsInput && (
          <div className="flex flex-wrap gap-2">
            {tagsInput.split(',').map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <Switch checked={isPrivate} onCheckedChange={setIsPrivate} disabled={loading} />
        <div>
          <label className="text-sm font-medium">{t.isPrivate}</label>
          <p className="text-xs text-muted-foreground">{t.privateHint}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t.pinContent}</label>
          <label className="cursor-pointer">
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" disabled={loading} />
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
          disabled={loading}
        />
      </div>

      <Button onClick={handlePublish} className="gradient-button text-white font-medium" disabled={loading}>
        <Icon name="Send" size={16} className="mr-2" />
        {loading ? '...' : t.publish}
      </Button>
    </div>
  );
};

export default CreatePinNew;

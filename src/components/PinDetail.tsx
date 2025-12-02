import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Pin {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: number;
  views: number;
  reports: number;
}

interface Comment {
  id: string;
  pinId: string;
  author: string;
  content: string;
  createdAt: number;
  reports: number;
}

interface PinDetailProps {
  pin: Pin;
  currentUser: string;
  language: 'en' | 'ru' | 'zh';
  onClose: () => void;
  onUpdate: (pin: Pin) => void;
}

const translations = {
  en: {
    copy: 'Copy',
    raw: 'RAW',
    report: 'Report',
    views: 'Views',
    author: 'Author',
    published: 'Published',
    comments: 'Comments',
    addComment: 'Add a comment...',
    post: 'Post',
    copied: 'Copied to clipboard!',
    reported: 'Reported',
    alreadyReported: 'Already reported',
  },
  ru: {
    copy: 'Копировать',
    raw: 'Исходник',
    report: 'Пожаловаться',
    views: 'Просмотры',
    author: 'Автор',
    published: 'Опубликовано',
    comments: 'Комментарии',
    addComment: 'Добавить комментарий...',
    post: 'Отправить',
    copied: 'Скопировано!',
    reported: 'Жалоба отправлена',
    alreadyReported: 'Уже пожаловались',
  },
  zh: {
    copy: '复制',
    raw: '原始',
    report: '举报',
    views: '浏览量',
    author: '作者',
    published: '发布时间',
    comments: '评论',
    addComment: '添加评论...',
    post: '发布',
    copied: '已复制！',
    reported: '已举报',
    alreadyReported: '已经举报过',
  },
};

const PinDetail = ({ pin, currentUser, language, onClose, onUpdate }: PinDetailProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const loadComments = () => {
      const stored = localStorage.getItem('newbin_comments');
      if (stored) {
        const allComments = JSON.parse(stored) as Comment[];
        const pinComments = allComments.filter((c) => c.pinId === pin.id && c.reports < 5);
        setComments(pinComments);
      }
    };
    loadComments();
    const interval = setInterval(loadComments, 2000);

    const favorites = JSON.parse(localStorage.getItem(`newbin_favorites_${currentUser}`) || '[]');
    setIsFavorite(favorites.includes(pin.id));

    return () => clearInterval(interval);
  }, [pin.id, currentUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pin.content);
    toast.success(t.copied);
  };

  const handleRaw = () => {
    window.open(`/raw/${pin.id}`, '_blank');
  };

  const handleReport = () => {
    const reportKey = `newbin_report_${currentUser}_${pin.id}`;
    if (localStorage.getItem(reportKey)) {
      toast.error(t.alreadyReported);
      return;
    }

    localStorage.setItem(reportKey, 'true');
    const updatedPin = { ...pin, reports: pin.reports + 1 };
    onUpdate(updatedPin);
    toast.success(t.reported);
  };

  const handleCommentReport = (commentId: string) => {
    const reportKey = `newbin_comment_report_${currentUser}_${commentId}`;
    if (localStorage.getItem(reportKey)) {
      toast.error(t.alreadyReported);
      return;
    }

    localStorage.setItem(reportKey, 'true');
    const allComments = JSON.parse(localStorage.getItem('newbin_comments') || '[]') as Comment[];
    const updatedComments = allComments.map((c) =>
      c.id === commentId ? { ...c, reports: c.reports + 1 } : c
    );
    localStorage.setItem('newbin_comments', JSON.stringify(updatedComments));
    setComments(comments.map((c) => (c.id === commentId ? { ...c, reports: c.reports + 1 } : c)));
    toast.success(t.reported);
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      pinId: pin.id,
      author: currentUser,
      content: newComment,
      createdAt: Date.now(),
      reports: 0,
    };

    const allComments = JSON.parse(localStorage.getItem('newbin_comments') || '[]') as Comment[];
    allComments.push(comment);
    localStorage.setItem('newbin_comments', JSON.stringify(allComments));
    setComments([...comments, comment]);
    setNewComment('');
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem(`newbin_favorites_${currentUser}`) || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== pin.id)
      : [...favorites, pin.id];
    localStorage.setItem(`newbin_favorites_${currentUser}`, JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? 'text-yellow-500 bg-muted' : 'hover:bg-muted'
            }`}
          >
            <Icon name="Star" size={20} />
          </button>
          <Button onClick={handleReport} variant="outline" size="sm">
            <Icon name="Flag" size={16} className="mr-2" />
            {t.report}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-4">{pin.title}</h1>
            <div className="flex gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Icon name="User" size={16} />
                {pin.author}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Eye" size={16} />
                {pin.views} {t.views}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={16} />
                {formatDate(pin.createdAt)}
              </span>
            </div>
          </div>

          <div className="bg-input rounded-lg p-4">
            <div className="flex gap-2 mb-3">
              <Button onClick={handleCopy} className="gradient-button text-white" size="sm">
                <Icon name="Copy" size={16} className="mr-2" />
                {t.copy}
              </Button>
              <Button onClick={handleRaw} variant="outline" size="sm">
                <Icon name="FileCode" size={16} className="mr-2" />
                {t.raw}
              </Button>
            </div>
            <pre className="code-editor text-sm whitespace-pre-wrap text-foreground">{pin.content}</pre>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{t.comments}</h2>
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t.addComment}
                className="bg-input text-foreground resize-none"
                rows={2}
              />
              <Button onClick={handlePostComment} className="gradient-button text-white">
                {t.post}
              </Button>
            </div>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card p-3 rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <button
                      onClick={() => handleCommentReport(comment.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Icon name="Flag" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PinDetail;

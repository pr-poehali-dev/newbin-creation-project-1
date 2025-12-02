import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface Pin {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: number;
  views: number;
  reports: number;
}

interface PinCardProps {
  pin: Pin;
  onClick: () => void;
}

const PinCard = ({ pin, onClick }: PinCardProps) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card
      onClick={onClick}
      className="p-4 hover:border-primary transition-all cursor-pointer hover-scale bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate mb-1">{pin.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 code-editor">{pin.content}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="User" size={14} />
              {pin.author}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Eye" size={14} />
              {pin.views}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Calendar" size={14} />
              {formatDate(pin.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PinCard;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Pin {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: number;
  views: number;
  reports: number;
}

const RawPin = () => {
  const { id } = useParams<{ id: string }>();
  const [pin, setPin] = useState<Pin | null>(null);

  useEffect(() => {
    const pins = JSON.parse(localStorage.getItem('newbin_pins') || '[]') as Pin[];
    const foundPin = pins.find((p) => p.id === id);
    if (foundPin) {
      setPin(foundPin);
    }
  }, [id]);

  if (!pin) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <pre>Pin not found</pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <pre className="p-4 code-editor text-sm whitespace-pre-wrap">{pin.content}</pre>
    </div>
  );
};

export default RawPin;

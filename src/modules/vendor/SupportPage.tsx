import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, useToast } from '../ui';

type Message = { id: number; message: string; created_at: string };

export function SupportPage(): React.ReactElement {
  const { push } = useToast();
  const [text, setText] = React.useState('');
  const [items, setItems] = React.useState<Message[]>([]);

  const load = React.useCallback(async () => {
    try { const data = await apiGet<Message[]>('/support/mine'); setItems(data); } catch {}
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const send = async () => {
    if (!text.trim()) return;
    try {
      await apiPost('/support', { message: text.trim() });
      push('Message sent', 'success');
      setText('');
      load();
    } catch (err: any) {
      push(err?.message ?? 'Failed to send', 'error');
    }
  };

  return (
    <div>
      <h3>Support</h3>
      <p>Contact admins via messaging.</p>
      <textarea className="btn" placeholder="Type your message" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      <div>
        <Button className="btn" style={{ marginTop: 8 }} type="button" onClick={send}>Send</Button>
      </div>
      {!!items.length && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 12 }}>
          {items.map(m => (
            <Card key={m.id}>
              <div style={{ opacity: 0.8, fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</div>
              <div>{m.message}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



import React from 'react';
import { apiPost } from '../../api/client';
import { Button, Card, Input, useToast } from '../ui';

export function CampaignsPage(): React.ReactElement {
  const { push } = useToast();
  const [audience, setAudience] = React.useState('students');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { push('Enter a message', 'error'); return; }
    try {
      setSending(true);
      await apiPost('/admin/campaigns', { audience, message });
      push('Campaign sent', 'success');
      setMessage('');
    } catch (err: any) {
      push(err?.message ?? 'Failed to send campaign', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2>Campaigns & Notifications</h2>
      <Card>
        <form className="grid" onSubmit={onSend} style={{ gridTemplateColumns: '1fr', gap: 12 }}>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <label>Audience</label>
            <select className="btn" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="students">All students</option>
              <option value="riders">All riders</option>
              <option value="vendors">All vendors</option>
            </select>
          </div>
          <textarea className="btn" rows={6} placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</Button>
        </form>
      </Card>
    </div>
  );
}



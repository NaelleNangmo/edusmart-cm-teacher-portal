import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const BG_COLORS = ['var(--indigo)', 'var(--rose)', 'var(--cyan)', 'var(--violet)', 'var(--primary)'];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 60) return diff < 1 ? 'À l\'instant' : `Il y a ${diff} min`;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
  const days = Math.floor(diff / 1440);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days}j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function getInitials(nom = '', prenom = '') {
  return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase();
}

export default function MessageriePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeMsg, setActiveMsg] = useState(null);
  const [tab, setTab] = useState('inbox');
  const [replyText, setReplyText] = useState('');

  const { data: inbox, isLoading: loadInbox } = useQuery({
    queryKey: ['inbox'],
    queryFn: () => api.get('/messages/inbox').then(r => r.data.messages),
  });

  const { data: sent } = useQuery({
    queryKey: ['sent'],
    queryFn: () => api.get('/messages/sent').then(r => r.data.messages),
    enabled: tab === 'sent',
  });

  const { data: msgDetail } = useQuery({
    queryKey: ['message', activeMsg],
    queryFn: () => api.get(`/messages/${activeMsg}`).then(r => r.data.message),
    enabled: !!activeMsg,
    onSuccess: () => qc.invalidateQueries(['unread-count']),
  });

  const deleteMsg = useMutation({
    mutationFn: (id) => api.delete(`/messages/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['inbox']);
      setActiveMsg(null);
    },
  });

  const sendReply = useMutation({
    mutationFn: (data) => api.post('/messages', data),
    onSuccess: () => {
      qc.invalidateQueries(['sent']);
      setReplyText('');
    },
  });

  const messages = tab === 'inbox' ? (inbox || []) : (sent || []);
  const unreadCount = (inbox || []).filter(m => !m.lu).length;

  const handleReply = () => {
    if (!replyText.trim() || !msgDetail) return;
    sendReply.mutate({
      destinataire_id: msgDetail.expediteur_id,
      objet: `Re: ${msgDetail.objet}`,
      corps: replyText,
    });
  };

  if (loadInbox) return <LoadingSpinner text="Chargement de la messagerie…" />;

  return (
    <div className="msg-layout" style={{ height: '100%' }}>
      {/* Liste messages */}
      <div className="msg-list-pane">
        <div className="msg-list-header">
          <div className="msg-list-title">Messagerie</div>
          <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}
            onClick={() => navigate('/messagerie/nouveau')}>
            ✏️ Nouveau
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <div className={`chip ${tab === 'inbox' ? 'chip-active' : 'chip-inactive'}`}
            onClick={() => setTab('inbox')}>
            Reçus {unreadCount > 0 && `(${unreadCount})`}
          </div>
          <div className={`chip ${tab === 'sent' ? 'chip-active' : 'chip-inactive'}`}
            onClick={() => setTab('sent')}>
            Envoyés
          </div>
        </div>

        {messages.map((m, i) => {
          const isInbox = tab === 'inbox';
          const name = isInbox
            ? `${m.expediteur_prenom || ''} ${m.expediteur_nom || ''}`.trim()
            : `${m.destinataire_prenom || ''} ${m.destinataire_nom || ''}`.trim();
          return (
            <div
              key={m.id}
              className={`msg-item${!m.lu && isInbox ? ' unread' : ''}${activeMsg === m.id ? ' active' : ''}`}
              onClick={() => setActiveMsg(m.id)}
            >
              <div className="msg-av" style={{ background: BG_COLORS[i % BG_COLORS.length], color: '#fff' }}>
                {getInitials(isInbox ? m.expediteur_nom : m.destinataire_nom, isInbox ? m.expediteur_prenom : m.destinataire_prenom)}
              </div>
              <div className="msg-content">
                <div className="msg-header-row">
                  <div className="msg-sender">{name || '—'}</div>
                  <div className="msg-time">{timeAgo(m.created_at)}</div>
                </div>
                <div className="msg-subject">{m.objet}</div>
              </div>
              {!m.lu && isInbox && <div className="msg-unread-dot" />}
            </div>
          );
        })}

        {messages.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
            Aucun message
          </div>
        )}
      </div>

      {/* Détail message */}
      <div className="msg-detail-pane">
        {!msgDetail ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 40 }}>📨</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>Sélectionnez un message</div>
          </div>
        ) : (
          <>
            <div className="msg-detail-head">
              <div className="msg-detail-subj">{msgDetail.objet}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="msg-from-av">
                    {getInitials(msgDetail.expediteur_nom, msgDetail.expediteur_prenom)}
                  </div>
                  <div>
                    <div className="msg-from-name">
                      {msgDetail.expediteur_prenom} {msgDetail.expediteur_nom} — {msgDetail.expediteur_role}
                    </div>
                    <div className="msg-from-meta">{timeAgo(msgDetail.created_at)}</div>
                  </div>
                </div>
                <div className="icon-btn" style={{ width: 34, height: 34, borderRadius: 10 }}
                  onClick={() => deleteMsg.mutate(msgDetail.id)}>🗑</div>
              </div>
            </div>

            <div className="msg-body">
              {msgDetail.corps.split('\n').map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>

            <div className="msg-reply-bar">
              <input
                className="msg-reply-input"
                type="text"
                placeholder={`Répondre à ${msgDetail.expediteur_prenom}…`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReply()}
              />
              <button className="btn btn-primary" onClick={handleReply} disabled={sendReply.isPending}>
                📤 Envoyer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

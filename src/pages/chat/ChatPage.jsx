import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageCircle, Search, X, RefreshCw, ArrowLeft } from 'lucide-react';
import { chatService } from '../../services/chat/chatService';
import { userService } from '../../services/users/userService';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/UI';
import styles from './ChatPage.module.css';

const ROLE_LABEL = { BUYER: 'Comprador', SELLER: 'Vendedor', ADMIN: 'Admin' };
const CONV_POLL_MS = 6000;
const MSG_POLL_MS  = 3000;

export default function ChatPage() {
  const { user } = useAuth();
  // Map convId -> { name, otherUserId }
  const [convMeta, setConvMeta]   = useState({});
  const [convIds,  setConvIds]    = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [text,       setText]       = useState('');
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const bottomRef   = useRef(null);
  const searchTimer = useRef(null);
  const convTimer   = useRef(null);
  const msgTimer    = useRef(null);
  const [searchParams] = useSearchParams();
  const myId = user?.userId || user?.id;

  // ── Cargar conversaciones con nombres (ConversationSummary) ───────────────
  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await chatService.getConversations();
      const summaries = r.data || [];
      // Construir mapa convId -> nombre y lista de ids ordenada
      const meta = {};
      const ids  = [];
      summaries.forEach(s => {
        ids.push(s.conversationId);
        meta[s.conversationId] = {
          name:        s.otherUserName || ('Usuario #' + s.otherUserId),
          otherUserId: s.otherUserId,
          lastMessage: s.lastMessage,
          unreadCount: s.unreadCount,
        };
      });
      setConvIds(ids);
      setConvMeta(prev => ({ ...prev, ...meta }));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── Polling conversaciones ────────────────────────────────────────────────
  useEffect(() => {
    loadConversations();
    convTimer.current = setInterval(() => loadConversations(true), CONV_POLL_MS);
    return () => clearInterval(convTimer.current);
  }, [loadConversations]);

  // ── Abrir conversación desde URL params (ej: admin desde órdenes) ─────────
  useEffect(() => {
    const convParam   = searchParams.get('conversation');
    const withUser    = searchParams.get('withUser');
    const withName    = searchParams.get('withName');
    if (convParam) {
      setActiveConv(convParam);
      if (!convIds.includes(convParam)) setConvIds(prev => [convParam, ...prev]);
      if (withUser) {
        setConvMeta(prev => ({
          ...prev,
          [convParam]: {
            ...(prev[convParam] || {}),
            name: withName || ('Usuario #' + withUser),
            otherUserId: parseInt(withUser),
          },
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Cargar mensajes de la conv activa ─────────────────────────────────────
  const loadMessages = useCallback(async (convId, scroll = false) => {
    const r = await chatService.getMessages(convId, { page: 0, size: 50 });
    const msgs = r.data?.content || [];
    setMessages(msgs);
    chatService.markRead(convId);
    // Extraer nombre si aun no lo tenemos
    const other = msgs.find(m => m.senderId !== parseInt(myId));
    if (other) {
      setConvMeta(prev => ({
        ...prev,
        [convId]: { ...(prev[convId] || {}), name: other.senderName },
      }));
    }
    if (scroll) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 80);
  }, [myId]);

  // ── Polling mensajes de la conv activa ────────────────────────────────────
  useEffect(() => {
    clearInterval(msgTimer.current);
    if (!activeConv) return;
    loadMessages(activeConv, true);
    msgTimer.current = setInterval(() => loadMessages(activeConv), MSG_POLL_MS);
    return () => clearInterval(msgTimer.current);
  }, [activeConv, loadMessages]);

  // ── Busqueda con debounce ─────────────────────────────────────────────────
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    clearTimeout(searchTimer.current);
    if (!query.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await userService.search(query);
        setSearchResults(res.data || []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, []);

  // ── Abrir o crear conversacion ────────────────────────────────────────────
  const startConversation = (recipientId, recipientName) => {
    const convId = 'conv_' + Math.min(myId, recipientId) + '_' + Math.max(myId, recipientId);
    setActiveConv(convId);
    setMobileShowChat(true);
    if (!convIds.includes(convId)) setConvIds(prev => [convId, ...prev]);
    setConvMeta(prev => ({
      ...prev,
      [convId]: { ...(prev[convId] || {}), name: recipientName, otherUserId: recipientId },
    }));
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // ── Enviar mensaje ────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const content = text.trim();
    if (!content || !activeConv) return;
    const meta = convMeta[activeConv];
    const recipientId = meta?.otherUserId || parseInt(
      activeConv.replace('conv_','').split('_').find(p => parseInt(p) !== parseInt(myId))
    );
    if (!recipientId) return;
    setSending(true);
    try {
      const res = await chatService.send({ recipientId, content });
      const msg = res.data;
      setMessages(prev => [...prev, msg]);
      if (msg.recipientName && !convMeta[activeConv]?.name) {
        setConvMeta(prev => ({
          ...prev,
          [activeConv]: { ...(prev[activeConv] || {}), name: msg.recipientName },
        }));
      }
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50);
      loadConversations(true);
    } finally { setSending(false); }
  };

  const getConvName = (convId) => convMeta[convId]?.name || convId;
  const formatTime  = (d) => new Date(d).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className={`${styles.page} ${mobileShowChat ? styles.pageChatMode : ''}`}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <h2 className={styles.sideTitle}>Mensajes</h2>
          <div style={{ display:'flex', gap:6 }}>
            <button className={styles.newMsgBtn} onClick={() => loadConversations(true)} title="Actualizar">
              <RefreshCw size={16}/>
            </button>
            <button className={styles.newMsgBtn} onClick={() => setShowSearch(v => !v)} title="Nueva conversacion">
              {showSearch ? <X size={18}/> : <Search size={18}/>}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className={styles.searchBox}>
            <div style={{ position:'relative' }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%',
                transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}/>
              <input className={styles.searchInput} value={searchQuery} autoFocus
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar por nombre o usuario..."
                style={{ paddingLeft:30 }}/>
            </div>
            {searching && <p className={styles.searchMsg}>Buscando...</p>}
            {!searching && searchQuery && searchResults.length === 0 && (
              <p className={styles.searchMsg}>Sin resultados para "{searchQuery}"</p>
            )}
            {searchResults.map(u => (
              <button key={u.id} className={styles.searchResult}
                onClick={() => startConversation(
                  u.id,
                  (u.firstName + ' ' + u.lastName).trim() || u.username
                )}>
                <div className={styles.resultAvatar}>
                  {(u.firstName?.[0] || u.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <p className={styles.resultName}>{u.firstName} {u.lastName}</p>
                  <p className={styles.resultSub}>@{u.username} - {ROLE_LABEL[u.role] || u.role}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {loading
          ? <div style={{ padding:20, display:'flex', justifyContent:'center' }}><Spinner size={24}/></div>
          : convIds.length === 0 && !showSearch
            ? <p className={styles.noConv}>Usa el icono para buscar usuarios</p>
            : (
              <div className={styles.convList}>
                {convIds.map(convId => {
                  const meta = convMeta[convId] || {};
                  return (
                    <button key={convId}
                      className={styles.convItem + (activeConv===convId ? ' '+styles.convActive : '')}
                      onClick={() => { setActiveConv(convId); setMobileShowChat(true); }}>
                      <div className={styles.convAvatar}>
                        {(meta.name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
                        <p className={styles.convId} style={{ fontWeight:600 }}>
                          {meta.name || convId}
                        </p>
                        {meta.lastMessage && (
                          <p style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden',
                            textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2 }}>
                            {meta.lastMessage}
                          </p>
                        )}
                      </div>
                      {meta.unreadCount > 0 && (
                        <span style={{ background:'var(--b300)', color:'#fff', borderRadius:999,
                          fontSize:10, fontWeight:700, padding:'2px 6px', flexShrink:0 }}>
                          {meta.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )
        }
      </div>

      {/* ── Panel de mensajes ── */}
      <div className={styles.chat}>
        {!activeConv ? (
          <div className={styles.chatEmpty}>
            <MessageCircle size={48} color="var(--text-muted)"/>
            <p>Selecciona una conversacion o inicia una nueva</p>
            <button className={styles.startBtn} onClick={() => setShowSearch(true)}>
              <Search size={15}/> Buscar usuario
            </button>
          </div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <button className={styles.backBtn} onClick={() => setMobileShowChat(false)} title="Volver">
                <ArrowLeft size={18}/>
              </button>
              <p className={styles.chatTitle}>{getConvName(activeConv)}</p>
            </div>
            <div className={styles.messages}>
              {messages.length === 0 && (
                <p style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, marginTop:40 }}>
                  Aun no hay mensajes. Escribe el primero!
                </p>
              )}
              {messages.map(m => {
                const isMine = m.senderId === parseInt(myId);
                return (
                  <div key={m.id} className={styles.msg + ' ' + (isMine ? styles.msgMine : styles.msgOther)}>
                    {!isMine && <p className={styles.msgName}>{m.senderName}</p>}
                    <div className={styles.bubble + ' ' + (isMine ? styles.bubbleMine : styles.bubbleOther)}>
                      <p className={styles.msgText}>{m.content}</p>
                      <p className={styles.msgTime}>{formatTime(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>
            <div className={styles.inputRow}>
              <input className={styles.msgInput} value={text} onChange={e => setText(e.target.value)}
                placeholder="Escribe un mensaje..."
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}/>
              <button className={styles.sendBtn} onClick={sendMessage} disabled={sending || !text.trim()}>
                {sending ? <Spinner size={16}/> : <Send size={18}/>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

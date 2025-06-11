import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

// Utility to decode JWT token (simple base64 decode to get payload)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const LogoutIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const SendIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function Chat({ token }) {
  const [socket, setSocket] = useState(null);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userEmail, setUserEmail] = useState(null); // your email extracted from token
  const messagesEndRef = useRef(null);

  // Extract email from JWT token on mount
  useEffect(() => {
    const payload = parseJwt(token);
    if (payload && payload.email) {
      setUserEmail(payload.email);
    }
  }, [token]);

  useEffect(() => {
    if (!userEmail) return;

    const s = io('http://localhost:5000', {
      auth: { token }
    });

    // Update online users excluding yourself
    s.on('users_online', (usersList) => {
      setOnlineUsers(usersList);
      setUsers(usersList.filter(user => user !== userEmail));
    });

    // Handle incoming messages
    s.on('receive_message', (data) => {
      // Only add messages related to current selected user
      if (data.sender === selectedUser || data.receiver === selectedUser) {
        // Mark message as received if sender is NOT you
        const isReceived = data.sender !== userEmail;
        setChat((prev) => [...prev, { ...data, received: isReceived }]);
      }
    });

    setSocket(s);

    return () => s.disconnect();
  }, [token, selectedUser, userEmail]);

  useEffect(() => {
    if (selectedUser) {
      setLoadingHistory(true);
      fetch(`http://localhost:5000/api/messages/${selectedUser}`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(messages => {
          setChat(messages);
          setLoadingHistory(false);
        })
        .catch(() => {
          setLoadingHistory(false);
          setChat([]);
        });
    }
  }, [selectedUser, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!msg.trim() || !selectedUser || !socket) return;

    const messageData = {
      content: msg.trim(),
      timestamp: new Date().toISOString(),
      receiver: selectedUser,
      sender: userEmail
    };

    socket.emit('send_message', messageData);
    // Add your own sent message immediately with received: false
    setChat(prev => [...prev, { ...messageData, received: false }]);
    setMsg('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="chat-container" role="main">
      <aside className="users-list" aria-label="User list">
        <h3 className="users-title">Online Users</h3>
        {users.length === 0 && <p className="no-users">No users online</p>}
        {users.map(user => (
          <button
            key={user}
            className={`user ${selectedUser === user ? 'selected' : ''}`}
            onClick={() => setSelectedUser(user)}
            aria-pressed={selectedUser === user}
            title={user}
          >
            {user}
          </button>
        ))}
      </aside>

      <section className="chat-main" aria-live="polite" aria-atomic="false">
        <header className="chat-header">
          <h2 className="chat-title">{selectedUser ? `Chat with ${selectedUser}` : 'Select a user to chat'}</h2>
          <div className="header-right">
            <span className="online-count" aria-live="polite" aria-atomic="true">
              {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
            </span>
            <button
              className="logout-button"
              onClick={handleLogout}
              aria-label="Logout from chat"
              title="Logout"
              type="button"
            >
              <LogoutIcon />
            </button>
          </div>
        </header>

        <main
          className="messages-container"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={-1}
        >
          {loadingHistory && <div className="loading">Loading chat history...</div>}

          {!loadingHistory && chat.length === 0 && selectedUser && (
            <p className="no-messages">No messages yet. Say hi!</p>
          )}

          {chat.map((message, i) => {
            const isSent = message.sender === userEmail;
            return (
              <article
                key={i}
                className={`message ${isSent ? 'sent' : 'received'}`}
                tabIndex={-1}
                aria-label={`${isSent ? 'Sent' : 'Received'} message at ${new Date(message.timestamp).toLocaleTimeString()}`}
              >
                <p className="message-content">{message.content}</p>
                <time className="message-timestamp" dateTime={message.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </article>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        <footer className="input-container">
          <textarea
            aria-label="Type your message"
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={selectedUser ? "Type a message..." : "Select a user to start chatting"}
            disabled={!selectedUser}
            rows={2}
            className="chat-input"
            spellCheck={true}
          />
          <button
            onClick={sendMessage}
            disabled={!msg.trim() || !selectedUser}
            className="send-button"
            aria-label="Send message"
            title="Send message"
            type="button"
          >
            <SendIcon />
          </button>
        </footer>
      </section>
    </div>
  );
}

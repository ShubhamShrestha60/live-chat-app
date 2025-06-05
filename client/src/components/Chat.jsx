import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

export default function Chat({ token }) {
  const [socket, setSocket] = useState(null);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const s = io('http://localhost:5000', {
      auth: { token }
    });

    s.on('receive_message', (data) => {
      setChat((prev) => [...prev, { ...data, received: true }]);
    });

    s.on('users_online', (users) => {
      // Update both online users and users list
      setOnlineUsers(users);
      setUsers(users.filter(user => user !== socket?.user?.email));
    });

    setSocket(s);

    return () => s.disconnect();
  }, [token]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!msg.trim() || !selectedUser) {
      console.log('Cannot send: ', { msg: msg.trim(), selectedUser });
      return;
    }
    
    if (!socket) {
      console.log('Socket not connected');
      return;
    }
    
    const messageData = {
      content: msg,
      timestamp: new Date().toISOString(),
      receiver: selectedUser
    };
    
    console.log('Sending message:', messageData);
    socket.emit('send_message', messageData);
    setChat((prev) => [...prev, { ...messageData, received: false }]);
    setMsg('');
  };

  const loadChatHistory = async (user) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${user}`, {
        headers: {
          'Authorization': token
        }
      });
      const messages = await response.json();
      setChat(messages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadChatHistory(selectedUser);
    }
  }, [selectedUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="chat-container">
      <div className="users-list">
        {users.map(user => (
          <div 
            key={user} 
            className={`user ${selectedUser === user ? 'selected' : ''}`}
            onClick={() => setSelectedUser(user)}
          >
            {user}
          </div>
        ))}
      </div>
      <div className="chat-header">
        <h2>Live Chat</h2>
        <div className="online-users">
          {onlineUsers.length} users online
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="messages-container">
        {chat.map((message, i) => (
          <div key={i} className={`message ${message.received ? 'received' : 'sent'}`}>
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      <div className="input-container">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

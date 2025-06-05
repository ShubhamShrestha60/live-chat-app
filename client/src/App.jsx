import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);

  if (!token) {
    return isRegistering ? (
      <Register
        onRegister={(user) => setToken(localStorage.getItem('token'))}
        onSwitchToLogin={() => setIsRegistering(false)}
      />
    ) : (
      <Login setToken={setToken} onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }

  return <Chat token={token} />;
}

export default App;

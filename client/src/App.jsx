import { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <div>
      {token ? (
        <Chat token={token} />
      ) : (
        <Login setToken={setToken} />
      )}
    </div>
  );
}

export default App;

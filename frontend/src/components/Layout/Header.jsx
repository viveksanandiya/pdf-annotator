import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !user;

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">PDF Annotator</Link>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <button onClick={logout} className="hover:underline">Logout</button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="hover:underline">Login</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
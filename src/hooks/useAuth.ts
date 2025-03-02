import { useEffect } from "react";
import { useState } from "react";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [wiseMessage, setWiseMessage] = useState('');

    useEffect(() => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuthenticated);
      setWiseMessage(localStorage.getItem('authMessage') || '');

      const interval = setInterval(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(isAuthenticated);
        setWiseMessage(localStorage.getItem('authMessage') || '');
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return { isAuthenticated, wiseMessage };
}

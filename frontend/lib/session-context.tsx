'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'

type SessionContextType = {
  isAuth: boolean
  userId: string | null
  username: string | null
  isAdmin: boolean | null
  setSession: (session: { isAuth: boolean, userId: string | null, username: string | null, isAdmin: boolean | null }) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuth(true);
          setUserId(data.id);
          setUsername(data.username);
          setIsAdmin(data.isAdmin);
        } else {
          setIsAuth(false);
          setUserId(null);
          setUsername(null);
          setIsAdmin(null);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setIsAuth(false);
        setUserId(null);
        setUsername(null);
        setIsAdmin(null);
      }
    };

    fetchSession();
  }, []); // Run once on component mount
  
  const setSession = (session: { isAuth: boolean; userId: string | null; username: string | null, isAdmin: boolean | null }) => {
    setIsAuth(session.isAuth);
    setUserId(session.userId);
    setUsername(session.username);
    setIsAdmin(session.isAdmin);
  };

  return (
    <SessionContext.Provider value={{ isAuth, userId, username, isAdmin, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

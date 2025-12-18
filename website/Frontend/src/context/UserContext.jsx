import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // For now, we'll use localStorage to persist user type
  // In production, this would come from your authentication system
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('userType') || 'student';
  });

  useEffect(() => {
    localStorage.setItem('userType', userType);
  }, [userType]);

  const value = {
    userType,
    setUserType,
    isStudent: userType === 'student',
    isTutor: userType === 'tutor'
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};


















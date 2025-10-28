import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types';

// Internal type for the user database, which includes the password
type UserWithPassword = User & { password: string };

// A simple in-memory store that mimics a user database, persisted to localStorage.
// In a real app, this would be replaced with API calls to a backend service.
const userDB = {
  getUsers: (): UserWithPassword[] => {
    try {
      const users = localStorage.getItem('usersDB');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  },
  saveUsers: (users: UserWithPassword[]) => {
    localStorage.setItem('usersDB', JSON.stringify(users));
  },
};

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  findUserByEmail: (email: string) => User | undefined;
  findEmailByName: (name: string) => string | undefined;
  updateUser: (name: string, email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateAvatar: (avatarUrl: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from session storage", e);
      sessionStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const setUserSession = (userWithPassword: UserWithPassword) => {
    const { password, ...userWithoutPassword } = userWithPassword;
    setCurrentUser(userWithoutPassword);
    sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  };

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        const users = userDB.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          setUserSession(user);
          resolve();
        } else {
          reject(new Error('Invalid email or password.'));
        }
      }, 500);
    });
  };
  
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
       setTimeout(() => { // Simulate network delay
        const users = userDB.getUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          return reject(new Error('An account with this email already exists.'));
        }
        const newUser: UserWithPassword = { name, email, password, avatarUrl: undefined };
        const updatedUsers = [...users, newUser];
        userDB.saveUsers(updatedUsers);
        setUserSession(newUser);
        resolve();
       }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const findUserByEmail = (email: string): User | undefined => {
    const users = userDB.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  };
  
  const findEmailByName = (name: string): string | undefined => {
    const users = userDB.getUsers();
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    return user?.email;
  };
  
  const updateUser = async (name: string, email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!currentUser) {
            return reject(new Error("No user is currently logged in."));
        }
        setTimeout(() => {
            const users = userDB.getUsers();
            // Check if the new email is already taken by another user
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.email.toLowerCase() !== currentUser.email.toLowerCase())) {
                return reject(new Error("This email is already in use by another account."));
            }

            const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIndex === -1) {
                return reject(new Error("Could not find the current user in the database."));
            }

            const updatedUser = { ...users[userIndex], name, email };
            users[userIndex] = updatedUser;
            userDB.saveUsers(users);
            setUserSession(updatedUser);
            resolve();
        }, 500);
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!currentUser) {
            return reject(new Error("No user is currently logged in."));
        }
        setTimeout(() => {
            const users = userDB.getUsers();
            const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIndex === -1) {
                return reject(new Error("Could not find the current user."));
            }

            const user = users[userIndex];
            if (user.password !== currentPassword) {
                return reject(new Error("The current password you entered is incorrect."));
            }

            user.password = newPassword;
            userDB.saveUsers(users);
            resolve();
        }, 500);
    });
  };

  const updateAvatar = async (avatarUrl: string | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!currentUser) {
        return reject(new Error("No user is currently logged in."));
      }
      setTimeout(() => {
        const users = userDB.getUsers();
        const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (userIndex === -1) {
          return reject(new Error("Could not find the current user in the database."));
        }

        const updatedUser = { ...users[userIndex], avatarUrl: avatarUrl || undefined };
        users[userIndex] = updatedUser;
        userDB.saveUsers(users);
        setUserSession(updatedUser);
        resolve();
      }, 500);
    });
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    findUserByEmail,
    findEmailByName,
    updateUser,
    changePassword,
    updateAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
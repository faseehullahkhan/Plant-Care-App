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
  resetPassword: (email: string, newPassword: string) => Promise<void>;
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
        const trimmedEmail = email.trim();
        const user = users.find(u => u.email.trim().toLowerCase() === trimmedEmail.toLowerCase());

        if (!user) {
          const err = new Error('No account found with this email address.');
          console.error(`Login attempt failed: email ${trimmedEmail} not found.`, err);
          return reject(err);
        }

        if (user.password !== password.trim()) {
          const err = new Error('The password you entered is incorrect.');
          console.error(`Login attempt failed for email ${trimmedEmail}: incorrect password.`, err);
          return reject(err);
        }
        
        setUserSession(user);
        resolve();
      }, 500);
    });
  };
  
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
       setTimeout(() => { // Simulate network delay
        const users = userDB.getUsers();
        const trimmedEmail = email.trim();
        if (users.some(u => u.email.trim().toLowerCase() === trimmedEmail.toLowerCase())) {
          console.error(`Signup failed: email ${trimmedEmail} already exists.`);
          return reject(new Error('An account with this email already exists.'));
        }
        const newUser: UserWithPassword = { name: name.trim(), email: trimmedEmail, password: password.trim(), avatarUrl: undefined };
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
    const trimmedEmail = email.trim();
    const user = users.find(u => u.email.trim().toLowerCase() === trimmedEmail.toLowerCase());
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  };
  
  const findEmailByName = (name: string): string | undefined => {
    const users = userDB.getUsers();
    const trimmedName = name.trim();
    const user = users.find(u => u.name.trim().toLowerCase() === trimmedName.toLowerCase());
    return user?.email;
  };
  
  const updateUser = async (name: string, email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!currentUser) {
            const err = new Error("No user is currently logged in.");
            console.error("Update user failed:", err);
            return reject(err);
        }
        setTimeout(() => {
            const users = userDB.getUsers();
            const trimmedEmail = email.trim();
            const trimmedName = name.trim();

            // Check if the new email is already taken by another user
            if (users.some(u => u.email.trim().toLowerCase() === trimmedEmail.toLowerCase() && u.email.toLowerCase() !== currentUser.email.toLowerCase())) {
                const err = new Error("This email is already in use by another account.");
                console.error(`Update user failed for ${currentUser.email}: new email ${trimmedEmail} is taken.`);
                return reject(err);
            }

            const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIndex === -1) {
                const err = new Error("Could not find the current user in the database.");
                console.error("Update user failed:", err, currentUser);
                return reject(err);
            }

            const updatedUser = { ...users[userIndex], name: trimmedName, email: trimmedEmail };
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
            const err = new Error("No user is currently logged in.");
            console.error("Change password failed:", err);
            return reject(err);
        }
        setTimeout(() => {
            const users = userDB.getUsers();
            const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (userIndex === -1) {
                const err = new Error("Could not find the current user.");
                console.error("Change password failed:", err, currentUser);
                return reject(err);
            }

            const user = users[userIndex];
            if (user.password !== currentPassword.trim()) {
                const err = new Error("The current password you entered is incorrect.");
                console.error(`Change password failed for ${currentUser.email}: incorrect current password.`);
                return reject(err);
            }

            user.password = newPassword.trim();
            userDB.saveUsers(users);
            resolve();
        }, 500);
    });
  };

  const updateAvatar = async (avatarUrl: string | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!currentUser) {
        const err = new Error("No user is currently logged in.");
        console.error("Update avatar failed:", err);
        return reject(err);
      }
      setTimeout(() => {
        try {
          const users = userDB.getUsers();
          const userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (userIndex === -1) {
            const err = new Error("Could not find the current user in the database.");
            console.error("Update avatar failed:", err, currentUser);
            return reject(err);
          }

          const updatedUser = { ...users[userIndex], avatarUrl: avatarUrl || undefined };
          users[userIndex] = updatedUser;
          userDB.saveUsers(users);
          setUserSession(updatedUser);
          resolve();
        } catch (err) {
            console.error("An unexpected error occurred while updating avatar:", err);
            reject(new Error("An unexpected error occurred. Please try again."));
        }
      }, 500);
    });
  };

  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            try {
                const users = userDB.getUsers();
                const trimmedEmail = email.trim();
                const userIndex = users.findIndex(u => u.email.trim().toLowerCase() === trimmedEmail.toLowerCase());

                if (userIndex === -1) {
                    const err = new Error("Could not find a user with that email.");
                    console.error(`Password reset failed: email ${trimmedEmail} not found.`, err);
                    return reject(err);
                }

                users[userIndex].password = newPassword.trim();
                userDB.saveUsers(users);
                resolve();
            } catch (err) {
                 console.error("An unexpected error occurred during password reset:", err);
                 reject(new Error("An unexpected error occurred. Please try again."));
            }
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
    resetPassword,
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
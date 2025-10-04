import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function register(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(result.user, { displayName: name });
    
    // Send email verification
    await sendEmailVerification(result.user);
    
    // Create user profile in Firestore
    const userProfile: User = {
      id: result.user.uid,
      email: email,
      name: name,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', result.user.uid), userProfile);
    setUserProfile(userProfile);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  async function updateUserProfile(updates: Partial<User>) {
    if (!currentUser || !userProfile) return;
    
    const updatedProfile = { ...userProfile, ...updates };
    await updateDoc(doc(db, 'users', currentUser.uid), updates);
    
    // Update display name in auth if name is being updated
    if (updates.name) {
      await updateProfile(currentUser, { displayName: updates.name });
    }
    
    setUserProfile(updatedProfile);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function loadUserProfile(user: FirebaseUser) {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          id: user.uid,
          email: user.email || '',
          name: data.name || user.displayName || '',
          phoneNumber: data.phoneNumber,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      } else {
        // Create profile if it doesn't exist
        const newProfile: User = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          createdAt: new Date()
        };
        await setDoc(docRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    updateUserProfile,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
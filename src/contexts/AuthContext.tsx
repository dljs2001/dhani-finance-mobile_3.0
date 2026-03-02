import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { userDb } from '@/lib/neon';

const ADMIN_CREDENTIALS = {
  userId: import.meta.env.VITE_ADMIN_USER_ID || '9899654695',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '7838203264'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const login = async (userId: string, password: string) => {
    setIsLoading(true);
    try {
      if (userId === ADMIN_CREDENTIALS.userId && password === ADMIN_CREDENTIALS.password) {
        setIsAdmin(true);
        setUser(null);
        localStorage.setItem('isAdmin', 'true');
        toast({
          title: "Success",
          description: "Admin login successful",
        });
        return;
      }

      const data = await userDb`SELECT * FROM users WHERE user_id = ${userId} LIMIT 1`;

      if (!data || data.length === 0) throw new Error('User not found');

      const userDoc = data[0];
      if (userDoc.password !== password) throw new Error('Invalid password');

      // Map the database response to our User type
      const mappedUser = {
        id: userDoc.id,
        userId: userDoc.user_id,
        password: userDoc.password,
        accountName: userDoc.account_name,
        accountNumber: userDoc.account_number,
        accountType: userDoc.account_type,
        availableBalance: Number(userDoc.available_balance),
        bankName: userDoc.bank_name,
        withdrawAccountNumber: userDoc.withdraw_account_number,
        withdrawalFee: Number(userDoc.withdrawal_fee),
        initialDeposit: Number(userDoc.initial_deposit),
        transactions: userDoc.transactions || []
      };

      console.log("Logged in user data:", mappedUser);
      setUser(mappedUser);
      setIsAdmin(false);
      localStorage.setItem('userId', userDoc.user_id);

      toast({
        title: "Success",
        description: "Login successful",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || 'Login failed',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  useEffect(() => {
    const checkExistingSession = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedIsAdmin = localStorage.getItem('isAdmin');

      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      if (storedUserId) {
        setIsLoading(true);
        try {
          const data = await userDb`SELECT * FROM users WHERE user_id = ${storedUserId} LIMIT 1`;

          if (data && data.length > 0) {
            const userDoc = data[0];
            const mappedUser = {
              id: userDoc.id,
              userId: userDoc.user_id,
              password: userDoc.password,
              accountName: userDoc.account_name,
              accountNumber: userDoc.account_number,
              accountType: userDoc.account_type,
              availableBalance: Number(userDoc.available_balance),
              bankName: userDoc.bank_name,
              withdrawAccountNumber: userDoc.withdraw_account_number,
              withdrawalFee: Number(userDoc.withdrawal_fee),
              initialDeposit: Number(userDoc.initial_deposit),
              transactions: userDoc.transactions || []
            };
            setUser(mappedUser);
          } else {
            localStorage.removeItem('userId');
          }
        } catch (error) {
          console.error('Session restoration error:', error);
          localStorage.removeItem('userId');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

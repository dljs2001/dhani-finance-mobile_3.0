
export interface Transaction {
  type: string;
  amount: number;
  date: string;
  description: string;
}

export interface User {
  id: string;
  userId: string;
  password: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  availableBalance: number;
  bankName: string;
  withdrawAccountNumber: string;
  withdrawalFee: number;
  initialDeposit: number;
  createdAt?: unknown; // For Firestore timestamps
  lastLogin?: unknown; // For Firestore timestamps
  transactions: Transaction[];
}

export interface AdminCredentials {
  userId: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => void;
}

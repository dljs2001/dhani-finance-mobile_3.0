import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert, CreditCard, Clock, Activity } from "lucide-react";

// --- UTILITY FUNCTIONS ---
const formatIndianCurrency = (num: number) => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '₹ 0';
  }
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
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


const User = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const [modalType, setModalType] = useState<"denied" | "withdraw" | null>(
    null
  );
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setModalType("denied");
    }
  }, [user, isLoading, navigate]);

  const handleWithdraw = () => {
    setModalType("withdraw");
    setIsWithdrawing(false);
    setWithdrawError(false);
  };

  const handlePayNow = () => {
    setIsWithdrawing(true);
    setWithdrawError(false);

    // Simulate 3 seconds loading
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawError(true);

      // Auto close after 3 seconds of showing error
      setTimeout(() => {
        setModalType(null);
      }, 3000);
    }, 3000);
  };

  const handleLogoutAndRedirect = () => {
    logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-[4px] border-primary border-t-transparent"></div>
        <p className="text-primary font-semibold text-sm animate-pulse">Loading your account...</p>
      </div>
    );
  }

  if (!isLoading && !user) {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent className="rounded-2xl max-w-[90%] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-primary text-center">Access Denied</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 font-medium">
              Please login to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl w-full sm:w-auto" onClick={handleLogoutAndRedirect}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <>
      <AlertDialog
        open={modalType === "withdraw"}
        onOpenChange={(isOpen) => !isOpen && setModalType(null)}
      >
        <AlertDialogContent className="rounded-3xl w-[90%] max-w-[400px] border-none shadow-2xl bg-white p-6 overflow-hidden">
          {(!isWithdrawing && !withdrawError) && (
            <>
              <AlertDialogHeader className="mb-2">
                <div className="flex justify-center mb-4">
                  <div className="bg-amber-100 p-4 rounded-full">
                    <ShieldAlert className="h-10 w-10 text-amber-500" />
                  </div>
                </div>
                <AlertDialogTitle className="text-center text-2xl font-bold text-gray-900 border-none">
                  Withdrawal Confirmation
                </AlertDialogTitle>
              </AlertDialogHeader>

              <div className="text-center my-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">A refundable fee is required</p>
                <p className="text-4xl font-black text-primary tracking-tight animate-slow-pulse">
                  {formatIndianCurrency(user?.withdrawalFee || 1400)}
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-2">
                  {numberToWordsIndian(user?.withdrawalFee || 1400)}
                </p>
              </div>

              <AlertDialogDescription className="text-center text-[13px] font-medium text-gray-500 px-2 mt-2 leading-relaxed">
                This payment will be fully refunded to your account within 20 minutes
                via the same payment method used.
              </AlertDialogDescription>

              <AlertDialogFooter className="sm:justify-center mt-8 flex flex-col gap-3 sm:flex-row sm:gap-2">
                <AlertDialogCancel asChild>
                  <Button onClick={() => setModalType(null)} className="w-full sm:w-auto h-12 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-semibold rounded-xl sm:order-1 order-2 mt-0">
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <Button onClick={handlePayNow} className="w-full sm:w-auto h-12 bg-success hover:bg-success/90 text-white font-bold rounded-xl shadow-lg shadow-success/20 active:scale-[0.98] transition-all sm:order-2 order-1 px-8">
                  Pay Now & Withdraw
                </Button>
              </AlertDialogFooter>
            </>
          )}

          {isWithdrawing && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-[4px] border-primary border-t-transparent shadow-md"></div>
              <h3 className="text-xl font-bold text-primary animate-pulse">Processing Payment...</h3>
              <p className="text-sm font-medium text-gray-500">Please do not close this window</p>
            </div>
          )}

          {withdrawError && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
              <div className="bg-destructive/10 p-4 rounded-full mb-2">
                <ShieldAlert className="h-12 w-12 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-destructive px-4">Payment Failed!</h3>
              <p className="text-base font-semibold text-gray-700 mb-6 max-w-xs leading-relaxed">Please try again later or use a different payment method.</p>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden absolute bottom-0 left-0">
                <div className="h-full bg-destructive animate-shrink-width" style={{ animation: "shrink 3s linear forwards" }}></div>
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-background flex flex-col items-center pb-12 antialiased relative">
        <div className="w-full max-w-md mx-auto relative px-4 pt-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <img
              src="/assets/images/dmi_dhani_logo.png"
              alt="Dhani Finance DMI"
              className="h-10 w-auto object-contain drop-shadow-sm"
            />
            <Button
              onClick={handleLogoutAndRedirect}
              variant="outline"
              className="border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl"
            >
              Logout
            </Button>
          </div>

          {/* Welcome Banner */}
          <div className="w-full overflow-hidden bg-primary/5 border border-primary/10 rounded-2xl py-3 px-1 mb-8 shadow-sm flex items-center relative">
            <div className="w-full whitespace-nowrap overflow-hidden relative">
              <p className="inline-block animate-marquee pl-full font-bold text-primary tracking-wide text-sm">
                Welcome, {user.accountName} ✦ Secure Banking
              </p>
            </div>
          </div>

          {/* Account Details Card */}
          <Card className="bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border border-gray-100 rounded-[24px] mb-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-400" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Account Details
              </h2>
              <div className="grid grid-cols-1 gap-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-500">Account Name</p>
                  <p className="font-semibold text-gray-900">{user.accountName}</p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-500">Dhani Account No.</p>
                  <p className="font-semibold text-gray-900">{user.accountNumber}</p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="font-semibold text-gray-900">{user.accountType}</p>
                </div>
                <div className="mt-4 bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Available Balance</p>
                  <div className="text-4xl font-black text-success tracking-tight mb-2">
                    {formatIndianCurrency(user.availableBalance)}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-500">
                    {numberToWordsIndian(user.availableBalance)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Withdraw CTA */}
          <Button
            className="w-full bg-primary hover:bg-primary/95 text-white h-auto py-5 mb-10 rounded-2xl shadow-xl shadow-primary/20 flex flex-col items-center gap-1.5 transition-transform active:scale-[0.98] border border-primary/20"
            onClick={handleWithdraw}
          >
            <span className="block text-xl font-black tracking-wide">WITHDRAW FUNDS</span>
            <span className="block text-xs font-medium text-white/80 opacity-90 px-2 text-center leading-tight">
              to Account of : {user.bankName} : XXXX XXXX XXXX {user.withdrawAccountNumber}
            </span>
          </Button>

          {/* Transaction History */}
          <div className="px-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" /> Transaction History
            </h2>
            <div className="space-y-3">
              {user.transactions?.length > 0 ? (
                user.transactions.map((transaction, index) => (
                  <Card key={index} className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'Credit' ? 'bg-success/10 text-success' : 'bg-red-50 text-red-500'}`}>
                        {transaction.type === 'Credit' ? <Clock className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{transaction.type}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{new Date(transaction.date).toLocaleDateString()} - {transaction.description}</p>
                      </div>
                    </div>
                    <div className={`font-black tracking-tight ${transaction.type === 'Credit' ? 'text-success' : 'text-gray-900'}`}>
                      {transaction.type === 'Credit' ? '+' : '-'}{formatIndianCurrency(transaction.amount)}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-8 text-center text-gray-500 font-medium">
                  No transaction history found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
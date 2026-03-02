import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { LockIcon, UserIcon } from 'lucide-react';

const Index = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(userId, password);
      navigate(userId === '9899654695' ? '/admin' : '/user');
    } catch (error) {
      console.error('Login error:', error);
      setModalContent("Wrong User ID or Password. Please try again.");
      setShowModal(true);
    }
  };

  const handleSignUp = () => {
    setModalContent('Sign-up feature will be available soon!');
    setShowModal(true);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <img
            src="/assets/images/dmi_dhani_logo.png"
            alt="Dhani Finance Logo"
            className="mx-auto w-auto max-w-[240px] max-h-20 object-contain mb-6 drop-shadow-sm"
          />
        </div>

        <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl mx-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-primary">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="relative group">
                  <UserIcon className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Mobile Number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="pl-11 h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                </div>
                <div className="relative group">
                  <LockIcon className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-lg rounded-xl shadow-md transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">Don't have an account? </span>
              <Button
                variant="link"
                className="text-primary font-semibold p-0 h-auto hover:text-primary/80"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent className="rounded-2xl w-[90%] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-primary">Notice</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 font-medium">
              {modalContent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-xl mt-0 font-semibold w-full sm:w-auto px-8">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
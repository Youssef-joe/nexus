import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuthStore();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        toast({
          title: 'Email verified',
          description: 'You can now log in to your account.',
        });
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed');
        toast({
          title: 'Verification failed',
          description: error.message || 'Please try again or contact support.',
          variant: 'destructive',
        });
      }
    };

    verify();
  }, [searchParams, verifyEmail, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">L&D Nexus</span>
          </Link>
        </div>

        <Card className="card-professional">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Email Verification
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-700">Verification Successful!</h3>
                  <p className="text-muted-foreground">{message}</p>
                </div>
                <Button asChild variant="hero" className="w-full">
                  <Link to="/login">Continue to Login</Link>
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-red-500" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-700">Verification Failed</h3>
                  <p className="text-muted-foreground">{message}</p>
                </div>
                <div className="space-y-2">
                  <Button asChild variant="hero" className="w-full">
                    <Link to="/signup">Create New Account</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
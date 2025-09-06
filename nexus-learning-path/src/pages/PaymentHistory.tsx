import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink
} from 'lucide-react';

export const PaymentHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await apiClient.getPaymentHistory();
        setPayments(response);
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const handleSetupPayout = async () => {
    try {
      const { onboardingUrl } = await apiClient.setupPayoutAccount();
      window.open(onboardingUrl, '_blank');
    } catch (error) {
      console.error('Failed to setup payout account:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentIcon = (type: string) => {
    return type === 'payout' ? 
      <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
      <ArrowDownLeft className="h-4 w-4 text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div>Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment History</h1>
            <p className="text-muted-foreground">Track your payments and earnings</p>
          </div>

          {/* Payout Setup for Professionals */}
          {user?.role === 'professional' && !user?.payoutSetupCompleted && (
            <Card className="card-professional mb-6 border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">Setup Payout Account</h3>
                    <p className="text-sm text-blue-700">
                      Complete your Stripe account setup to receive payments
                    </p>
                  </div>
                  <Button onClick={handleSetupPayout} variant="default">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Setup Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payment history found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {getPaymentIcon(payment.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {payment.projectId?.title || 'Project Payment'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {payment.type === 'payout' ? 'Payout received' : 'Project funded'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            ${payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <Badge variant={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
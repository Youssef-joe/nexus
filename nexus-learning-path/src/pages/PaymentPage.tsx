import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { PaymentForm } from '@/components/PaymentForm';
import stripePromise from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PaymentPage = () => {
  const { projectId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await apiClient.getProject(projectId!);
        setProject(response);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, navigate, toast]);

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful!',
      description: 'Your project has been funded and is now active.',
    });
    navigate(`/projects/${projectId}`);
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div>Loading payment details...</div>
      </div>
    );
  }

  if (!project || user?.role !== 'organization' || project.organizationId._id !== user._id) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You can only fund your own projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Fund Your Project</h1>
            <p className="text-muted-foreground">
              Complete the payment to activate your project and start receiving applications
            </p>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm
              projectId={projectId!}
              amount={project.budget}
              projectTitle={project.title}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};
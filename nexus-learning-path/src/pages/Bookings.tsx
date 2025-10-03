import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { BookingCalendar } from '@/components/BookingCalendar';
import { CreateBookingDialog } from '@/components/CreateBookingDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

export const Bookings = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">
              Manage your meetings and sessions
            </p>
          </div>
          {user?.role === 'organization' && <CreateBookingDialog />}
        </div>

        <BookingCalendar />
      </div>
    </Layout>
  );
};
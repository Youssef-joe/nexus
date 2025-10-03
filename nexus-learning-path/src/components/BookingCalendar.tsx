import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookingStore, Booking } from '@/store/bookingStore';
import { format, isSameDay } from 'date-fns';
import { Clock, MapPin, Video, Users } from 'lucide-react';

export const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { bookings, fetchBookings, loading } = useBookingStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const selectedDateBookings = bookings.filter(booking =>
    isSameDay(new Date(booking.startTime), selectedDate)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Users className="h-4 w-4" />;
      case 'training_session': return <Clock className="h-4 w-4" />;
      case 'workshop': return <Users className="h-4 w-4" />;
      case 'meeting': return <Video className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const bookedDates = bookings.map(booking => new Date(booking.startTime));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersStyles={{
              booked: { backgroundColor: '#3b82f6', color: 'white' },
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Bookings for {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : selectedDateBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookings for this date
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateBookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(booking.type)}
                      <h3 className="font-semibold">{booking.title}</h3>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(booking.startTime), 'h:mm a')} - 
                      {format(new Date(booking.endTime), 'h:mm a')}
                    </div>
                    
                    {booking.isOnline ? (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Online Meeting
                        {booking.meetingLink && (
                          <Button variant="link" size="sm" asChild>
                            <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                              Join
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : booking.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {booking.location}
                      </div>
                    )}
                    
                    {booking.description && (
                      <p className="text-sm">{booking.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
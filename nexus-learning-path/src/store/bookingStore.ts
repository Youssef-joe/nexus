import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Booking {
  _id: string;
  organizationId: any;
  professionalId: any;
  projectId?: any;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'consultation' | 'training_session' | 'workshop' | 'meeting';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  meetingLink?: string;
  location?: string;
  isOnline: boolean;
  attendees?: string[];
  notes?: string;
  reminderEnabled: boolean;
  reminderHours: number;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BookingStore {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (booking: Partial<Booking>) => Promise<void>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string, reason: string) => Promise<void>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/bookings');
      set({ bookings: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch bookings', loading: false });
    }
  },

  createBooking: async (booking) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/bookings', booking);
      set(state => ({ 
        bookings: [...state.bookings, response.data], 
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create booking', loading: false });
      throw error;
    }
  },

  updateBooking: async (id, booking) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/bookings/${id}`, booking);
      set(state => ({
        bookings: state.bookings.map(b => b._id === id ? response.data : b),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update booking', loading: false });
      throw error;
    }
  },

  cancelBooking: async (id, reason) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/bookings/${id}/cancel`, { data: { reason } });
      set(state => ({
        bookings: state.bookings.map(b => b._id === id ? response.data : b),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to cancel booking', loading: false });
      throw error;
    }
  },
}));
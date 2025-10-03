import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBookingStore } from '@/store/bookingStore';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus } from 'lucide-react';

interface CreateBookingDialogProps {
  professionalId?: string;
  projectId?: string;
}

export const CreateBookingDialog = ({ professionalId, projectId }: CreateBookingDialogProps) => {
  const [open, setOpen] = useState(false);
  const { createBooking, loading } = useBookingStore();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();

  const isOnline = watch('isOnline', false);

  const onSubmit = async (data: any) => {
    try {
      await createBooking({
        ...data,
        professionalId: professionalId || data.professionalId,
        projectId,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });
      
      toast({
        title: 'Booking Created',
        description: 'Your booking has been created successfully.',
      });
      
      setOpen(false);
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Book Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Booking
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Meeting title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message as string}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={(value) => setValue('type', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="training_session">Training Session</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime', { required: 'Start time is required' })}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register('endTime', { required: 'End time is required' })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isOnline"
              checked={isOnline}
              onCheckedChange={(checked) => setValue('isOnline', checked)}
            />
            <Label htmlFor="isOnline">Online Meeting</Label>
          </div>

          {isOnline ? (
            <div>
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                {...register('meetingLink')}
                placeholder="https://zoom.us/j/..."
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Meeting location"
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Meeting description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="reminderEnabled"
              defaultChecked={true}
              onCheckedChange={(checked) => setValue('reminderEnabled', checked)}
            />
            <Label htmlFor="reminderEnabled">Send Reminder</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Building, Star, Award, Briefcase } from 'lucide-react';

export const Profile = () => {
  const {t} = useTranslation();
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    // Organization fields
    companyName: user?.companyName || '',
    companySize: user?.companySize || '',
    industry: user?.industry || '',
    // Professional fields
    skills: user?.skills?.join(', ') || '',
    certifications: user?.certifications?.join(', ') || '',
    experience: user?.experience || 0,
    hourlyRate: user?.hourlyRate || 0,
  });

  const isOrganization = user?.role === 'organization';

  const handleSave = async () => {
    try {
      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(s => s),
      };
      
      updateProfile(updatedData);
      setIsEditing(false);
      
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('profile.title')}</h1>
              <p className="text-muted-foreground">{t('profile.manage_account')}</p>
            </div>
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              variant={isEditing ? "default" : "outline"}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card className="card-professional">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-muted-foreground capitalize">{user.role}</p>
                    <Badge variant={user.verified ? "default" : "secondary"} className="mt-2">
                      {user.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>

                  {!isOrganization && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{user.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Projects</span>
                        <span className="font-medium">{user.completedProjects || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Reviews</span>
                        <span className="font-medium">{user.totalReviews || 0}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input value={user.email} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          disabled={!isEditing}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Dubai, UAE"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Organization-specific fields */}
              {isOrganization && (
                <Card className="card-professional">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Your Company Ltd."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Company Size</Label>
                        <Input
                          value={formData.companySize}
                          onChange={(e) => setFormData({...formData, companySize: e.target.value})}
                          disabled={!isEditing}
                          placeholder="50-100 employees"
                        />
                      </div>
                      <div>
                        <Label>Industry</Label>
                        <Input
                          value={formData.industry}
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Technology"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Professional-specific fields */}
              {!isOrganization && (
                <Card className="card-professional">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Professional Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Skills (comma separated)</Label>
                      <Input
                        value={formData.skills}
                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Leadership, Training Design, Facilitation"
                      />
                    </div>
                    <div>
                      <Label>Certifications (comma separated)</Label>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={formData.certifications}
                          onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                          disabled={!isEditing}
                          placeholder="PMP, SHRM-CP, ATD Master Trainer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: Number(e.target.value)})}
                          disabled={!isEditing}
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <Label>Hourly Rate ($)</Label>
                        <Input
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})}
                          disabled={!isEditing}
                          placeholder="75"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
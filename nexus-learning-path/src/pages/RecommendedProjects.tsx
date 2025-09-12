import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock,
  TrendingUp,
  Building,
  Target
} from 'lucide-react';

export const RecommendedProjects = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await apiClient.getMatchingProjects();
        setMatches(response);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project recommendations',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'professional') {
      fetchMatches();
    }
  }, [user, toast]);

  const getMatchColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-500';
      case 'very_good': return 'bg-blue-500';
      case 'good': return 'bg-yellow-500';
      case 'fair': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getMatchLabel = (level: string) => {
    switch (level) {
      case 'excellent': return 'Excellent Match';
      case 'very_good': return 'Very Good Match';
      case 'good': return 'Good Match';
      case 'fair': return 'Fair Match';
      default: return 'Poor Match';
    }
  };

  if (user?.role !== 'professional') {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This feature is only available for professionals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              AI Project Recommendations
            </h1>
            <p className="text-muted-foreground">
              Projects matched to your skills and experience using AI analysis
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Analyzing your profile and finding perfect matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <Card className="card-professional">
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground">
                  Complete your profile with skills and experience to get better recommendations
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/profile')}
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {matches.map((match) => (
                <Card key={match.project._id} className="card-professional hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {match.project.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>
                              {match.project.organizationId?.companyName || 
                               `${match.project.organizationId?.firstName} ${match.project.organizationId?.lastName}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{match.project.location || 'Remote'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getMatchColor(match.matchLevel)}`}>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {match.matchScore}% Match
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getMatchLabel(match.matchLevel)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {match.project.description}
                    </p>

                    {/* Required Skills */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.project.requiredSkills?.map((skill: string) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${match.project.budget?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{match.project.duration}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {match.project.type?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => navigate(`/projects/${match.project._id}`)}
                      >
                        View Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
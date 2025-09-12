import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock,
  Brain,
  TrendingUp,
  Award
} from 'lucide-react';

interface TalentMatchingProps {
  projectId: string;
}

export const TalentMatching = ({ projectId }: TalentMatchingProps) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await apiClient.getMatchingProfessionals(projectId);
        setMatches(response);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load talent matches',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [projectId, toast]);

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

  if (isLoading) {
    return (
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Talent Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading AI matches...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Talent Matching
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top professionals matched using AI analysis
        </p>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No matching professionals found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div
                key={match.professional._id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                      {match.professional.firstName?.[0]}{match.professional.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {match.professional.firstName} {match.professional.lastName}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{match.professional.rating || 0}/5</span>
                        <span>•</span>
                        <span>{match.professional.completedProjects || 0} projects</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getMatchColor(match.matchLevel)}`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {match.matchScore}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getMatchLabel(match.matchLevel)}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {match.professional.skills?.slice(0, 4).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {match.professional.skills?.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{match.professional.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{match.professional.experience || 0}+ years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${match.professional.hourlyRate || 0}/hr</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
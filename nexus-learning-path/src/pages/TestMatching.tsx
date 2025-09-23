import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Users, Briefcase, Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function TestMatching() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      await apiClient.seedDatabase();
      toast({
        title: 'Success',
        description: 'Database seeded with test data successfully!',
      });
      loadProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed database',
        variant: 'destructive',
      });
    } finally {
      setSeeding(false);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProjects();
      setProjects(response.projects || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testMatching = async (projectId: string) => {
    setLoading(true);
    try {
      const matchResults = await apiClient.getMatchingProfessionals(projectId, 5);
      setMatches(matchResults);
      setSelectedProject(projects.find(p => p._id === projectId));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get matches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'very_good': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Matching System Test</h1>
        <p className="text-gray-600">Test the AI-powered professional-to-project matching system</p>
      </div>

      {/* Seed Database Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Setup
          </CardTitle>
          <CardDescription>
            Populate the database with test data (professionals and projects)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={seedDatabase} 
            disabled={seeding}
            className="mr-4"
          >
            {seeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Test Data
              </>
            )}
          </Button>
          <Button 
            onClick={loadProjects} 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Load Projects
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Projects Section */}
      {projects.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Available Projects ({projects.length})
            </CardTitle>
            <CardDescription>
              Click on a project to test AI matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Card 
                  key={project._id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => testMatching(project._id)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${project.budget?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {project.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills?.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.requiredSkills?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.requiredSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Results Section */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              AI Matching Results for "{selectedProject.title}"
            </CardTitle>
            <CardDescription>
              Top {matches.length} matching professionals found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Finding best matches...</span>
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <Card key={match.professional._id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {match.professional.firstName} {match.professional.lastName}
                          </h3>
                          <p className="text-gray-600">{match.professional.bio}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {match.matchScore}%
                          </div>
                          <Badge className={getMatchColor(match.matchLevel)}>
                            {match.matchLevel.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-500">Experience</span>
                          <p className="font-medium">{match.professional.experience} years</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Rate</span>
                          <p className="font-medium">${match.professional.hourlyRate}/hr</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Rating</span>
                          <p className="font-medium flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {match.professional.rating}/5
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Projects</span>
                          <p className="font-medium">{match.professional.completedProjects}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm text-gray-500 block mb-1">Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {match.professional.skills?.slice(0, 4).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {match.professional.skills?.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{match.professional.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-medium text-gray-700">AI Analysis:</span>
                        <p className="text-sm text-gray-600 mt-1">{match.reasoning}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No matching professionals found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
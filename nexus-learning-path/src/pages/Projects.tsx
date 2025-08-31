import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, MapPin, DollarSign, Calendar, Brain, Users } from 'lucide-react';

export const Projects = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { projects, fetchProjects, createProject, isLoading } = useProjectsStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'project_based',
    requiredSkills: '',
    budget: '',
    duration: '',
    deliverables: '',
    location: '',
    isRemote: true,
    languages: 'English'
  });

  const isOrganization = user?.role === 'organization';

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        await fetchProjects();
      } catch (error) {
        console.error('Failed to load projects:', error);
        // Don't show error toast immediately, let user try to create project first
      }
    };
    loadProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    try {
      await createProject({
        ...newProject,
        requiredSkills: newProject.requiredSkills.split(',').map(s => s.trim()),
        budget: Number(newProject.budget),
        deliverables: newProject.deliverables.split(',').map(s => s.trim()),
        languages: [newProject.languages]
      });
      
      // Refresh the projects list
      await fetchProjects();
      
      toast({
        title: 'Project created!',
        description: 'Your project has been created and is now live.',
      });
      
      setIsCreateOpen(false);
      setNewProject({
        title: '',
        description: '',
        type: 'project_based',
        requiredSkills: '',
        budget: '',
        duration: '',
        deliverables: '',
        location: '',
        isRemote: true,
        languages: 'English'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isOrganization ? t('projects.manage_projects') : t('projects.browse_projects')}
            </h1>
            <p className="text-muted-foreground">
              {isOrganization ? t('projects.create_and_manage') : t('projects.find_opportunities')}
            </p>
          </div>
          
          {isOrganization && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('projects.create_project')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label>Project Title</Label>
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="e.g., Leadership Development Program"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Describe your project requirements..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Project Type</Label>
                      <Select value={newProject.type} onValueChange={(value) => setNewProject({...newProject, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short_term">Short Term</SelectItem>
                          <SelectItem value="long_term">Long Term</SelectItem>
                          <SelectItem value="project_based">Project Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Budget ($)</Label>
                      <Input
                        type="number"
                        value={newProject.budget}
                        onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                        placeholder="5000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Required Skills (comma separated)</Label>
                    <Input
                      value={newProject.requiredSkills}
                      onChange={(e) => setNewProject({...newProject, requiredSkills: e.target.value})}
                      placeholder="Leadership, Training Design, Facilitation"
                    />
                  </div>
                  <div>
                    <Label>Deliverables (comma separated)</Label>
                    <Input
                      value={newProject.deliverables}
                      onChange={(e) => setNewProject({...newProject, deliverables: e.target.value})}
                      placeholder="Training Materials, Workshop Sessions, Assessment Tools"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={newProject.duration}
                        onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
                        placeholder="3 months"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={newProject.location}
                        onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                        placeholder="Dubai, UAE"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleCreateProject} className="w-full">
                  Create Project
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project._id} className="card-professional hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge variant={project.status === 'open' ? 'default' : project.status === 'draft' ? 'outline' : 'secondary'}>
                    {formatStatus(project.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>${project.budget.toLocaleString()}</span>
                </div>
                
                {project.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                    {project.isRemote && <Badge variant="outline">Remote</Badge>}
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {project.requiredSkills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {project.requiredSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.requiredSkills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.applicationsCount} applications</span>
                  </div>
                  
                  {project.aiMatchingScore && (
                    <div className="flex items-center gap-1 text-sm">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">{project.aiMatchingScore}% match</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  variant={isOrganization ? "outline" : "default"}
                  onClick={() => {
                    if (isOrganization) {
                      // Navigate to project details
                      window.open(`/projects/${project._id}`, '_blank');
                    } else {
                      // Apply to project logic here
                      toast({
                        title: 'Apply to Project',
                        description: 'Application feature coming soon!',
                      });
                    }
                  }}
                >
                  {isOrganization ? 'View Details' : 'Apply Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading projects...</div>
          </div>
        )}

        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchQuery ? 'No projects found matching your search.' : 'No projects available yet.'}
              {isOrganization && (
                <div className="mt-4">
                  <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                    Create your first project
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
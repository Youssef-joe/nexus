import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  Plus,
  Brain,
  Target
} from 'lucide-react';

export const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { myProjects, recommendedProjects, fetchMyProjects, fetchRecommendedProjects, isLoading } = useProjectsStore();

  const isOrganization = user?.role === 'organization';

  useEffect(() => {
    if (user) {
      fetchMyProjects();
      if (!isOrganization) {
        fetchRecommendedProjects();
      }
    }
  }, [user, fetchMyProjects, fetchRecommendedProjects, isOrganization]);

  if (!user) return null;

  const activeProjects = myProjects.filter(p => p.status === 'in_progress' || p.status === 'open').length;
  const completedProjects = myProjects.filter(p => p.status === 'completed').length;
  
  const stats = isOrganization ? [
    { icon: Briefcase, label: 'Active Projects', value: activeProjects.toString(), change: `+${Math.floor(activeProjects * 0.2)}` },
    { icon: Users, label: 'Total Projects', value: myProjects.length.toString(), change: `+${completedProjects}` },
    { icon: MessageSquare, label: 'Messages', value: '23', change: '+8' },
    { icon: DollarSign, label: 'Budget Allocated', value: `$${myProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`, change: '+12%' },
  ] : [
    { icon: Briefcase, label: 'Active Projects', value: activeProjects.toString(), change: `+${Math.floor(activeProjects * 0.1)}` },
    { icon: Star, label: 'Rating', value: user.rating?.toFixed(1) || '0.0', change: '+0.1' },
    { icon: Target, label: 'Completed', value: completedProjects.toString(), change: `+${Math.floor(completedProjects * 0.15)}` },
    { icon: DollarSign, label: 'Potential Earnings', value: `$${myProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`, change: '+8%' },
  ];

  const displayProjects = isOrganization ? myProjects.slice(0, 3) : recommendedProjects.slice(0, 3);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'open': return 'outline';
      default: return 'secondary';
    }
  };
  
  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcome')}, {user.firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isOrganization 
              ? "Manage your L&D projects and connect with expert professionals." 
              : "Track your projects and grow your L&D consultancy business."
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-professional">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="card-professional">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {isOrganization ? 'Your Projects' : 'Active Projects'}
                  </CardTitle>
                  <CardDescription>
                    {isOrganization 
                      ? 'Manage and track your L&D initiatives' 
                      : 'Projects you are currently working on'
                    }
                  </CardDescription>
                </div>
                <Button className="hero" variant="hero">
                  <Plus className="h-4 w-4 mr-2" />
                  {isOrganization ? 'Post Project' : 'Find Projects'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayProjects.length > 0 ? displayProjects.map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{project.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {isOrganization ? `${project.applicationsCount} applications` : project.organizationId?.companyName || project.organizationId?.firstName + ' ' + project.organizationId?.lastName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {project.endDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.endDate).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${project.budget.toLocaleString()}
                          </div>
                          {project.aiMatchingScore && (
                            <div className="flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              {project.aiMatchingScore}% match
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusColor(project.status)}>
                          {formatStatus(project.status)}
                        </Badge>
                        {project.isRemote && (
                          <Badge variant="outline" className="text-xs">
                            Remote
                          </Badge>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{isOrganization ? 'No projects yet. Create your first project!' : 'No recommended projects. Update your profile for better matches!'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Messages */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isOrganization ? (
                  <>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Experts
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Project
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Find Projects
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                        {i === 1 ? 'S' : i === 2 ? 'M' : 'J'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {i === 1 ? 'Sarah Johnson' : i === 2 ? 'Mike Chen' : 'Jessica Brown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {i === 1 
                            ? 'Project timeline looks good...' 
                            : i === 2 
                            ? 'Can we schedule a call?' 
                            : 'Thanks for the proposal!'
                          }
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {i === 1 ? '2m' : i === 2 ? '1h' : '3h'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
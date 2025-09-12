import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Building,
  Star,
  Brain
} from 'lucide-react';
import { TalentMatching } from '../components/TalentMatching';

export const ProjectDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOrganization = user?.role === 'organization';
  const isOwner = project?.organizationId?._id === user?._id;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await apiClient.getProject(id!);
        console.log('Project data:', response);
        console.log('AI Insights:', response.aiInsights);
        setProject(response);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div>{t('project_details.loading')}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('project_details.back_to_projects')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <Card className="card-professional">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {project.organizationId?.companyName || 
                           `${project.organizationId?.firstName} ${project.organizationId?.lastName}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>{t('project_details.project_details')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">{t('project_details.budget')}</h4>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-semibold">${project.budget.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{t('project_details.duration')}</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{project.duration || t('project_details.not_specified')}</span>
                      </div>
                    </div>
                  </div>

                  {project.location && (
                    <div>
                      <h4 className="font-medium mb-2">{t('project_details.location')}</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span>{project.location}</span>
                        {project.isRemote && <Badge variant="outline">{t('projects.remote')}</Badge>}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">{t('project_details.required_skills')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.requiredSkills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('project_details.deliverables')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {project.deliverables.map((deliverable: string, index: number) => (
                        <li key={index}>{deliverable}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('project_details.languages')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.languages.map((language: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              {(project.aiInsights || true) && (
                <Card className="card-professional">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      {t('project_details.ai_insights')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.aiInsights ? (
                        <>
                          {project.aiInsights.marketAnalysis && (
                            <div>
                              <h4 className="font-medium mb-2">{t('project_details.market_analysis')}</h4>
                              <p className="text-sm text-muted-foreground">
                                {project.aiInsights.marketAnalysis}
                              </p>
                            </div>
                          )}
                          {project.aiInsights.budgetAssessment && (
                            <div>
                              <h4 className="font-medium mb-2">{t('project_details.budget_assessment')}</h4>
                              <p className="text-sm text-muted-foreground">
                                {project.aiInsights.budgetAssessment}
                              </p>
                            </div>
                          )}
                          {project.aiInsights.recommendations && (
                            <div>
                              <h4 className="font-medium mb-2">{t('project_details.recommendations')}</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {project.aiInsights.recommendations.map((rec: string, index: number) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>AI insights are being generated...</p>
                          <p className="text-sm mt-2">This may take a few moments for new projects.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Talent Matching - Only for organization owners */}
              {isOwner && (
                <TalentMatching projectId={project._id} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Stats */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>{t('project_details.project_stats')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('project_details.applications')}</span>
                    <span className="font-medium">{project.applicationsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('project_details.views')}</span>
                    <span className="font-medium">{project.viewsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('project_details.type')}</span>
                    <Badge variant="outline">{project.type.replace('_', ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Organization Info */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle>{t('project_details.organization')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                      {project.organizationId?.firstName?.[0]}{project.organizationId?.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {project.organizationId?.companyName || 
                         `${project.organizationId?.firstName} ${project.organizationId?.lastName}`}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{t('project_details.verified_organization')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="card-professional">
                <CardContent className="pt-6">
                  {isOwner ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'Edit Project',
                            description: 'Edit functionality coming soon!',
                          });
                        }}
                      >
                        {t('project_details.edit_project')}
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'View Applications',
                            description: 'Applications view coming soon!',
                          });
                        }}
                      >
                        {t('project_details.view_applications')}
                      </Button>
                    </div>
                  ) : !isOrganization ? (
                    <Button 
                      className="w-full" 
                      variant="hero"
                      onClick={() => {
                        toast({
                          title: 'Apply to Project',
                          description: 'Application feature coming soon!',
                        });
                      }}
                    >
                      {t('project_details.apply_to_project')}
                    </Button>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">
                      {t('project_details.only_professionals_apply')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
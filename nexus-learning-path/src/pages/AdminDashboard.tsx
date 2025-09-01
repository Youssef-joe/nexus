import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  FolderOpen, 
  FileText, 
  TrendingUp,
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  totalProfessionals: number;
  totalProjects: number;
  totalApplications: number;
  totalRevenue: number;
  averageProjectBudget: number;
  activeProjects: number;
  completedProjects: number;
  draftProjects: number;
  inProgressProjects: number;
  cancelledProjects: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  recentUsers: any[];
  recentProjects: any[];
  monthlyStats: any[];
  projectStatusStats: any[];
  topOrganizations: any[];
}

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await apiClient.getAdminStats();
        setStats(response);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminStats();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center">
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and statistics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-professional">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrganizations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalProjects} total projects
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: ${stats?.averageProjectBudget.toLocaleString()}/project
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="card-professional">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.verifiedUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.unverifiedUsers} pending
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Draft Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.draftProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting publication
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.inProgressProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.cancelledProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Terminated projects
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats && stats.totalProjects > 0 ? 
                    Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Project completion
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Users */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.verified && <Badge variant="outline" className="text-green-600">✓</Badge>}
                        <Badge variant={user.role === 'organization' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentProjects.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{project.title}</p>
                        <Badge variant={
                          project.status === 'completed' ? 'default' : 
                          project.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {project.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{project.organization}</span>
                        <span>${project.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Organizations */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Top Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topOrganizations.map((org, index) => (
                    <div key={org._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">#{index + 1} {org.name}</p>
                        <Badge variant="outline">
                          {org.projectCount} projects
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Budget: ${org.totalBudget.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-lg">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats?.totalApplications}</div>
                <p className="text-sm text-muted-foreground">Total applications submitted</p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-lg">Professionals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats?.totalProfessionals}</div>
                <p className="text-sm text-muted-foreground">Registered L&D professionals</p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-lg">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {stats ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Project completion rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
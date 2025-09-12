import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecommendedProjects } from '../RecommendedProjects';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/store/authStore');
jest.mock('@/lib/api');
jest.mock('@/hooks/use-toast');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockToast = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RecommendedProjects', () => {
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  it('renders access denied for non-professional users', () => {
    mockUseAuthStore.mockReturnValue({
      user: { role: 'organization' },
    } as any);

    renderWithRouter(<RecommendedProjects />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('This feature is only available for professionals.')).toBeInTheDocument();
  });

  it('renders loading state for professional users', () => {
    mockUseAuthStore.mockReturnValue({
      user: { role: 'professional' },
    } as any);

    mockApiClient.getMatchingProjects.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    renderWithRouter(<RecommendedProjects />);

    expect(screen.getByText('Analyzing your profile and finding perfect matches...')).toBeInTheDocument();
  });

  it('renders recommended projects successfully', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { role: 'professional' },
    } as any);

    const mockMatches = [
      {
        project: {
          _id: 'project1',
          title: 'Leadership Development Program',
          description: 'Comprehensive leadership training for managers',
          requiredSkills: ['Leadership', 'Communication'],
          budget: 10000,
          duration: '3 months',
          location: 'Remote',
          type: 'training',
          organizationId: {
            companyName: 'Tech Corp',
            firstName: 'John',
            lastName: 'Smith',
          },
        },
        matchScore: 92,
        matchLevel: 'excellent',
      },
    ];

    mockApiClient.getMatchingProjects.mockResolvedValue(mockMatches);

    renderWithRouter(<RecommendedProjects />);

    await waitFor(() => {
      expect(screen.getByText('Leadership Development Program')).toBeInTheDocument();
      expect(screen.getByText('92% Match')).toBeInTheDocument();
      expect(screen.getByText('Excellent Match')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('$10,000')).toBeInTheDocument();
      expect(screen.getByText('3 months')).toBeInTheDocument();
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
    });
  });

  it('renders empty state when no matches found', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { role: 'professional' },
    } as any);

    mockApiClient.getMatchingProjects.mockResolvedValue([]);

    renderWithRouter(<RecommendedProjects />);

    await waitFor(() => {
      expect(screen.getByText('No Matches Found')).toBeInTheDocument();
      expect(screen.getByText('Complete your profile with skills and experience to get better recommendations')).toBeInTheDocument();
      expect(screen.getByText('Update Profile')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { role: 'professional' },
    } as any);

    mockApiClient.getMatchingProjects.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<RecommendedProjects />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load project recommendations',
        variant: 'destructive',
      });
    });
  });
});
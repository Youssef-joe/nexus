import { render, screen, waitFor } from '@testing-library/react';
import { TalentMatching } from '../TalentMatching';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('@/hooks/use-toast');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockToast = jest.fn();

describe('TalentMatching', () => {
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockApiClient.getMatchingProfessionals.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<TalentMatching projectId="project123" />);

    expect(screen.getByText('Loading AI matches...')).toBeInTheDocument();
    expect(screen.getByText('AI Talent Matching')).toBeInTheDocument();
  });

  it('renders matching professionals successfully', async () => {
    const mockMatches = [
      {
        professional: {
          _id: 'prof1',
          firstName: 'John',
          lastName: 'Doe',
          skills: ['Leadership', 'Training'],
          rating: 4.5,
          completedProjects: 10,
          experience: 5,
          hourlyRate: 100,
        },
        matchScore: 85,
        matchLevel: 'very_good',
      },
    ];

    mockApiClient.getMatchingProfessionals.mockResolvedValue(mockMatches);

    render(<TalentMatching projectId="project123" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Very Good Match')).toBeInTheDocument();
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('5+ years')).toBeInTheDocument();
      expect(screen.getByText('$100/hr')).toBeInTheDocument();
    });
  });

  it('renders empty state when no matches found', async () => {
    mockApiClient.getMatchingProfessionals.mockResolvedValue([]);

    render(<TalentMatching projectId="project123" />);

    await waitFor(() => {
      expect(screen.getByText('No matching professionals found')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockApiClient.getMatchingProfessionals.mockRejectedValue(new Error('API Error'));

    render(<TalentMatching projectId="project123" />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load talent matches',
        variant: 'destructive',
      });
    });
  });

  it('displays correct match level colors and labels', async () => {
    const mockMatches = [
      {
        professional: {
          _id: 'prof1',
          firstName: 'Alice',
          lastName: 'Smith',
          skills: ['Leadership'],
          rating: 5,
          completedProjects: 20,
          experience: 10,
          hourlyRate: 150,
        },
        matchScore: 95,
        matchLevel: 'excellent',
      },
    ];

    mockApiClient.getMatchingProfessionals.mockResolvedValue(mockMatches);

    render(<TalentMatching projectId="project123" />);

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('Excellent Match')).toBeInTheDocument();
    });
  });

  it('limits skills display to 4 with overflow indicator', async () => {
    const mockMatches = [
      {
        professional: {
          _id: 'prof1',
          firstName: 'John',
          lastName: 'Doe',
          skills: ['Leadership', 'Training', 'Coaching', 'Management', 'Strategy', 'Communication'],
          rating: 4.5,
          completedProjects: 10,
          experience: 5,
          hourlyRate: 100,
        },
        matchScore: 85,
        matchLevel: 'very_good',
      },
    ];

    mockApiClient.getMatchingProfessionals.mockResolvedValue(mockMatches);

    render(<TalentMatching projectId="project123" />);

    await waitFor(() => {
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('Training')).toBeInTheDocument();
      expect(screen.getByText('Coaching')).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });
  });
});
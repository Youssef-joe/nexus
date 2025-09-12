import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from '../PaymentForm';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

// Mock dependencies
jest.mock('@/hooks/use-toast');
jest.mock('@/lib/api');
jest.mock('@stripe/react-stripe-js', () => ({
  ...jest.requireActual('@stripe/react-stripe-js'),
  useStripe: () => ({
    confirmCardPayment: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn().mockReturnValue({}),
  }),
  CardElement: () => <div data-testid="card-element">Card Element</div>,
}));

const mockToast = jest.fn();
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('PaymentForm', () => {
  const defaultProps = {
    projectId: 'project123',
    amount: 5000,
    projectTitle: 'Test Project',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  it('renders payment form correctly', () => {
    render(<PaymentForm {...defaultProps} />);

    expect(screen.getByText('Fund Project')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument(); // 5% platform fee
    expect(screen.getByTestId('card-element')).toBeInTheDocument();
  });

  it('calculates platform fee correctly', () => {
    render(<PaymentForm {...defaultProps} amount={10000} />);

    expect(screen.getByText('$500')).toBeInTheDocument(); // 5% of $10,000
  });

  it('handles cancel button click', () => {
    render(<PaymentForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('displays security notice', () => {
    render(<PaymentForm {...defaultProps} />);

    expect(screen.getByText('Your payment is secured by Stripe')).toBeInTheDocument();
  });
});
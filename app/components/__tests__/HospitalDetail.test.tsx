// File: app/components/__tests__/HospitalDetail.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { messages as frMessages } from '../../translations/fr';
import { messages as enMessages } from '../../translations/en';
import HospitalDetail from '../HospitalDetail';
import type { Hospital } from '../../types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock des utilitaires de navigation
vi.mock('../../utils/navigation-utils', () => ({
  openDirections: vi.fn(),
}));

// Mock Hospital de test
const mockHospital: Hospital = {
  id: '1',
  name: 'Test Hospital',
  nameEn: 'Test Hospital',
  nameFr: 'Hôpital de Test',
  status: 'Deployed',
  deploymentDate: '2023-06-15',
  website: 'https://test-hospital.com',
  coordinates: [2.3522, 48.8566] as [number, number],
  address: 'Paris, France',
  imageUrl: '/images/hospitals/test.png',
};

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nProvider i18n={i18n}>
      {component}
    </I18nProvider>
  );
};

describe('HospitalDetail', () => {
  beforeAll(() => {
    // Initialize i18n with messages
    i18n.loadAndActivate({ locale: 'en', messages: enMessages });
    i18n.load('fr', frMessages);
  });
  it('should render hospital information correctly', () => {
    renderWithI18n(<HospitalDetail hospital={mockHospital} />);

    // Hospital name is displayed
    expect(screen.getByText('Test Hospital')).toBeInTheDocument();

    // Status is displayed (as part of badge with date)
    expect(screen.getByText(/Deployed/i)).toBeInTheDocument();

    // Website link is present
    expect(screen.getByRole('link', { name: /website/i })).toBeInTheDocument();

    // Directions button is present
    expect(screen.getByRole('button', { name: /directions/i })).toBeInTheDocument();
  });

  it('should render null when hospital is null', () => {
    const { container } = renderWithI18n(<HospitalDetail hospital={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display website link when available', () => {
    renderWithI18n(<HospitalDetail hospital={mockHospital} />);
    
    const websiteLink = screen.getByRole('link', { name: /website/i });
    expect(websiteLink).toHaveAttribute('href', 'https://test-hospital.com');
  });

  it('should show deployment status badge', () => {
    renderWithI18n(<HospitalDetail hospital={mockHospital} />);

    // Status is shown as part of text with date, so use partial match
    expect(screen.getByText(/Deployed/i)).toBeInTheDocument();

    // Check for the status badge container with correct classes
    const statusBadge = screen.getByText(/Deployed/i).closest('span');
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-500');
  });

  it('should handle signed status correctly', () => {
    const signedHospital = { ...mockHospital, status: 'Signed' as const };
    renderWithI18n(<HospitalDetail hospital={signedHospital} />);

    // Status is shown as part of text with date
    expect(screen.getByText(/Signed/i)).toBeInTheDocument();

    // Check for the status badge container (Signed gets green colors)
    const statusBadge = screen.getByText(/Signed/i).closest('span');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-500');
  });

  it('should apply custom className', () => {
    const { container } = renderWithI18n(
      <HospitalDetail hospital={mockHospital} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

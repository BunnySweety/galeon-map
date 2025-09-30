// File: app/utils/__tests__/export-utils.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToJSON, exportFilteredHospitals } from '../export-utils';
import type { Hospital } from '../../types';

// Mock dependencies
const mockSaveAs = vi.fn();
vi.mock('file-saver', () => ({
  saveAs: mockSaveAs,
}));

vi.mock('../logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock date-utils
vi.mock('../date-utils', () => ({
  formatDateWithLocale: vi.fn((date, format, locale) => {
    if (locale === 'fr') {
      return '15 juin 2023';
    }
    return 'June 15, 2023';
  }),
}));

// Create mock hospital data
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Hospital A',
    nameEn: 'Hospital A',
    nameFr: 'Hôpital A',
    status: 'Deployed' as const,
    deploymentDate: '2023-06-15',
    website: 'https://hospital-a.com',
    coordinates: [2.3522, 48.8566] as [number, number],
    address: '123 Main St, Paris',
    imageUrl: '/images/hospital-a.png',
  },
  {
    id: '2',
    name: 'Hospital B',
    nameEn: 'Hospital B',
    nameFr: 'Hôpital B',
    status: 'Signed' as const,
    deploymentDate: '2023-07-01',
    website: 'https://hospital-b.com',
    coordinates: [2.2945, 48.8584] as [number, number],
    address: '456 Oak Ave, Paris',
    imageUrl: '/images/hospital-b.png',
  },
];

describe('export-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current date
    vi.setSystemTime(new Date('2023-08-15'));
  });

  describe('exportToCSV', () => {
    it('should export hospitals to CSV format with English locale', async () => {
      const exportData = {
        hospitals: mockHospitals,
        locale: 'en',
        translations: {
          'Hospital Name': 'Hospital Name',
          'Status': 'Status',
          'Address': 'Address',
          'Deployment Date': 'Deployment Date',
          'Website': 'Website',
          'Coordinates': 'Coordinates',
          'Export Information': 'Export Information',
          'Export Date': 'Export Date',
          'Total Hospitals': 'Total Hospitals',
          'Deployed Hospitals': 'Deployed Hospitals',
          'Signed Hospitals': 'Signed Hospitals',
        },
      };

      await exportToCSV(exportData);

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
      const [blob, filename] = mockSaveAs.mock.calls[0];

      // Check filename format
      expect(filename).toMatch(/^galeon-hospitals-\d{4}-\d{2}-\d{2}\.csv$/);

      // Check blob type
      expect(blob.type).toBe('text/csv;charset=utf-8');

      // Read blob content
      const text = await blob.text();
      
      // Check CSV headers
      expect(text).toContain('Hospital Name,Status,Address,Deployment Date,Website,Coordinates');
      
      // Check hospital data
      expect(text).toContain('Hospital A,Deployed,123 Main St, Paris');
      expect(text).toContain('Hospital B,Signed,456 Oak Ave, Paris');
      
      // Check coordinates format
      expect(text).toContain('48.8566, 2.3522'); // lat, lon format
      
      // Check metadata section
      expect(text).toContain('Export Information');
      expect(text).toContain('Total Hospitals,2');
      expect(text).toContain('Deployed Hospitals,1');
      expect(text).toContain('Signed Hospitals,1');
    });

    it('should export hospitals to CSV format with French locale', async () => {
      const exportData = {
        hospitals: mockHospitals,
        locale: 'fr',
        translations: {
          'Hospital Name': 'Nom de l\'hôpital',
          'Status': 'Statut',
          'Address': 'Adresse',
          'Deployment Date': 'Date de déploiement',
          'Website': 'Site web',
          'Coordinates': 'Coordonnées',
          'Export Information': 'Informations d\'export',
          'Export Date': 'Date d\'export',
          'Total Hospitals': 'Total des hôpitaux',
          'Deployed Hospitals': 'Hôpitaux déployés',
          'Signed Hospitals': 'Hôpitaux signés',
        },
      };

      await exportToCSV(exportData);

      const [blob, filename] = mockSaveAs.mock.calls[0];

      // Check French filename
      expect(filename).toMatch(/^galeon-hopitaux-\d{4}-\d{2}-\d{2}\.csv$/);

      const text = await blob.text();
      
      // Check French headers
      expect(text).toContain('Nom de l\'hôpital,Statut,Adresse');
      
      // Check French status translations
      expect(text).toContain('Hôpital A,Déployé');
      expect(text).toContain('Hôpital B,Signé');
      
      // Check French metadata
      expect(text).toContain('Informations d\'export');
      expect(text).toContain('Total des hôpitaux,2');
    });

    it('should handle CSV escaping properly', async () => {
      const hospitalWithSpecialChars: Hospital = {
        ...mockHospitals[0],
        name: 'Hospital "Special", Inc.',
        address: 'Street with, commas and "quotes"',
      };

      const exportData = {
        hospitals: [hospitalWithSpecialChars],
        locale: 'en',
        translations: { 'Hospital Name': 'Hospital Name', 'Address': 'Address' },
      };

      await exportToCSV(exportData);

      const [blob] = mockSaveAs.mock.calls[0];
      const text = await blob.text();

      // Check that quotes and commas are properly escaped
      expect(text).toContain('"Hospital ""Special"", Inc."');
      expect(text).toContain('"Street with, commas and ""quotes"""');
    });

    it('should include UTF-8 BOM for Excel compatibility', async () => {
      const exportData = {
        hospitals: mockHospitals,
        locale: 'en',
        translations: {},
      };

      await exportToCSV(exportData);

      const [blob] = mockSaveAs.mock.calls[0];
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Check for UTF-8 BOM (EF BB BF)
      expect(uint8Array[0]).toBe(0xEF);
      expect(uint8Array[1]).toBe(0xBB);
      expect(uint8Array[2]).toBe(0xBF);
    });
  });

  describe('exportToJSON', () => {
    it('should export hospitals to JSON format with metadata', () => {
      const exportData = {
        hospitals: mockHospitals,
        locale: 'en',
        translations: {},
      };

      exportToJSON(exportData);

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
      const [blob, filename] = mockSaveAs.mock.calls[0];

      // Check filename format
      expect(filename).toMatch(/^galeon-hospitals-\d{4}-\d{2}-\d{2}\.json$/);

      // Check blob type
      expect(blob.type).toBe('application/json');
    });

    it('should include correct metadata in JSON export', async () => {
      const exportData = {
        hospitals: mockHospitals,
        locale: 'en',
        translations: {},
      };

      exportToJSON(exportData);

      const [blob] = mockSaveAs.mock.calls[0];
      const text = await blob.text();
      const data = JSON.parse(text);

      expect(data.metadata).toEqual({
        exportDate: expect.any(String),
        totalHospitals: 2,
        deployedHospitals: 1,
        signedHospitals: 1,
        locale: 'en',
        version: '1.0',
      });

      expect(data.hospitals).toHaveLength(2);
      expect(data.hospitals[0]).toMatchObject({
        id: '1',
        name: 'Hospital A',
        status: 'Deployed',
        exportedAt: expect.any(String),
      });
    });

    it('should use French locale and translations in JSON export', async () => {
      const exportData = {
        hospitals: mockHospitals,
        locale: 'fr',
        translations: {},
      };

      exportToJSON(exportData);

      const [blob, filename] = mockSaveAs.mock.calls[0];

      // Check French filename
      expect(filename).toMatch(/^galeon-hopitaux-\d{4}-\d{2}-\d{2}\.json$/);

      const text = await blob.text();
      const data = JSON.parse(text);

      expect(data.metadata.locale).toBe('fr');
      expect(data.hospitals[0].name).toBe('Hôpital A'); // French name
      expect(data.hospitals[0].status).toBe('Déployé'); // French status
      expect(data.hospitals[1].status).toBe('Signé'); // French status
    });
  });

  describe('exportFilteredHospitals', () => {
    it('should filter hospitals by status and date before export', async () => {
      const allHospitals: Hospital[] = [
        ...mockHospitals,
        {
          ...mockHospitals[0],
          id: '3',
          status: 'Deployed' as const,
          deploymentDate: '2023-09-01', // Future date
        },
      ];

      await exportFilteredHospitals(
        allHospitals,
        '2023-07-15', // Current date
        { deployed: true, signed: false }, // Only deployed
        'en',
        {},
        'csv'
      );

      const [blob] = mockSaveAs.mock.calls[0];
      const text = await blob.text();

      // Should only include Hospital A (deployed and before current date)
      expect(text).toContain('Hospital A');
      expect(text).not.toContain('Hospital B'); // Signed but signed filter is false
      expect(text).not.toContain('Hospital C'); // Future date
    });

    it('should call correct export function based on format', async () => {
      const exportData = {
        hospitals: mockHospitals,
        currentDate: '2023-08-15',
        selectedFilters: { deployed: true, signed: true },
        locale: 'en',
        translations: {},
      };

      // Test CSV export
      await exportFilteredHospitals(
        mockHospitals,
        exportData.currentDate,
        exportData.selectedFilters,
        exportData.locale,
        exportData.translations,
        'csv'
      );

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
      let [blob] = mockSaveAs.mock.calls[0];
      expect(blob.type).toBe('text/csv;charset=utf-8');

      vi.clearAllMocks();

      // Test JSON export
      await exportFilteredHospitals(
        mockHospitals,
        exportData.currentDate,
        exportData.selectedFilters,
        exportData.locale,
        exportData.translations,
        'json'
      );

      expect(mockSaveAs).toHaveBeenCalledTimes(1);
      [blob] = mockSaveAs.mock.calls[0];
      expect(blob.type).toBe('application/json');
    });

    it('should handle invalid dates gracefully', async () => {
      const hospitalWithInvalidDate: Hospital = {
        ...mockHospitals[0],
        deploymentDate: 'invalid-date',
      };

      await exportFilteredHospitals(
        [hospitalWithInvalidDate],
        '2023-07-15',
        { deployed: true, signed: true },
        'en',
        {},
        'csv'
      );

      const [blob] = mockSaveAs.mock.calls[0];
      const text = await blob.text();

      // Should not include hospital with invalid date
      expect(text).not.toContain('Hospital A');
    });
  });
});

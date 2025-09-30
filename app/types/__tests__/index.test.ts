// File: app/types/__tests__/index.test.ts
import { describe, it, expect } from 'vitest';
import { HospitalSchema, Hospital } from '../../api/hospitals/data';
import type { HospitalStatus, LocaleType } from '../index';

describe('Types Centralisés', () => {
  describe('Hospital Schema Validation', () => {
    it('should validate a correct hospital object', () => {
      const validHospital = {
        id: '1',
        name: 'Test Hospital',
        nameEn: 'Test Hospital',
        nameFr: 'Hôpital de Test',
        status: 'Deployed' as const,
        deploymentDate: '2023-06-15',
        website: 'https://test-hospital.com',
        coordinates: [2.3522, 48.8566] as [number, number],
        address: 'Paris, France',
        imageUrl: '/images/hospitals/test.png',
      };

      const result = HospitalSchema.safeParse(validHospital);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validHospital);
      }
    });

    it('should reject invalid coordinates', () => {
      const invalidHospital = {
        id: '1',
        name: 'Test Hospital',
        nameEn: 'Test Hospital',
        nameFr: 'Hôpital de Test',
        status: 'Deployed' as const,
        deploymentDate: '2023-06-15',
        website: 'https://test-hospital.com',
        coordinates: [2.3522], // Manque une coordonnée
        address: 'Paris, France',
        imageUrl: '/images/hospitals/test.png',
      };

      const result = HospitalSchema.safeParse(invalidHospital);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalidHospital = {
        id: '1',
        name: 'Test Hospital',
        nameEn: 'Test Hospital',
        nameFr: 'Hôpital de Test',
        status: 'InvalidStatus',
        deploymentDate: '2023-06-15',
        website: 'https://test-hospital.com',
        coordinates: [2.3522, 48.8566],
        address: 'Paris, France',
        imageUrl: '/images/hospitals/test.png',
      };

      const result = HospitalSchema.safeParse(invalidHospital);
      expect(result.success).toBe(false);
    });

    it('should require valid website URL', () => {
      const invalidHospital = {
        id: '1',
        name: 'Test Hospital',
        nameEn: 'Test Hospital',
        nameFr: 'Hôpital de Test',
        status: 'Deployed' as const,
        deploymentDate: '2023-06-15',
        website: 'not-a-url',
        coordinates: [2.3522, 48.8566] as [number, number],
        address: 'Paris, France',
        imageUrl: '/images/hospitals/test.png',
      };

      const result = HospitalSchema.safeParse(invalidHospital);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Definitions', () => {
    it('should have correct HospitalStatus values', () => {
      const deployed: HospitalStatus = 'Deployed';
      const signed: HospitalStatus = 'Signed';
      
      expect(deployed).toBe('Deployed');
      expect(signed).toBe('Signed');
      
      // TypeScript compilation s'assure que seules ces valeurs sont acceptées
    });

    it('should have correct LocaleType values', () => {
      const english: LocaleType = 'en';
      const french: LocaleType = 'fr';
      
      expect(english).toBe('en');
      expect(french).toBe('fr');
      
      // TypeScript compilation s'assure que seules ces valeurs sont acceptées
    });

    it('should maintain Hospital type consistency', () => {
      // Test que le type Hospital du schema Zod est bien exporté
      const hospital: Hospital = {
        id: '1',
        name: 'Test Hospital',
        nameEn: 'Test Hospital',
        nameFr: 'Hôpital de Test',
        status: 'Deployed',
        deploymentDate: '2023-06-15',
        website: 'https://test-hospital.com',
        coordinates: [2.3522, 48.8566],
        address: 'Paris, France',
        imageUrl: '/images/hospitals/test.png',
      };

      // Vérifier que l'objet respecte bien le type
      expect(hospital.coordinates).toHaveLength(2);
      expect(typeof hospital.coordinates[0]).toBe('number');
      expect(typeof hospital.coordinates[1]).toBe('number');
      expect(['Deployed', 'Signed']).toContain(hospital.status);
    });
  });
});

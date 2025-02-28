// File: app/utils/exportUtils.ts
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import type { Hospital } from '../store/useMapStore';

/**
 * Types d'export supportés
 */
export type ExportType = 'pdf' | 'xls' | 'json';

/**
 * Interface pour les données d'hôpital formatées pour l'export
 */
export interface HospitalExportData {
  name: string;
  status: string;
  deploymentDate: string;
  website: string;
  address: string;
}

/**
 * Options pour l'export des données
 */
export interface ExportOptions {
  fileName?: string;
  language?: 'en' | 'fr';
  includeHeaders?: boolean;
}

/**
 * Prépare les données des hôpitaux pour l'export
 * @param hospitals La liste des hôpitaux à exporter
 * @param exportType Le type d'export (pdf, xls, json)
 * @returns Les données formatées pour l'export
 */
export function prepareExportData(
  hospitals: Hospital[], 
  exportType: ExportType
): HospitalExportData[] {
  return hospitals.map(hospital => ({
    name: hospital.name,
    status: hospital.status,
    deploymentDate: format(
      new Date(hospital.deploymentDate), 
      exportType === 'xls' ? 'yyyy-MM-dd' : 'dd/MM/yyyy'
    ),
    website: hospital.website,
    address: hospital.address
  }));
}

/**
 * Exporte les données au format JSON
 * @param hospitals La liste des hôpitaux à exporter
 * @param options Options d'export
 */
export function exportAsJSON(
  hospitals: Hospital[], 
  options: ExportOptions = {}
): void {
  const data = prepareExportData(hospitals, 'json');
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const fileName = options.fileName || `hospitals-data-${currentDate}.json`;
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  
  saveAs(blob, fileName);
}

/**
 * Exporte les données au format CSV/Excel
 * @param hospitals La liste des hôpitaux à exporter
 * @param options Options d'export
 */
export function exportAsCSV(
  hospitals: Hospital[], 
  options: ExportOptions = {}
): void {
  const data = prepareExportData(hospitals, 'xls');
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const fileName = options.fileName || `hospitals-data-${currentDate}.csv`;
  
  // Création de l'en-tête du CSV
  const headers = Object.keys(data[0]);
  
  // Traduction des en-têtes si nécessaire
  const translatedHeaders = options.language === 'fr'
    ? headers.map(header => {
        switch(header) {
          case 'name': return 'nom';
          case 'status': return 'statut';
          case 'deploymentDate': return 'dateDéploiement';
          case 'website': return 'siteWeb';
          case 'address': return 'adresse';
          default: return header;
        }
      })
    : headers;
    
  // Création des lignes
  const rows = data.map(item => Object.values(item).join(','));
  
  // Assemblage du CSV (avec ou sans en-têtes)
  const csvContent = options.includeHeaders !== false
    ? `${translatedHeaders.join(',')}\n${rows.join('\n')}`
    : rows.join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, fileName);
}

/**
 * Crée le contenu HTML pour l'export PDF
 * @param hospitals La liste des hôpitaux à exporter
 * @param language La langue de l'export (en/fr)
 * @returns Le contenu HTML formaté pour le PDF
 */
export function createPDFContent(
  hospitals: Hospital[], 
  language: 'en' | 'fr' = 'en'
): string {
  const data = prepareExportData(hospitals, 'pdf');
  const today = format(new Date(), language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy');
  const title = language === 'fr' ? 'Carte des Hôpitaux' : 'Hospitals Map';
  
  const tableHeader = language === 'fr' 
    ? ['NOM', 'STATUT', 'DATE DE DÉPLOIEMENT', 'SITE WEB'] 
    : ['NAME', 'STATUS', 'DEPLOYMENT DATE', 'WEBSITE'];
    
  const statusLabel = (status: string) => {
    if (language === 'fr') {
      return status === 'Deployed' ? 'Déployé' : 'Signé';
    }
    return status;
  };
  
  // Création des lignes du tableau
  const tableRows = data.map(hospital => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: left;">${hospital.name}</td>
      <td style="padding: 12px; text-align: left;">
        <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 9999px; font-size: 12px; 
          background-color: ${hospital.status === 'Deployed' ? '#dbeafe' : '#d1fae5'}; 
          color: ${hospital.status === 'Deployed' ? '#3b82f6' : '#10b981'};">
          ${statusLabel(hospital.status)}
        </span>
      </td>
      <td style="padding: 12px; text-align: left;">${hospital.deploymentDate}</td>
      <td style="padding: 12px; text-align: left;">
        <a href="${hospital.website}" style="color: #3b82f6; text-decoration: none;">
          ${hospital.website.replace(/^https?:\/\//, '')}
        </a>
      </td>
    </tr>
  `).join('');
  
  // Création du contenu HTML pour le PDF
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>GALEON ${title} - ${today}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .header {
          background-color: #3b82f6;
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .logo {
          display: flex;
          align-items: center;
        }
        .logo-symbol {
          font-size: 28px;
          font-weight: bold;
          margin-right: 8px;
        }
        .date {
          font-size: 14px;
          opacity: 0.8;
        }
        .container {
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background-color: #f8fafc;
        }
        thead {
          background-color: #e5e7eb;
        }
        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #4b5563;
        }
        .footer {
          margin-top: 40px;
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <span class="logo-symbol">Ω</span>
          <h1>GALEON ${title}</h1>
        </div>
        <div class="date">${today}</div>
      </div>
      
      <div class="container">
        <p>${language === 'fr' ? 
          'Liste des hôpitaux répartis par statut et date de déploiement.' : 
          'List of hospitals distributed by status and deployment date.'
        }</p>
        
        <table>
          <thead>
            <tr>
              ${tableHeader.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="footer">
          © 2025 Galeon Community - ${language === 'fr' ? 'Projet open source' : 'Open source project'}<br>
          ${language === 'fr' ? 'Fait avec' : 'Made with'} ♥ ${language === 'fr' ? 'par' : 'by'} BunnySweety
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Exporte les données au format PDF (simulation)
 * @param hospitals La liste des hôpitaux à exporter
 * @param options Options d'export
 */
export function exportAsPDF(
  hospitals: Hospital[], 
  options: ExportOptions = {}
): void {
  const language = options.language || 'en';
  const htmlContent = createPDFContent(hospitals, language);
  
  // Dans une application réelle, nous utiliserions jsPDF pour convertir en PDF
  // Pour l'instant, nous ouvrons simplement une nouvelle fenêtre pour la démo
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    setTimeout(() => {
      newWindow.print();
    }, 500);
  }
}

/**
 * Fonction principale pour exporter les données dans différents formats
 * @param hospitals La liste des hôpitaux à exporter
 * @param exportType Le type d'export souhaité
 * @param options Options d'export
 */
export function exportData(
  hospitals: Hospital[], 
  exportType: ExportType,
  options: ExportOptions = {}
): void {
  switch (exportType) {
    case 'json':
      exportAsJSON(hospitals, options);
      break;
      
    case 'xls':
      exportAsCSV(hospitals, options);
      break;
      
    case 'pdf':
      exportAsPDF(hospitals, options);
      break;
      
    default:
      console.error(`Type d'export non supporté: ${exportType}`);
  }
}
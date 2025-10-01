// Native CSV export implementation (XLSX removed for security)
import { saveAs } from 'file-saver';
import type { Hospital } from '../types';
import { formatDateWithLocale, SupportedLocale } from './date-utils';
import logger from './logger';

// Dynamic imports for jsPDF to reduce initial bundle size
type jsPDFType = typeof import('jspdf').default;
type AutoTableType = typeof import('jspdf-autotable').autoTable;

// Lazy load jsPDF and autoTable
const loadPDFLibraries = async (): Promise<{ jsPDF: jsPDFType; autoTable: AutoTableType }> => {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  return {
    jsPDF: jsPDFModule.default,
    autoTable: autoTableModule.autoTable,
  };
};

// Native CSV utilities for secure export
const escapeCsvValue = (value: string): string => {
  // Escape CSV values properly to prevent injection
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const arrayToCsv = (data: string[][]): string => {
  return data.map(row => row.map(escapeCsvValue).join(',')).join('\n');
};

export interface ExportData {
  hospitals: Hospital[];
  locale: string;
  translations: {
    [key: string]: string;
  };
}

// Utility function to get translated hospital name
const getHospitalName = (hospital: Hospital, locale: string): string => {
  return locale === 'fr' ? hospital.nameFr : hospital.nameEn;
};

// Utility function to format date with locale support
const formatDate = (dateString: string, locale: string = 'en'): string => {
  try {
    const date = new Date(dateString);
    // Use different format for French: "15 juin 2023" vs English: "June 15, 2023"
    const format = locale === 'fr' ? 'd MMMM yyyy' : 'MMMM d, yyyy';
    return formatDateWithLocale(date, format, locale as SupportedLocale);
  } catch {
    return dateString;
  }
};

// Function to load image as base64 with ultra-high quality
const loadImageAsBase64 = (
  imagePath: string,
  targetWidth?: number,
  targetHeight?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use ultra-high resolution for maximum sharpness
      const scale = 4; // Fixed 4x scale for ultra-sharp rendering
      const width = targetWidth ?? img.width;
      const height = targetHeight ?? img.height;

      // Set canvas size with ultra-high resolution
      canvas.width = width * scale;
      canvas.height = height * scale;

      // Disable image smoothing for pixel-perfect rendering
      ctx.imageSmoothingEnabled = false;

      // Draw image at ultra-high resolution
      ctx.drawImage(img, 0, 0, width * scale, height * scale);

      // Create a second canvas for final high-quality downsampling
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');

      if (!finalCtx) {
        reject(new Error('Could not get final canvas context'));
        return;
      }

      finalCanvas.width = width;
      finalCanvas.height = height;

      // Enable high-quality smoothing for downsampling
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';

      // Downsample with high quality
      finalCtx.drawImage(canvas, 0, 0, width * scale, height * scale, 0, 0, width, height);

      // Export as maximum quality PNG
      const dataURL = finalCanvas.toDataURL('image/png', 1.0);
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

// Function to draw the Galeon logo using PNG image
const drawGaleonLogo = async (
  doc: InstanceType<jsPDFType>,
  x: number,
  y: number,
  scale: number = 1
) => {
  try {
    // Calculate target dimensions for ultra-high quality
    const targetWidth = 200; // Ultra-high resolution base width
    const targetHeight = 173; // Ultra-high resolution base height
    const finalWidth = 22 * scale; // Slightly larger logo size
    const finalHeight = 19 * scale; // Slightly larger logo size

    // Load the PNG logo with ultra-high resolution
    const logoBase64 = await loadImageAsBase64('/logo-white.png', targetWidth, targetHeight);

    // Add the PNG image to the PDF with maximum quality
    doc.addImage(logoBase64, 'PNG', x, y, finalWidth, finalHeight, undefined, 'NONE');
  } catch (error) {
    logger.warn('Could not load PNG logo, using high-quality vector fallback');

    // High-quality vector fallback logo drawing (smaller size)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3 * scale); // Very thin lines for crisp appearance

    const width = 22 * scale; // Slightly larger fallback size to match PNG
    const height = 19 * scale;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = height * 0.35;

    // Draw high-quality omega shape with smoother curves
    // Main body - use multiple small arcs for smoother appearance
    const steps = 20;
    const startAngle = Math.PI * 0.15;
    const endAngle = Math.PI * 0.85;
    const angleStep = (endAngle - startAngle) / steps;

    doc.setLineWidth(1.5 * scale);
    for (let i = 0; i < steps; i++) {
      const angle1 = startAngle + i * angleStep;
      const angle2 = startAngle + (i + 1) * angleStep;
      const x1 = centerX + Math.cos(angle1) * radius;
      const y1 = centerY + Math.sin(angle1) * radius;
      const x2 = centerX + Math.cos(angle2) * radius;
      const y2 = centerY + Math.sin(angle2) * radius;
      doc.line(x1, y1, x2, y2);
    }

    // Draw the feet with rounded corners
    doc.setFillColor(255, 255, 255);
    const footWidth = width * 0.12;
    const footHeight = height * 0.3;

    // Left foot with rounded corners
    doc.roundedRect(x + width * 0.2, y + height * 0.7, footWidth, footHeight, 1, 1, 'F');

    // Right foot with rounded corners
    doc.roundedRect(x + width * 0.68, y + height * 0.7, footWidth, footHeight, 1, 1, 'F');
  }
};

// Export to PDF
export const exportToPDF = async (data: ExportData): Promise<void> => {
  const { hospitals, locale } = data;

  // Dynamically load jsPDF and autoTable
  const { jsPDF, autoTable } = await loadPDFLibraries();
  const doc = new jsPDF('landscape'); // Use landscape orientation like the CSS (841.89px x 595.28px)

  // Set font - using Times as closest approximation to MinionPro
  // Note: For full MinionPro support, the font would need to be embedded in jsPDF
  // Using Times as it has similar serif characteristics to MinionPro
  doc.setFont('times');

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Background color matching CSS (#EBF4FD)
  doc.setFillColor(235, 244, 253);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Blue header background (#479AF3) - exact CSS match
  const headerHeight = 103.93 * (pageHeight / 595.28); // Scale header proportionally
  doc.setFillColor(71, 154, 243);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Header content
  doc.setTextColor(245, 251, 255); // #F5FBFF

  // Title with MinionPro-like font (using Times as approximation)
  doc.setFontSize(24);
  doc.setFont('times', 'normal');
  const titleY = headerHeight * 0.6;

  // Calculate logo position to align with text baseline
  const logoHeight = 19 * 0.8; // Logo height with scale
  const logoY = titleY - logoHeight / 2 - 2; // Center logo with text, slight adjustment

  // Draw Galeon logo aligned with title baseline
  await drawGaleonLogo(doc, 20, logoY, 0.8);

  // Create neon effect for "HOSPITALS MAP" part with internationalization
  const galeonText = 'GALEON ';
  const hospitalsMapText = locale === 'fr' ? 'CARTE DES HÔPITAUX' : 'HOSPITALS MAP';

  // Draw "GALEON" normally
  doc.setTextColor(245, 251, 255); // #F5FBFF
  doc.text(galeonText, 45, titleY);

  // Calculate position for "HOSPITALS MAP"
  const galeonWidth = doc.getTextWidth(galeonText);
  const hospitalsMapX = 45 + galeonWidth;

  // Create neon effect for "HOSPITALS MAP"
  // Outer glow (multiple layers for neon effect)
  doc.setTextColor(100, 200, 255); // Light blue glow
  for (let i = 0; i < 3; i++) {
    const offset = (i + 1) * 0.3;
    doc.text(hospitalsMapText, hospitalsMapX + offset, titleY + offset);
    doc.text(hospitalsMapText, hospitalsMapX - offset, titleY + offset);
    doc.text(hospitalsMapText, hospitalsMapX + offset, titleY - offset);
    doc.text(hospitalsMapText, hospitalsMapX - offset, titleY - offset);
  }

  // Inner bright core
  doc.setTextColor(200, 240, 255); // Bright cyan
  doc.text(hospitalsMapText, hospitalsMapX, titleY);

  // Final bright white core
  doc.setTextColor(255, 255, 255); // Pure white
  doc.text(hospitalsMapText, hospitalsMapX, titleY);

  // Current date in top right (positioned like CSS) with internationalization
  const currentDate = formatDate(new Date().toISOString(), locale);
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  const dateWidth = doc.getTextWidth(currentDate);
  doc.text(currentDate, pageWidth - dateWidth - 30, headerHeight * 0.6);

  // Table headers with internationalization
  const tableHeaders = [
    locale === 'fr' ? 'NOM' : 'NAME',
    locale === 'fr' ? 'STATUT' : 'STATUS',
    locale === 'fr' ? 'DATE DE DÉPLOIEMENT' : 'DEPLOYMENT DATE',
    locale === 'fr' ? 'SITE WEB' : 'WEBSITE',
  ];

  const tableData = hospitals.map(hospital => [
    getHospitalName(hospital, locale),
    locale === 'fr'
      ? hospital.status === 'Deployed'
        ? 'Déployé'
        : hospital.status === 'Signed'
          ? 'Signé'
          : hospital.status
      : hospital.status,
    hospital.deploymentDate ? formatDate(hospital.deploymentDate, locale) : '',
    hospital.website ?? '',
  ]);

  // Add table with exact CSS styling
  autoTable(doc as any, {
    head: [tableHeaders],
    body: tableData,
    startY: headerHeight + 5,
    styles: {
      fontSize: 10,
      cellPadding: 6,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      textColor: [13, 15, 32], // #0D0F20
      fontStyle: 'normal',
      font: 'times', // Use Times as MinionPro approximation
    },
    headStyles: {
      fillColor: [235, 244, 253], // #EBF4FD (same as background)
      textColor: [13, 15, 32], // #0D0F20
      fontStyle: 'bold',
      fontSize: 12,
      halign: 'center', // Center the column headers
      valign: 'bottom',
      font: 'times', // Use Times as MinionPro approximation
    },
    bodyStyles: {
      fillColor: [235, 244, 253], // #EBF4FD
      valign: 'middle',
      halign: 'center', // Center all body content
    },
    alternateRowStyles: {
      fillColor: [218, 235, 253], // #DAEBFD
    },
    columnStyles: {
      0: {
        cellWidth: pageWidth * 0.3, // NAME - 30% (reduced to make room)
        halign: 'center',
      },
      1: {
        cellWidth: pageWidth * 0.12, // STATUS - 12% (reduced)
        halign: 'center',
      },
      2: {
        cellWidth: pageWidth * 0.28, // DEPLOYMENT DATE - 28% (increased for French text)
        halign: 'center',
      },
      3: {
        cellWidth: pageWidth * 0.3, // WEBSITE - 30%
        halign: 'center',
      },
    },
    margin: { left: 0, right: 0 },
    tableWidth: 'auto',
    theme: 'plain',
    showHead: 'everyPage',
  });

  // Footer with page number (centered at 95% like CSS)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(12);
    doc.setTextColor(13, 15, 32); // #0D0F20
    doc.setFont('times', 'normal');

    // Center the page number at 95% height like CSS
    const pageText = i.toString();
    const textWidth = doc.getTextWidth(pageText);
    doc.text(pageText, (pageWidth - textWidth) / 2, pageHeight * 0.95);
  }

  // Save the PDF with internationalized filename
  const filenamePrefix = locale === 'fr' ? 'galeon-hopitaux' : 'galeon-hospitals';
  const filename = `${filenamePrefix}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Export to CSV (Excel compatible, secure replacement for XLSX)
export const exportToCSV = async (data: ExportData): Promise<void> => {
  const { hospitals, locale, translations } = data;

  // Prepare CSV data with headers
  const headers = [
    translations['Hospital Name'] ?? 'Hospital Name',
    translations['Status'] ?? 'Status',
    translations['Address'] ?? 'Address',
    translations['Deployment Date'] ?? 'Deployment Date',
    translations['Website'] ?? 'Website',
    translations['Coordinates'] ?? 'Coordinates',
  ];

  // Prepare data rows
  const dataRows = hospitals.map(hospital => [
    getHospitalName(hospital, locale),
    locale === 'fr'
      ? hospital.status === 'Deployed'
        ? 'Déployé'
        : hospital.status === 'Signed'
          ? 'Signé'
          : hospital.status
      : hospital.status,
    hospital.address ?? '',
    hospital.deploymentDate ? formatDate(hospital.deploymentDate, locale) : '',
    hospital.website ?? '',
    hospital.coordinates ? `${hospital.coordinates[1]}, ${hospital.coordinates[0]}` : '',
  ]);

  // Combine headers and data
  const csvData = [headers, ...dataRows];

  // Convert to CSV string
  const csvContent = arrayToCsv(csvData);

  // Add metadata section
  const metadataSection = [
    [''],
    [translations['Export Information'] ?? 'Export Information'],
    [translations['Export Date'] ?? 'Export Date', formatDate(new Date().toISOString(), locale)],
    [translations['Total Hospitals'] ?? 'Total Hospitals', hospitals.length.toString()],
    [
      translations['Deployed Hospitals'] ?? 'Deployed Hospitals',
      hospitals.filter(h => h.status === 'Deployed').length.toString(),
    ],
    [
      translations['Signed Hospitals'] ?? 'Signed Hospitals',
      hospitals.filter(h => h.status === 'Signed').length.toString(),
    ],
  ];

  const fullCsvContent = csvContent + '\n' + arrayToCsv(metadataSection);

  // Create and download CSV file (Excel compatible with UTF-8 BOM)
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + fullCsvContent], {
    type: 'text/csv;charset=utf-8',
  });

  const filenamePrefix = locale === 'fr' ? 'galeon-hopitaux' : 'galeon-hospitals';
  const filename = `${filenamePrefix}-${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, filename);
};

// Export to JSON (enhanced version)
export const exportToJSON = (data: ExportData): void => {
  const { hospitals, locale } = data;

  // Prepare enhanced JSON data
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalHospitals: hospitals.length,
      deployedHospitals: hospitals.filter(h => h.status === 'Deployed').length,
      signedHospitals: hospitals.filter(h => h.status === 'Signed').length,
      locale: locale,
      version: '1.0',
    },
    hospitals: hospitals.map(hospital => ({
      id: hospital.id,
      name: getHospitalName(hospital, locale),
      nameFr: hospital.nameFr,
      nameEn: hospital.nameEn,
      status:
        locale === 'fr'
          ? hospital.status === 'Deployed'
            ? 'Déployé'
            : hospital.status === 'Signed'
              ? 'Signé'
              : hospital.status
          : hospital.status,
      address: hospital.address,
      deploymentDate: hospital.deploymentDate,
      website: hospital.website,
      coordinates: hospital.coordinates,
      exportedAt: new Date().toISOString(),
    })),
  };

  // Create and download JSON file with internationalized filename
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filenamePrefix = locale === 'fr' ? 'galeon-hopitaux' : 'galeon-hospitals';
  const filename = `${filenamePrefix}-${new Date().toISOString().split('T')[0]}.json`;
  saveAs(blob, filename);
};

// Export filtered hospitals based on current view
export const exportFilteredHospitals = async (
  hospitals: Hospital[],
  currentDate: string,
  selectedFilters: { deployed: boolean; signed: boolean },
  locale: string,
  translations: { [key: string]: string },
  format: 'pdf' | 'csv' | 'json'
): Promise<void> => {
  // Filter hospitals based on current view
  const filteredHospitals = hospitals.filter(hospital => {
    // Filter by status
    const statusMatch =
      (hospital.status === 'Deployed' && selectedFilters.deployed) ||
      (hospital.status === 'Signed' && selectedFilters.signed);

    if (!statusMatch) return false;

    // Filter by date
    try {
      const current = new Date(currentDate);
      current.setUTCHours(0, 0, 0, 0);
      const hospitalDate = new Date(hospital.deploymentDate);
      hospitalDate.setUTCHours(0, 0, 0, 0);
      return hospitalDate <= current;
    } catch {
      return false;
    }
  });

  const exportData: ExportData = {
    hospitals: filteredHospitals,
    locale,
    translations,
  };

  switch (format) {
    case 'pdf':
      await exportToPDF(exportData);
      break;
    case 'csv':
      await exportToCSV(exportData);
      break;
    case 'json':
      exportToJSON(exportData);
      break;
  }
};

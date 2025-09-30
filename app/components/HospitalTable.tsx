// File: app/components/HospitalTable.tsx
'use client';

import { useLingui } from '@lingui/react';
import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { useMapStore } from '../store/useMapStore';
import type { Hospital } from '../types';

interface HospitalTableProps {
  className?: string;
}

const HospitalTable: React.FC<HospitalTableProps> = ({ className = '' }) => {
  const { i18n } = useLingui();

  // Create a safe translation function that handles undefined i18n
  const _ = useCallback(
    (text: string) => {
      try {
        return i18n?._ ? i18n._(text) : text;
      } catch {
        return text;
      }
    },
    [i18n]
  );

  const { filteredHospitals, selectHospital } = useMapStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Function to select a hospital
  const handleSelectHospital = useCallback((hospital: Hospital) => {
    setSelectedHospital(hospital);
    selectHospital(hospital);
  }, [selectHospital]);

  // Export data in different formats
  const exportData = useCallback((exportType: 'pdf' | 'csv' | 'json') => {
    // Extract only the data we want to export
    const data = filteredHospitals.map((hospital: Hospital) => {
      const deploymentDate = format(
        new Date(hospital.deploymentDate),
        exportType === 'csv' ? 'yyyy-MM-dd' : 'dd/MM/yyyy'
      );

      return {
        name: hospital.name,
        status: hospital.status,
        deploymentDate,
        website: hospital.website,
        address: hospital.address,
      };
    });

    const currentDate = format(new Date(), 'yyyy-MM-dd');

    if (exportType === 'json') {
      // JSON export
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, `hospitals-data-${currentDate}.json`);
    } else if (exportType === 'csv') {
      // CSV export
      if (data.length === 0) return;
      const headers = Object.keys(data[0]!).join(',');
      const rows = data.map(item => Object.values(item).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, `hospitals-data-${currentDate}.csv`);
    } else if (exportType === 'pdf') {
      // In a real app, this would use a library like jsPDF
      // For this demo, we'll just show an alert
      alert('PDF export would be implemented with a library like jsPDF');
    }

    setShowExportModal(false);
  }, [filteredHospitals]);

  // Handlers optimisés pour les boutons d'export
  const handleShowExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    setShowExportModal(false);
  }, []);

  const handleExportPdf = useCallback(() => {
    exportData('pdf');
  }, [exportData]);

  const handleExportXls = useCallback(() => {
    exportData('csv');
  }, [exportData]);

  const handleExportJson = useCallback(() => {
    exportData('json');
  }, [exportData]);

  // Handler optimisé pour les liens externes
  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handler optimisé pour la sélection d'hôpital (avec closure)
  const createHospitalSelectHandler = useCallback((hospital: Hospital) => {
    return () => handleSelectHospital(hospital);
  }, [handleSelectHospital]);

  return (
    <div className={`bg-white p-4 md:p-6 rounded-lg shadow-md overflow-auto ${className}`} role="region" aria-label={_('Hospitals list')}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-lg md:text-xl font-semibold" id="hospitals-table-title">{_('Hospitals')}</h2>
        <button
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
          onClick={handleShowExportModal}
          aria-label={_('Export Data')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            ></path>
          </svg>
          {_('Export Data')}
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse" aria-labelledby="hospitals-table-title">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-600" scope="col">{_('NAME')}</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600" scope="col">{_('STATUS')}</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600" scope="col">
                {_('DEPLOYMENT DATE')}
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600" scope="col">{_('WEBSITE')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredHospitals.map((hospital: Hospital) => (
              <tr
                key={hospital.id}
                className={`border-b hover:bg-gray-50 cursor-pointer ${selectedHospital?.id === hospital.id ? 'bg-blue-50' : ''}`}
                onClick={createHospitalSelectHandler(hospital)}
              >
                <td className="py-4 px-4 font-medium">{hospital.name}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                    ${hospital.status === 'Deployed' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-1.5 ${hospital.status === 'Deployed' ? 'bg-blue-500' : 'bg-green-500'}`}
                    ></span>
                    {_(hospital.status)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {format(new Date(hospital.deploymentDate), 'dd/MM/yyyy')}
                </td>
                <td className="py-4 px-4">
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                    onClick={handleStopPropagation}
                  >
                    {hospital.website.replace(/^https?:\/\//, '')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredHospitals.map((hospital: Hospital) => (
          <div
            key={hospital.id}
            className={`p-4 border rounded-lg cursor-pointer ${selectedHospital?.id === hospital.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}
            onClick={createHospitalSelectHandler(hospital)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{hospital.name}</h3>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                ${hospital.status === 'Deployed' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${hospital.status === 'Deployed' ? 'bg-blue-500' : 'bg-green-500'}`}
                ></span>
                {_(hospital.status)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              {format(new Date(hospital.deploymentDate), 'dd/MM/yyyy')}
            </div>
            <a
              href={hospital.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm hover:underline flex items-center"
              onClick={handleStopPropagation}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
              {hospital.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        ))}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" id="export-modal-title">{_('Export data')}</h3>
              <button
                onClick={handleCloseExportModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label={_('Close')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="modal-export-grid">
              <button
                onClick={handleExportPdf}
                className="modal-export-option"
              >
                <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="modal-export-text">PDF</span>
              </button>

              <button
                onClick={handleExportXls}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded hover:bg-blue-100"
              >
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="text-blue-500 text-sm">CSV</span>
              </button>

              <button
                onClick={handleExportJson}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded hover:bg-blue-100"
              >
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="modal-export-text">JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalTable;

import React, { useState } from 'react';
import type { DeletedItemLog } from '../types';
import { ExportIcon, DeleteIcon, ExclamationCircleIcon } from './icons';
import { exportDeletionsPDF } from '../services/pdfService';

interface DeletionHistoryProps {
  deletedItems: DeletedItemLog[];
  activeUser?: string;
  onClearDeletions?: () => void;
}

const DeletionHistory: React.FC<DeletionHistoryProps> = ({ deletedItems, activeUser, onClearDeletions }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleExportPDF = () => {
    if (deletedItems.length === 0) return;
    exportDeletionsPDF(deletedItems, activeUser);
  };

  const handleExportAndClear = () => {
    if (deletedItems.length === 0) return;
    // 1. Download PDF as mandated
    exportDeletionsPDF(deletedItems, activeUser);
    // 2. Clear history
    if (onClearDeletions) {
      onClearDeletions();
    }
    setIsConfirmModalOpen(false);
  };

  const handleExportCSV = () => {
    if (deletedItems.length === 0) return;

    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }
        const strValue = String(value);
        if (/[",\n\r]/.test(strValue)) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
    };

    const headers = [
        'ID',
        'Nombre',
        'Descripción',
        'Marca',
        'Modelo',
        'Stock Inicial',
        'Fecha Eliminación',
        'Eliminado por'
    ];

    const csvContent = [
        headers.join(','),
        ...deletedItems.map(item => [
            escapeCSV(item.id),
            escapeCSV(item.name),
            escapeCSV(item.description),
            escapeCSV(item.brand),
            escapeCSV(item.model),
            escapeCSV(item.initialStock),
            escapeCSV(item.deletionDate.toLocaleString()),
            escapeCSV(item.deletedBy)
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'historial_eliminados.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const DeletionItem: React.FC<{item: DeletedItemLog}> = ({ item }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl">
        <div className="flex-1 mb-2 sm:mb-0">
            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{item.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-mono">
                ID: {item.id}
              </span>
            </p>
            {item.description && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                {item.description}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Eliminado / Archivado el: <span className="font-mono">{new Date(item.deletionDate).toLocaleString()}</span> por <span className="font-semibold text-red-700 dark:text-red-400">{item.deletedBy}</span>
            </p>
        </div>
    </div>
  );

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗑️</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Historial de Eliminaciones</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Registro auditado de bajas de instrumentos y devoluciones archivadas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
              onClick={handleExportPDF}
              disabled={deletedItems.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md shadow-red-500/20 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-1.5"
              aria-label="Exportar eliminaciones a PDF"
          >
              <ExportIcon />
              <span>Exportar PDF</span>
          </button>

          <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={deletedItems.length === 0}
              className="inline-flex items-center justify-center px-3.5 py-2.5 border border-red-300 dark:border-red-800 text-xs font-bold rounded-xl shadow-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-1.5"
              aria-label="Vaciar historial descargando PDF"
              title="El historial únicamente se puede vaciar mediante la descarga obligatoria del documento PDF de respaldo"
          >
              <DeleteIcon />
              <span>Vaciar Historial</span>
          </button>

          <button
              onClick={handleExportCSV}
              disabled={deletedItems.length === 0}
              className="inline-flex items-center justify-center px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-xl shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Exportar eliminaciones a CSV"
          >
              CSV
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {deletedItems.length > 0 ? (
          deletedItems.map(item => <DeletionItem key={item.id + new Date(item.deletionDate).toISOString()} item={item} />)
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-sm italic">No hay registros de elementos eliminados o archivados.</p>
        )}
      </div>

      {/* Audit Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all" role="dialog" aria-modal="true">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-2xl">
                <ExclamationCircleIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Requisito de Auditoría
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  Para proceder con el vaciado del <strong className="text-gray-900 dark:text-white">Historial de Eliminaciones ({deletedItems.length} registros)</strong>, el sistema descargará automáticamente el documento <strong className="text-red-600 dark:text-red-400">PDF de respaldo</strong> para garantizar la trazabilidad de la institución.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-2">
              <button
                type="button"
                onClick={handleExportAndClear}
                className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl px-4 py-2.5 bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow-md shadow-red-500/20 transition-all sm:w-auto"
              >
                <ExportIcon />
                <span>Descargar PDF y Vaciar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletionHistory;

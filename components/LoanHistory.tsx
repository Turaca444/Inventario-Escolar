import React from 'react';
import type { Loan } from '../types';
import { ReturnIcon, ExportIcon, DeleteIcon } from './icons';
import { exportLoansPDF } from '../services/pdfService';

interface LoanHistoryProps {
  loans: Loan[];
  onReturn: (loanId: string) => void;
  onDeleteLoan?: (loanId: string) => void;
  onClearReturned?: () => void;
  activeUser?: string;
}

const LoanHistory: React.FC<LoanHistoryProps> = ({ loans, onReturn, onDeleteLoan, onClearReturned, activeUser }) => {
  const activeLoans = loans.filter(loan => !loan.returnDate);
  const returnedLoans = loans.filter(loan => loan.returnDate);

  const handleExportPDF = () => {
    if (loans.length === 0) return;
    exportLoansPDF(loans, activeUser);
  };

  const handleExportCSV = () => {
    if (loans.length === 0) return;

    // Helper to escape commas, quotes, and newlines in values
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
        'ID Préstamo',
        'ID Instrumento',
        'Nombre Instrumento',
        'Nombre Profesor',
        'Cantidad',
        'Fecha Préstamo',
        'Fecha Devolución'
    ];

    const csvContent = [
        headers.join(','),
        ...loans.map(loan => [
            escapeCSV(loan.id),
            escapeCSV(loan.itemId),
            escapeCSV(loan.itemName),
            escapeCSV(loan.teacherName),
            escapeCSV(loan.quantity),
            escapeCSV(loan.loanDate.toLocaleString()),
            escapeCSV(loan.returnDate ? loan.returnDate.toLocaleString() : 'No devuelto')
        ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'historial_prestamos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const LoanItem: React.FC<{loan: Loan}> = ({ loan }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
        <div className="flex-1 mb-3 sm:mb-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 dark:text-white">{loan.itemName}</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                loan.returnDate
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {loan.returnDate ? 'Devuelto' : 'En Préstamo'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Prestado a: <span className="font-semibold text-gray-900 dark:text-white">{loan.teacherName}</span> | Cantidad: <span className="font-semibold">{loan.quantity}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Fecha Préstamo: {loan.loanDate.toLocaleString()}
                {loan.returnDate && ` — Devuelto: ${loan.returnDate.toLocaleString()}`}
            </p>
        </div>
        <div className="flex items-center gap-2">
          {!loan.returnDate ? (
              <button
                  onClick={() => onReturn(loan.id)}
                  className="inline-flex items-center px-3.5 py-2 border border-transparent text-xs font-bold rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                  <ReturnIcon />
                  Devolver
              </button>
          ) : (
              onDeleteLoan && (
                <button
                    onClick={() => onDeleteLoan(loan.id)}
                    title="Eliminar este registro del historial"
                    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                    aria-label="Eliminar registro"
                >
                    <DeleteIcon />
                </button>
              )
          )}
        </div>
    </div>
  );

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Historial de Préstamos</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Seguimiento activo y registro de devoluciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
              onClick={handleExportPDF}
              disabled={loans.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-1.5"
              aria-label="Exportar historial a PDF"
          >
              <ExportIcon />
              <span>Exportar PDF</span>
          </button>
          
          <button
              onClick={handleExportCSV}
              disabled={loans.length === 0}
              className="inline-flex items-center justify-center px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-xl shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Exportar historial a CSV"
          >
              CSV
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <span>⏳</span>
              <span>Préstamos Activos ({activeLoans.length})</span>
            </h3>
            <div className="space-y-3">
                {activeLoans.length > 0 ? (
                    activeLoans.map(loan => <LoanItem key={loan.id} loan={loan} />)
                ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm italic">No hay préstamos activos en este momento.</p>
                )}
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <span>✅</span>
                <span>Historial de Devoluciones ({returnedLoans.length})</span>
              </h3>

              {returnedLoans.length > 0 && onClearReturned && (
                <button
                  onClick={onClearReturned}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl border border-red-200 dark:border-red-800 transition-all"
                  title="Eliminar todo el historial de devoluciones"
                >
                  <DeleteIcon />
                  <span>Vaciar Devoluciones</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
                {returnedLoans.length > 0 ? (
                    returnedLoans.map(loan => <LoanItem key={loan.id} loan={loan} />)
                ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm italic">No hay devoluciones registradas en el historial.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;

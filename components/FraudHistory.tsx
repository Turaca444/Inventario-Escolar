import React, { useState } from 'react';
import type { FraudReport } from '../types';
import { ExportIcon, DeleteIcon, ExclamationCircleIcon } from './icons';
import { exportFraudReportPDF, exportAllFraudReportsPDF } from '../services/pdfService';

interface FraudHistoryProps {
  fraudReports: FraudReport[];
  activeUser?: string;
  onUpdateStatus?: (id: string, newStatus: 'Pendiente' | 'En Investigación' | 'Resuelto') => void;
  onDeleteReport?: (id: string) => void;
}

const FraudHistory: React.FC<FraudHistoryProps> = ({
  fraudReports,
  activeUser,
  onUpdateStatus,
  onDeleteReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [severityFilter, setSeverityFilter] = useState<string>('Todas');

  const filteredReports = fraudReports.filter((rep) => {
    const matchesSearch =
      rep.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.itemName && rep.itemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rep.involvedPerson && rep.involvedPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rep.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || rep.status === statusFilter;
    const matchesSeverity = severityFilter === 'Todas' || rep.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleExportAllPDF = () => {
    exportAllFraudReportsPDF(filteredReports, activeUser);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Crítica':
        return 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'Alta':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Media':
        return 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resuelto':
        return 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'En Investigación':
        return 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-red-100 dark:border-red-900/30 transition-all">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-lg">
              🚨
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Historial de Reportes de Fraude e Irregularidades
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Registro de alertas de seguridad, sustracciones y denuncias en el laboratorio
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportAllPDF}
            disabled={fraudReports.length === 0}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-red-200 dark:border-red-800 text-sm font-semibold rounded-xl text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            <ExportIcon />
            <span>Exportar Denuncias a PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar por denunciante, tipo, equipo o hechos..."
            className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Investigación">En Investigación</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="Todas">Todas las Severidades</option>
            <option value="Crítica">🔴 Crítica</option>
            <option value="Alta">🟠 Alta</option>
            <option value="Media">🟡 Media</option>
            <option value="Baja">🟢 Baja</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 uppercase font-semibold">
              <th className="px-4 py-3">Fecha/Hora</th>
              <th className="px-4 py-3">Denunciante</th>
              <th className="px-4 py-3">Tipo de Irregularidad</th>
              <th className="px-4 py-3">Severidad</th>
              <th className="px-4 py-3">Equipo / Sospechoso</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {formatDate(report.reportDate)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {report.reporterName}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {report.reporterRole}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-red-700 dark:text-red-400">
                      {report.incidentType}
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-1 max-w-xs mt-0.5">
                      {report.description}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(report.severity)}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {report.itemName && (
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        📦 {report.itemName}
                      </div>
                    )}
                    {report.involvedPerson && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-300">
                        👤 Sospechoso: {report.involvedPerson}
                      </div>
                    )}
                    {!report.itemName && !report.involvedPerson && (
                      <span className="text-gray-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {onUpdateStatus ? (
                      <select
                        value={report.status}
                        onChange={(e) => onUpdateStatus(report.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${getStatusBadge(report.status)}`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Investigación">En Investigación</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => exportFraudReportPDF(report, activeUser)}
                      className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                      title="Descargar Acta Individual PDF"
                    >
                      <ExportIcon />
                      <span className="hidden sm:inline">Acta PDF</span>
                    </button>
                    {onDeleteReport && (
                      <button
                        onClick={() => onDeleteReport(report.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors inline-flex items-center"
                        title="Eliminar reporte de la lista"
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500">
                  No hay reportes de fraude registradas que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FraudHistory;

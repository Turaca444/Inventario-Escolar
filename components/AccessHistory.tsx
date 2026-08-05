import React, { useState } from 'react';
import type { AccessLog, UserRole } from '../types';
import { ExportIcon, DeleteIcon, ExclamationCircleIcon } from './icons';
import { exportAccessLogsPDF } from '../services/pdfService';

interface AccessHistoryProps {
  accessLogs: AccessLog[];
  activeUser?: string;
  onLogoutCurrentSession?: () => void;
  onClearAccessLogs?: () => void;
  onDeleteAccessLog?: (logId: string) => void;
}

const AccessHistory: React.FC<AccessHistoryProps> = ({
  accessLogs,
  activeUser,
  onClearAccessLogs,
  onDeleteAccessLog,
}) => {
  const [roleFilter, setRoleFilter] = useState<'Todos' | UserRole>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<AccessLog | null>(null);

  const filteredLogs = accessLogs.filter((log) => {
    const fullName = `${log.firstName} ${log.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || log.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportPDF = () => {
    if (accessLogs.length === 0) return;
    exportAccessLogsPDF(filteredLogs, activeUser);
  };

  const handleExportAndClear = () => {
    if (accessLogs.length === 0) return;
    // 1. Mandatory PDF export for audit compliance
    exportAccessLogsPDF(accessLogs, activeUser);
    // 2. Clear history
    if (onClearAccessLogs) {
      onClearAccessLogs();
    }
    setIsConfirmModalOpen(false);
  };

  const handleConfirmSingleDelete = () => {
    if (!logToDelete) return;
    exportAccessLogsPDF([logToDelete], activeUser);
    if (onDeleteAccessLog) {
      onDeleteAccessLog(logToDelete.id);
    }
    setLogToDelete(null);
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

  const calculateDuration = (login: Date | string, logout?: Date | string) => {
    if (!logout) return 'Sesión en curso';
    const loginD = typeof login === 'string' ? new Date(login) : login;
    const logoutD = typeof logout === 'string' ? new Date(logout) : logout;
    const diffMs = logoutD.getTime() - loginD.getTime();
    if (diffMs < 0) return '-';
    const totalMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Registro de Ingresos y Horarios
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historial de accesos y permanencia de Administradores y Preceptores
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={accessLogs.length === 0}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-indigo-200 dark:border-indigo-800 text-sm font-semibold rounded-xl text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            <ExportIcon />
            <span>Exportar Ingresos a PDF</span>
          </button>

          {onClearAccessLogs && (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={accessLogs.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-red-200 dark:border-red-800 text-sm font-semibold rounded-xl text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              title="El registro únicamente se puede vaciar mediante la descarga obligatoria del documento PDF de respaldo"
            >
              <DeleteIcon />
              <span>Vaciar Registro</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="my-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por Nombre y Apellido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Filtrar Rol:
          </span>
          <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-700">
            {(['Todos', 'Administrador', 'Preceptor'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  roleFilter === role
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Access Log Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 font-semibold uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Personal</th>
              <th className="px-4 py-3">Rol / Cargo</th>
              <th className="px-4 py-3">Horario Ingreso</th>
              <th className="px-4 py-3">Horario Salida</th>
              <th className="px-4 py-3">Permanencia</th>
              <th className="px-4 py-3">Estado</th>
              {onDeleteAccessLog && <th className="px-4 py-3 text-right">Acción</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                    {log.firstName} {log.lastName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        log.role === 'Administrador'
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300'
                          : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300'
                      }`}
                    >
                      {log.role === 'Administrador' ? '🛡️ Admin' : '📋 Preceptor'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-mono text-xs">
                    {formatDate(log.loginTime)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-mono text-xs">
                    {log.logoutTime ? (
                      formatDate(log.logoutTime)
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Actualmente conectado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 text-xs">
                    {calculateDuration(log.loginTime, log.logoutTime)}
                  </td>
                  <td className="px-4 py-3.5">
                    {log.status === 'Activo' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        En Turno
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Finalizado
                      </span>
                    )}
                  </td>
                  {onDeleteAccessLog && (
                    <td className="px-4 py-3.5 text-right">
                      {log.status !== 'Activo' ? (
                        <button
                          onClick={() => setLogToDelete(log)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                          title="Eliminar este registro individual"
                        >
                          <DeleteIcon />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={onDeleteAccessLog ? 7 : 6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  No hay registros de ingreso que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Confirmation Modal - Clear Full Register */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all" role="dialog" aria-modal="true">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-2xl">
                <ExclamationCircleIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Confirmar Eliminación Permanente
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  El <strong className="text-gray-900 dark:text-white">Registro de Ingresos y Horarios ({accessLogs.length} registros)</strong> <strong className="text-red-600 dark:text-red-400">se eliminará en forma permanente</strong> del sistema.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  📄 Toda la información de ingresos y horarios <strong>se registrará en un documento PDF de respaldo</strong> descargable automáticamente para resguardar la auditoría.
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
                <span>Registrar en PDF y Eliminar</span>
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

      {/* Audit Confirmation Modal - Single Item Delete */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all" role="dialog" aria-modal="true">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-2xl">
                <ExclamationCircleIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Confirmar Eliminación Permanente
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  El registro de ingreso de <strong className="text-gray-900 dark:text-white">{logToDelete.firstName} {logToDelete.lastName}</strong> <strong className="text-red-600 dark:text-red-400">se eliminará en forma permanente</strong>.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  📄 Este registro <strong>se archivará en un documento PDF de respaldo</strong> descargable automáticamente antes de eliminarse.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="w-full inline-flex justify-center items-center gap-1.5 rounded-xl px-4 py-2.5 bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-500/20 transition-all sm:w-auto"
              >
                <ExportIcon />
                <span>Registrar en PDF y Eliminar</span>
              </button>
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all sm:w-auto"
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

export default AccessHistory;

import React, { useState } from 'react';
import { CloseIcon } from './icons';
import type { AccessLog, InventoryItem } from '../types';

export type AlertType = 
  | 'Falla / Avería de Equipo'
  | 'Pérdida / Extravío'
  | 'Incidencia de Seguridad'
  | 'Daño en Infraestructura'
  | 'Uso No Autorizado'
  | 'Aviso General / Emergencia';

export type AlertPriority = 'Crítica' | 'Alta' | 'Media' | 'Baja';

export interface SystemAlert {
  id: string;
  createdAt: Date;
  type: AlertType;
  priority: AlertPriority;
  location: string;
  description: string;
  itemId?: string;
  itemName?: string;
  reportedBy: string;
  reporterRole?: string;
  status: 'Activa' | 'Resuelta';
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSession: AccessLog | null;
  inventory: InventoryItem[];
  alerts: SystemAlert[];
  onAddAlert: (alert: Omit<SystemAlert, 'id' | 'createdAt' | 'status'>) => void;
  onResolveAlert: (alertId: string, resolvedBy: string) => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  activeSession,
  inventory,
  alerts,
  onAddAlert,
  onResolveAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // Form State
  const [type, setType] = useState<AlertType>('Falla / Avería de Equipo');
  const [priority, setPriority] = useState<AlertPriority>('Alta');
  const [location, setLocation] = useState('Laboratorio Principal');
  const [description, setDescription] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [reporterName, setReporterName] = useState(
    activeSession ? `${activeSession.firstName} ${activeSession.lastName}` : ''
  );
  const [reporterRole, setReporterRole] = useState(
    activeSession ? activeSession.role : 'Preceptor'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const selectedItem = inventory.find((i) => i.id === selectedItemId);

    onAddAlert({
      type,
      priority,
      location: location.trim() || 'General',
      description: description.trim(),
      itemId: selectedItem?.id,
      itemName: selectedItem?.name,
      reportedBy: reporterName.trim() || 'Anónimo / Sistema',
      reporterRole: reporterRole,
    });

    // Reset form
    setDescription('');
    setSelectedItemId('');
    setActiveTab('list');
  };

  const activeAlerts = alerts.filter((a) => a.status === 'Activa');
  const resolvedAlerts = alerts.filter((a) => a.status === 'Resuelta');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 transition-all"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-2xl animate-bounce">
              🚨
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Botón de Alerta / Incidencias
              </h3>
              <p className="text-xs sm:text-sm text-red-100">
                Emitir o consultar alertas en tiempo real sobre instrumentos y laboratorio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label="Cerrar modal de alerta"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'create'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              ➕ Emitir Alerta
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all relative ${
                activeTab === 'list'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              📋 Historial de Alertas ({alerts.length})
              {activeAlerts.length > 0 && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black">
                  {activeAlerts.length} activas
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-gray-800 dark:text-gray-200">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/40 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-200 flex items-start gap-2">
                <span className="text-base shrink-0">⚠️</span>
                <p>
                  Utilice esta herramienta para notificar de forma urgente problemas con instrumentos, fallas de equipos, incidentes de seguridad o pérdidas en la institución.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Alerta *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AlertType)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  >
                    <option value="Falla / Avería de Equipo">🛠️ Falla / Avería de Equipo</option>
                    <option value="Pérdida / Extravío">🔍 Pérdida / Extravío</option>
                    <option value="Incidencia de Seguridad">🚨 Incidencia de Seguridad</option>
                    <option value="Daño en Infraestructura">💥 Daño en Infraestructura</option>
                    <option value="Uso No Autorizado">🚫 Uso No Autorizado</option>
                    <option value="Aviso General / Emergencia">📢 Aviso General / Emergencia</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Nivel de Prioridad *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AlertPriority)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  >
                    <option value="Crítica">🔴 Crítica / Urgente</option>
                    <option value="Alta">🟠 Alta</option>
                    <option value="Media">🟡 Media</option>
                    <option value="Baja">🔵 Baja / Informativa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Ubicación / Sector *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: Laboratorio de Física, Aula 4, Depósito..."
                    className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                </div>

                {/* Instrument (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Instrumento / Equipo Afectado (Opcional)
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="">-- Ninguno / Falla General --</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.brand} - {item.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Descripción Detallada del Suceso *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describa claramente lo ocurrido, observaciones relevantes o acciones requeridas..."
                  className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  required
                />
              </div>

              {/* Reporter details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Reportado por
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Nombre del emisor..."
                    className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={reporterRole}
                    onChange={(e) => setReporterRole(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="Preceptor">Preceptor</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Docente">Docente</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-102 active:scale-98 flex items-center gap-2"
                >
                  <span>🚨</span>
                  <span>Emitir Alerta Ahora</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                <span>Alertas en el Sistema</span>
                <span className="text-xs font-normal text-gray-500">
                  {activeAlerts.length} activas / {resolvedAlerts.length} resueltas
                </span>
              </h4>

              {alerts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <span className="text-4xl block mb-2">✅</span>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    No hay alertas o incidencias registradas.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Utilice el botón &quot;Emitir Alerta&quot; para reportar un evento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {alerts.map((alert) => {
                    const isActiva = alert.status === 'Activa';
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isActiva
                            ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-75'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                alert.priority === 'Crítica'
                                  ? 'bg-red-600 text-white'
                                  : alert.priority === 'Alta'
                                  ? 'bg-amber-500 text-white'
                                  : alert.priority === 'Media'
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {alert.priority}
                            </span>
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                              {alert.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isActiva
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200'
                              }`}
                            >
                              {isActiva ? '🔴 Activa' : '✅ Resuelta'}
                            </span>

                            {isActiva && (
                              <button
                                onClick={() =>
                                  onResolveAlert(
                                    alert.id,
                                    activeSession
                                      ? `${activeSession.firstName} ${activeSession.lastName}`
                                      : 'Administrador'
                                  )
                                }
                                className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm"
                              >
                                Marcar Resuelta
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                          {alert.description}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200/60 dark:border-gray-600/60">
                          <span>
                            📍 <strong>Ubicación:</strong> {alert.location}
                          </span>
                          {alert.itemName && (
                            <span>
                              🛠️ <strong>Equipo:</strong> {alert.itemName}
                            </span>
                          )}
                          <span>
                            👤 <strong>Por:</strong> {alert.reportedBy} ({alert.reporterRole || 'Usuario'})
                          </span>
                          <span>
                            📅 <strong>Fecha:</strong> {new Date(alert.createdAt).toLocaleString('es-AR')}
                          </span>
                          {alert.resolvedBy && alert.resolvedAt && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✅ Resuelto por {alert.resolvedBy} el {new Date(alert.resolvedAt).toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Sistema de Alertas e Incidencias en Tiempo Real
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default AlertModal;

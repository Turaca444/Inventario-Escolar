import React, { useState } from 'react';
import type { InventoryItem, FraudIncidentType, FraudSeverity, FraudReport, AccessLog } from '../types';
import { ExportIcon, ExclamationCircleIcon } from './icons';

interface FraudReportModalProps {
  isOpen: boolean;
  inventory: InventoryItem[];
  activeSession: AccessLog | null;
  onClose: () => void;
  onSubmit: (report: Omit<FraudReport, 'id' | 'reportDate' | 'status'>, exportPdf: boolean) => void;
}

const incidentTypes: FraudIncidentType[] = [
  'Sustracción / Robo',
  'Falsificación de Firma / Préstamo',
  'Alteración de Serie / Placa',
  'Acceso No Autorizado',
  'Uso Indebido de Equipos',
  'Otro',
];

const FraudReportModal: React.FC<FraudReportModalProps> = ({
  isOpen,
  inventory,
  activeSession,
  onClose,
  onSubmit,
}) => {
  const [reporterName, setReporterName] = useState(
    activeSession ? `${activeSession.firstName} ${activeSession.lastName}` : ''
  );
  const [reporterRole, setReporterRole] = useState<string>(
    activeSession ? activeSession.role : 'Preceptor'
  );
  const [incidentType, setIncidentType] = useState<FraudIncidentType>('Sustracción / Robo');
  const [severity, setSeverity] = useState<FraudSeverity>('Alta');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [involvedPerson, setInvolvedPerson] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (exportPdf: boolean) => {
    if (!reporterName.trim()) {
      setError('Por favor, ingrese el nombre de la persona que reporta.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Proporcione una descripción detallada del incidente (mínimo 10 caracteres).');
      return;
    }

    const selectedItem = inventory.find((i) => i.id === selectedItemId);

    onSubmit(
      {
        reporterName: reporterName.trim(),
        reporterRole: reporterRole.trim(),
        incidentType,
        severity,
        itemId: selectedItem?.id,
        itemName: selectedItem ? `${selectedItem.name} (${selectedItem.brand} ${selectedItem.model})` : undefined,
        involvedPerson: involvedPerson.trim() || undefined,
        description: description.trim(),
      },
      exportPdf
    );

    // Reset fields
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all" role="dialog" aria-modal="true">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl border border-red-100 dark:border-red-900/50 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl text-2xl">
              🚨
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide">
                Reportar Fraude o Irregularidad
              </h3>
              <p className="text-xs text-red-100">
                Canal de Auditoría, Alertas e Incidencias en Inventario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <ExclamationCircleIcon />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2">
            <span className="text-base flex-shrink-0">⚠️</span>
            <div>
              <strong>Registro de Seguridad y Auditoría Legal:</strong> Las denuncias por fraude o irregularidad generan un acta formal con código único y quedan registradas de forma inalterable.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reporter Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Denunciante / Informante *
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Reporter Role */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Cargo / Rol *
              </label>
              <select
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="Administrador">Administrador</option>
                <option value="Preceptor">Preceptor</option>
                <option value="Docente">Docente</option>
                <option value="Personal de Seguridad">Personal de Seguridad</option>
                <option value="Otro">Otro Personal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Incident Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Irregularidad / Fraude *
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as FraudIncidentType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {incidentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nivel de Severidad *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FraudSeverity)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="Crítica">🔴 Crítica (Urgente / Delito Mayor)</option>
                <option value="Alta">🟠 Alta (Sustracción o Falsificación)</option>
                <option value="Media">🟡 Media (Uso Indebido / Anomalía)</option>
                <option value="Baja">🟢 Baja (Incidencia Menor)</option>
              </select>
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Elemento / Instrumento Afectado (Opcional)
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">-- Selección de inventario (General / Sin asociar) --</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.brand} ({item.model}) | Stock: {item.currentStock}
                </option>
              ))}
            </select>
          </div>

          {/* Suspect Person */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Persona Involucrada o Sospechosa (Opcional)
            </label>
            <input
              type="text"
              value={involvedPerson}
              onChange={(e) => setInvolvedPerson(e.target.value)}
              placeholder="Nombre, apellido o legajo del presunto responsable"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Descripción Detallada de los Hechos / Evidencias *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa fecha, hora, lugar, alteración observada, faltantes o inconsistencias..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row-reverse gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-sm rounded-xl shadow-md shadow-red-500/20 transition-all"
          >
            <ExportIcon />
            <span>Registrar y Descargar Acta PDF</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-black text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            <span>Registrar Sin PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm rounded-xl transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FraudReportModal;

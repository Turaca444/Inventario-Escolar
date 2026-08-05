
import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../types';
import { CloseIcon } from './icons';

interface LoanModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  activeUser?: string;
  onClose: () => void;
  onConfirm: (teacherName: string, quantity: number) => void;
}

const LoanModal: React.FC<LoanModalProps> = ({ isOpen, item, activeUser, onClose, onConfirm }) => {
  const [teacherName, setTeacherName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTeacherName('');
      setQuantity(1);
      setError('');
      
      const updateTime = () => {
        const now = new Date();
        const formatted = now.toLocaleString('es-AR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setCurrentDateTime(formatted);
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen || !item) {
    return null;
  }

  const handleConfirm = () => {
    if (!teacherName.trim()) {
      setError('El nombre del profesor / solicitante es obligatorio.');
      return;
    }
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor que cero.');
      return;
    }
    if (quantity > item.currentStock) {
      setError(`La cantidad no puede exceder el stock disponible (${item.currentStock}).`);
      return;
    }
    onConfirm(teacherName, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 transform transition-all">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-lg">
              📋
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white" id="modal-title">
                Prestar Herramienta / Instrumento
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Registro de salida de stock</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Selected item card */}
        <div className="mt-4 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between">
            <p className="text-base font-extrabold text-indigo-950 dark:text-indigo-200">{item.name}</p>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm">
              Stock: {item.currentStock} / {item.initialStock}
            </span>
          </div>
          {item.brand && (
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
              Marca/Modelo: {item.brand} {item.model || ''}
            </p>
          )}
        </div>

        {/* Date, Time & Registered By Live Banner */}
        <div className="mt-4 p-3.5 bg-slate-900 text-white rounded-xl shadow-inner space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase tracking-wider font-sans font-semibold">📅 Fecha y Hora de Préstamo:</span>
            <span className="text-emerald-400 font-bold">{currentDateTime}</span>
          </div>
          {activeUser && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400 font-sans font-semibold">👤 Registrado por:</span>
              <span className="text-indigo-300 font-sans font-semibold">{activeUser}</span>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="teacherName" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Docente / Profesor Solicitante *
            </label>
            <input
              type="text"
              id="teacherName"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Ej: Prof. Juan Carlos Pérez"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Cantidad a prestar (Máx: {item.currentStock}) *
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              min="1"
              max={item.currentStock}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-900 dark:text-white"
            />
          </div>

          {error && (
            <p className="p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-600 dark:text-red-300">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Confirmar Préstamo</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanModal;


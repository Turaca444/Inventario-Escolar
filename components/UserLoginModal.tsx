import React, { useState } from 'react';
import type { UserRole } from '../types';
import { CloseIcon } from './icons';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (firstName: string, lastName: string, role: UserRole) => void;
}

const UserLoginModal: React.FC<UserLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('Preceptor');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor complete tanto el Nombre como el Apellido.');
      return;
    }
    setError('');
    onLogin(firstName.trim(), lastName.trim(), role);
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all">
        
        {/* Header background decoration */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-2xl">
              🔑
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Registro de Ingreso</h3>
              <p className="text-xs text-indigo-100 mt-0.5">Identificación de Administrador y Preceptores</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">🛡️</span>
            <div>
              <strong className="block text-amber-900 dark:text-amber-100 font-bold mb-0.5">Control de Seguridad y Auditoría</strong>
              <span>Debe registrar su ingreso (Administrador o Preceptor) para acceder a la API de búsqueda y realizar operaciones en el inventario.</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Seleccione su Rol / Cargo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Administrador')}
                className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                  role === 'Administrador'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                    : 'bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>🛡️</span>
                <span>Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Preceptor')}
                className={`py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 transition-all ${
                  role === 'Preceptor'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 ring-2 ring-purple-500/30'
                    : 'bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>📋</span>
                <span>Preceptor</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Juan"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Pérez"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-300 flex items-center justify-between">
            <span className="font-medium">Hora de Ingreso Actual:</span>
            <span className="font-bold font-mono">{new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <span>Registrar e Ingresar</span>
              <span>➔</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLoginModal;

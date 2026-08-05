
import React from 'react';
import type { AccessLog } from '../types';

interface HeaderProps {
  activeSession: AccessLog | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSession, onOpenLoginModal, onLogout }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-800 text-white rounded-xl shadow-md">
                        🛠️
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Gestor de Inventario e Instrumentos
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Control de préstamos, eliminaciones e ingresos de personal
                        </p>
                    </div>
                </div>

                {/* User Session Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    {activeSession ? (
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/80 p-2 pl-3.5 pr-2 rounded-2xl border border-gray-200 dark:border-gray-600">
                            <div className="flex flex-col text-right sm:text-left">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>{activeSession.firstName} {activeSession.lastName}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                        activeSession.role === 'Administrador'
                                            ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                                            : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                                    }`}>
                                        {activeSession.role}
                                    </span>
                                </div>
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Ingreso: {new Date(activeSession.loginTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                                </span>
                            </div>

                            <button
                                onClick={onLogout}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-600 rounded-xl transition-all border border-red-200 dark:border-red-800/60"
                                title="Finalizar turno y cerrar sesión"
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onOpenLoginModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-102 active:scale-98"
                        >
                            <span>🔑</span>
                            <span>Ingreso Admin / Preceptor</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;


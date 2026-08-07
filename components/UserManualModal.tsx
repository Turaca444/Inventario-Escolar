import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const sections = [
    {
      id: 'session',
      title: '🔑 Botones de Sesión e Ingreso',
      category: 'Sesión',
      buttons: [
        {
          name: '🔑 Ingreso Admin / Preceptor',
          location: 'Encabezado superior derecho',
          description: 'Abre la ventana emergente para registrar el inicio de turno. Permite ingresar el Nombre, Apellido y seleccionar el Rol (Administrador o Preceptor). Registra automáticamente la hora exacta de ingreso.',
        },
        {
          name: '🔴 Salir / Cerrar Sesión',
          location: 'Encabezado (cuando hay sesión activa)',
          description: 'Finaliza el turno de trabajo del usuario activo, guarda la hora de salida en el historial de ingresos y cierra la sesión.',
        },
      ],
    },
    {
      id: 'navigation',
      title: '📌 Botones de Navegación y Vistas',
      category: 'Navegación',
      buttons: [
        {
          name: '📦 Inventario General',
          location: 'Barra de pestañas superior',
          description: 'Muestra la tabla principal con todos los instrumentos y equipos registrados, su disponibilidad, categoría y ubicación.',
        },
        {
          name: '📖 Préstamos',
          location: 'Barra de pestañas superior',
          description: 'Accede a la lista de instrumentos actualmente prestados e historial de préstamos realizados a docentes, alumnos o áreas.',
        },
        {
          name: '🗑️ Eliminaciones',
          location: 'Barra de pestañas superior',
          description: 'Muestra la bitácora de equipos dados de baja o eliminados del sistema, incluyendo el motivo, fecha y responsable.',
        },
        {
          name: '⏰ Ingresos',
          location: 'Barra de pestañas superior',
          description: 'Despliega la bitácora de control de asistencia de Preceptores y Administradores con sus tiempos de inicio y fin de turno.',
        },
        {
          name: '⚠️ Reportar Fraude',
          location: 'Encabezado / Barra superior y Acciones',
          description: 'Abre el formulario de reporte de fraude o sustracción de equipos, permitiendo registrar detalles de la irregularidad y generar un acta en PDF.',
        },
        {
          name: '📘 Manual del Usuario',
          location: 'Encabezado / Barra superior',
          description: 'Abre este documento explicativo interactivo sobre el funcionamiento de cada botón y herramienta de la plataforma.',
        },
      ],
    },
    {
      id: 'inventory_actions',
      title: '🛠️ Botones de Gestión de Inventario',
      category: 'Acciones',
      buttons: [
        {
          name: '➕ Agregar Instrumento',
          location: 'Esquina superior derecha de la barra de acciones',
          description: 'Abre el formulario para dar de alta un nuevo instrumento o equipo en el inventario, requiriendo nombre, marca, serie, estado y ubicación.',
        },
        {
          name: '🤝 Prestar',
          location: 'Fila de cada instrumento en la tabla de inventario',
          description: 'Inicia la solicitud de préstamo del equipo seleccionado, solicitando nombre del solicitante, curso/destino y fecha estimada de devolución.',
        },
        {
          name: '🔄 Devolver / Marcar Devuelto',
          location: 'Fila de instrumento prestado o pestaña de Préstamos',
          description: 'Registra el retorno del equipo al inventario, liberándolo para nuevos préstamos y actualizando su estado a disponible.',
        },
        {
          name: '✏️ Editar',
          location: 'Fila de cada instrumento (Acciones)',
          description: 'Permite modificar los datos del instrumento (cambio de ubicación, actualización de estado, marca, modelo o número de serie).',
        },
        {
          name: '🗑️ Eliminar / Dar de Baja',
          location: 'Fila de cada instrumento (Acciones)',
          description: 'Registra la baja definitiva del equipo en el sistema. Solicita un motivo obligatorio (daño, extravío, obsolescencia) y lo traslada a la pestaña de Eliminaciones.',
        },
      ],
    },
    {
      id: 'search_filters',
      title: '🔍 Botones de Búsqueda y Exportación',
      category: 'Filtros y Reportes',
      buttons: [
        {
          name: '🔍 Búsqueda Inteligente / IA',
          location: 'Barra de búsqueda en la parte superior del inventario',
          description: 'Filtra instrumentos en tiempo real por nombre, código, ubicación o categoría. Permite consultas en lenguaje natural.',
        },
        {
          name: '📄 Exportar a PDF / Reporte',
          location: 'Secciones de Préstamos, Eliminaciones e Ingresos',
          description: 'Genera y descarga un reporte institucional en formato PDF con la información filtrada actualmente en pantalla.',
        },
        {
          name: '🧹 Limpiar Filtros / Buscar',
          location: 'Junto a la barra de búsqueda o filtros de fecha',
          description: 'Restablece los campos de filtro y búsqueda para volver a mostrar la totalidad de los registros.',
        },
      ],
    },
  ];

  const filteredSections = sections.map((sec) => {
    const matchingButtons = sec.buttons.filter(
      (btn) =>
        btn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        btn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        btn.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...sec, buttons: matchingButtons };
  }).filter((sec) => (activeCategory === 'all' || sec.category === activeCategory) && sec.buttons.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 transition-all"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 px-6 py-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-2xl">
              📘
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Manual del Usuario
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100">
                Guía completa de botones y funciones del sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label="Cerrar manual"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 shrink-0 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar botón o función..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['all', 'Sesión', 'Navegación', 'Acciones', 'Filtros y Reportes'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {cat === 'all' ? 'Todas las categorías' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-gray-800 dark:text-gray-200">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-2">🔎</span>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                No se encontraron botones que coincidan con &quot;{searchTerm}&quot;.
              </p>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <div key={sec.id} className="space-y-3">
                <h4 className="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-950 pb-1.5 flex items-center gap-2">
                  <span>{sec.title}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {sec.buttons.map((btn, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                            {btn.name}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 shrink-0">
                            {sec.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                          {btn.description}
                        </p>
                      </div>
                      <div className="mt-1 pt-2 border-t border-gray-200/60 dark:border-gray-600/60 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Ubicación:</span>
                        <span>{btn.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Gestor de Inventario e Instrumentos - Manual de Usuario
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95"
          >
            Entendido / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserManualModal;

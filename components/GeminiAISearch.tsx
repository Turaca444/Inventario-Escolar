import React from 'react';
import { SearchIcon, LoadingSpinner } from './icons';

interface GeminiAISearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (queryOverride?: string) => void;
  isSearching: boolean;
  onClear: () => void;
}

const GeminiAISearch: React.FC<GeminiAISearchProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
  onClear,
}) => {
  const sampleQueries = [
    '⚡ Testers y Multímetros',
    '🔌 Cables HDMI',
    '🛠️ Kits de destornilladores',
    '🤖 Robótica Arduino',
    '💾 Pen Drives USB',
  ];

  const handleSampleClick = (sample: string) => {
    const cleanQuery = sample.replace(/^[^\wáéíóúñÁÉÍÓÚÑ]+\s*/, '').trim();
    setSearchQuery(cleanQuery);
    onSearch(cleanQuery);
  };

  return (
    <div className="relative group my-6">
      {/* Outer ambient glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>

      {/* Main Container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden">
        
        {/* Top AI Badge & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md text-sm font-bold">
              ✨
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 dark:from-purple-300 dark:via-indigo-300 dark:to-pink-300">
                  Búsqueda Inteligente Gemini AI
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
                  API ACTIVA
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Consulta en lenguaje natural sobre las herramientas e instrumentos
              </p>
            </div>
          </div>

          {searchQuery && (
            <button
              onClick={onClear}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline self-start sm:self-auto"
            >
              Restablecer lista completa
            </button>
          )}
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-purple-500">
            <SearchIcon />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Escriba su consulta (ej: 'herramientas de soldadura', 'multímetro con temperatura'...)"
            className="w-full pl-11 pr-32 py-3 bg-purple-50/50 dark:bg-gray-900/60 border-2 border-purple-200 dark:border-purple-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
          />

          <button
            onClick={onSearch}
            disabled={isSearching}
            className="absolute right-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-1.5"
          >
            {isSearching ? (
              <>
                <LoadingSpinner />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <span>Buscar con IA</span>
                <span>⚡</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="font-semibold text-gray-400 dark:text-gray-500 whitespace-nowrap text-[11px]">
            Sugerencias:
          </span>
          {sampleQueries.map((sample) => (
            <button
              key={sample}
              onClick={() => handleSampleClick(sample)}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-gray-700 border border-purple-100 dark:border-purple-900/50 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-300 transition-all text-[11px] shadow-sm font-medium"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeminiAISearch;

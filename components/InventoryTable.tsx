import React from 'react';
import type { InventoryItem } from '../types';
import { LendIcon, EditIcon, DeleteIcon } from './icons';

interface InventoryTableProps {
  inventory: InventoryItem[];
  onLend: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
  isLoading: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, onLend, onEdit, onDelete, isLoading }) => {
    
    const getStockColor = (current: number, initial: number) => {
        if (current === 0) return 'text-red-500 dark:text-red-400 font-bold';
        if (current <= initial / 4) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md sm:rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Producto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Descripción</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">Marca</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">Buscando...</td>
                </tr>
            ) : inventory.length === 0 ? (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No se encontraron productos.</td>
                </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{item.brand || '-'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStockColor(item.currentStock, item.initialStock)}`}>
                    {item.currentStock} / {item.initialStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                          aria-label={`Editar ${item.name}`}
                          title="Editar"
                        >
                            <EditIcon />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                          aria-label={`Eliminar ${item.name}`}
                          title="Eliminar"
                        >
                            <DeleteIcon />
                        </button>
                        <button
                          onClick={() => onLend(item)}
                          disabled={item.currentStock === 0}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-500"
                        >
                          <LendIcon />
                          Prestar
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
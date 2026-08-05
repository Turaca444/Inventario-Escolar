import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../types';
import { CloseIcon } from './icons';

interface EditItemModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (updatedItem: InventoryItem) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, item, onClose, onConfirm }) => {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'currentStock' | 'initialStock'>>({
    name: '',
    description: '',
    brand: '',
    model: '',
  });
  const [error, setError] = useState('');

  // Pre-fill form when item is passed
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        brand: item.brand,
        model: item.model,
      });
      setError('');
    }
  }, [item]);

  if (!isOpen || !item) {
    return null;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    if (!formData.name.trim()) {
      setError('El nombre del instrumento es obligatorio.');
      return;
    }
    const updatedItem: InventoryItem = {
        ...item,
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        model: formData.model,
    };
    onConfirm(updatedItem);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 transform transition-all">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
            Editar Instrumento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <CloseIcon />
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del Instrumento
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            />
          </div>
           <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <input
              type="text"
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label htmlFor="edit-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Marca
              </label>
              <input
                type="text"
                id="edit-brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              />
            </div>
             <div>
              <label htmlFor="edit-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modelo
              </label>
              <input
                type="text"
                id="edit-model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-300">
            <p>Stock Inicial: <span className="font-semibold">{item.initialStock}</span></p>
            <p>Stock Actual: <span className="font-semibold">{item.currentStock}</span></p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">El stock no se puede editar desde aquí. Para ajustar el stock, elimine y vuelva a agregar el instrumento.</p>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
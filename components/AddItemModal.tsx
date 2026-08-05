import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../types';
import { CloseIcon } from './icons';

// We don't need id or currentStock from the form
type NewItemData = Omit<InventoryItem, 'id' | 'currentStock'>;

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newItemData: NewItemData) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [formData, setFormData] = useState<NewItemData>({
    name: '',
    description: '',
    brand: '',
    model: '',
    initialStock: 1,
  });
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        brand: '',
        model: '',
        initialStock: 1,
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'initialStock' ? parseInt(value, 10) || 0 : value }));
  };

  const handleConfirm = () => {
    if (!formData.name.trim()) {
      setError('El nombre del instrumento es obligatorio.');
      return;
    }
    if (formData.initialStock < 0) {
      setError('El stock inicial no puede ser negativo.');
      return;
    }
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4 transform transition-all">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
            Agregar Nuevo Instrumento
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <CloseIcon />
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del Instrumento
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Ej: Multímetro Digital"
            />
          </div>
           <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              placeholder="Ej: Con medidor de temperatura"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Marca
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                placeholder="Ej: Uni-T"
              />
            </div>
             <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modelo
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                placeholder="Ej: UT33D-PLUS/EC"
              />
            </div>
          </div>
          <div>
            <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Stock Inicial
            </label>
            <input
              type="number"
              id="initialStock"
              name="initialStock"
              value={formData.initialStock}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            />
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
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;

import React, { useState, useEffect } from 'react';
import { initialInventory } from './data';
import type { InventoryItem, Loan, DeletedItemLog, AccessLog, UserRole, FraudReport } from './types';
import { queryInventory } from './services/geminiService';
import { exportFraudReportPDF } from './services/pdfService';

import Header from './components/Header';
import InventoryTable from './components/InventoryTable';
import LoanHistory from './components/LoanHistory';
import DeletionHistory from './components/DeletionHistory';
import AccessHistory from './components/AccessHistory';
import FraudHistory from './components/FraudHistory';
import GeminiAISearch from './components/GeminiAISearch';
import UserLoginModal from './components/UserLoginModal';
import LoanModal from './components/LoanModal';
import AddItemModal from './components/AddItemModal';
import EditItemModal from './components/EditItemModal';
import FraudReportModal from './components/FraudReportModal';
import Toast from './components/Toast';
import { PlusIcon, ExclamationCircleIcon } from './components/icons';

// --- Local Storage Loader Helpers ---

const loadInventoryFromStorage = (): InventoryItem[] => {
    try {
        const storedInventory = localStorage.getItem('inventory');
        if (storedInventory) {
            return JSON.parse(storedInventory);
        }
    } catch (error) {
        console.error("Error al cargar el inventario desde localStorage:", error);
    }
    return initialInventory;
};

const loadLoansFromStorage = (): Loan[] => {
    try {
        const storedLoans = localStorage.getItem('loans');
        if (storedLoans) {
            return JSON.parse(storedLoans).map((loan: any) => ({
                ...loan,
                loanDate: new Date(loan.loanDate),
                returnDate: loan.returnDate ? new Date(loan.returnDate) : undefined,
            }));
        }
    } catch (error) {
        console.error("Error al cargar los préstamos desde localStorage:", error);
    }
    return [];
};

const loadDeletedItemsFromStorage = (): DeletedItemLog[] => {
    try {
        const storedDeletedItems = localStorage.getItem('deletedItems');
        if (storedDeletedItems) {
            return JSON.parse(storedDeletedItems).map((item: any) => ({
                ...item,
                deletionDate: new Date(item.deletionDate),
            }));
        }
    } catch (error) {
        console.error("Error al cargar los elementos eliminados desde localStorage:", error);
    }
    return [];
};

const initialSampleLogs: AccessLog[] = [
    {
        id: 'log-sample-1',
        firstName: 'Carlos',
        lastName: 'Gómez',
        role: 'Administrador',
        loginTime: new Date(Date.now() - 3600000 * 5),
        logoutTime: new Date(Date.now() - 3600000 * 2),
        status: 'Finalizado',
    },
    {
        id: 'log-sample-2',
        firstName: 'María',
        lastName: 'Fernández',
        role: 'Preceptor',
        loginTime: new Date(Date.now() - 3600000 * 2),
        status: 'Activo',
    }
];

const loadAccessLogsFromStorage = (): AccessLog[] => {
    try {
        const storedLogs = localStorage.getItem('accessLogs');
        if (storedLogs) {
            return JSON.parse(storedLogs).map((log: any) => ({
                ...log,
                loginTime: new Date(log.loginTime),
                logoutTime: log.logoutTime ? new Date(log.logoutTime) : undefined,
            }));
        }
    } catch (error) {
        console.error("Error al cargar registros de acceso:", error);
    }
    return initialSampleLogs;
};

const loadActiveSessionFromStorage = (): AccessLog | null => {
    try {
        const storedSession = localStorage.getItem('activeSession');
        if (storedSession) {
            const parsed = JSON.parse(storedSession);
            return {
                ...parsed,
                loginTime: new Date(parsed.loginTime),
                logoutTime: parsed.logoutTime ? new Date(parsed.logoutTime) : undefined,
            };
        }
    } catch (error) {
        console.error("Error al cargar sesión activa:", error);
    }
    return null;
};

const initialSampleFraudReports: FraudReport[] = [
  {
    id: 'fraud-sample-1',
    reportDate: new Date(Date.now() - 86400000 * 2),
    reporterName: 'Carlos Gómez',
    reporterRole: 'Administrador',
    incidentType: 'Sustracción / Robo',
    severity: 'Alta',
    itemName: 'Tester Multímetro Digital (Fluke 87V)',
    involvedPerson: 'Sin identificar',
    description: 'Se constató el faltante del Multímetro Fluke del armario N°3 durante la inspección de cierre de turno.',
    status: 'En Investigación',
  }
];

const loadFraudReportsFromStorage = (): FraudReport[] => {
    try {
        const stored = localStorage.getItem('fraudReports');
        if (stored) {
            return JSON.parse(stored).map((r: any) => ({
                ...r,
                reportDate: new Date(r.reportDate),
            }));
        }
    } catch (error) {
        console.error("Error al cargar reportes de fraude:", error);
    }
    return initialSampleFraudReports;
};


const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  itemName: string;
  defaultDeletedBy?: string;
  onClose: () => void;
  onConfirm: (deletedBy: string) => void;
}> = ({ isOpen, itemName, defaultDeletedBy = '', onClose, onConfirm }) => {
    const [deletedBy, setDeletedBy] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDeletedBy(defaultDeletedBy);
            setError('');
        }
    }, [isOpen, defaultDeletedBy]);

    if (!isOpen) {
        return null;
    }

    const handleConfirmClick = () => {
        if (!deletedBy.trim()) {
            setError('Por favor, ingrese el nombre del usuario que realiza la eliminación.');
            return;
        }
        onConfirm(deletedBy);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 transform transition-all">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <div className="text-red-600 dark:text-red-400">
                    <ExclamationCircleIcon />
                </div>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                  Eliminar Instrumento
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ¿Estás seguro de que quieres eliminar <strong className="text-gray-900 dark:text-white">{itemName}</strong>? Esta acción registrará la baja irreversiblemente.
                  </p>
                </div>
                <div className="mt-4">
                    <label htmlFor="deletedBy" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                        Responsable de la baja
                    </label>
                    <input
                        type="text"
                        id="deletedBy"
                        value={deletedBy}
                        onChange={(e) => setDeletedBy(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Nombre y apellido del usuario"
                    />
                    {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
                </div>
              </div>
            </div>
            <div className="mt-6 sm:flex sm:flex-row-reverse gap-2">
              <button
                type="button"
                onClick={handleConfirmClick}
                className="w-full inline-flex justify-center rounded-xl px-4 py-2.5 bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow-md shadow-red-500/20 sm:w-auto"
              >
                Confirmar Baja
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
    );
};


const App: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>(loadInventoryFromStorage);
    const [loans, setLoans] = useState<Loan[]>(loadLoansFromStorage);
    const [deletedItems, setDeletedItems] = useState<DeletedItemLog[]>(loadDeletedItemsFromStorage);
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>(loadAccessLogsFromStorage);
    const [fraudReports, setFraudReports] = useState<FraudReport[]>(loadFraudReportsFromStorage);
    const [activeSession, setActiveSession] = useState<AccessLog | null>(loadActiveSessionFromStorage);

    // Persistence effects
    useEffect(() => {
        try {
            localStorage.setItem('inventory', JSON.stringify(inventory));
        } catch (error) {
            console.error("Error al guardar inventario:", error);
        }
    }, [inventory]);

    useEffect(() => {
        try {
            localStorage.setItem('loans', JSON.stringify(loans));
        } catch (error) {
            console.error("Error al guardar préstamos:", error);
        }
    }, [loans]);
    
    useEffect(() => {
        try {
            localStorage.setItem('deletedItems', JSON.stringify(deletedItems));
        } catch (error) {
            console.error("Error al guardar eliminados:", error);
        }
    }, [deletedItems]);

    useEffect(() => {
        try {
            localStorage.setItem('accessLogs', JSON.stringify(accessLogs));
        } catch (error) {
            console.error("Error al guardar registros de acceso:", error);
        }
    }, [accessLogs]);

    useEffect(() => {
        try {
            localStorage.setItem('fraudReports', JSON.stringify(fraudReports));
        } catch (error) {
            console.error("Error al guardar reportes de fraude:", error);
        }
    }, [fraudReports]);

    useEffect(() => {
        try {
            if (activeSession) {
                localStorage.setItem('activeSession', JSON.stringify(activeSession));
            } else {
                localStorage.removeItem('activeSession');
            }
        } catch (error) {
            console.error("Error al guardar sesión activa:", error);
        }
    }, [activeSession]);


    // Navigation tab
    const [activeTab, setActiveTab] = useState<'all' | 'inventory' | 'loans' | 'deletions' | 'access' | 'fraud'>('all');

    // Modals state
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(inventory);
    const [isSearching, setIsSearching] = useState(false);
    const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);
    
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredInventory(inventory);
        }
    }, [inventory, searchQuery]);

    const handleSearch = async (overrideQuery?: string) => {
        const queryToUse = (typeof overrideQuery === 'string' ? overrideQuery : searchQuery).trim();
        if (!queryToUse) {
            setFilteredInventory(inventory);
            return;
        }

        // Require active login registration before calling the Gemini AI API
        if (!activeSession) {
            setPendingSearchQuery(queryToUse);
            setIsLoginModalOpen(true);
            showToast("Por razones de seguridad y control, debe registrar el ingreso (Administrador/Preceptor) antes de consultar la API.", "error");
            return;
        }

        await executeSearchQuery(queryToUse);
    };

    const executeSearchQuery = async (queryToUse: string) => {
        setIsSearching(true);
        try {
            const matchingIds = await queryInventory(queryToUse, inventory);
            const results = inventory.filter(item => matchingIds.includes(item.id));
            setFilteredInventory(results);
            if (results.length === 0) {
                showToast("No se encontraron instrumentos que coincidan con la búsqueda.", "error");
            } else {
                showToast(`Se encontraron ${results.length} instrumentos coincidentes.`, "success");
            }
        } catch (error) {
            console.error("Search failed:", error);
            showToast("La búsqueda con IA falló.", "error");
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setFilteredInventory(inventory);
    };
    
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // Access & Login Handlers
    const handleLogin = (firstName: string, lastName: string, role: UserRole) => {
        const newLog: AccessLog = {
            id: `log-${Date.now()}`,
            firstName,
            lastName,
            role,
            loginTime: new Date(),
            status: 'Activo',
        };

        setActiveSession(newLog);
        setAccessLogs(prev => [newLog, ...prev]);
        setIsLoginModalOpen(false);
        showToast(`¡Ingreso registrado! Bienvenido/a ${firstName} ${lastName} (${role}).`, 'success');

        if (pendingSearchQuery) {
            const queryToRun = pendingSearchQuery;
            setPendingSearchQuery(null);
            setTimeout(() => {
                executeSearchQuery(queryToRun);
            }, 150);
        }
    };

    const handleLogout = () => {
        if (!activeSession) return;
        const now = new Date();
        const updatedSession: AccessLog = {
            ...activeSession,
            logoutTime: now,
            status: 'Finalizado',
        };

        setAccessLogs(prev =>
            prev.map(log => log.id === activeSession.id ? updatedSession : log)
        );
        setActiveSession(null);
        showToast(`Sesión de ${activeSession.firstName} ${activeSession.lastName} finalizada.`, 'success');
    };

    const activeUserFormatted = activeSession
        ? `${activeSession.firstName} ${activeSession.lastName} (${activeSession.role})`
        : undefined;

    // Inventory operations
    const handleOpenLoanModal = (item: InventoryItem) => {
        if (!activeSession) {
            setIsLoginModalOpen(true);
            showToast("Debe registrar el ingreso (Administrador/Preceptor) antes de registrar préstamos.", "error");
            return;
        }
        setSelectedItem(item);
        setIsLoanModalOpen(true);
    };

    const handleCloseLoanModal = () => {
        setIsLoanModalOpen(false);
        setSelectedItem(null);
    };

    const handleOpenAddItemModal = () => {
        if (!activeSession) {
            setIsLoginModalOpen(true);
            showToast("Debe registrar el ingreso (Administrador/Preceptor) antes de agregar elementos.", "error");
            return;
        }
        setIsAddItemModalOpen(true);
    };

    const handleCloseAddItemModal = () => {
        setIsAddItemModalOpen(false);
    };

    const handleOpenEditModal = (item: InventoryItem) => {
        if (!activeSession) {
            setIsLoginModalOpen(true);
            showToast("Debe registrar el ingreso (Administrador/Preceptor) antes de editar elementos.", "error");
            return;
        }
        setEditingItem(item);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    const handleConfirmLoan = (teacherName: string, quantity: number) => {
        if (!selectedItem) return;

        const updateFunction = (prev: InventoryItem[]) => 
            prev.map(item =>
                item.id === selectedItem.id
                    ? { ...item, currentStock: item.currentStock - quantity }
                    : item
            );

        setInventory(updateFunction);
        setFilteredInventory(updateFunction);

        const newLoan: Loan = {
            id: `loan-${Date.now()}`,
            itemId: selectedItem.id,
            itemName: selectedItem.name,
            teacherName,
            quantity,
            loanDate: new Date(),
            registeredBy: activeUserFormatted,
        };

        setLoans(prevLoans => [newLoan, ...prevLoans]);
        handleCloseLoanModal();
        showToast('¡Préstamo registrado exitosamente!', 'success');
    };
    
    const handleConfirmAddItem = (newItemData: Omit<InventoryItem, 'id' | 'currentStock'>) => {
        const newItem: InventoryItem = {
            ...newItemData,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            currentStock: newItemData.initialStock,
        };
        
        const addFunction = (prev: InventoryItem[]) => [newItem, ...prev];
        setInventory(addFunction);
        if (!searchQuery.trim()) {
            setFilteredInventory(addFunction);
        }

        handleCloseAddItemModal();
        showToast('¡Instrumento agregado exitosamente!', 'success');
    };
    
    const handleConfirmEdit = (updatedItem: InventoryItem) => {
        const updateFunction = (prev: InventoryItem[]) =>
            prev.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );

        setInventory(updateFunction);
        setFilteredInventory(updateFunction);
        handleCloseEditModal();
        showToast('¡Instrumento actualizado exitosamente!', 'success');
    };

    const handleReturnItem = (loanId: string) => {
        const loanToReturn = loans.find(loan => loan.id === loanId);
        if (!loanToReturn) return;
        
        const updateFunction = (prev: InventoryItem[]) => 
            prev.map(item =>
                item.id === loanToReturn.itemId
                    ? { ...item, currentStock: item.currentStock + loanToReturn.quantity }
                    : item
            );

        setInventory(updateFunction);
        setFilteredInventory(updateFunction);

        setLoans(prevLoans =>
            prevLoans.map(loan =>
                loan.id === loanId ? { ...loan, returnDate: new Date() } : loan
            )
        );
        showToast('¡Devolución registrada exitosamente!', 'success');
    };

    const handleDeleteLoan = (loanId: string) => {
        const loanToDelete = loans.find(l => l.id === loanId);
        if (loanToDelete) {
            const deletedLog: DeletedItemLog = {
                id: `del-loan-${loanToDelete.id}`,
                name: `[Devolución Archivada] ${loanToDelete.itemName}`,
                description: `Préstamo a docente: ${loanToDelete.teacherName}. Entregado el ${new Date(loanToDelete.loanDate).toLocaleString('es-AR')}${loanToDelete.returnDate ? ` y devuelto el ${new Date(loanToDelete.returnDate).toLocaleString('es-AR')}` : ''}. Registrado por: ${loanToDelete.registeredBy || 'Sistema'}.`,
                brand: 'Historial Préstamo',
                model: `Docente: ${loanToDelete.teacherName}`,
                initialStock: loanToDelete.quantity,
                currentStock: 0,
                deletionDate: new Date(),
                deletedBy: activeUserFormatted || 'Usuario',
            };
            setDeletedItems(prev => [deletedLog, ...prev]);
        }
        setLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
        showToast('Registro trasladado al Historial de Eliminaciones.', 'success');
    };

    const handleClearReturnedLoans = () => {
        const returnedLoans = loans.filter(loan => loan.returnDate);
        if (returnedLoans.length === 0) return;

        const newDeletedLogs: DeletedItemLog[] = returnedLoans.map(loan => ({
            id: `del-loan-${loan.id}`,
            name: `[Devolución Archivada] ${loan.itemName}`,
            description: `Préstamo a docente: ${loan.teacherName}. Entregado el ${new Date(loan.loanDate).toLocaleString('es-AR')} y devuelto el ${new Date(loan.returnDate!).toLocaleString('es-AR')}. Registrado por: ${loan.registeredBy || 'Sistema'}.`,
            brand: 'Historial Préstamo',
            model: `Docente: ${loan.teacherName}`,
            initialStock: loan.quantity,
            currentStock: 0,
            deletionDate: new Date(),
            deletedBy: activeUserFormatted || 'Usuario',
        }));

        setDeletedItems(prev => [...newDeletedLogs, ...prev]);
        setLoans(prevLoans => prevLoans.filter(loan => !loan.returnDate));
        showToast(`${returnedLoans.length} registro(s) de devolución archivado(s) en Historial de Eliminaciones.`, 'success');
    };

    const handleClearDeletions = () => {
        setDeletedItems([]);
        showToast('Historial de eliminaciones vaciado exitosamente tras descargar el PDF de respaldo.', 'success');
    };

    const handleClearAccessLogs = () => {
        // Clear finished access logs, preserving active session if connected
        setAccessLogs(prevLogs => prevLogs.filter(log => log.status === 'Activo' || log.id === activeSession?.id));
        showToast('Registro de ingresos y horarios vaciado tras descargar el PDF de respaldo.', 'success');
    };

    const handleDeleteAccessLog = (logId: string) => {
        setAccessLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
        showToast('Registro de ingreso eliminado.', 'success');
    };

    const handleOpenDeleteModal = (itemId: string) => {
        if (!activeSession) {
            setIsLoginModalOpen(true);
            showToast("Debe registrar el ingreso (Administrador/Preceptor) antes de dar de baja elementos.", "error");
            return;
        }
        const itemToDelete = inventory.find(item => item.id === itemId);
        if (!itemToDelete) return;

        const hasActiveLoan = loans.some(loan => loan.itemId === itemId && !loan.returnDate);
        if (hasActiveLoan) {
            showToast("No se puede eliminar un instrumento con préstamos activos.", "error");
            return;
        }

        setDeletingItem(itemToDelete);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
    };

    const handleConfirmDelete = (deletedBy: string) => {
        if (!deletingItem) return;

        const deletedLogEntry: DeletedItemLog = {
            ...deletingItem,
            deletionDate: new Date(),
            deletedBy,
        };
        setDeletedItems(prev => [deletedLogEntry, ...prev]);

        const deleteFunction = (prev: InventoryItem[]) => prev.filter(item => item.id !== deletingItem.id);
        setInventory(deleteFunction);
        setFilteredInventory(deleteFunction);
        
        showToast('Instrumento eliminado exitosamente.', 'success');
        handleCloseDeleteModal();
    };

    // Fraud Report handlers
    const handleCreateFraudReport = (
        reportData: Omit<FraudReport, 'id' | 'reportDate' | 'status'>,
        exportPdf: boolean
    ) => {
        const newReport: FraudReport = {
            ...reportData,
            id: `fraud-${Date.now()}`,
            reportDate: new Date(),
            status: 'Pendiente',
        };

        setFraudReports(prev => [newReport, ...prev]);
        setIsFraudModalOpen(false);
        showToast('¡Reporte de Fraude / Irregularidad registrado exitosamente!', 'success');

        if (exportPdf) {
            exportFraudReportPDF(newReport, activeUserFormatted);
        }
    };

    const handleUpdateFraudStatus = (id: string, newStatus: 'Pendiente' | 'En Investigación' | 'Resuelto') => {
        setFraudReports(prev =>
            prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
        );
        showToast(`Estado del reporte actualizado a: ${newStatus}`, 'success');
    };

    const handleDeleteFraudReport = (id: string) => {
        setFraudReports(prev => prev.filter(r => r.id !== id));
        showToast('Reporte de fraude eliminado.', 'success');
    };


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased pb-16">
            <Header
                activeSession={activeSession}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onLogout={handleLogout}
            />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Navigation Bar / Section Switcher */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === 'all'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Vista General Completa
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === 'inventory'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            📦 Inventario ({inventory.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('loans')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === 'loans'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            📖 Préstamos ({loans.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('deletions')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === 'deletions'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            🗑️ Eliminaciones ({deletedItems.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('access')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === 'access'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            ⏰ Ingresos ({accessLogs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('fraud')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === 'fraud'
                                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/60'
                            }`}
                        >
                            🚨 Fraude ({fraudReports.length})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenAddItemModal}
                            className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-102 active:scale-98"
                        >
                            <PlusIcon />
                            <span>Agregar Instrumento</span>
                        </button>
                    </div>
                </div>

                {/* Gemini AI Search Hero Component */}
                {(activeTab === 'all' || activeTab === 'inventory') && (
                    <GeminiAISearch
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onSearch={handleSearch}
                        isSearching={isSearching}
                        onClear={handleClearSearch}
                    />
                )}

                {/* Main Inventory Section */}
                {(activeTab === 'all' || activeTab === 'inventory') && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>🛠️</span>
                                    <span>Inventario de Herramientas e Instrumentos</span>
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Listado completo del stock disponible para préstamos docentes
                                </p>
                            </div>
                        </div>

                        <InventoryTable 
                            inventory={filteredInventory} 
                            onLend={handleOpenLoanModal} 
                            onEdit={handleOpenEditModal}
                            onDelete={handleOpenDeleteModal}
                            isLoading={isSearching} 
                        />
                    </div>
                )}

                {/* Loans History Section */}
                {(activeTab === 'all' || activeTab === 'loans') && (
                    <LoanHistory 
                        loans={loans} 
                        onReturn={handleReturnItem} 
                        onDeleteLoan={handleDeleteLoan}
                        onClearReturned={handleClearReturnedLoans}
                        activeUser={activeUserFormatted}
                    />
                )}

                {/* Deletion History Section */}
                {(activeTab === 'all' || activeTab === 'deletions') && (
                    <DeletionHistory 
                        deletedItems={deletedItems} 
                        activeUser={activeUserFormatted}
                        onClearDeletions={handleClearDeletions}
                    />
                )}

                {/* Personnel Access Log & Schedule Section */}
                {(activeTab === 'all' || activeTab === 'access') && (
                    <AccessHistory 
                        accessLogs={accessLogs} 
                        activeUser={activeUserFormatted}
                        onLogoutCurrentSession={handleLogout}
                        onClearAccessLogs={handleClearAccessLogs}
                        onDeleteAccessLog={handleDeleteAccessLog}
                    />
                )}

                {/* Fraud & Security Incidents Section */}
                {(activeTab === 'all' || activeTab === 'fraud') && (
                    <FraudHistory
                        fraudReports={fraudReports}
                        activeUser={activeUserFormatted}
                        onUpdateStatus={handleUpdateFraudStatus}
                        onDeleteReport={handleDeleteFraudReport}
                    />
                )}
            </main>

            {/* Modals */}
            <UserLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={handleLogin}
            />

            <FraudReportModal
                isOpen={isFraudModalOpen}
                inventory={inventory}
                activeSession={activeSession}
                onClose={() => setIsFraudModalOpen(false)}
                onSubmit={handleCreateFraudReport}
            />

            <LoanModal
                isOpen={isLoanModalOpen}
                item={selectedItem}
                activeUser={activeUserFormatted}
                onClose={handleCloseLoanModal}
                onConfirm={handleConfirmLoan}
            />

            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={handleCloseAddItemModal}
                onConfirm={handleConfirmAddItem}
            />

            <EditItemModal
                isOpen={isEditModalOpen}
                item={editingItem}
                onClose={handleCloseEditModal}
                onConfirm={handleConfirmEdit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                itemName={deletingItem?.name || ''}
                defaultDeletedBy={activeUserFormatted || ''}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default App;

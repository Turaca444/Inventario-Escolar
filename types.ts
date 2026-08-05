export type UserRole = 'Administrador' | 'Preceptor';

export interface AccessLog {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  loginTime: Date;
  logoutTime?: Date;
  status: 'Activo' | 'Finalizado';
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  brand: string;
  model: string;
  initialStock: number;
  currentStock: number;
}

export interface Loan {
  id: string;
  itemId: string;
  itemName: string;
  teacherName: string;
  quantity: number;
  loanDate: Date;
  returnDate?: Date;
  registeredBy?: string;
}

export interface DeletedItemLog extends InventoryItem {
  deletionDate: Date;
  deletedBy: string;
}

export type FraudIncidentType = 
  | 'Sustracción / Robo'
  | 'Falsificación de Firma / Préstamo'
  | 'Alteración de Serie / Placa'
  | 'Acceso No Autorizado'
  | 'Uso Indebido de Equipos'
  | 'Otro';

export type FraudSeverity = 'Crítica' | 'Alta' | 'Media' | 'Baja';

export interface FraudReport {
  id: string;
  reportDate: Date;
  reporterName: string;
  reporterRole: string;
  incidentType: FraudIncidentType;
  severity: FraudSeverity;
  itemId?: string;
  itemName?: string;
  involvedPerson?: string;
  description: string;
  status: 'Pendiente' | 'En Investigación' | 'Resuelto';
}

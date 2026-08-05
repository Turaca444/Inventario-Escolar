import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Loan, DeletedItemLog, AccessLog, FraudReport } from '../types';

// Helper to format date nicely
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Adds a professional header banner to the PDF document
 */
const addPDFHeader = (
  doc: jsPDF,
  title: string,
  subtitle: string,
  generatedBy?: string
) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top accent bar (Indigo / Purple gradient)
  doc.setFillColor(67, 56, 202); // Indigo 700
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFillColor(99, 102, 241); // Indigo 500
  doc.rect(0, 22, pageWidth, 3, 'F');

  // Header Title inside top accent bar
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SISTEMA DE GESTIÓN Y CONTROL DE INVENTARIO', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Departamento de Programación e Instrumentación', 14, 17);

  // Document Title Box (Y=32) - Full width available for title
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), 14, 32);

  // Subtitle (Y=38)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(subtitle, 14, 38);

  // Metadata Row (Y=44) - Date and Time placed on a dedicated line to guarantee no overlap
  const nowStr = formatDate(new Date());
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  if (generatedBy) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado por: ${generatedBy}`, 14, 44);
  }

  doc.setFont('helvetica', 'bold');
  doc.text(`Fecha y hora de emisión: ${nowStr}`, pageWidth - 14, 44, { align: 'right' });

  // Thin separator line (Y=48)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 48, pageWidth - 14, 48);
};

/**
 * Adds a professional footer with signatures and page numbers
 */
const addPDFFooter = (doc: jsPDF, pageCount: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Signature lines on the last page or bottom of each page
    if (i === pageCount) {
      const sigY = pageHeight - 35;
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.5);

      // Signature 1
      doc.line(20, sigY, 80, sigY);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text('Firma Administrador', 50, sigY + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('Aclaración y Sello', 50, sigY + 9, { align: 'center' });

      // Signature 2
      doc.line(pageWidth - 80, sigY, pageWidth - 20, sigY);
      doc.setFont('helvetica', 'bold');
      doc.text('Firma Preceptor de Turno', pageWidth - 50, sigY + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('Aclaración y Sello', pageWidth - 50, sigY + 9, { align: 'center' });
    }

    // Footer bottom bar
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Documento oficial generado por la Plataforma de Inventario', 14, pageHeight - 9);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 9, { align: 'right' });
  }
};

/**
 * Export Loan History to Professional PDF
 */
export const exportLoansPDF = (loans: Loan[], activeUser?: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const activeLoans = loans.filter((l) => !l.returnDate);
  const returnedLoans = loans.filter((l) => l.returnDate);

  addPDFHeader(
    doc,
    'Historial General de Préstamos y Devoluciones',
    `Reporte consolidado - Total préstamos: ${loans.length} (${activeLoans.length} activos / ${returnedLoans.length} devueltos)`,
    activeUser
  );

  const tableData = loans.map((loan, idx) => [
    (idx + 1).toString(),
    loan.itemName,
    loan.teacherName,
    loan.quantity.toString(),
    formatDate(loan.loanDate),
    loan.returnDate ? formatDate(loan.returnDate) : 'EN PRÉSTAMO',
    loan.returnDate ? 'DEVUELTO' : 'ACTIVO',
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['#', 'Instrumento', 'Docente / Solicitante', 'Cant.', 'F. Préstamo', 'F. Devolución', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [49, 46, 129], // Indigo 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 45 },
      2: { cellWidth: 40 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 32 },
      5: { halign: 'center', cellWidth: 32 },
      6: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const value = data.cell.raw as string;
        if (value === 'ACTIVO') {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        } else {
          data.cell.styles.textColor = [22, 101, 52]; // Green
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 40 },
  });

  const pageCount = doc.getNumberOfPages();
  addPDFFooter(doc, pageCount);

  doc.save(`Historial_Prestamos_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Export Deletion History to Professional PDF
 */
export const exportDeletionsPDF = (deletedItems: DeletedItemLog[], activeUser?: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  addPDFHeader(
    doc,
    'Historial de Bajas y Eliminación de Herramientas',
    `Registro auditado de bajas de inventario - Total bajas: ${deletedItems.length}`,
    activeUser
  );

  const tableData = deletedItems.map((item, idx) => [
    (idx + 1).toString(),
    item.id,
    item.name,
    `${item.brand || '-'} / ${item.model || '-'}`,
    item.initialStock?.toString() || '1',
    formatDate(item.deletionDate),
    item.deletedBy || 'No registrado',
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['#', 'ID Código', 'Instrumento', 'Marca / Modelo', 'Stock Org.', 'Fecha de Baja', 'Responsable de Baja']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [153, 27, 27], // Red 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242], // Light pink tint
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 25 },
      2: { fontStyle: 'bold', cellWidth: 45 },
      3: { cellWidth: 35 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 30 },
      6: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14, bottom: 40 },
  });

  const pageCount = doc.getNumberOfPages();
  addPDFFooter(doc, pageCount);

  doc.save(`Historial_Eliminaciones_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Export Access History (Ingresos y Horarios) to Professional PDF
 */
export const exportAccessLogsPDF = (accessLogs: AccessLog[], activeUser?: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  addPDFHeader(
    doc,
    'Registro de Ingresos y Horarios de Personal',
    `Control de Asistencia de Administradores y Preceptores - Total registros: ${accessLogs.length}`,
    activeUser
  );

  const tableData = accessLogs.map((log, idx) => {
    const fullName = `${log.firstName} ${log.lastName}`;
    const loginStr = formatDate(log.loginTime);
    const logoutStr = log.logoutTime ? formatDate(log.logoutTime) : 'SESIÓN ACTIVA';

    // Calculate duration if logoutTime exists
    let durationStr = 'En curso';
    if (log.logoutTime) {
      const loginD = typeof log.loginTime === 'string' ? new Date(log.loginTime) : log.loginTime;
      const logoutD = typeof log.logoutTime === 'string' ? new Date(log.logoutTime) : log.logoutTime;
      const diffMs = logoutD.getTime() - loginD.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      durationStr = `${hours}h ${mins}m`;
    }

    return [
      (idx + 1).toString(),
      fullName,
      log.role.toUpperCase(),
      loginStr,
      logoutStr,
      durationStr,
      log.status,
    ];
  });

  autoTable(doc, {
    startY: 52,
    head: [['#', 'Nombre y Apellido', 'Rol / Cargo', 'Horario de Ingreso', 'Horario de Salida', 'Permanencia', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 45 },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 32 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const value = data.cell.raw as string;
        if (value === 'Activo') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald Green
        } else {
          data.cell.styles.textColor = [100, 116, 139]; // Slate 500
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 40 },
  });

  const pageCount = doc.getNumberOfPages();
  addPDFFooter(doc, pageCount);

  doc.save(`Registro_Ingresos_Horarios_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Generates an individual official PDF Incident / Fraud Report
 */
export const exportFraudReportPDF = (report: FraudReport, generatedBy?: string): void => {
  const doc = new jsPDF();
  addPDFHeader(
    doc,
    'ACTA DE DENUNCIA E IRREGULARIDAD / FRAUDE',
    'Reporte de Seguridad e Incidencia en Inventario',
    generatedBy || report.reporterName
  );

  const startY = 52;
  doc.setFillColor(239, 68, 68); // Red banner
  doc.rect(14, startY, 182, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`SEVERIDAD DE LA ALERTA: ${report.severity.toUpperCase()} | ESTADO: ${report.status.toUpperCase()}`, 18, startY + 6.5);

  autoTable(doc, {
    startY: startY + 14,
    head: [['Campo de Registro', 'Detalle de la Incidencia']],
    body: [
      ['Código de Alerta ID', report.id],
      ['Fecha y Hora de Reporte', formatDate(report.reportDate)],
      ['Reportado Por', `${report.reporterName} (${report.reporterRole})`],
      ['Tipo de Irregularidad / Fraude', report.incidentType],
      ['Severidad', report.severity],
      ['Elemento / Instrumento Afectado', report.itemName || 'No especificado / General'],
      ['Persona / Involucrado Sospechoso', report.involvedPerson || 'Sin identificar / No especificado'],
      ['Estado del Reporte', report.status],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 250, 252] },
      1: { cellWidth: 122 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Description box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DESCRIPCIÓN DETALLADA DE LOS HECHOS / HALLAZGOS:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const splitDesc = doc.splitTextToSize(report.description, 182);
  doc.rect(14, finalY + 4, 182, Math.max(25, splitDesc.length * 5 + 6), 'S');
  doc.text(splitDesc, 18, finalY + 10);

  const signY = finalY + Math.max(25, splitDesc.length * 5 + 6) + 35;
  if (signY < doc.internal.pageSize.getHeight() - 40) {
    doc.line(25, signY, 85, signY);
    doc.line(125, signY, 185, signY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Firma de Quien Denuncia / Informa', 25, signY + 5);
    doc.text('Firma Autoridad / Auditoría', 125, signY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(report.reporterName, 25, signY + 9);
    doc.text('Supervisión de Inventario', 125, signY + 9);
  }

  const pageCount = doc.getNumberOfPages();
  addPDFFooter(doc, pageCount);

  doc.save(`Acta_Fraude_${report.id.slice(-6)}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Generates an Audit Log PDF of all registered Fraud & Security Incidents
 */
export const exportAllFraudReportsPDF = (reports: FraudReport[], generatedBy?: string): void => {
  const doc = new jsPDF();
  addPDFHeader(
    doc,
    'REGISTRO GENERAL DE ALERTAS DE FRAUDE E INCIDENCIAS',
    `Total de Denuncias y Reportes Registrados: ${reports.length}`,
    generatedBy
  );

  const tableData = reports.map((rep, idx) => [
    (idx + 1).toString(),
    formatDate(rep.reportDate),
    `${rep.reporterName}\n(${rep.reporterRole})`,
    rep.incidentType,
    rep.severity,
    rep.itemName || '-',
    rep.involvedPerson || '-',
    rep.status,
  ]);

  autoTable(doc, {
    startY: 52,
    head: [['#', 'Fecha/Hora', 'Denunciante', 'Tipo de Irregularidad', 'Severidad', 'Equipo Afectado', 'Involucrado', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [153, 27, 27], // Dark Red
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242], // Soft red tint
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { halign: 'center', cellWidth: 26 },
      2: { fontStyle: 'bold', cellWidth: 28 },
      3: { cellWidth: 32 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      5: { cellWidth: 28 },
      6: { cellWidth: 23 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
    },
    margin: { left: 14, right: 14, bottom: 40 },
  });

  const pageCount = doc.getNumberOfPages();
  addPDFFooter(doc, pageCount);

  doc.save(`Auditoria_Reportes_Fraude_${new Date().toISOString().slice(0, 10)}.pdf`);
};


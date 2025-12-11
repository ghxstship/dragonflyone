import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// =====================================================
// PDF GENERATOR UTILITY
// =====================================================

export interface PDFColumn {
  header: string;
  dataKey: string;
  width?: number;
}

export interface PDFTableData {
  columns: PDFColumn[];
  rows: Record<string, string | number | boolean | null | undefined>[];
}

export interface PDFGeneratorOptions {
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
  headerColor?: string;
  accentColor?: string;
  includeTimestamp?: boolean;
  includePageNumbers?: boolean;
  logo?: string;
  footer?: string;
}

export interface PDFSection {
  type: 'heading' | 'paragraph' | 'table' | 'keyValue' | 'spacer';
  content?: string;
  data?: PDFTableData;
  keyValues?: Array<{ label: string; value: string }>;
  level?: 1 | 2 | 3;
  height?: number;
}

/**
 * PDF Generator class for creating professional PDF documents
 */
export class PDFGenerator {
  private doc: jsPDF;
  private options: PDFGeneratorOptions;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private contentWidth: number;

  constructor(options: PDFGeneratorOptions) {
    this.options = {
      orientation: 'portrait',
      pageSize: 'a4',
      headerColor: '#000000',
      accentColor: '#6366f1',
      includeTimestamp: true,
      includePageNumbers: true,
      ...options,
    };

    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.pageSize,
    });

    this.margin = 20;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.currentY = this.margin;

    this.addHeader();
  }

  private addHeader(): void {
    const { title, subtitle, headerColor, includeTimestamp } = this.options;

    // Title
    this.doc.setFontSize(24);
    this.doc.setTextColor(headerColor || '#000000');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY + 10);
    this.currentY += 15;

    // Subtitle
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setTextColor('#666666');
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += 8;
    }

    // Timestamp
    if (includeTimestamp) {
      this.doc.setFontSize(10);
      this.doc.setTextColor('#999999');
      const timestamp = new Date().toLocaleString();
      this.doc.text(`Generated: ${timestamp}`, this.margin, this.currentY);
      this.currentY += 5;
    }

    // Divider line
    this.doc.setDrawColor(headerColor || '#000000');
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY + 3, this.pageWidth - this.margin, this.currentY + 3);
    this.currentY += 10;
  }

  private checkPageBreak(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin - 10) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Add a heading to the document
   */
  addHeading(text: string, level: 1 | 2 | 3 = 2): void {
    const sizes = { 1: 18, 2: 14, 3: 12 };
    const spacing = { 1: 12, 2: 10, 3: 8 };

    this.checkPageBreak(spacing[level] + 5);

    this.doc.setFontSize(sizes[level]);
    this.doc.setTextColor(this.options.headerColor || '#000000');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += spacing[level];
  }

  /**
   * Add a paragraph of text
   */
  addParagraph(text: string): void {
    this.checkPageBreak(15);

    this.doc.setFontSize(11);
    this.doc.setTextColor('#333333');
    this.doc.setFont('helvetica', 'normal');

    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 5 + 5;
  }

  /**
   * Add a table to the document
   */
  addTable(data: PDFTableData): void {
    const { columns, rows } = data;

    this.checkPageBreak(30);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [columns.map(col => col.header)],
      body: rows.map(row => columns.map(col => String(row[col.dataKey] ?? ''))),
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: this.options.accentColor || '#6366f1',
        textColor: '#ffffff',
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: '#333333',
      },
      alternateRowStyles: {
        fillColor: '#f9fafb',
      },
      columnStyles: columns.reduce((acc, col, idx) => {
        if (col.width) {
          acc[idx] = { cellWidth: col.width };
        }
        return acc;
      }, {} as Record<number, { cellWidth: number }>),
    });

    // Update currentY after table
    const finalY = (this.doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    this.currentY = (finalY || this.currentY) + 10;
  }

  /**
   * Add key-value pairs (like a summary section)
   */
  addKeyValuePairs(pairs: Array<{ label: string; value: string }>): void {
    this.checkPageBreak(pairs.length * 7 + 5);

    pairs.forEach(({ label, value }) => {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor('#666666');
      this.doc.text(`${label}:`, this.margin, this.currentY);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor('#333333');
      this.doc.text(value, this.margin + 50, this.currentY);

      this.currentY += 6;
    });

    this.currentY += 5;
  }

  /**
   * Add vertical spacing
   */
  addSpacer(height: number = 10): void {
    this.currentY += height;
  }

  /**
   * Add multiple sections at once
   */
  addSections(sections: PDFSection[]): void {
    sections.forEach(section => {
      switch (section.type) {
        case 'heading':
          this.addHeading(section.content || '', section.level || 2);
          break;
        case 'paragraph':
          this.addParagraph(section.content || '');
          break;
        case 'table':
          if (section.data) {
            this.addTable(section.data);
          }
          break;
        case 'keyValue':
          if (section.keyValues) {
            this.addKeyValuePairs(section.keyValues);
          }
          break;
        case 'spacer':
          this.addSpacer(section.height || 10);
          break;
      }
    });
  }

  /**
   * Add page numbers to all pages
   */
  private addPageNumbers(): void {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setTextColor('#999999');
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  /**
   * Add footer to all pages
   */
  private addFooter(): void {
    if (!this.options.footer) return;

    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor('#999999');
      this.doc.text(
        this.options.footer,
        this.margin,
        this.pageHeight - 10
      );
    }
  }

  /**
   * Generate the PDF and return as Blob
   */
  toBlob(): Blob {
    if (this.options.includePageNumbers) {
      this.addPageNumbers();
    }
    this.addFooter();

    return this.doc.output('blob');
  }

  /**
   * Generate the PDF and return as base64 string
   */
  toBase64(): string {
    if (this.options.includePageNumbers) {
      this.addPageNumbers();
    }
    this.addFooter();

    return this.doc.output('datauristring');
  }

  /**
   * Download the PDF
   */
  download(filename: string): void {
    if (this.options.includePageNumbers) {
      this.addPageNumbers();
    }
    this.addFooter();

    this.doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Generate a simple report PDF
 */
export function generateReportPDF(
  title: string,
  sections: PDFSection[],
  options?: Partial<PDFGeneratorOptions>
): Blob {
  const generator = new PDFGenerator({ title, ...options });
  generator.addSections(sections);
  return generator.toBlob();
}

/**
 * Generate a table-based PDF (e.g., for data exports)
 */
export function generateTablePDF(
  title: string,
  data: PDFTableData,
  options?: Partial<PDFGeneratorOptions>
): Blob {
  const generator = new PDFGenerator({ title, ...options });
  generator.addTable(data);
  return generator.toBlob();
}

/**
 * Generate a wrap report PDF
 */
export function generateWrapReportPDF(
  productionName: string,
  summary: Array<{ label: string; value: string }>,
  sections: {
    incidents?: PDFTableData;
    crewHours?: PDFTableData;
    equipment?: PDFTableData;
    expenses?: PDFTableData;
    lessonsLearned?: string[];
    recommendations?: string[];
  }
): Blob {
  const generator = new PDFGenerator({
    title: `Wrap Report: ${productionName}`,
    subtitle: 'Production Summary and Analysis',
    orientation: 'portrait',
  });

  // Summary section
  generator.addHeading('Summary', 1);
  generator.addKeyValuePairs(summary);
  generator.addSpacer();

  // Incidents
  if (sections.incidents && sections.incidents.rows.length > 0) {
    generator.addHeading('Incidents', 2);
    generator.addTable(sections.incidents);
  }

  // Crew Hours
  if (sections.crewHours && sections.crewHours.rows.length > 0) {
    generator.addHeading('Crew Hours Summary', 2);
    generator.addTable(sections.crewHours);
  }

  // Equipment
  if (sections.equipment && sections.equipment.rows.length > 0) {
    generator.addHeading('Equipment Usage', 2);
    generator.addTable(sections.equipment);
  }

  // Expenses
  if (sections.expenses && sections.expenses.rows.length > 0) {
    generator.addHeading('Expense Summary', 2);
    generator.addTable(sections.expenses);
  }

  // Lessons Learned
  if (sections.lessonsLearned && sections.lessonsLearned.length > 0) {
    generator.addHeading('Lessons Learned', 2);
    sections.lessonsLearned.forEach((lesson, idx) => {
      generator.addParagraph(`${idx + 1}. ${lesson}`);
    });
  }

  // Recommendations
  if (sections.recommendations && sections.recommendations.length > 0) {
    generator.addHeading('Recommendations', 2);
    sections.recommendations.forEach((rec, idx) => {
      generator.addParagraph(`${idx + 1}. ${rec}`);
    });
  }

  return generator.toBlob();
}

/**
 * Generate a settlement report PDF
 */
export function generateSettlementPDF(
  eventName: string,
  summary: Array<{ label: string; value: string }>,
  lineItems: PDFTableData
): Blob {
  const generator = new PDFGenerator({
    title: `Settlement Report: ${eventName}`,
    subtitle: 'Financial Summary',
    orientation: 'portrait',
  });

  generator.addHeading('Summary', 1);
  generator.addKeyValuePairs(summary);
  generator.addSpacer();

  generator.addHeading('Line Items', 2);
  generator.addTable(lineItems);

  return generator.toBlob();
}

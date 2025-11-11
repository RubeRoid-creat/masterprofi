import * as XLSX from 'xlsx';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

/**
 * Экспорт данных в Excel с форматированием
 */
export function exportToExcel(
  data: any[],
  columns: { key: string; label: string; format?: (value: any) => any }[],
  options: ExportOptions = {}
): void {
  if (!data || data.length === 0) {
    alert('Нет данных для экспорта');
    return;
  }

  // Подготовка данных для Excel
  const excelData = data.map((item) => {
    const row: any = {};
    columns.forEach((col) => {
      const value = item[col.key];
      row[col.label] = col.format ? col.format(value) : value;
    });
    return row;
  });

  // Создание рабочей книги
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Настройка ширины колонок
  const colWidths = columns.map((col) => ({
    wch: Math.max(col.label.length, 15),
  }));
  ws['!cols'] = colWidths;

  // Стилизация заголовков (жирный шрифт)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  
  // Стили для заголовков
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FFE0E0E0' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Добавление листа в книгу
  XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Данные');

  // Сохранение файла
  const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Экспорт данных в CSV
 */
export function exportToCSV(
  data: any[],
  columns: { key: string; label: string; format?: (value: any) => any }[],
  options: ExportOptions = {}
): void {
  if (!data || data.length === 0) {
    alert('Нет данных для экспорта');
    return;
  }

  // Подготовка заголовков
  const headers = columns.map((col) => col.label).join(',');

  // Подготовка данных
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = item[col.key];
        const formatted = col.format ? col.format(value) : value;
        // Экранирование запятых и кавычек в CSV
        const stringValue = String(formatted || '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  // Объединение заголовков и данных
  const csvContent = [headers, ...rows].join('\n');

  // Создание BOM для корректного отображения кириллицы
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Создание ссылки для скачивания
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', options.filename || `export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Форматирование даты для экспорта
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Форматирование даты и времени для экспорта
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматирование суммы для экспорта
 */
export function formatAmount(amount: number | string): string {
  if (amount === null || amount === undefined) return '0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  return isNaN(num) ? '0.00' : num.toFixed(2);
}


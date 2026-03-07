/**
 * Utility to export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file
 */
export const exportToCSV = (data, fileName = 'student_report.csv') => {
    if (!data || !data.length) return;

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV rows
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const cell = row[header] === null || row[header] === undefined ? '' : row[header];
                // Handle strings with commas by wrapping in quotes
                return typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell;
            }).join(',')
        )
    ].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

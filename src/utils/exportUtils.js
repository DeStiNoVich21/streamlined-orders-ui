export const downloadCSV = (data, fileName = "export.csv") => {
    if (!data.length) return;
    
    // Берем ключи из первого объекта как заголовки
    const headers = Object.keys(data[0]).join(',');
    
    const rows = data.map(obj => 
        Object.values(obj)
            .map(val => `"${val}"`) // Оборачиваем в кавычки, чтобы запятые внутри текста не ломали структуру
            .join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
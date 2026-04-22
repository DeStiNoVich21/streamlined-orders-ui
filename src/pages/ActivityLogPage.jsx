import { useState, useEffect } from 'react';

export const ActivityLogPage = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Читаем логи из localStorage
        const data = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        setLogs(data);
    }, []);

    const clearLogs = () => {
        localStorage.removeItem('activityLogs');
        setLogs([]);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black uppercase">Activity Log (Local)</h2>
                <button onClick={clearLogs} className="text-xs text-red-500 font-bold underline">Очистить историю</button>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 text-[10px] uppercase font-black text-slate-400">User</th>
                            <th className="p-4 text-[10px] uppercase font-black text-slate-400">Action</th>
                            <th className="p-4 text-[10px] uppercase font-black text-slate-400">Object</th>
                            <th className="p-4 text-[10px] uppercase font-black text-slate-400">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="p-4 font-bold text-blue-600">{log.userName}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                                        log.action === 'Удаление' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-600">{log.entityName}</td>
                                <td className="p-4 text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
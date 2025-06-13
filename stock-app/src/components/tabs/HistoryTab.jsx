import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export function HistoryTab({ active }) {
    const [transactions, setTransactions] = useState([]);
    const [filters, setFilters] = useState({});

    const loadHistory = useCallback(() => {
        const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
        api.getTransactions(cleanFilters).then(setTransactions).catch(err => alert(err.message));
    }, [filters]);
    
    useEffect(() => { if (active) loadHistory(); }, [active, loadHistory]);

    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFilterSubmit = (e) => { e.preventDefault(); loadHistory(); };
    const clearFilters = () => { 
        setFilters({}); 
        const form = document.getElementById('history-filter-form');
        if (form) form.reset();
        // Disparar loadHistory após limpar para recarregar com tudo
        const cleanFilters = {};
        api.getTransactions(cleanFilters).then(setTransactions).catch(err => alert(err.message));
    };

    return (
        <div>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <form id="history-filter-form" onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                    <div><label className="block text-sm font-medium text-gray-700">Data Início</label><input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="date" name="dateStart" onChange={handleFilterChange}/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Data Fim</label><input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="date" name="dateEnd" onChange={handleFilterChange}/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Ordem (OP)</label><input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="text" name="op" onChange={handleFilterChange} placeholder="Digite o nº da OP"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Tipo</label><select name="type" onChange={handleFilterChange} defaultValue="" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"><option value="">Todos</option><option value="Entrada">Entrada</option><option value="Saída">Saída</option></select></div>
                    <div className="flex space-x-2"><button type="submit" className="w-full font-bold py-2 px-4 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white">Filtrar</button><button type="button" onClick={clearFilters} className="w-full font-bold py-2 px-4 rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-800">Limpar</button></div>
                </form>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino / OP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Un.</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.length > 0 ? transactions.map(t => (
                            <tr key={t.transaction_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.transaction_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.description}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${t.type === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                    <i className={`fas ${t.type === 'Entrada' ? 'fa-arrow-up' : 'fa-arrow-down'} mr-2`}></i>{t.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{t.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.op_number || t.recipient || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.price ? parseFloat(t.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center p-8 text-gray-500">Nenhum dado para exibir.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

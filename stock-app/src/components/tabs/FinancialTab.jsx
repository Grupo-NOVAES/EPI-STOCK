import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../../services/api.js';
import { Loader } from './../Loader.jsx';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export function FinancialTab({ active }) {
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const loadSummary = useCallback((currentFilters) => {
        setIsLoading(true);
        const cleanFilters = Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v));
        api.getFinancialSummary(cleanFilters)
            .then(setSummary)
            .catch(err => alert(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (active) {
            loadSummary(filters);
        }
    }, [active]);
    
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // *** LÓGICA ATUALIZADA AQUI ***
    const handleFilterSubmit = (e) => {
        e.preventDefault(); // Previne o recarregamento da página
        loadSummary(filters); // Busca os dados com os filtros atuais
    };

    const formatCurrency = (val) => (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const categoryChartData = useMemo(() => ({
        labels: summary ? Object.keys(summary.stockValueByCategory) : [],
        datasets: [{ data: summary ? Object.values(summary.stockValueByCategory) : [], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'], hoverOffset: 4 }]
    }), [summary]);

    const topItemsChartData = useMemo(() => ({
        labels: summary ? summary.top5ValuableItems.map(i => i.description) : [],
        datasets: [{ label: 'Valor em Estoque (R$)', data: summary ? summary.top5ValuableItems.map(i => i.itemValue) : [], backgroundColor: '#10b981' }]
    }), [summary]);
    
    if (isLoading) return <Loader />;
    if (!summary) return <p>Não foi possível carregar os dados financeiros.</p>

    return (
        <div>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                {/* O formulário agora chama handleFilterSubmit */}
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div><label className="block text-sm font-medium text-gray-700">Data Início</label><input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="date" name="dateStart" onChange={handleFilterChange}/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Data Fim</label><input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="date" name="dateEnd" onChange={handleFilterChange}/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Ordem (OP)</label><input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="text" name="op" onChange={handleFilterChange} placeholder="Digite o nº da OP"/></div>
                    <div><button type="submit" className="w-full font-bold py-2 px-4 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white">Filtrar</button></div>
                </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm font-medium text-gray-500">Valor Total do Estoque (Atual)</p><p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary.totalStockValue)}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm font-medium text-gray-500">Item Mais Valioso (Atual)</p><p className="text-2xl font-bold text-gray-900 mt-1 truncate">{summary.mostValuableItem?.description || 'N/A'}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-sm font-medium text-gray-500">Custo Saídas (no Período)</p><p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary.outgoings)}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col"><h3 className="font-bold mb-4">Valor por Categoria (Atual)</h3><div className="relative h-64 md:h-80 w-full"><Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }}}} /></div></div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md flex flex-col"><h3 className="font-bold mb-4">Top 5 Itens por Valor (Atual)</h3><div className="relative h-64 md:h-80 w-full"><Bar data={topItemsChartData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}}} /></div></div>
            </div>
        </div>
    );
}

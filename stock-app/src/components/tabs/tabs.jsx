export function Tabs({ activeTab, setActiveTab }) {
    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
        { id: 'financial', label: 'Análise Financeira', icon: 'fa-chart-line' },
        { id: 'history', label: 'Histórico', icon: 'fa-history' },
        { id: 'items', label: 'Gerenciar Itens', icon: 'fa-box-open' },
        { id: 'reports', label: 'Relatórios', icon: 'fa-file-excel' },
    ];

    return (
        <div className="mb-6 border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-button py-3 px-2 text-sm font-medium text-gray-500 hover:text-gray-700 mr-2 ${activeTab === tab.id ? 'active' : ''}`}>
                        <i className={`fas ${tab.icon} mr-2 opacity-75`}></i>{tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
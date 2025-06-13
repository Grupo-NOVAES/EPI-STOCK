import { useState, useMemo } from 'react';

export function DashboardTab({ stock, onOpenTransactionModal, onEditItem }) {
    const [view, setView] = useState('categories');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = useMemo(() => stock ? Object.values(stock.reduce((acc, item) => {
        const catName = item.category || 'Sem Categoria';
        if (!acc[catName]) acc[catName] = { name: catName, itemCount: 0, totalStock: 0 };
        acc[catName].itemCount++;
        acc[catName].totalStock += item.current_stock;
        return acc;
    }, {})).sort((a,b) => a.name.localeCompare(b.name)) : [], [stock]);

    const filteredItems = useMemo(() => stock.filter(item => (item.category || 'Sem Categoria') === selectedCategory), [stock, selectedCategory]);
    
    const getStockStatusClass = item => item.current_stock <= 0 ? 'bg-red-100 text-red-800' : item.current_stock <= item.min_stock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
    const getCAStatusHTML = (item) => {
        const validityDate = item.ca_validity_date ? new Date(item.ca_validity_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/D';
        if(item.ca_status === 'OK') return <><i className="fas fa-check-circle mr-1 text-green-500"></i>CA {item.ca_number || ''} válido até {validityDate}</>;
        if(item.ca_status === 'VenceEmBreve') return <><i className="fas fa-exclamation-triangle mr-1 text-yellow-500"></i>CA {item.ca_number || ''} vence em {validityDate}</>;
        if(item.ca_status === 'Vencido') return <><i className="fas fa-times-circle mr-1 text-red-500"></i>CA {item.ca_number || ''} VENCIDO em {validityDate}</>;
        return <><i className="fas fa-question-circle mr-1 text-gray-400"></i>CA não informado</>;
    }

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-700">{view === 'categories' ? 'Categorias de Itens' : `Itens em ${selectedCategory}`}</h2>
                <div className="flex items-center gap-2">
                    {view === 'items' && <button onClick={() => setView('categories')} className="font-bold py-2 px-4 rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-800"><i className="fas fa-arrow-left mr-2"></i>Voltar</button>}
                    <button onClick={() => onOpenTransactionModal('Entrada')} className="font-bold py-2 px-4 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white"><i className="fas fa-arrow-up mr-2"></i>Registar Entrada</button>
                    <button onClick={() => onOpenTransactionModal('Saída')} className="font-bold py-2 px-4 rounded-lg shadow-md bg-red-600 hover:bg-red-700 text-white"><i className="fas fa-arrow-down mr-2"></i>Registar Saída</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {view === 'categories' ? categories.map(cat => (
                    <div key={cat.name} onClick={() => { setView('items'); setSelectedCategory(cat.name); }} className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <div className="flex justify-between items-center"><h4 className="font-bold text-xl text-gray-800">{cat.name}</h4><span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">{cat.itemCount} Itens</span></div>
                        <div className="mt-4"><p className="text-3xl font-bold text-gray-900">{cat.totalStock}<span className="text-lg font-normal text-gray-500 ml-2">em stock</span></p></div>
                    </div>
                )) : filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                        <div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStockStatusClass(item)} float-right`}>{item.current_stock <= 0 ? 'Zerado' : (item.current_stock <= item.min_stock ? 'Baixo' : 'OK')}</span>
                            <h4 className="font-bold text-lg text-gray-800 mb-1">{item.description}</h4>
                            <p className="text-5xl font-bold text-gray-900">{item.current_stock}<span className="text-lg font-normal text-gray-500 ml-2">{item.unit}</span></p>
                            {/* *** NOVO BLOCO PARA MOSTRAR STOCK POR TAMANHO *** */}
                            {item.sizes && item.sizes.length > 0 && (
                                <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                                    {Object.entries(item.stock_by_size).map(([size, quantity]) => (
                                        <span key={size} className="font-medium">Tamanho {size}: <b className={quantity > 0 ? 'text-gray-800' : 'text-red-500'}>{quantity}</b></span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-gray-600 mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span>{getCAStatusHTML(item)}</span>
                            <button onClick={() => onEditItem(item)} className="text-blue-600 hover:text-blue-900 font-semibold text-xs"><i className="fas fa-edit mr-1"></i>Editar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

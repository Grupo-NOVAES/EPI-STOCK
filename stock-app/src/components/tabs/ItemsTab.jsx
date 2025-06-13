export function ItemsTab({ items, onOpenItemModal, onEditItem }) {
    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => onOpenItemModal(null)} className="font-bold py-2 px-4 rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white">
                    <i className="fas fa-plus-circle mr-2"></i>Adicionar Novo Item
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº CA</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length > 0 ? items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}<span className="block text-xs text-gray-500">ID: {item.id}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.category || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.ca_number || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEditItem(item)} className="text-blue-600 hover:text-blue-900 font-semibold">
                                        <i className="fas fa-edit mr-1"></i>Editar
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center p-8 text-gray-500">Nenhum dado para exibir.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
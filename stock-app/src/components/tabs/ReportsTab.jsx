export function ReportsTab() {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const filters = Object.fromEntries(formData.entries());
        const params = new URLSearchParams();
        
        if(filters.dateStart) params.append('dateStart', filters.dateStart);
        if(filters.dateEnd) params.append('dateEnd', filters.dateEnd);
        if (filters.type && filters.type !== 'Ambos') params.append('type', filters.type);
        if (filters.op) params.append('op', filters.op);
        if (filters.purchase_order_id) params.append('purchase_order_id', filters.purchase_order_id);

        window.location.href = `/api/report?${params.toString()}`;
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-700 mb-4">Gerar Relatório de Movimentações</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Início</label>
                        <input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="date" name="dateStart" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Fim</label>
                        <input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="date" name="dateEnd" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nº do Pedido</label>
                        <input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="number" name="purchase_order_id" placeholder="Opcional" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ordem (OP)</label>
                        <input className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" type="text" name="op" placeholder="Opcional"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Tipo de Movimentação</label>
                        <select name="type" defaultValue="Ambos" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="Ambos">Ambos</option>
                            <option value="Entrada">Apenas Entradas</option>
                            <option value="Saída">Apenas Saídas</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 self-end">
                       <button type="submit" className="w-full font-bold py-2 px-4 rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white flex items-center justify-center">
                           <i className="fas fa-file-excel mr-2"></i>Gerar Planilha
                       </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

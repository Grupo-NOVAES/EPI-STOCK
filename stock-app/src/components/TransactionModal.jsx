import { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal.jsx';

export function TransactionModal({ show, onClose, items, onSave, initialType }) {
    const defaultDate = new Date().toISOString().slice(0, 10);
    
    const getInitialState = () => ({
        type: initialType || 'Saída',
        transaction_date: defaultDate,
        quantity: 1,
        item_id: '',
        size: '', // Novo campo
        purchase_order_id: '',
        entry_transaction_id: ''
    });

    const [formData, setFormData] = useState(getInitialState);

    const selectedItem = useMemo(() => {
        return items.find(item => item.id === parseInt(formData.item_id));
    }, [formData.item_id, items]);

    useEffect(() => {
        if (show) {
            setFormData(getInitialState());
        }
    }, [show, initialType]);
    
    const handleChange = e => {
        const { name, value } = e.target;
        if(name === 'item_id') {
            // Reinicia o tamanho ao trocar de item
            setFormData(prev => ({ ...prev, item_id: value, size: '', entry_transaction_id: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = e => { 
        e.preventDefault(); 
        if (selectedItem && selectedItem.sizes && selectedItem.sizes.length > 0 && !formData.size) {
            alert('Por favor, selecione um tamanho para este item.');
            return;
        }
        onSave(formData);
    };
    
    return (
        <Modal show={show} onClose={onClose} title={`Registar ${formData.type}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Item</label>
                        <select name="item_id" value={formData.item_id} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="" disabled>Selecione um item...</option>
                            {items.map(item => <option key={item.id} value={item.id}>{item.description}</option>)}
                        </select>
                    </div>
                    {/* *** CAMPO DE TAMANHO ADICIONADO *** */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tamanho</label>
                        <select 
                            name="size" 
                            value={formData.size} 
                            onChange={handleChange} 
                            required={selectedItem && selectedItem.sizes && selectedItem.sizes.length > 0}
                            disabled={!selectedItem || !selectedItem.sizes || selectedItem.sizes.length === 0}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                        >
                            <option value="">{selectedItem && selectedItem.sizes && selectedItem.sizes.length > 0 ? 'Selecione...' : 'N/A'}</option>
                            {selectedItem?.sizes?.map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="Entrada">Entrada</option>
                            <option value="Saída">Saída</option>
                        </select>
                    </div>

                    {formData.type === 'Entrada' && (
                        <>
                            <div><label className="block text-sm font-medium text-gray-700">Nº do Pedido</label><input type="number" name="purchase_order_id" value={formData.purchase_order_id} onChange={handleChange} required placeholder="Ex: 1630" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Preço Unitário (R$)</label><input type="number" name="price" onChange={handleChange} placeholder="19.99" step="0.01" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Fornecedor</label><input type="text" name="recipient" onChange={handleChange} required placeholder="Nome do Fornecedor" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                        </>
                    )}

                    {formData.type === 'Saída' && (
                        <div><label className="block text-sm font-medium text-gray-700">Ordem de Produção (OP)</label><input type="text" name="op_number" onChange={handleChange} placeholder="Digite a OP" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                    )}
                    
                    <div><label className="block text-sm font-medium text-gray-700">Quantidade</label><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Data</label><input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="font-bold py-2 px-4 rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-800">Cancelar</button>
                    <button type="submit" className="font-bold py-2 px-4 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white">Salvar</button>
                </div>
            </form>
        </Modal>
    );
}

import { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';

export function ItemModal({ show, onClose, itemToEdit, onSave }) {
    const getInitialData = () => itemToEdit 
        ? { ...itemToEdit, sizes: itemToEdit.sizes || [], ca_validity_date: itemToEdit.ca_validity_date?.split('T')[0] || '' } 
        : { description: '', category: '', unit: '', min_stock: 0, ca_number: '', ca_validity_date: '', sizes: [] };

    const [formData, setFormData] = useState(getInitialData);
    const [newSize, setNewSize] = useState('');

    useEffect(() => {
        setFormData(getInitialData());
    }, [itemToEdit, show]);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleAddSize = () => {
        if (newSize && !formData.sizes.includes(newSize.trim())) {
            setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }));
            setNewSize('');
        }
    };

    const handleRemoveSize = (sizeToRemove) => {
        setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(size => size !== sizeToRemove) }));
    };

    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <Modal show={show} onClose={onClose} title={itemToEdit ? 'Editar Item' : 'Adicionar Novo Item'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campos existentes do formulário */}
                <div><label className="block text-sm font-medium text-gray-700">Descrição do EPI</label><input type="text" name="description" value={formData.description || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Categoria</label><input type="text" name="category" value={formData.category || ''} onChange={handleChange} required placeholder="Ex: Calçados" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Unidade</label><input type="text" name="unit" value={formData.unit || ''} onChange={handleChange} required placeholder="Ex: Un, Par" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Nº do CA</label><input type="text" name="ca_number" value={formData.ca_number || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Validade do CA</label><input type="date" name="ca_validity_date" value={formData.ca_validity_date || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Stock Mínimo</label><input type="number" name="min_stock" value={formData.min_stock || 0} onChange={handleChange} required min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                </div>

                {/* *** NOVO CAMPO PARA GERIR TAMANHOS *** */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tamanhos (Opcional)</label>
                    <div className="flex items-center mt-1">
                        <input 
                            type="text" 
                            value={newSize} 
                            onChange={(e) => setNewSize(e.target.value)}
                            placeholder="Ex: P, 38, etc."
                            className="flex-grow shadow-sm sm:text-sm border-gray-300 rounded-l-md"
                        />
                        <button 
                            type="button"
                            onClick={handleAddSize}
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-r-md hover:bg-gray-300"
                        >
                            +
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {formData.sizes.map(size => (
                            <span key={size} className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {size}
                                <button type="button" onClick={() => handleRemoveSize(size)} className="ml-2 text-blue-500 hover:text-blue-700">
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={onClose} className="font-bold py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800">Cancelar</button><button type="submit" className="font-bold py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white">Salvar Item</button></div>
            </form>
        </Modal>
    );
}

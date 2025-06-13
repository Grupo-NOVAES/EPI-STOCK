import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';

import { DashboardTab } from './components/tabs/DashboardTab';
import { FinancialTab } from './components/tabs/FinancialTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { ItemsTab } from './components/tabs/ItemsTab';
import { ReportsTab } from './components/tabs/ReportsTab';

import { ItemModal } from './components/ItemModal';
import { TransactionModal } from './components/TransactionModal';
import { Loader } from './components/Loader';
import { Tabs } from './components/tabs/tabs';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stock, setStock] = useState([]);
    const [items, setItems] = useState([]);
    
    const [showItemModal, setShowItemModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [initialTransactionType, setInitialTransactionType] = useState('Saída');

    const loadData = useCallback(async () => {
        setLoading(true); 
        try {
            await api.getHealth();
            const [stockData, itemsData] = await Promise.all([api.getStock(), api.getItems()]);
            setStock(stockData);
            setItems(itemsData);
        } catch (error) {
            alert(`ERRO: ${error.message}\nVerifique se o backend está a correr na porta 3000.`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenItemModal = (item) => {
        setCurrentItem(item);
        setShowItemModal(true);
    };

    const handleOpenTransactionModal = (type) => {
        setInitialTransactionType(type);
        setShowTransactionModal(true);
    };

    const handleSaveItem = async (itemData) => {
        try {
            if (itemData.id) await api.updateItem(itemData.id, itemData);
            else await api.postItem(itemData);
            setShowItemModal(false);
            await loadData();
        } catch (error) {
            alert(`Erro ao salvar item: ${error.message}`);
        }
    };
    
    const handleSaveTransaction = async (transactionData) => {
        try {
            await api.postTransaction(transactionData);
            setShowTransactionModal(false);
            await loadData();
        } catch(error) {
            alert(`Erro ao salvar movimentação: ${error.message}`);
        }
    };

    const renderTabContent = () => {
        if (loading) return <Loader />;
        switch (activeTab) {
            case 'dashboard': return <DashboardTab stock={stock} onOpenTransactionModal={handleOpenTransactionModal} onEditItem={handleOpenItemModal} />;
            case 'financial': return <FinancialTab active={activeTab === 'financial'}/>;
            case 'history': return <HistoryTab active={activeTab === 'history'} />;
            case 'items': return <ItemsTab items={items} onOpenItemModal={handleOpenItemModal} onEditItem={handleOpenItemModal} />;
            case 'reports': return <ReportsTab />;
            default: return null;
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque de EPIs</h1>
                <p className="text-gray-600 mt-1">Painel para gerenciar estoque, validade de CAs, entradas e saídas.</p>
            </header>
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="mt-6">{renderTabContent()}</main>

            <ItemModal show={showItemModal} onClose={() => setShowItemModal(false)} itemToEdit={currentItem} onSave={handleSaveItem} />
            
            {/* *** CORREÇÃO APLICADA AQUI *** */}
            {/* A propriedade `stock={stock}` foi adicionada para passar os dados de stock ao modal. */}
            <TransactionModal 
                show={showTransactionModal} 
                onClose={() => setShowTransactionModal(false)} 
                items={items} 
                stock={stock}
                onSave={handleSaveTransaction} 
                initialType={initialTransactionType} 
            />
        </div>
    );
}

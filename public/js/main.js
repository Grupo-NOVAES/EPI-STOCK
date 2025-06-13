// js/main.js
document.addEventListener('DOMContentLoaded', () => {

    const state = {
        items: [],
        stock: [],
        dashboardView: 'categories',
        filteredItems: [],
    };
    const elements = {};

    function main() {
        ui.cacheDOMElements(); 
        Object.assign(elements, ui.elements);
        setupEventListeners();
        initializeApp();
    }

    function setupEventListeners() {
        const addSafeListener = (element, event, handler) => {
            if (element) element.addEventListener(event, handler);
        };

        elements.buttons.tabButtons.forEach(button => addSafeListener(button, 'click', handleTabClick));
        addSafeListener(elements.buttons.openTransactionModalBtn, 'click', handleOpenTransactionModal);
        
        document.querySelectorAll('#open-item-modal-btn').forEach(btn => {
            addSafeListener(btn, 'click', handleOpenItemModal);
        });

        addSafeListener(elements.buttons.backToCategoriesBtn, 'click', handleBackToCategories);
        
        elements.buttons.closeModalButtons.forEach(button => {
            addSafeListener(button, 'click', () => {
                ui.toggleModal('transaction', false);
                ui.toggleModal('item', false);
            });
        });

        addSafeListener(elements.forms.transaction, 'submit', handleTransactionSubmit);
        addSafeListener(elements.forms.item, 'submit', handleItemSubmit);
        addSafeListener(elements.forms.historyFilter, 'submit', (e) => { e.preventDefault(); loadHistory(); });
        addSafeListener(elements.buttons.clearFiltersBtn, 'click', () => { 
            if (elements.forms.historyFilter) elements.forms.historyFilter.reset();
            loadHistory(); 
        });
        // *** EVENTO ATUALIZADO ***
        addSafeListener(elements.fields.transactionTypeSelect, 'change', handleTransactionTypeChange);
        addSafeListener(elements.containers.stock, 'click', handleStockContainerClick);
        addSafeListener(elements.containers.items, 'click', (e) => handleEditItemClick(e.target));
    }

    async function initializeApp() {
        ui.setLoading(true);
        try {
            await api.checkHealth();
            const [stockData, itemsData] = await Promise.all([api.getStock(), api.getItems()]);
            state.stock = stockData;
            state.items = itemsData;
            
            renderDashboard();
            ui.populateItemSelect(state.items);
            await loadHistory();
            ui.render('items', state.items, ui.createItemTableRowHTML);
        } catch (error) {
            alert(`ERRO: ${error.message}\n\nVerifique o console do Node.js e se o banco de dados foi migrado.`);
        } finally {
            ui.setLoading(false);
        }
    }

    function renderDashboard() {
        if (state.dashboardView === 'categories') {
            const categories = state.stock.reduce((acc, item) => {
                const categoryName = item.category || 'Sem Categoria';
                let cat = acc.find(c => c.name === categoryName);
                if (!cat) {
                    cat = { name: categoryName, itemCount: 0, totalStock: 0 };
                    acc.push(cat);
                }
                cat.itemCount++;
                cat.totalStock += item.current_stock;
                return acc;
            }, []);
            ui.render('stock', categories.sort((a,b) => a.name.localeCompare(b.name)), ui.createCategoryCardHTML);
            if (elements.dashboard.title) elements.dashboard.title.textContent = 'Categorias de Itens';
            if (elements.buttons.backToCategoriesBtn) elements.buttons.backToCategoriesBtn.classList.add('hidden');
        } else if (state.dashboardView === 'items') {
            ui.render('stock', state.filteredItems, ui.createStockCardHTML);
            if (elements.dashboard.title) elements.dashboard.title.textContent = `Itens em ${state.filteredItems[0]?.category || ''}`;
            if (elements.buttons.backToCategoriesBtn) elements.buttons.backToCategoriesBtn.classList.remove('hidden');
        }
    }

    async function loadHistory() {
        if (!elements.forms.historyFilter) return;
        const formData = new FormData(elements.forms.historyFilter);
        const filters = Object.fromEntries(formData.entries());
        for (const key in filters) { if (!filters[key]) delete filters[key]; }
        try {
            const transactions = await api.getTransactions(filters);
            ui.render('history', transactions, ui.createHistoryTableRowHTML);
        } catch(error) { ui.render('history', [], ''); }
    }

    async function loadFinancialData() {
        try {
            const summary = await api.getFinancialSummary();
            ui.renderFinancialDashboard(summary);
        } catch (error) {
            alert(`Erro ao carregar dados financeiros: ${error.message}`);
        }
    }

    function handleTabClick(event) {
        elements.buttons.tabButtons.forEach(b => b.classList.remove('active'));
        event.currentTarget.classList.add('active');
        const tabId = event.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        const pane = document.getElementById(`${tabId}-tab`);
        if (pane) pane.classList.remove('hidden');
        
        if (tabId === 'financial') loadFinancialData();
    }

    function handleOpenTransactionModal() {
        if (elements.forms.transaction) elements.forms.transaction.reset();
        ui.toggleModal('transaction', true);
        handleTransactionTypeChange(); // Define o estado inicial do formulário
    }

    function handleOpenItemModal() {
        if (!elements.forms.item) return;
        elements.forms.item.reset();
        if(elements.fields.itemFormIdHidden) elements.fields.itemFormIdHidden.value = '';
        if (elements.fields.itemModalTitle) elements.fields.itemModalTitle.textContent = 'Adicionar Novo Item';
        ui.toggleModal('item', true);
    }
    
    function handleBackToCategories() {
        state.dashboardView = 'categories';
        renderDashboard();
    }

    function handleStockContainerClick(event) {
        const categoryCard = event.target.closest('.category-card');
        if (categoryCard) {
            const categoryName = categoryCard.dataset.category;
            state.filteredItems = state.stock.filter(item => (item.category || 'Sem Categoria') === categoryName);
            state.dashboardView = 'items';
            renderDashboard();
            return;
        }
        handleEditItemClick(event.target);
    }

    function handleEditItemClick(target) {
        const button = target.closest('.edit-item-btn');
        if (!button) return;
        const itemId = parseInt(button.dataset.id, 10); // ID agora é número
        const itemToEdit = state.items.find(item => item.id === itemId);
        if (itemToEdit) {
            ui.populateItemForm(itemToEdit);
            ui.toggleModal('item', true);
        }
    }

    async function handleTransactionSubmit(event) {
        event.preventDefault();
        const formData = new FormData(elements.forms.transaction);
        const data = Object.fromEntries(formData.entries());
        try {
            await api.postTransaction(data);
            ui.toggleModal('transaction', false);
            await initializeApp();
        } catch (error) { alert(`Erro ao salvar: ${error.message}`); }
    }

    // *** FUNÇÃO ATUALIZADA ***
    async function handleItemSubmit(event) {
        event.preventDefault();
        const formData = new FormData(elements.forms.item);
        const data = Object.fromEntries(formData.entries());
        const itemId = data.hiddenId;

        try {
            if (itemId) { // Se tem hiddenId, estamos editando
                await api.updateItem(itemId, data);
            } else { // Senão, é um item novo
                await api.postItem(data);
            }
            ui.toggleModal('item', false);
            await initializeApp();
        } catch (error) { alert(`Erro ao salvar item: ${error.message}`); }
    }

    // *** FUNÇÃO ATUALIZADA ***
    function handleTransactionTypeChange() {
        if (!elements.fields.transactionTypeSelect) return;
        const isEntrada = elements.fields.transactionTypeSelect.value === 'Entrada';
        
        const recipientInput = document.getElementById('recipient');
        const opInput = document.getElementById('op_number');

        // Alterna a visibilidade dos campos
        elements.fields.priceWrapper?.classList.toggle('hidden', !isEntrada);
        elements.fields.recipientWrapper?.classList.toggle('hidden', !isEntrada);
        elements.fields.opWrapper?.classList.toggle('hidden', isEntrada);
        
        // Ajusta o atributo 'required' e limpa valores para evitar enviar dados errados
        if (isEntrada) {
            if (recipientInput) recipientInput.required = true;
            if (opInput) {
                opInput.required = false;
                opInput.value = '';
            }
        } else { // Caso 'Saída'
            if (recipientInput) {
                recipientInput.required = false;
                recipientInput.value = '';
            }
            if (opInput) opInput.required = false; // OP é opcional
        }
    }

    main();
});

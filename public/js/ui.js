// js/ui.js
const ui = {
    elements: {},
    charts: {},

    cacheDOMElements() {
        this.elements = {
            loading: document.getElementById('loading'),
            tabContent: document.getElementById('tab-content'),
            containers: {
                stock: document.getElementById('stock-container'),
                history: document.getElementById('history-table-body'),
                items: document.getElementById('items-table-body'),
            },
            financial: {
                totalValue: document.getElementById('total-stock-value'),
                mostValuable: document.getElementById('most-valuable-item'),
                monthlyCost: document.getElementById('monthly-cost'),
                categoryChart: document.getElementById('category-value-chart'),
                topItemsChart: document.getElementById('top-items-chart'),
            },
            dashboard: {
                title: document.getElementById('dashboard-title'),
            },
            modals: {
                transaction: document.getElementById('transaction-modal'),
                item: document.getElementById('item-modal'),
            },
            forms: {
                item: document.getElementById('item-form'),
                transaction: document.getElementById('transaction-form'),
                historyFilter: document.getElementById('history-filter-form'),
            },
            fields: {
                opWrapper: document.getElementById('op-field-wrapper'),
                priceWrapper: document.getElementById('price-field-wrapper'),
                // *** CAMPO ADICIONADO ***
                recipientWrapper: document.getElementById('recipient-field-wrapper'),
                transactionTypeSelect: document.getElementById('transaction-type'),
                itemSelect: document.getElementById('item-select'),
                itemModalTitle: document.getElementById('item-modal-title'),
                itemFormIdHidden: document.getElementById('item-id-hidden'),
                // itemFormCodeInput removido pois não existe mais
            },
            buttons: {
                tabButtons: document.querySelectorAll('.tab-button'),
                closeModalButtons: document.querySelectorAll('.close-modal-btn'),
                openTransactionModalBtn: document.getElementById('open-transaction-modal-btn'),
                openItemModalBtn: document.getElementById('open-item-modal-btn'),
                backToCategoriesBtn: document.getElementById('back-to-categories-btn'),
                clearFiltersBtn: document.getElementById('clear-filters-btn'),
            }
        };
    },
    
    render(containerKey, data, createHTML) {
        const container = this.elements.containers[containerKey];
        if (!container) return;
        
        if (data.length > 0) {
            container.innerHTML = data.map(createHTML).join('');
        } else {
            const colspan = container.closest('table')?.querySelector('thead tr')?.children.length || 1;
            container.innerHTML = container.tagName === 'TBODY'
                ? `<tr><td colspan="${colspan}" class="text-center p-8 text-gray-500">Nenhum dado para exibir.</td></tr>`
                : `<div class="col-span-full text-center p-8 text-gray-500">Nenhum dado para exibir.</div>`;
        }
    },

    createCategoryCardHTML(category) { return `<div data-category="${category.name}" class="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer category-card"><div class="flex justify-between items-center"><h4 class="font-bold text-xl text-gray-800">${category.name}</h4><span class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">${category.itemCount} Itens</span></div><div class="mt-4"><p class="text-3xl font-bold text-gray-900">${category.totalStock}<span class="text-lg font-normal text-gray-500 ml-2">em estoque</span></p></div></div>`; },
    createStockCardHTML(item) { let stockStatusClass = 'bg-green-100 text-green-800'; if (item.current_stock <= 0) stockStatusClass = 'bg-red-100 text-red-800'; else if (item.current_stock <= item.min_stock) stockStatusClass = 'bg-yellow-100 text-yellow-800'; const validityDate = item.ca_validity_date ? new Date(item.ca_validity_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/D'; let caStatusHTML = `<i class="fas fa-question-circle mr-1 text-gray-400"></i>CA não informado`; if(item.ca_status === 'OK') caStatusHTML = `<i class="fas fa-check-circle mr-1 text-green-500"></i>CA ${item.ca_number || ''} válido até ${validityDate}`; if(item.ca_status === 'VenceEmBreve') caStatusHTML = `<i class="fas fa-exclamation-triangle mr-1 text-yellow-500"></i>CA ${item.ca_number || ''} vence em ${validityDate}`; if(item.ca_status === 'Vencido') caStatusHTML = `<i class="fas fa-times-circle mr-1 text-red-500"></i>CA ${item.ca_number || ''} VENCIDO em ${validityDate}`; return `<div class="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"><div><span class="text-xs font-semibold px-2 py-1 rounded-full ${stockStatusClass} float-right">${item.current_stock <= 0 ? 'Zerado' : (item.current_stock <= item.min_stock ? 'Baixo' : 'OK')}</span><h4 class="font-bold text-lg text-gray-800 mb-1">${item.description}</h4><p class="text-5xl font-bold text-gray-900">${item.current_stock}<span class="text-lg font-normal text-gray-500 ml-2">${item.unit}</span></p></div><div class="text-xs text-gray-600 mt-4 pt-3 border-t border-gray-200 flex justify-between items-center"><span>${caStatusHTML}</span><button data-id="${item.id}" class="text-blue-600 hover:text-blue-900 font-semibold edit-item-btn text-xs"><i class="fas fa-edit mr-1"></i>Editar</button></div></div>`; },
    createHistoryTableRowHTML(t) { const typeClass = t.type === 'Entrada' ? 'text-green-600' : 'text-red-600'; const typeIcon = t.type === 'Entrada' ? 'fa-arrow-up' : 'fa-arrow-down'; const priceFormatted = t.price ? parseFloat(t.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'; const destination = t.op_number || t.recipient || 'N/D'; return `<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(t.transaction_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.description}</td><td class="px-6 py-4 whitespace-nowrap text-sm font-semibold ${typeClass}"><i class="fas ${typeIcon} mr-2"></i>${t.type}</td><td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">${t.quantity}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${destination}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${priceFormatted}</td></tr>`; },
    createItemTableRowHTML(item) { return `<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.description}<span class="block text-xs text-gray-500">ID: ${item.id}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.category || 'N/A'}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.ca_number || 'N/A'}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button data-id="${item.id}" class="text-blue-600 hover:text-blue-900 font-semibold edit-item-btn"><i class="fas fa-edit mr-1"></i>Editar</button></td></tr>`; },
    renderFinancialDashboard(summary) { const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); if (this.elements.financial.totalValue) this.elements.financial.totalValue.textContent = formatCurrency(summary.totalStockValue); if (this.elements.financial.mostValuable) this.elements.financial.mostValuable.textContent = summary.mostValuableItem?.description || 'N/A'; if (this.elements.financial.monthlyCost) this.elements.financial.monthlyCost.textContent = formatCurrency(summary.monthlyOutgoings); this.renderCategoryChart(summary.stockValueByCategory); this.renderTopItemsChart(summary.top5ValuableItems); },
    renderCategoryChart(data) { const ctx = this.elements.financial.categoryChart?.getContext('2d'); if (!ctx) return; if (this.charts.category) this.charts.category.destroy(); this.charts.category = new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'], hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } } }); },
    renderTopItemsChart(data) { const ctx = this.elements.financial.topItemsChart?.getContext('2d'); if (!ctx) return; if (this.charts.topItems) this.charts.topItems.destroy(); this.charts.topItems = new Chart(ctx, { type: 'bar', data: { labels: data.map(item => item.description), datasets: [{ label: 'Valor em Estoque (R$)', data: data.map(item => item.itemValue), backgroundColor: '#10b981' }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }); },
    
    // *** FUNÇÃO ATUALIZADA ***
    populateItemForm(item) {
        const form = this.elements.forms.item;
        if(!form) return;
        
        // Preenche o ID oculto para saber que estamos editando
        this.elements.fields.itemFormIdHidden.value = item.id;
        
        // O campo de ID visível foi removido, então não precisamos mais mexer nele.
        form.querySelector('#item-description').value = item.description;
        form.querySelector('#item-category').value = item.category;
        form.querySelector('#item-unit').value = item.unit;
        form.querySelector('#item-min-stock').value = item.min_stock;
        form.querySelector('#item-ca-number').value = item.ca_number;
        form.querySelector('#item-ca-validity').value = item.ca_validity_date;
        this.elements.fields.itemModalTitle.textContent = 'Editar Item';
    },

    populateItemSelect(items) { 
        const selectElement = this.elements.fields.itemSelect;
        if (!selectElement) return;
        const currentVal = selectElement.value;
        selectElement.innerHTML = '<option value="" disabled selected>Selecione um item...</option>';
        items.forEach(item => {
            selectElement.innerHTML += `<option value="${item.id}">${item.description}</option>`;
        });
        selectElement.value = currentVal;
    },

    setLoading(isLoading) { if (this.elements.loading) this.elements.loading.classList.toggle('hidden', !isLoading); if (this.elements.tabContent) this.elements.tabContent.classList.toggle('hidden', isLoading); },
    toggleModal(modalKey, show) { const modal = this.elements.modals[modalKey]; if (!modal) return; modal.classList.toggle('hidden', !show); modal.classList.toggle('flex', show); },
};

// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// IMPORTANTE: Configure aqui os dados de acesso ao seu banco de dados MySQL.
const dbConfig = {
    host: 'localhost',
    user: 'root',      // <-- MUDE AQUI para o seu usuário
    password: '177619',    // <-- MUDE AQUI para a sua senha
    database: 'epi_stock_control',
    dateStrings: true // Mantém as datas como strings para evitar problemas de fuso horário.
};

app.use(cors());
app.use(express.json());

// --- Configuração de Arquivos Estáticos ---
// *** CORREÇÃO ADICIONADA AQUI ***
// Agora, o Express servirá os arquivos estáticos (HTML, JS, CSS) a partir da pasta 'public'.
// Esta é a configuração correta para a sua nova estrutura de arquivos.
app.use(express.static(path.join(__dirname, 'public')));


// --- Funções Auxiliares do Banco de Dados ---
async function executeQuery(res, sql, params = []) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('DATABASE ERROR:', error.message);
        if (res && typeof res.status === 'function') {
            res.status(500).json({ error: 'Erro interno do servidor. Verifique o console do Node.js.' });
        }
        return null;
    } finally {
        if (connection) await connection.end();
    }
}


// --- Rotas da API ---

// Rota de diagnóstico para testar a conexão com o banco.
app.get('/api/health', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.ping();
        await connection.end();
        res.status(200).json({ status: 'ok', message: 'Conexão com o banco de dados bem-sucedida.' });
    } catch (error) {
        console.error('HEALTH CHECK FAILED:', error);
        res.status(500).json({ status: 'error', message: 'Falha ao conectar ao banco de dados.', details: error.code });
    }
});

// Rota para calcular e retornar o estoque atual de todos os itens.
app.get('/api/stock', async (req, res) => {
    const items = await executeQuery(res, 'SELECT * FROM items ORDER BY description ASC');
    if (!items) return;
    const transactions = await executeQuery(res, 'SELECT * FROM transactions');
    if (!transactions) return;

    const stock = items.map(item => {
        const totalIn = transactions.filter(t => t.item_id === item.id && t.type === 'Entrada').reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = transactions.filter(t => t.item_id === item.id && t.type === 'Saída').reduce((sum, t) => sum + t.quantity, 0);
        
        let ca_status = 'NaoInformado';
        if (item.ca_validity_date) {
            const validityDate = new Date(item.ca_validity_date + 'T00:00:00Z'); 
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            
            const diffTime = validityDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) ca_status = 'Vencido';
            else if (diffDays <= 30) ca_status = 'VenceEmBreve';
            else ca_status = 'OK';
        }
        
        return { ...item, current_stock: totalIn - totalOut, ca_status };
    });
    res.json(stock);
});

// Rota para o Dashboard Financeiro.
app.get('/api/financial-summary', async (req, res) => {
    const transactions = await executeQuery(res, 'SELECT * FROM transactions');
    if (!transactions) return;
    const items = await executeQuery(res, 'SELECT * FROM items');
    if (!items) return;

    let totalStockValue = 0;
    
    const itemPriceMap = transactions
        .filter(t => t.type === 'Entrada' && t.price > 0)
        .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date))
        .reduce((map, t) => {
            map[t.item_id] = parseFloat(t.price);
            return map;
        }, {});

    const stockWithValue = items.map(item => {
        const totalIn = transactions.filter(t => t.item_id === item.id && t.type === 'Entrada').reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = transactions.filter(t => t.item_id === item.id && t.type === 'Saída').reduce((sum, t) => sum + t.quantity, 0);
        const current_stock = totalIn - totalOut;
        
        const last_price = itemPriceMap[item.id] || 0;
        const itemValue = current_stock * last_price;
        totalStockValue += itemValue;
        
        return { ...item, current_stock, last_price, itemValue };
    });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyOutgoings = transactions
        .filter(t => {
            const tDate = new Date(t.transaction_date);
            return t.type === 'Saída' && tDate >= firstDayOfMonth;
        })
        .reduce((total, t) => {
            const itemCost = itemPriceMap[t.item_id] || 0;
            return total + (t.quantity * itemCost);
        }, 0);

    const stockValueByCategory = stockWithValue.reduce((acc, item) => {
        const categoryName = item.category || 'Sem Categoria';
        acc[categoryName] = (acc[categoryName] || 0) + item.itemValue;
        return acc;
    }, {});
    
    res.json({
        totalStockValue,
        monthlyOutgoings: monthlyOutgoings,
        mostValuableItem: stockWithValue.sort((a, b) => b.itemValue - a.itemValue)[0],
        stockValueByCategory,
        top5ValuableItems: stockWithValue.filter(item => item.itemValue > 0).sort((a, b) => b.itemValue - a.itemValue).slice(0, 5),
    });
});

// Rotas CRUD para Itens e Transações.
app.get('/api/items', async (req, res) => { 
    const items = await executeQuery(res, 'SELECT * FROM items ORDER BY description ASC'); 
    if (items) res.json(items); 
});

app.get('/api/transactions', async (req, res) => { 
    const { dateStart, dateEnd, op, type } = req.query; 
    let sql = `SELECT t.*, i.description, i.category FROM transactions t JOIN items i ON t.item_id = i.id WHERE 1=1`; 
    const params = []; 
    if (dateStart) { sql += ` AND t.transaction_date >= ?`; params.push(dateStart); } 
    if (dateEnd) { sql += ` AND t.transaction_date <= ?`; params.push(dateEnd); } 
    if (op) { sql += ` AND t.op_number LIKE ?`; params.push(`%${op}%`); } 
    if (type) { sql += ` AND t.type = ?`; params.push(type); } 
    sql += ` ORDER BY t.transaction_date DESC, t.created_at DESC`; 
    const transactions = await executeQuery(res, sql, params); 
    if (transactions) res.json(transactions); 
});

app.post('/api/items', async (req, res) => { 
    const { id, description, category, unit, minStock, caNumber, caValidityDate } = req.body; 
    const result = await executeQuery(res, 'INSERT INTO items (id, description, category, unit, min_stock, ca_number, ca_validity_date) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, description, category, unit, minStock, caNumber || null, caValidityDate || null]); 
    if (result) res.status(201).json({ message: 'Item adicionado' }); 
});

app.put('/api/items/:id', async (req, res) => { 
    const { id } = req.params; 
    const { description, category, unit, minStock, caNumber, caValidityDate } = req.body; 
    const result = await executeQuery(res, 'UPDATE items SET description = ?, category = ?, unit = ?, min_stock = ?, ca_number = ?, ca_validity_date = ? WHERE id = ?', [description, category, unit, minStock, caNumber || null, caValidityDate || null, id]); 
    if (result) res.status(200).json({ message: 'Item atualizado' }); 
});

app.post('/api/transactions', async (req, res) => { 
    const { itemId, type, quantity, recipient, op_number, price, date } = req.body; 
    const result = await executeQuery(res, 'INSERT INTO transactions (item_id, type, quantity, recipient, op_number, price, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)', [itemId, type, quantity, recipient, op_number || null, price || null, date]); 
    if (result) res.status(201).json({ message: 'Movimentação adicionada' }); 
});

// --- Inicialização do Servidor ---
async function startServer() {
    try {
        await executeQuery(null, 'SELECT 1');
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
    } catch (error) {
        console.error('❌ ERRO FATAL: Não foi possível conectar ao banco de dados.', error.message);
        console.log('\nPor favor, verifique as credenciais (host, user, password) no arquivo "server.js".');
        process.exit(1);
    }
}

startServer();

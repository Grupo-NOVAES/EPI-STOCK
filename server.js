// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
// *** NOVA IMPORTAÇÃO PARA RELATÓRIOS ***
const { Parser } = require('json2csv');

const app = express();
const PORT = 3000;

const dbConfig = {
    host: 'localhost',
    user: 'root',      // <-- MUDE AQUI para o seu usuário
    password: '177619',    // <-- MUDE AQUI para a sua senha
    database: 'epi_stock_control',
    dateStrings: true
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function executeQuery(res, sql, params = []) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('DATABASE ERROR:', error.message);
        if (res && typeof res.status === 'function') {
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
        return null;
    } finally {
        if (connection) await connection.end();
    }
}

// --- Rotas da API ---

// (As rotas /api/health, /api/stock, /api/financial-summary, etc., continuam as mesmas)
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
            const today = new Date(); today.setUTCHours(0, 0, 0, 0);
            const diffDays = Math.ceil((validityDate - today) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) ca_status = 'Vencido';
            else if (diffDays <= 30) ca_status = 'VenceEmBreve';
            else ca_status = 'OK';
        }
        
        return { ...item, current_stock: totalIn - totalOut, ca_status };
    });
    res.json(stock);
});

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
    const { description, category, unit, minStock, caNumber, caValidityDate } = req.body;
    const sql = 'INSERT INTO items (description, category, unit, min_stock, ca_number, ca_validity_date) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [description, category, unit, minStock, caNumber || null, caValidityDate || null];
    const result = await executeQuery(res, sql, params);
    if (result) {
        res.status(201).json({ message: 'Item adicionado com sucesso', insertedId: result.insertId });
    }
});

app.put('/api/items/:id', async (req, res) => { 
    const { id } = req.params; 
    const { description, category, unit, minStock, caNumber, caValidityDate } = req.body; 
    const result = await executeQuery(res, 'UPDATE items SET description = ?, category = ?, unit = ?, min_stock = ?, ca_number = ?, ca_validity_date = ? WHERE id = ?', [description, category, unit, minStock, caNumber || null, caValidityDate || null, id]); 
    if (result) res.status(200).json({ message: 'Item atualizado' }); 
});

app.post('/api/transactions', async (req, res) => { 
    let { itemId, type, quantity, recipient, op_number, price, date } = req.body;
    if (type === 'Entrada') {
        op_number = null;
    } else {
        recipient = null;
        price = null;
    }
    const result = await executeQuery(res, 'INSERT INTO transactions (item_id, type, quantity, recipient, op_number, price, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)', [itemId, type, quantity, recipient, op_number, price, date]); 
    if (result) res.status(201).json({ message: 'Movimentação adicionada' }); 
});


// *** NOVA ROTA PARA GERAR RELATÓRIOS ***
app.get('/api/report', async (req, res) => {
    const { dateStart, dateEnd, type } = req.query;

    let sql = `SELECT 
        t.transaction_date as "Data",
        t.type as "Tipo",
        i.description as "Descrição do Item",
        i.category as "Categoria",
        t.quantity as "Quantidade",
        t.op_number as "Ordem de Produção (OP)",
        t.recipient as "Fornecedor",
        t.price as "Preço Unitário (R$)"
    FROM transactions t 
    JOIN items i ON t.item_id = i.id 
    WHERE 1=1`;

    const params = [];
    if (dateStart) {
        sql += ` AND t.transaction_date >= ?`;
        params.push(dateStart);
    }
    if (dateEnd) {
        sql += ` AND t.transaction_date <= ?`;
        params.push(dateEnd);
    }
    if (type && (type === 'Entrada' || type === 'Saída')) {
        sql += ` AND t.type = ?`;
        params.push(type);
    }
    sql += ` ORDER BY t.transaction_date ASC`;

    const data = await executeQuery(res, sql, params);
    if (data === null) return; // Erro já foi tratado pela executeQuery

    if (data.length === 0) {
        res.status(404).send('Nenhum dado encontrado para os filtros selecionados.');
        return;
    }

    try {
        const json2csvParser = new Parser({ delimiter: ';' }); // Usa ';' como delimitador para melhor compatibilidade com Excel em português
        const csv = json2csvParser.parse(data);
        
        // Define os headers para forçar o download no navegador
        res.header('Content-Type', 'text/csv; charset=UTF-8');
        res.attachment(`relatorio_de_movimentacoes_${new Date().toISOString().slice(0,10)}.csv`);
        res.send(Buffer.from(csv, 'utf-8')); // Envia como buffer para garantir a codificação correta

    } catch (err) {
        console.error("Erro ao gerar CSV:", err);
        res.status(500).send("Erro ao gerar o arquivo de relatório.");
    }
});


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

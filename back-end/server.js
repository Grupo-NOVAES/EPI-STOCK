// backend/server.js

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { Parser } from 'json2csv';

const app = express();
const PORT = 3000;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '177619',
    database: 'epi_stock_control',
    dateStrings: true
};

app.use(cors());
app.use(express.json());

async function executeQuery(res, sql, params = []) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('DATABASE ERROR:', error.message);
        if (res && typeof res.status === 'function') {
            res.status(500).json({ error: 'Erro interno do servidor. Verifique a consola do Node.js.' });
        }
        return null;
    } finally {
        if (connection) await connection.end();
    }
}

// --- ROTAS DA API ---

app.get('/api/health', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.ping();
        await connection.end();
        res.status(200).json({ status: 'ok', message: 'Conexão com o banco de dados bem-sucedida.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Falha ao conectar ao banco de dados.', details: error.code });
    }
});

app.get('/api/stock', async (req, res) => {
    const items = await executeQuery(res, 'SELECT * FROM items ORDER BY description ASC');
    if (!items) return;

    // *** CORREÇÃO APLICADA AQUI ***
    // Garante que a coluna 'sizes' (que vem como string) seja convertida para um array.
    items.forEach(item => {
        if (item.sizes && typeof item.sizes === 'string') {
            try {
                item.sizes = JSON.parse(item.sizes);
            } catch (e) {
                console.error(`Erro ao fazer parse dos tamanhos para o item ${item.id}:`, item.sizes);
                item.sizes = []; // Define como um array vazio em caso de erro.
            }
        } else if (!item.sizes) {
            item.sizes = []; // Garante que é sempre um array
        }
    });
    
    const allTransactions = await executeQuery(res, 'SELECT * FROM transactions');
    if(!allTransactions) return;

    const stock = items.map(item => {
        const totalIn = allTransactions.filter(t => t.item_id === item.id && t.type === 'Entrada').reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = allTransactions.filter(t => t.item_id === item.id && t.type === 'Saída').reduce((sum, t) => sum + t.quantity, 0);

        const stockBySize = {};
        if (item.sizes.length > 0) {
            item.sizes.forEach(size => {
                const sizeIn = allTransactions.filter(t => t.item_id === item.id && t.type === 'Entrada' && t.size === size).reduce((s, t) => s + t.quantity, 0);
                const sizeOut = allTransactions.filter(t => t.item_id === item.id && t.type === 'Saída' && t.size === size).reduce((s, t) => s + t.quantity, 0);
                stockBySize[size] = sizeIn - sizeOut;
            });
        }
        
        let ca_status = 'NaoInformado';
        if (item.ca_validity_date) {
            const validityDate = new Date(item.ca_validity_date + 'T00:00:00Z'); 
            const today = new Date(); today.setUTCHours(0, 0, 0, 0);
            const diffDays = Math.ceil((validityDate - today) / (1000 * 60 * 60 * 24));
            ca_status = diffDays < 0 ? 'Vencido' : diffDays <= 30 ? 'VenceEmBreve' : 'OK';
        }
        
        return { 
            ...item, 
            current_stock: totalIn - totalOut, 
            stock_by_size: stockBySize,
            ca_status
        };
    });
    res.json(stock);
});


// ... (O resto do ficheiro permanece o mesmo. Apenas a rota /api/stock foi alterada.)
// Rota para o Dashboard Financeiro.
app.get('/api/financial-summary', async (req, res) => {
    const { dateStart, dateEnd, op } = req.query;

    let filterSql = '';
    const params = [];
    if (dateStart) { filterSql += ' AND t.transaction_date >= ?'; params.push(dateStart); }
    if (dateEnd) { filterSql += ' AND t.transaction_date <= ?'; params.push(dateEnd); }
    if (op) { filterSql += ' AND t.op_number LIKE ?'; params.push(`%${op}%`); }

    const allTransactions = await executeQuery(res, 'SELECT * FROM transactions');
    if (!allTransactions) return;
    
    const filteredTransactions = await executeQuery(res, `SELECT * FROM transactions t WHERE 1=1 ${filterSql}`, params);
    if (!filteredTransactions) return;
    
    const items = await executeQuery(res, 'SELECT * FROM items');
    if (!items) return;

    const itemPriceMap = allTransactions
        .filter(t => t.type === 'Entrada' && t.price > 0)
        .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date))
        .reduce((map, t) => {
            map[t.item_id] = parseFloat(t.price);
            return map;
        }, {});

    const stockWithValue = items.map(item => {
        const totalIn = allTransactions.filter(t => t.item_id === item.id && t.type === 'Entrada').reduce((sum, t) => sum + t.quantity, 0);
        const totalOut = allTransactions.filter(t => t.item_id === item.id && t.type === 'Saída').reduce((sum, t) => sum + t.quantity, 0);
        const current_stock = totalIn - totalOut;
        const last_price = itemPriceMap[item.id] || 0;
        const itemValue = current_stock * last_price;
        return { ...item, current_stock, last_price, itemValue };
    });
    
    const totalStockValue = stockWithValue.reduce((sum, item) => sum + item.itemValue, 0);

    const outgoingsInPeriod = filteredTransactions
        .filter(t => t.type === 'Saída')
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
        outgoings: outgoingsInPeriod,
        mostValuableItem: stockWithValue.sort((a, b) => b.itemValue - a.itemValue)[0],
        stockValueByCategory,
        top5ValuableItems: stockWithValue.filter(item => item.itemValue > 0).sort((a, b) => b.itemValue - a.itemValue).slice(0, 5),
    });
});

app.get('/api/items', async (req, res) => { 
    const items = await executeQuery(res, 'SELECT * FROM items ORDER BY description ASC'); 
    if (items) {
        items.forEach(item => {
            if (item.sizes && typeof item.sizes === 'string') item.sizes = JSON.parse(item.sizes);
            else if (!item.sizes) item.sizes = [];
        });
        res.json(items);
    } 
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
    let { description, category, unit, min_stock, ca_number, ca_validity_date, sizes } = req.body;
    const sizesJson = JSON.stringify(sizes || []);

    const sql = 'INSERT INTO items (description, category, unit, min_stock, ca_number, ca_validity_date, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [description, category, unit, min_stock, ca_number || null, ca_validity_date || null, sizesJson];
    const result = await executeQuery(res, sql, params);
    if (result) res.status(201).json({ message: 'Item adicionado com sucesso' });
});

app.put('/api/items/:id', async (req, res) => { 
    const { id } = req.params; 
    let { description, category, unit, min_stock, ca_number, ca_validity_date, sizes } = req.body;
    const sizesJson = JSON.stringify(sizes || []);

    const result = await executeQuery(res, 'UPDATE items SET description = ?, category = ?, unit = ?, min_stock = ?, ca_number = ?, ca_validity_date = ?, sizes = ? WHERE id = ?', [description, category, unit, min_stock, ca_number || null, ca_validity_date || null, sizesJson, id]); 
    if (result) res.status(200).json({ message: 'Item atualizado' }); 
});

app.post('/api/transactions', async (req, res) => { 
    let { item_id, type, quantity, recipient, op_number, transaction_date, price, purchase_order_id, entry_transaction_id, size } = req.body;
    
    if (type === 'Saída') {
        const [entry] = await executeQuery(res, 'SELECT purchase_order_id FROM transactions WHERE transaction_id = ?', [entry_transaction_id]);
        if (!entry) return res.status(400).json({ error: 'Transação de entrada original não encontrada.' });
        
        purchase_order_id = entry.purchase_order_id;
        recipient = null;
        price = null;
    } else {
        op_number = null;
        entry_transaction_id = null;
    }

    const sql = `INSERT INTO transactions (item_id, size, type, quantity, recipient, op_number, price, transaction_date, purchase_order_id, entry_transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [item_id, size, type, quantity, recipient, op_number, price, transaction_date, purchase_order_id, entry_transaction_id];
    
    const result = await executeQuery(res, sql, params);
    if (result) res.status(201).json({ message: 'Movimentação adicionada' }); 
});

app.get('/api/report', async (req, res) => {
    const { dateStart, dateEnd, type, op, purchase_order_id } = req.query;
    let sql = `SELECT t.transaction_date as "Data", t.type as "Tipo", t.purchase_order_id as "Pedido", i.description as "Descrição do Item", i.category as "Categoria", t.size as "Tamanho", t.quantity as "Quantidade", t.op_number as "Ordem de Produção (OP)", t.recipient as "Fornecedor", t.price as "Preço Unitário (R$)" FROM transactions t JOIN items i ON t.item_id = i.id WHERE 1=1`;
    const params = [];

    if (dateStart) { sql += ` AND t.transaction_date >= ?`; params.push(dateStart); }
    if (dateEnd) { sql += ` AND t.transaction_date <= ?`; params.push(dateEnd); }
    if (op) { sql += ` AND t.op_number LIKE ?`; params.push(`%${op}%`); }
    if (purchase_order_id) { sql += ` AND t.purchase_order_id = ?`; params.push(purchase_order_id); }
    if (type && (type === 'Entrada' || type === 'Saída')) { sql += ` AND t.type = ?`; params.push(type); }
    sql += ` ORDER BY t.transaction_date ASC`;

    const data = await executeQuery(res, sql, params);
    if (data === null) return;
    if (data.length === 0) return res.status(404).json({ error: 'Nenhum dado encontrado para os filtros selecionados.' });

    try {
        const json2csvParser = new Parser({ delimiter: ';' });
        const csv = json2csvParser.parse(data);
        res.header('Content-Type', 'text/csv; charset=UTF-8');
        res.attachment(`relatorio_movimentacoes.csv`);
        res.send(Buffer.from(csv, 'utf-8'));
    } catch (err) {
        res.status(500).send("Erro ao gerar o ficheiro de relatório.");
    }
});


async function startServer() {
    try {
        await mysql.createConnection(dbConfig).then(c=>c.end());
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        app.listen(PORT, () => console.log(`🚀 Servidor backend a correr em http://localhost:${PORT}`));
    } catch (error) {
        console.error('❌ ERRO FATAL: Não foi possível conectar ao banco de dados.', error.message);
        process.exit(1);
    }
}

startServer();

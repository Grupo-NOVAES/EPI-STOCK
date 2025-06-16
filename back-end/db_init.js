// backend/db_init.js
// Descrição: Script para inicializar o banco de dados com a estrutura mais recente,
// incluindo a funcionalidade de tamanhos.

import mysql from 'mysql2/promise';

// --- Configuração do Banco de Dados ---
// IMPORTANTE: Use as mesmas credenciais do seu ficheiro server.js.
const dbConfig = {
    host: 'localhost',
    user: 'root',      // <-- MUDE AQUI para o seu utilizador
    password: '177619',    // <-- MUDE AQUI para a sua palavra-passe
    charset: 'utf8mb4',
};

// --- Queries SQL ---
const CREATE_DATABASE_SQL = `CREATE DATABASE IF NOT EXISTS epi_stock_control CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

const USE_DATABASE_SQL = `USE epi_stock_control;`;

const CREATE_ITEMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    sizes JSON NULL,
    min_stock INT UNSIGNED NOT NULL DEFAULT 0,
    ca_number VARCHAR(50) NULL, 
    ca_validity_date DATE NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const CREATE_TRANSACTIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    size VARCHAR(50) NULL,
    type ENUM('Entrada', 'Saída') NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    recipient VARCHAR(255) NULL,
    purchase_order_id INT NULL,
    entry_transaction_id INT NULL,
    op_number VARCHAR(50) NULL,
    price DECIMAL(10, 2) NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE CASCADE
);`;



// --- Função Principal de Execução ---
async function initializeDatabase() {
    let connection;
    try {
        console.log('🔌 Conectando ao servidor MySQL...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexão bem-sucedida!');

        console.log('\n[1/4] 🏗️  Criando banco de dados (se não existir)...');
        await connection.query(CREATE_DATABASE_SQL);
        console.log('✅ Banco de dados "epi_stock_control" garantido.');

        console.log('\n[2/4] 🔄 Selecionando o banco de dados...');
        await connection.query(USE_DATABASE_SQL);
        console.log('✅ Banco de dados selecionado.');
        
        console.log('\n[3/4] 🛠️  Criando tabela "items" (com coluna "sizes")...');
        await connection.query(CREATE_ITEMS_TABLE_SQL);
        console.log('✅ Tabela "items" criada com sucesso.');

        console.log('\n[4/4] 🛠️  Criando tabela "transactions" (com coluna "size")...');
        await connection.query(CREATE_TRANSACTIONS_TABLE_SQL);
        console.log('✅ Tabela "transactions" criada com sucesso.');
        
    } catch (error) {
        console.error('\n❌ ERRO DURANTE A INICIALIZAÇÃO:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexão com o MySQL encerrada.');
        }
        console.log('\n🎉 Processo de inicialização finalizado!');
    }
}

initializeDatabase();

// db_init.js
// Descrição: Script para inicializar o banco de dados.
// Este script irá:
// 1. Conectar-se ao servidor MySQL.
// 2. Criar o banco de dados 'epi_stock_control' se ele não existir.
// 3. Criar as tabelas 'items' e 'transactions'.
// 4. Inserir os dados de exemplo na tabela 'items'.

const mysql = require('mysql2/promise');

// --- Configuração do Banco de Dados ---
// IMPORTANTE: Use as mesmas credenciais do seu arquivo server.js.
// Deixe 'database' como nulo para conectar ao servidor MySQL antes de criar o banco de dados.
const dbConfig = {
    host: 'localhost',
    user: 'root',      // <-- MUDE AQUI para o seu usuário
    password: '177619',    // <-- MUDE AQUI para a sua senha
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
    min_stock INT UNSIGNED NOT NULL DEFAULT 0,
    ca_number VARCHAR(50) NULL, 
    ca_validity_date DATE NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const CREATE_TRANSACTIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    type ENUM('Entrada', 'Saída') NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    recipient VARCHAR(255) NULL,
    op_number VARCHAR(50) NULL,
    price DECIMAL(10, 2) NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT ON UPDATE CASCADE
);`;

const INSERT_ITEMS_SQL = `
INSERT IGNORE INTO items (description, category, unit, min_stock, ca_number, ca_validity_date) VALUES 
    ('CAPACETE DE SEGURANÇA BRANCO', 'Capacetes', 'Un', 15, '36163', '2029-01-30'),
    ('CAPACETE DE SEGURANÇA AZUL', 'Capacetes', 'Un', 10, '35417', '2028-05-10'),
    ('BOTA DE PVC PRETA', 'Calçados', 'Par', 10, '39248', '2028-12-01'),
    ('BOTINA DE AMARRAR C/ BICO DE ACO', 'Calçados', 'Par', 10, '41419', '2025-08-01'),
    ('LUVA DE LÁTEX', 'Luvas', 'Par', 100, '28388', '2026-08-11'),
    ('LUVA DE RASPA', 'Luvas', 'Par', 20, '15423', '2027-01-01'),
    ('MÁSCARA DESCARTÁVEL PFF2', 'Proteção Respiratória', 'Un', 200, '41513', '2025-07-25'),
    ('PROTETOR FACIAL INCOLOR', 'Proteção Facial', 'Un', 5, '15993', '2026-03-15');
`;


// --- Função Principal de Execução ---
async function initializeDatabase() {
    let connection;
    try {
        console.log('🔌 Conectando ao servidor MySQL...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexão bem-sucedida!');

        console.log('\n[1/5] 🏗️  Criando banco de dados (se não existir)...');
        await connection.query(CREATE_DATABASE_SQL);
        console.log('✅ Banco de dados "epi_stock_control" garantido.');

        console.log('\n[2/5] 🔄 Selecionando o banco de dados...');
        await connection.query(USE_DATABASE_SQL);
        console.log('✅ Banco de dados selecionado.');
        
        console.log('\n[3/5] 🛠️  Criando tabela "items"...');
        await connection.query(CREATE_ITEMS_TABLE_SQL);
        console.log('✅ Tabela "items" criada com sucesso.');

        console.log('\n[4/5] 🛠️  Criando tabela "transactions"...');
        await connection.query(CREATE_TRANSACTIONS_TABLE_SQL);
        console.log('✅ Tabela "transactions" criada com sucesso.');

        console.log('\n[5/5] 📝 Inserindo dados de exemplo...');
        const [result] = await connection.query(INSERT_ITEMS_SQL);
        if (result.affectedRows > 0) {
            console.log(`✅ ${result.affectedRows} itens de exemplo inseridos.`);
        } else {
            console.log('🟡 Nenhum item novo inserido (provavelmente já existiam).');
        }
        

    } catch (error) {
        console.error('\n❌ ERRO DURANTE A INICIALIZAÇÃO:', error);
        process.exit(1); // Encerra o script com código de erro
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexão com o MySQL encerrada.');
        }
        console.log('\n🎉 Processo de inicialização finalizado!');
    }
}

// Inicia a execução da função
initializeDatabase();


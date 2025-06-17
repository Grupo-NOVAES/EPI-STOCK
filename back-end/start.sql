-- Seleciona o banco de dados para garantir que as queries sejam executadas no lugar certo.
USE epi_stock_control;

-- Inicia uma transação para garantir que todas as inserções ocorram com sucesso.
-- Se ocorrer algum erro, nenhuma alteração será salva.
START TRANSACTION;

-- Data para o registro de entrada inicial de estoque.
SET @initial_stock_date = CURDATE();

-- =================================================================================
-- VESTIMENTAS
-- =================================================================================

-- 1. Jaquetas
INSERT INTO items (description, category, unit, sizes, min_stock) 
VALUES ('JAQUETA', 'Vestimentas', 'UN', '["P", "M", "G", "GG", "EXG", "G1"]', 0);
SET @item_id = LAST_INSERT_ID();

INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date) VALUES
    (@item_id, 'P', 'Entrada', 5, 81.65, @initial_stock_date),
    (@item_id, 'M', 'Entrada', 3, 81.65, @initial_stock_date),
    (@item_id, 'G', 'Entrada', 8, 81.65, @initial_stock_date),
    (@item_id, 'GG', 'Entrada', 16, 81.65, @initial_stock_date),
    (@item_id, 'EXG', 'Entrada', 1, 88.27, @initial_stock_date),
    (@item_id, 'G1', 'Entrada', 4, NULL, @initial_stock_date); -- Preço não encontrado

-- 2. Toucas
INSERT INTO items (description, category, unit) VALUES
    ('TOUCA ARABE SOLDADOR AZUL', 'Vestimentas', 'UN'),
    ('TOUCA ARABE CINZA UV', 'Vestimentas', 'UN');
-- Inserir transações para toucas
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 6, 12.00, @initial_stock_date FROM items WHERE description = 'TOUCA ARABE SOLDADOR AZUL';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 2, 12.00, @initial_stock_date FROM items WHERE description = 'TOUCA ARABE CINZA UV';

-- 3. Coletes Refletivos
INSERT INTO items (description, category, unit) VALUES
    ('COLETE REFLETIVO VERDE NOITE', 'Vestimentas', 'UN'),
    ('COLETE REFLETIVO LARANJA DIA', 'Vestimentas', 'UN');
-- Inserir transações para coletes
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 6, 26.00, @initial_stock_date FROM items WHERE description = 'COLETE REFLETIVO VERDE NOITE';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 22, 26.00, @initial_stock_date FROM items WHERE description = 'COLETE REFLETIVO LARANJA DIA';

-- 4. Cintas Lombares
INSERT INTO items (description, category, unit, sizes) 
VALUES ('CINTA LOMBAR', 'Vestimentas', 'UN', '["G", "GG", "EG"]');
SET @item_id = LAST_INSERT_ID();

INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date) VALUES
    (@item_id, 'G', 'Entrada', 2, 40.00, @initial_stock_date),
    (@item_id, 'GG', 'Entrada', 4, 40.00, @initial_stock_date),
    (@item_id, 'EG', 'Entrada', 1, 40.00, @initial_stock_date);

-- 5. Avental de Raspa
INSERT INTO items (description, category, unit) 
VALUES ('AVENTAL RASPA P/SOLDA', 'Vestimentas', 'UN');
SET @item_id = LAST_INSERT_ID();
INSERT INTO transactions (item_id, type, quantity, price, transaction_date) 
VALUES (@item_id, 'Entrada', 2, 45.00, @initial_stock_date);


-- =================================================================================
-- PROTEÇÃO DA CABEÇA E FACE
-- =================================================================================

-- 6. Máscara de Solda
INSERT INTO items (description, category, unit, ca_number) 
VALUES ('MASCARA DE SOLDA ( SEM LENTE )', 'Proteção Facial', 'UN', '15083');
SET @item_id = LAST_INSERT_ID();
INSERT INTO transactions (item_id, type, quantity, price, transaction_date) 
VALUES (@item_id, 'Entrada', 2, 73.55, @initial_stock_date);

-- 7. Capacetes
INSERT INTO items (description, category, unit) VALUES
    ('CAPACETE BRANCO', 'Proteção da Cabeça', 'UN'),
    ('CAPACETE CINZA', 'Proteção da Cabeça', 'UN');
-- Inserir transações para capacetes
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 15, 13.85, @initial_stock_date FROM items WHERE description = 'CAPACETE BRANCO';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 2, 13.85, @initial_stock_date FROM items WHERE description = 'CAPACETE CINZA';


-- =================================================================================
-- CALÇADOS DE SEGURANÇA
-- =================================================================================

-- 8. Calçado de Segurança genérico (sem CA especificado)
INSERT INTO items (description, category, unit, sizes) 
VALUES ('CALÇADO SEGURANÇA', 'Calçados de Segurança', 'UN', '["N°36"]');
SET @item_id = LAST_INSERT_ID();
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date) 
VALUES (@item_id, 'N°36', 'Entrada', 1, NULL, @initial_stock_date); -- Preço não encontrado

-- 9. Calçado de Segurança (CA.43108)
INSERT INTO items (description, category, unit, ca_number, sizes) 
VALUES ('CALÇADO SEGURANÇA', 'Calçados de Segurança', 'UN', '43108', '["N°38", "N°43", "N°44", "N°45"]');
SET @item_id = LAST_INSERT_ID();
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date) VALUES
    (@item_id, 'N°38', 'Entrada', 6, 56.15, @initial_stock_date),
    (@item_id, 'N°43', 'Entrada', 6, 56.15, @initial_stock_date),
    (@item_id, 'N°44', 'Entrada', 5, 56.15, @initial_stock_date),
    (@item_id, 'N°45', 'Entrada', 5, 56.15, @initial_stock_date);

-- 10. Outros Calçados de Segurança (por CA)
INSERT INTO items (description, category, unit, ca_number, sizes) VALUES
    ('CALÇADO SEGURANÇA', 'Calçados de Segurança', 'UN', '36982', '["N°39"]'),
    ('CALÇADO SEGURANÇA', 'Calçados de Segurança', 'UN', '43377', '["N°43"]'),
    ('CALÇADO SEGURANÇA', 'Calçados de Segurança', 'UN', '17015', '["N°43"]'),
    ('CALÇADO SEGURANÇA', 'Calçados de Segurança', 'UN', '28945', '["N°43"]'),
    ('CALÇADOS SEGURANÇA', 'Calçados de Segurança', 'UN', '40043', '["N°45"]');

INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date)
SELECT id, 'N°39', 'Entrada', 4, 68.00, @initial_stock_date FROM items WHERE ca_number = '36982';
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date)
SELECT id, 'N°43', 'Entrada', 3, 68.00, @initial_stock_date FROM items WHERE ca_number = '43377';
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date)
SELECT id, 'N°43', 'Entrada', 2, 60.00, @initial_stock_date FROM items WHERE ca_number = '17015';
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date)
SELECT id, 'N°43', 'Entrada', 1, 60.00, @initial_stock_date FROM items WHERE ca_number = '28945';
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date)
SELECT id, 'N°45', 'Entrada', 1, 56.00, @initial_stock_date FROM items WHERE ca_number = '40043';

-- 11. Botinas PVC (por CA)
INSERT INTO items (description, category, unit, ca_number, sizes) VALUES
    ('BOTINA PVC', 'Calçados de Segurança', 'UN', '32169', '["N°38"]'),
    ('BOTINA PVC', 'Calçados de Segurança', 'UN', '42291', '["N°38", "N°39", "N°42", "N°44", "N°45"]'),
    ('BOTINA PVC', 'Calçados de Segurança', 'UN', '36026', '["N°43"]');

INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date)
SELECT id, 'N°38', 'Entrada', 2, 38.00, @initial_stock_date FROM items WHERE description = 'BOTINA PVC' AND ca_number = '32169';
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date)
SELECT id, 'N°43', 'Entrada', 3, 38.00, @initial_stock_date FROM items WHERE description = 'BOTINA PVC' AND ca_number = '36026';

SET @item_id_botina_42291 = (SELECT id FROM items WHERE description = 'BOTINA PVC' AND ca_number = '42291');
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date) VALUES
    (@item_id_botina_42291, 'N°38', 'Entrada', 2, 36.00, @initial_stock_date),
    (@item_id_botina_42291, 'N°39', 'Entrada', 3, 36.00, @initial_stock_date),
    (@item_id_botina_42291, 'N°42', 'Entrada', 1, 36.00, @initial_stock_date),
    (@item_id_botina_42291, 'N°44', 'Entrada', 2, 36.00, @initial_stock_date),
    (@item_id_botina_42291, 'N°45', 'Entrada', 2, 36.00, @initial_stock_date);

-- 12. Calçado de Segurança Agente Elétrico/Calor (CA.49653)
INSERT INTO items (description, category, unit, ca_number, sizes) 
VALUES ('CALÇADO SEGURANÇA AG.ELÉT/CALOR', 'Calçados de Segurança', 'UN', '49653', '["N°39", "N°41", "N°42", "N°43"]');
SET @item_id = LAST_INSERT_ID();
INSERT INTO transactions (item_id, size, type, quantity, price, transaction_date) VALUES
    (@item_id, 'N°39', 'Entrada', 1, 90.00, @initial_stock_date),
    (@item_id, 'N°41', 'Entrada', 3, 90.00, @initial_stock_date),
    (@item_id, 'N°42', 'Entrada', 4, 90.00, @initial_stock_date),
    (@item_id, 'N°43', 'Entrada', 3, 90.00, @initial_stock_date);


-- =================================================================================
-- PROTEÇÃO AUDITIVA E RESPIRATÓRIA
-- =================================================================================

-- 13. Protetores Auriculares (por CA)
INSERT INTO items (description, category, unit, ca_number) VALUES
    ('PROTETOR AURICULAR TIPO PLUG', 'Proteção Auditiva', 'UN', '18189'),
    ('PROTETOR AURICULAR TIPO PLUG', 'Proteção Auditiva', 'UN', '19578'),
    ('PROTETOR AURICULAR TIPO PLUG', 'Proteção Auditiva', 'UN', '5745');
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 1, 1.20, @initial_stock_date FROM items WHERE ca_number = '18189';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 26, 1.05, @initial_stock_date FROM items WHERE ca_number = '19578';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 84, 1.18, @initial_stock_date FROM items WHERE ca_number = '5745';

-- 14. Respiradores e Filtros
INSERT INTO items (description, category, unit, ca_number) VALUES
    ('FILTRO PARA RESPIRADOR CG 306', 'Proteção Respiratória', 'UN', '7072'),
    ('RESPIRADOR FACIL CG 306', 'Proteção Respiratória', 'UN', '7072'),
    ('RESPIRADOR DESCARTAVEL PFF2', 'Proteção Respiratória', 'UN', '38503'),
    ('MASCARA PANO', 'Proteção Respiratória', 'UN', NULL),
    ('MASCARA FACIL 2 FILTROS', 'Proteção Respiratória', 'UN', '39427');

INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 8, 16.80, @initial_stock_date FROM items WHERE description = 'FILTRO PARA RESPIRADOR CG 306';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 4, 18.20, @initial_stock_date FROM items WHERE description = 'RESPIRADOR FACIL CG 306';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 10, 2.95, @initial_stock_date FROM items WHERE description = 'RESPIRADOR DESCARTAVEL PFF2';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 29, 2.50, @initial_stock_date FROM items WHERE description = 'MASCARA PANO';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 1, 35.00, @initial_stock_date FROM items WHERE description = 'MASCARA FACIL 2 FILTROS';

-- =================================================================================
-- PROTEÇÃO VISUAL
-- =================================================================================

-- 15. Óculos de Proteção
INSERT INTO items (description, category, unit, ca_number) VALUES
    ('OCULOS ESCURO', 'Proteção Visual', 'UN', '48017'),
    ('OCULOS TRANSPARENTE', 'Proteção Visual', 'UN', '11268'),
    ('OCULOS SOBREPOR TRANSPARANTE', 'Proteção Visual', 'UN', '39878'),
    ('OCULOS SOBREPOR TRANSPARANTE', 'Proteção Visual', 'UN', '10344');
    
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 11, 6.50, @initial_stock_date FROM items WHERE ca_number = '48017';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 3, 4.50, @initial_stock_date FROM items WHERE ca_number = '11268';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 2, 12.00, @initial_stock_date FROM items WHERE ca_number = '39878';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 5, 12.00, @initial_stock_date FROM items WHERE ca_number = '10344';


-- =================================================================================
-- PROTEÇÃO PARA AS MÃOS
-- =================================================================================

-- 16. Luvas
INSERT INTO items (description, category, unit, ca_number) VALUES
    ('LUVA DE RASPA AG.TÉRMICO', 'Proteção para as Mãos', 'PAR', '32586'),
    ('LUVA LÁTEX MULTIUSO', 'Proteção para as Mãos', 'PAR', NULL),
    ('LUVA CURTA BORRACHA PVC', 'Proteção para as Mãos', 'PAR', '41917'),
    ('LUVA LONGA PETRONIT', 'Proteção para as Mãos', 'PAR', '40304'),
    ('LUVA TECIDO COM NITRILICO', 'Proteção para as Mãos', 'PAR', '43319'),
    ('LUVA MULTIUSO P.U PRETA', 'Proteção para as Mãos', 'PAR', '29014');

INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 3, 15.30, @initial_stock_date FROM items WHERE description = 'LUVA DE RASPA AG.TÉRMICO';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 9, 3.80, @initial_stock_date FROM items WHERE description = 'LUVA LÁTEX MULTIUSO';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 10, 13.00, @initial_stock_date FROM items WHERE description = 'LUVA CURTA BORRACHA PVC';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 3, 18.50, @initial_stock_date FROM items WHERE description = 'LUVA LONGA PETRONIT';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 16, 7.50, @initial_stock_date FROM items WHERE description = 'LUVA TECIDO COM NITRILICO';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 14, 4.95, @initial_stock_date FROM items WHERE description = 'LUVA MULTIUSO P.U PRETA';


-- =================================================================================
-- OUTROS E EQUIPAMENTOS
-- =================================================================================

-- 17. Itens Diversos
INSERT INTO items (description, category, unit, ca_number) VALUES
    ('GANCHO MOSKETÃO CLASSE B LOTE1910 CG MAX 25KN', 'Equipamentos Diversos', 'UN', NULL),
    ('EQUIPAMENTO DECIBELIMETRO MEDIDOR DE NIVEL SONORO', 'Equipamentos de Medição', 'UN', NULL),
    ('PROTETOR SOLAR VAL. 01/2028', 'Cuidados com a Pele', 'UN', NULL),
    ('REPELENTE DE INSETOS SUNLAU VAL. 02/05/2026', 'Cuidados com a Pele', 'UN', NULL),
    ('JOELHEIRA CORTAG', 'Proteção dos Membros', 'UN', NULL);

INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 2, 26.60, @initial_stock_date FROM items WHERE description LIKE 'GANCHO MOSKETÃO%';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 1, NULL, @initial_stock_date FROM items WHERE description LIKE 'EQUIPAMENTO DECIBELIMETRO%'; -- Preço não encontrado
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 12, 10.25, @initial_stock_date FROM items WHERE description LIKE 'PROTETOR SOLAR%';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 5, 15.30, @initial_stock_date FROM items WHERE description LIKE 'REPELENTE DE INSETOS%';
INSERT INTO transactions (item_id, type, quantity, price, transaction_date)
SELECT id, 'Entrada', 1, 38.20, @initial_stock_date FROM items WHERE description = 'JOELHEIRA CORTAG';

-- Confirma todas as inserções no banco de dados
COMMIT;
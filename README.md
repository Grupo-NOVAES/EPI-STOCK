# EPI-Stock: Controle de Estoque de EPIs

![Licença](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-14.x+-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-4.x-orange.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.x-blue.svg)

Um sistema de painel web para controle e gerenciamento de estoque de Equipamentos de Proteção Individual (EPIs). A aplicação permite o monitoramento de entradas, saídas, níveis de estoque, validade de Certificados de Aprovação (CAs) e análise financeira básica.

## 📋 Tabela de Conteúdos

* [Sobre o Projeto](#sobre-o-projeto)
* [Funcionalidades](#funcionalidades)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Pré-requisitos](#pré-requisitos)
* [Como Executar](#como-executar)
* [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
* [Rotas da API](#rotas-da-api)

## 📖 Sobre o Projeto

O **EPI-Stock** foi desenvolvido para simplificar o controle de estoque de EPIs, um requisito crucial para a segurança no trabalho. O sistema oferece uma interface visual e intuitiva para registrar todas as movimentações, visualizar o status atual do estoque em tempo real e tomar decisões baseadas em dados, como a necessidade de reposição de itens ou a proximidade do vencimento de CAs.

## ✨ Funcionalidades

O sistema possui uma interface de aba única com diversas funcionalidades centralizadas:

* **📊 Dashboard Visual**:
    * Visualização inicial por categorias, com a quantidade total de itens em estoque por grupo.
    * Navegação para visualização detalhada de itens dentro de uma categoria.
    * Cards de status que indicam visualmente se o estoque está "OK", "Baixo" ou "Zerado".
    * Alerta automático de status do Certificado de Aprovação (CA): "Válido", "Vence em Breve" ou "Vencido".

* **💰 Análise Financeira**:
    * Cálculo do valor total do estoque com base no último preço de compra.
    * Identificação do custo total de saídas no mês corrente.
    * Gráficos interativos (criados com Chart.js) para visualizar o valor por categoria e os 5 itens mais valiosos em estoque.

* **📜 Histórico de Movimentações**:
    * Registro detalhado de todas as transações de entrada e saída.
    * Filtros avançados por período (data de início e fim), tipo de movimentação e Ordem de Produção (OP).

* **📦 Gerenciamento de Itens**:
    * Funcionalidade completa de CRUD (Criar, Ler, Atualizar) para os itens de EPI.
    * Formulário para adicionar novos itens ou editar existentes, incluindo informações como descrição, categoria, unidade, estoque mínimo e dados do CA.

* **📄 Exportação de Relatórios**:
    * Geração de relatórios de movimentação em formato **CSV**, compatível com Excel e outras planilhas.
    * Seleção de intervalo de datas e tipo de movimentação (Entrada, Saída ou Ambos) para o relatório.

## 🛠️ Tecnologias Utilizadas

O projeto é dividido em duas partes principais:

**Backend:**
* **Node.js**: Ambiente de execução do JavaScript no servidor.
* **Express.js**: Framework para criação da API REST e roteamento.
* **mysql2**: Driver para conexão com o banco de dados MySQL, com suporte a Promises.
* **json2csv**: Pacote para conversão de dados JSON em CSV para a funcionalidade de relatórios.
* **cors**: Middleware para habilitar o Cross-Origin Resource Sharing.

**Frontend:**
* **HTML5** e **CSS3**: Estrutura e estilização da página.
* **TailwindCSS**: Framework CSS para design rápido e responsivo.
* **Vanilla JavaScript (ES6+)**: Manipulação do DOM e lógica da interface do usuário.
* **Chart.js**: Biblioteca para criação de gráficos interativos.
* **Font Awesome**: Biblioteca de ícones.

## ✅ Pré-requisitos

Antes de começar, você precisará ter as seguintes ferramentas instaladas em sua máquina:
* [Node.js](https://nodejs.org/en/) (que inclui o npm)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

## 🚀 Como Executar

Siga os passos abaixo para executar o projeto localmente:

1.  **Clone o repositório:**
    ```bash
    git clone [https://URL-DO-SEU-REPOSITORIO.git](https://URL-DO-SEU-REPOSITORIO.git)
    cd epi-stock
    ```

2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

3.  **Configure a Conexão com o Banco de Dados:**
    Você precisa inserir suas credenciais do MySQL em **dois arquivos**:

    * Em `server.js` (para a aplicação principal):
        ```javascript
        const dbConfig = {
            host: 'localhost',
            user: 'SEU_USUARIO_MYSQL',    // <-- MUDE AQUI
            password: 'SUA_SENHA_MYSQL',  // <-- MUDE AQUI
            database: 'epi_stock_control',
            dateStrings: true
        };
        ```
    * Em `db_init.js` (para o script de inicialização):
        ```javascript
        const dbConfig = {
            host: 'localhost',
            user: 'SEU_USUARIO_MYSQL',    // <-- MUDE AQUI
            password: 'SUA_SENHA_MYSQL',  // <-- MUDE AQUI
            charset: 'utf8mb4',
        };
        ```

4.  **Crie e Popule o Banco de Dados:**
    Execute o script de inicialização que cria o banco de dados, as tabelas e insere dados de exemplo.
    ```bash
    npm run db:init
    ```

5.  **Inicie o Servidor:**
    ```bash
    npm start
    ```

6.  **Acesse a Aplicação:**
    Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000).

## 🗄️ Estrutura do Banco de Dados

O banco de dados `epi_stock_control` contém duas tabelas principais:

* **`items`**: Armazena as informações cadastrais de cada EPI.
    * `id`: Identificador único.
    * `description`: Nome do item.
    * `category`: Categoria (ex: Luvas, Calçados).
    * `unit`: Unidade de medida (ex: Par, Un).
    * `min_stock`: Estoque mínimo desejado.
    * `ca_number`, `ca_validity_date`: Dados do Certificado de Aprovação.

* **`transactions`**: Registra todas as movimentações de estoque.
    * `transaction_id`: Identificador único da transação.
    * `item_id`: Chave estrangeira referenciando a tabela `items`.
    * `type`: Tipo de movimentação (`Entrada` ou `Saída`).
    * `quantity`: Quantidade movimentada.
    * `price`: Preço unitário (usado em transações de `Entrada`).
    * `recipient`: Fornecedor (usado em transações de `Entrada`).
    * `op_number`: Ordem de Produção (usado em transações de `Saída`).
    * `transaction_date`: Data em que a movimentação ocorreu.

## 🌐 Rotas da API

As principais rotas da API estão disponíveis sob o prefixo `/api`.

| Método | Rota                    | Descrição                                                                      |
| :----- | :---------------------- | :----------------------------------------------------------------------------- |
| `GET`  | `/health`               | Verifica a conexão com o banco de dados.                                         |
| `GET`  | `/stock`                | Retorna a lista de todos os itens com o estoque atual e status do CA calculados. |
| `GET`  | `/items`                | Retorna a lista de todos os itens cadastrados.                               |
| `POST` | `/items`                | Adiciona um novo item ao banco de dados.                                     |
| `PUT`  | `/items/:id`            | Atualiza um item existente.                                                  |
| `GET`  | `/transactions`         | Retorna o histórico de movimentações, com suporte a filtros.               |
| `POST` | `/transactions`         | Registra uma nova movimentação (entrada ou saída).                         |
| `GET`  | `/financial-summary`    | Retorna os dados consolidados para a aba de análise financeira.              |
| `GET`  | `/report`               | Gera e baixa um relatório de movimentações em formato CSV.                 |

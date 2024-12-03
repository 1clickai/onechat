const { Pool } = require('pg');
require('dotenv').config(); // Carregar as variáveis do .env

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING || 'postgresql://onechatuser:secret@localhost:5432/onechatdb',
});

// Função para conectar ao banco e garantir que as tabelas existem
async function connectToDB() {
    let retries = 5; // Número de tentativas de reconexão
    while (retries) {
        try {
            console.log('Attempting to connect to the database...');
            await pool.connect();
            console.log('Connected to the database.');

            // Criar a tabela de instâncias, se não existir
            const tableQuery = `
            CREATE TABLE IF NOT EXISTS instances (
                id SERIAL PRIMARY KEY,
                udid VARCHAR(255) UNIQUE NOT NULL,
                phone_number VARCHAR(15),
                status VARCHAR(20) DEFAULT 'disconnected',
                qr_code TEXT,
                session_data JSONB,
                name VARCHAR(255),
                profile_picture TEXT,
                webhook TEXT,
                webhook_key VARCHAR(255),
                telegram_api_key VARCHAR(255),
                telegram_status VARCHAR(255) DEFAULT 'disconnected',
                discord_bot_token VARCHAR(255),
                discord_status VARCHAR(255) DEFAULT 'disconnected',
                discord_bot_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        

            await pool.query(tableQuery);
            console.log('Database tables ensured.');
            return; // Sucesso: a função retorna sem erros
        } catch (error) {
            console.error('Error connecting to the database:', error.message);
            console.error('Stack Trace:', error.stack);

            retries -= 1;
            if (retries === 0) {
                console.error('Exhausted all retry attempts. Unable to connect to the database.');
                throw new Error('Failed to connect to the database after multiple attempts.');
            }

            console.error(`
                ❌🚨 Exhausted all retry attempts. Unable to connect to the database. 
                
                💡 If you are using EasyPanel, make sure to update the \`DB_CONNECTION_STRING\` variable:
                1️⃣ Go to your EasyPanel dashboard.
                2️⃣ Click on **onechat-db**, then go to **Credentials**.
                3️⃣ Copy the value of **Internal Connection URL**.
                4️⃣ Navigate to **onechat-api** under **Environment**.
                5️⃣ Paste the copied URL into the \`DB_CONNECTION_STRING\` field. 🌐🛠️
                
                🔄 Restart your application to apply the changes. Good luck! 🚀
                `);                
            await new Promise((res) => setTimeout(res, 5000)); // Espera de 5 segundos
        }
    }
}

// Exporta o pool para realizar consultas diretas
async function query(text, params) {
    try {
        //console.log(`Executing query: ${text}`);
        // if (params) console.log(`With parameters: ${JSON.stringify(params)}`);

        const result = await pool.query(text, params);

        //console.log('Query executed successfully.');
        return result;
    } catch (error) {
        console.error('Error executing query:', error.message);
        console.error('Stack Trace:', error.stack);
        throw error;
    }
}

module.exports = {
    connectToDB, // Exporta a função de conexão
    query,       // Exporta o método de consulta
};

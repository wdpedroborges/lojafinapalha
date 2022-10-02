const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    stripeKey: process.env.STRIPE_PRIVATE_KEY,
    usuario: process.env.USUARIO,
    senha: process.env.SENHA,
    senhaDB: process.env.SENHA_DB,
    codigoSessao: process.env.CODIGO_SESSAO
};
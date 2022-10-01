const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
	titulo: {
		type: String,
		required: [true, 'por favor, informe um título para o produto'],
		unique: true,
		lowercase: true
	},
	descricao: {
		type: String,
		required: [true, 'por favor, informe uma descrição para o produto'],
		lowercase: true
	},
	preco: {
		type: String,
		required: [true, 'por favor, informe um preço para o produto']
	},
	imagem: {
		type: String,
		required: [true, 'por favor, informe uma imagem para o produto'],
		lowercase: true
	}
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;
const mongoose = require('mongoose');

const vendaSchema = new mongoose.Schema({
	nomeSobrenome: {
		type: String,
		required: [true, 'por favor, informe um nome para o comprador'],
		lowercase: true
	},
	email: {
		type: String,
		required: [true, 'por favor, informe um email para o comprador'],
		lowercase: true
	},
	telefone: {
		type: String,
		required: [true, 'por favor, informe um telefone para o comprador']
	},
	cidade: {
		type: String,
		required: [true, 'por favor, informe uma cidade para o comprador'],
		lowercase: true
	},
	bairro: {
		type: String,
		required: [true, 'por favor, informe um bairro para o comprador'],
		lowercase: true
	},
	rua: {
		type: String,
		required: [true, 'por favor, informe uma rua para o comprador'],
		lowercase: true
	},
	complemento: {
		type: String,
		required: [true, 'por favor, informe um complemento para o comprador'],
		lowercase: true
	},
	cep: {
		type: String,
		required: [true, 'por favor, informe um CEP para o comprador'],
		lowercase: true
	},
	infoProdutos: {
		type: String,
		required: true,
	},
	meioVenda: {
		type: String,
		required: true,
		lowercase: true
	},	
	afiliado: {
		type: String,
		lowercase: true
	},
	codigoCompra: {
		type: String,
		required: true,
		unique: true,
	},
	codigoRastreio: {
		type: String
	},
	compraConfirmada: {
		type: String,
		default: 'Não'
	},
	repasse: {
		type: String,
		default: 'Não'
	}
});

const Venda = mongoose.model('Venda', vendaSchema);

module.exports = Venda;
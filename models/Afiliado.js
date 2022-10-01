const mongoose = require('mongoose');

const afiliadoSchema = new mongoose.Schema({
	nome: {
		type: String,
		required: [true, 'por favor, informe um nome para o afiliado'],
		unique: true,
		lowercase: true
	},
	pix: {
		type: String,
		required: [true, 'por favor, informe um pix para o afiliado'],
		lowercase: true
	},
	telefone: {
		type: String,
		required: [true, 'por favor, informe um telefone para o afiliado'],
		lowercase: true
	},
	email: {
		type: String,
		required: [true, 'por favor, informe um email para o afiliado'],
		lowercase: true
	},
	dataConsideracao: {
		type: String,
		required: true
	}
});

const Afiliado = mongoose.model('Afiliado', afiliadoSchema);

module.exports = Afiliado;
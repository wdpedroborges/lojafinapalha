const sacolaModal = document.querySelector('#sacolaModal');
const produtoModal = document.querySelector('#produtoModal');
const toast = document.querySelector('.toast');
const btnAdicionarSacola = [... document.querySelectorAll('.btnAdicionarSacola')];
const btnLimparSacola = document.querySelector('#btnLimparSacola');
const btnFinalizarCompra = document.querySelector('#btnFinalizarCompra');
const btnFinalizaCompraWhatsapp = document.querySelector('#btnFinalizaCompraWhatsapp');
const valorProdutosSacola = [... document.querySelectorAll('.valorProdutosSacola')];
const sacolaFlutuante = document.querySelector('#sacolaFlutuante');
const sacolaMenu = document.querySelector('#sacolaMenu');
const tabelaSacola = document.querySelector('#tabelaSacola');
const iconeMenuResponsivo = document.querySelector('#iconeMenuResponsivo');
const menuResponsivo = document.querySelector('nav ul');
const totalcompra = document.querySelector('#totalCompra');

let produtosSacola = [];
let objetosProdutosSacola;

let abriuMenuResponsivo = false;
iconeMenuResponsivo.addEventListener('click', () => {
	if (!abriuMenuResponsivo) {
		abriuMenuResponsivo = true;
		iconeMenuResponsivo.classList.remove('bi-list');
		iconeMenuResponsivo.classList.add('bi-x');
		menuResponsivo.style.setProperty('display', 'block');
	} else {
		abriuMenuResponsivo = false;
		iconeMenuResponsivo.classList.remove('bi-x');
		iconeMenuResponsivo.classList.add('bi-list');
		menuResponsivo.style.setProperty('display', 'none');
	}
});

function exibeToast(texto) {
	toast.innerText = texto;
	toast.style.setProperty('display', 'block');
	setTimeout(() => {
		toast.style.setProperty('display', 'none');
	}, 1000);
}

function convertePreco(preco) {
	preco = preco.replace('R$', '');
	preco = preco.replace(',', '.');
	return parseFloat(preco);
}

function verificaPrecoProduto(nomeProduto) {
	const spanPrecos = [... document.querySelectorAll('.preco')];
	let preco;
	spanPrecos.forEach(span => {
		if (span.getAttribute('title') === nomeProduto) {
			preco = span.textContent;
		}
	});

	return convertePreco(preco);
}

function distingueElementosArray(array) {
	let distinguidos = [];
	for (let i = 0; i < array.length; i++) {
		let presente = false;
		for (let j = 0; j < distinguidos.length; j++) {
			if (array[i] === distinguidos[j]) {
				presente = true;
				continue;
			}
		}
		if (!presente) {
			distinguidos.push(array[i]);
		}
	}

	return distinguidos;
}

function atualizaNumeroSacola(novoValor) {
	valorProdutosSacola.forEach(valor => {
		valor.innerText = novoValor;
	});
}

function limpaSacola() {
	if (produtosSacola.length > 0) {
		produtosSacola.length = 0;
		atualizaNumeroSacola(produtosSacola.length);
		produtosSacola = [];
		limpaTabelaSacola();
		sacolaModal.style.setProperty('display', 'none');
		exibeToast('A sacola foi limpa com sucesso.');
	} else {
		sacolaModal.style.setProperty('display', 'none');
		exibeToast('A sacola já está vazia. Que tal colocar alguma coisa nela?');
	}

	totalCompra.textContent = '0,00';
	
}

function removeQuantidadesNulas(array) {
	novoArray = [];

	array.forEach(elemento => {
		if (parseInt(elemento.quantidade) > 0) {
			novoArray.push(elemento);
		}
	});

	return novoArray;
}

function calculaTotal() {
	let total = 0;
	let linhasTabela = [... document.querySelectorAll('table tr')];
	linhasTabela.forEach(linha => {
		let filhosLinha = [... linha.children];
		let quantidade, preco;
		let totalLinha = 0;
		filhosLinha.forEach(filho => {
			if (filho.classList.contains('celula-quantidade')) {
				let inputQuantidade = [... filho.children];
				quantidade = parseInt(inputQuantidade[0].value);
			}
			if (filho.classList.contains('celula-preco')) {
				preco = parseFloat(filho.textContent);
			}

			if (quantidade && preco) {
				totalLinha = quantidade * preco;
			}
		});
		total += totalLinha;
	});


	const precoFrete = parseFloat(document.getElementById('precoFrete').innerText);

	totalCompra.textContent = (total + precoFrete).toFixed(2);
}

async function finalizaCompra(meioVenda) {
	let padraoEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	let padraoCep1 = /^[0-9]{5}-[0-9]{3}$/;
	let padraoCep2 = /^[0-9]{5}[0-9]{3}$/;
	let padraoTelefone = /(?:^\([0]?[1-9]{2}\)|^[0]?[1-9]{2}[\.-\s]?)[9]?[1-9]\d{3}[\.-\s]?\d{4}$/;

	const afiliado = JSON.parse(localStorage.getItem('afiliado')) !== null ? JSON.parse(localStorage.getItem('afiliado')) : '';
	const nomeCadastro = document.getElementById('nomeCadastro').value;
	const emailCadastro = document.getElementById('emailCadastro').value;
	const telefoneCadastro = document.getElementById('telefoneCadastro').value;
	const cidadeCadastro = document.getElementById('cidadeCadastro').value;
	const bairroCadastro = document.getElementById('bairroCadastro').value;
	const ruaCadastro = document.getElementById('ruaCadastro').value;
	const complementoCadastro = document.getElementById('complementoCadastro').value;
	const cepCadastro = document.getElementById('cepCadastro').value;

	let ok = true;
	if (nomeCadastro !== '' && emailCadastro !== '' && telefoneCadastro !== '' && cidadeCadastro !== '' && bairroCadastro !== '' && ruaCadastro !== '' && complementoCadastro !== '' && cepCadastro !== '') {
		if (!emailCadastro.match(padraoEmail)) {
			exibeToast('E-mail inválido.');
			ok = false;
		}
		if (!(cepCadastro.match(padraoCep1) || cepCadastro.match(padraoCep2))) {
			exibeToast('Padrão de CEP inválido.');
			ok = false;
		}
		if (!telefoneCadastro.match(padraoTelefone)) {
			exibeToast('Padrão de telefone inválido.');
			ok = false;
		}
	} else {
		exibeToast('Preencha todos os campos.');
		ok = false;
	}

	if (ok) {
		if (produtosSacola.length > 0) {
			let inputsTabela = [... document.querySelectorAll('td input')];

			objetosProdutosSacola.forEach( (objeto, index) => {
				objeto.quantidade = inputsTabela[index].value;
			});
			exibeToast('Compra finalizada com sucesso. Você será redirecionado. Aguarde, por favor.');
		} else {
			exibeToast('A sacola está vazia.');
		}

		let info = {
			dadosComprador: {nomeCadastro, emailCadastro, telefoneCadastro, cidadeCadastro, bairroCadastro, ruaCadastro, complementoCadastro, cepCadastro},
			produtos: removeQuantidadesNulas(objetosProdutosSacola),
			meioVenda: meioVenda,
			afiliado: afiliado.nome
		};

		try {
			const res = await fetch('/finaliza-compra', {
				method: 'POST',
				body: JSON.stringify(info),
				headers: {'Content-Type': 'application/json'}
			});
			const data = await res.json();
			if (data.url) {
				window.location = data.url;
			}

		} catch(err) {
			console.log(err);
		}
	}
}

function criaObjetosProdutos(distinguidos) {
	for (let i = 0; i < distinguidos.length; i++) {
		distinguidos[i] = {
			nome: distinguidos[i],
			quantidade: 0,
			preco: 0
		};
	}

	return distinguidos;
}

function verificaProdutosSacola(produtosSacola) {
	let objetos = criaObjetosProdutos(distingueElementosArray(produtosSacola));
	for (let i = 0; i < objetos.length; i++) {
		for (let j = 0; j < produtosSacola.length; j++) {
			if (objetos[i].nome === produtosSacola[j]) {
				objetos[i].quantidade++;
			}
		}
	}

	return objetos;
}

function inserePrecosProdutos(produtos) {
	produtos.forEach(produto => {
		produto.preco = verificaPrecoProduto(produto.nome);
	});

	return produtos;
}

function removeElementoArray(array, elemento) {
	let novoArray = [];
	for (let i = 0; i < array.length; i++) {
		if (array[i] !== elemento) {
			novoArray.push(array[i]);
		}
	}

	return novoArray;
}

function insereProdutosTabelaSacola(produtos) {
	limpaTabelaSacola();
	produtos = inserePrecosProdutos(produtos);
	for (let i = 0; i < produtos.length; i++) {
		let linha = document.createElement('tr');
		let nome = document.createElement('td');
		let celulaQuantidade = document.createElement('td');
		celulaQuantidade.classList.add('celula-quantidade');
		let inputQuantidade = document.createElement('input');
		inputQuantidade.classList.add('input-quantidade');
		let preco = document.createElement('td');
		preco.classList.add('celula-preco');
		let celulaAcao = document.createElement('td');
		let iconeExcluir = document.createElement('i');
		nome.innerText = produtos[i].nome;
		inputQuantidade.value = produtos[i].quantidade;
		inputQuantidade.setAttribute('type', 'number');
		celulaQuantidade.append(inputQuantidade);
		preco.innerText = produtos[i].preco;
		iconeExcluir.classList.add('bi', 'bi-trash', 'icone-excluir');
		celulaAcao.append(iconeExcluir);
		linha.append(nome, celulaQuantidade, preco, celulaAcao);

		tabelaSacola.append(linha);

	}

	const iconeExcluir = [... document.querySelectorAll('.icone-excluir')];
	iconeExcluir.forEach(icone => {
		icone.addEventListener('click', e => {
			let nomeElementoRemover = (e.target.parentElement.parentElement.children[0].innerText).toLowerCase();
			produtosSacola = removeElementoArray(produtosSacola, nomeElementoRemover);;
			e.target.parentElement.parentElement.remove();
			objetosProdutosSacola = verificaProdutosSacola(produtosSacola);
			atualizaNumeroSacola(produtosSacola.length);
			calculaTotal();
			exibeToast('Item removido com sucesso.');
		});
	});

	const tdInput = [... document.querySelectorAll('td input')];
	tdInput.forEach(input => {
		input.addEventListener('change', () => {
			if (parseInt(input.value) < 1) {
				input.value = 1;
			}

			calculaTotal();
		});
	});

	calculaTotal();
}

function limpaTabelaSacola() {
	tabelaSacola.innerHTML = '';
	let cabecalho = document.createElement('tr');
	let nome = document.createElement('th');
	let quantidade = document.createElement('th');
	let preco = document.createElement('th');
	let acao = document.createElement('th');
	nome.innerText = 'Nome';
	quantidade.innerText = 'Quantidade';
	preco.innerText = 'Preço (R$)';
	acao.innerText = 'Ação';
	cabecalho.append(nome, quantidade, preco, acao);
	tabelaSacola.append(cabecalho);
}

btnLimparSacola.addEventListener('click', () => {
	limpaSacola();
});

btnFinalizarCompra.addEventListener('click', () => {
	finalizaCompra('stripe');
});

btnFinalizaCompraWhatsapp.addEventListener('click', () => {
	finalizaCompra('whatsapp');
});

btnAdicionarSacola.forEach(btn => {
	btn.addEventListener('click', () => {
		
		let infoProduto = btn.getAttribute('title');
		produtosSacola.push(infoProduto);
		exibeToast(`O produto "${infoProduto}" foi adicionado à sacola com sucesso.`);
		objetosProdutosSacola = verificaProdutosSacola(produtosSacola);
		insereProdutosTabelaSacola(objetosProdutosSacola);
		atualizaNumeroSacola(produtosSacola.length);
	})
});

document.addEventListener('click', e => {
	if (e.target.classList.contains('bg-modal')) {
		e.target.style.setProperty('display', 'none');
	} else if (e.target.classList.contains('icone-fechar')) {
		const bgModais = [... document.querySelectorAll('.bg-modal')];
		bgModais.forEach(bgModal => {
			bgModal.style.setProperty('display', 'none');
		});
	}
});

function exibeSacola() {
	exibeToast('Ambiente seguro.')
	sacolaModal.style.setProperty('display', 'flex');
}

sacolaFlutuante.addEventListener('click', () => {
	exibeSacola();
});

sacolaMenu.addEventListener('click', () => {
	exibeSacola();
})

const cepCadastro = document.getElementById('cepCadastro');
cepCadastro.addEventListener('change', () => {
	obtemDadosCEP(cepCadastro.value);
});

async function obtemDadosCEP(cep) {
	const msg = document.getElementById('msg');
	const resultadoPreco = document.getElementById('resultadoPreco');
	const precoFrete = document.getElementById('precoFrete');
	const totalCompra = document.getElementById('totalCompra');
	const resultadoPrazo = document.getElementById('resultadoPrazo');
	const nomeCadastro = document.getElementById('nomeCadastro');
	const emailCadastro = document.getElementById('emailCadastro');
	const telefoneCadastro = document.getElementById('telefoneCadastro');
	const cidadeCadastro = document.getElementById('cidadeCadastro');
	const bairroCadastro = document.getElementById('bairroCadastro');
	const ruaCadastro = document.getElementById('ruaCadastro');
	const complementoCadastro = document.getElementById('complementoCadastro');
	const cepCadastro = document.getElementById('cepCadastro');

	try {
		const res = await fetch(`/dados-cep/${cep}`);
		const data = await res.json();
		if (data.error) {
			msg.innerText = data.error;
		} else {
			msg.innerText = '';
			ruaCadastro.value = data.dadosCep.logradouro;
			bairroCadastro.value = data.dadosCep.bairro;
			cidadeCadastro.value = data.dadosCep.localidade;
			telefoneCadastro.value = data.dadosCep.ddd;

			resultadoPreco.innerText = `Preço: R$${(data.precoPrazo[0].Valor).replace(',', '.')}`;
			precoFrete.innerText = (data.precoPrazo[0].Valor).replace(',', '.');
			resultadoPrazo.innerText = `Prazo: ${data.precoPrazo[0].PrazoEntrega} dias úteis.`;
			totalCompra.innerText = (parseFloat(totalCompra.innerText) + parseFloat(data.precoPrazo[0].Valor)).toFixed(2);
		}
	} catch(e) {
		msg.innerText = e.message;
	}
}

// params.getAll('name') # => ["n1", "n2"]
let params = new URLSearchParams(location.search);
if (params.get('codigoCompra') && params.get('codigoCompra') !== '') {
	confirmaCompra();
}

async function confirmaCompra() {
    let codigoCompra = params.get('codigoCompra');
	try {
		const res = await fetch('/confirma-compra', {
			method: 'POST',
			body: JSON.stringify({codigoCompra}),
			headers: {'Content-Type': 'application/json'}
		});
		const data = await res.json();
		if (data) {
			console.log(data);
		}
	} catch(err) {
		console.log(err);
	}
}

params = new URLSearchParams(location.search);
if (params.get('afiliado') && params.get('afiliado') !== '') {
	localStorage.setItem('afiliado', JSON.stringify({nome: params.get('afiliado')}));
}

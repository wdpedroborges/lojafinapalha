const { stripeKey, usuario, senha } = require('../config');
const Produto = require('../models/Produto');
const Venda = require('../models/Venda');
const stripe = require('stripe')(stripeKey);
const {consultarCep, calcularPrecoPrazo} = require('correios-brasil');

const admin = {
    'usuario': usuario,
    'senha': senha
};

module.exports.login_admin_get = (req, res) => {
    res.render('login-admin');
}

module.exports.login_admin_post = (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario == admin.usuario && senha == admin.senha) {
      console.log('Logado com sucesso');
      req.session.usuario = admin.usuario;
      res.status(201).json(admin.usuario);
    } else {
      console.log('Login inválido');
      const erro = 'Login inválido';
      res.status(400).json(erro);
    }
}

module.exports.home_get = (req, res) => {
  Produto.find()
    .then(result => {
      res.render('home', { produtos: result, title: 'produtos' });
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports.produtos_get = (req, res) => {
  Venda.find().sort({ _id: -1 })
    .then(result => {
      res.render('produtos', { vendas: result, title: 'vendas' });
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports.produtos_post = async (req, res) => {
  const { titulo, descricao, preco } = req.body;
  const imagem = req.file.filename;

  try {
      const produto = await Produto.create({ titulo, descricao, preco, imagem });
      await produto.save();
      console.log('Produto cadastrado com sucesso.');
      res.status(201).json('Produto cadastrado com sucesso.');
  } catch(e) {
      res.status(400).json(e);
  }
}

module.exports.finaliza_compra_post = async (req, res) => {
  let dadosComprador = req.body.dadosComprador;
  let meioVenda = req.body.meioVenda;
  let afiliado = req.body.afiliado;
  let produtos = req.body.produtos;
  data = new Date();
  let codigoCompra = data.getTime();

  // verifica novamente o preço de cada item, mas desta vez pegando o preço no bd
  let produtosDb = await Produto.find();
  produtosDb.forEach(produto => {
    for (let i = 0; i < produtos.length; i++) {
      if (produtos[i].nome === produto.nome) {
        produtos[i].preco = parseFloat(produto.preco);
      }
    }
  });

  console.log(meioVenda);
  console.log(produtos);

  // recalcula o frete
  let args = {
    sCepOrigem: '81200100',
    sCepDestino: dadosComprador.cepCadastro,
    nVlPeso: '1',
    nCdFormato: '1',
    nVlComprimento: '20',
    nVlAltura: '20',
    nVlLargura: '20',
    nCdServico: ['04510'], //Array com os códigos de serviço
    nVlDiametro: '0',
  };
  let promiseFrete = calcularPrecoPrazo(args).then((response) => {
    return {nome: 'frete', quantidade: 1, preco: parseFloat(response[0].Valor)};
  });
  let frete = await promiseFrete;
  produtos.push(frete);

  // registra a compra feita
  let vendaRegistrada = false;
  try {
      const venda = await Venda.create({ 
          nomeSobrenome: dadosComprador.nomeCadastro,
          email: dadosComprador.emailCadastro,
          telefone: dadosComprador.telefoneCadastro,
          cidade: dadosComprador.cidadeCadastro,
          bairro: dadosComprador.bairroCadastro,
          rua: dadosComprador.ruaCadastro,
          complemento: dadosComprador.complementoCadastro,
          cep: dadosComprador.cepCadastro,
          infoProdutos: JSON.stringify(produtos),
          meioVenda: meioVenda,
          afiliado: afiliado,
          codigoCompra: codigoCompra,
          codigoRastreio: 'Não informado',
          compraConfirmada: 'Não'
        });

      await venda.save();
      vendaRegistrada = true;      
  } catch(e) {
      res.status(400).json(e);
      console.log(e);
  }

  if (vendaRegistrada && meioVenda === 'stripe') {
    let produtosMapeados = produtos.map(produto => {
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: produto.nome
          },
          unit_amount: parseFloat(produto.preco) * 100
        },
        quantity: produto.quantidade
      };
    });

    console.log('----- Itens mapeados: -----')
    console.log(produtos);
    console.log('----- fim itens mapeados -----')

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: produtosMapeados,
        mode: 'payment',
        success_url: `https://lojafinapalha.herokuapp.com/?codigoCompra=${codigoCompra}`,
        cancel_url: `https://lojafinapalha.herokuapp.com/`
      });

      res.json({url: session.url});
    } catch(e) {
      console.log(e);
      res.status(500).json({error: e.message});
    }
  } else if (meioVenda === 'whatsapp') {

    let mensagem = `✔ VENDA - Fina Palha\n\n➡ *Nome:* ${dadosComprador.nomeCadastro}\n➡ *Email:* ${dadosComprador.emailCadastro}\n➡ *Telefone:* ${dadosComprador.telefoneCadastro}\n➡ *Cidade:* ${dadosComprador.cidadeCadastro}\n➡ *Bairro:* ${dadosComprador.bairroCadastro}\n➡ *Rua:* ${dadosComprador.ruaCadastro}\n➡ *Número:* ${dadosComprador.complementoCadastro}\n➡ *CEP:* ${dadosComprador.cepCadastro}\n\n➡ *Produtos:* ${JSON.stringify(produtos)}\n\n➡ *Afiliado:* ${afiliado}\n➡ *Código de compra:* ${codigoCompra}`;
    mensagem = encodeURIComponent(mensagem);
    res.json({url: `https://api.whatsapp.com/send?phone=5561998746331&text=${mensagem}`});
  }
}

module.exports.confirma_compra_post = async (req, res) => {
  console.log(req.body.codigoCompra);
  const venda = await Venda.where('codigoCompra').equals(req.body.codigoCompra).limit(1);
  if (venda.length > 0) {
    venda[0].compraConfirmada = 'Sim';
    await venda[0].save();
  }
}

module.exports.dados_cep_get = async (req, res) => {
  let args = {
    sCepOrigem: '81200100',
    sCepDestino: req.params.cep,
    nVlPeso: '1',
    nCdFormato: '1',
    nVlComprimento: '20',
    nVlAltura: '20',
    nVlLargura: '20',
    nCdServico: ['04510'], //Array com os códigos de serviço
    nVlDiametro: '0',
  };
  let resposta = {
    dadosCep: null,
    precoPrazo: null
  };
  consultarCep(req.params.cep).then((response) => {
    resposta.dadosCep = response;
    calcularPrecoPrazo(args).then((response) => {
      resposta.precoPrazo = response;
      res.send(resposta);
    }).catch(e => {
      res.status(500).json({error: e.message});
    });
  }).catch(e => {
    res.status(500).json({error: e.message});
  });
}

module.exports.contato_get = (req, res) => {
   res.render('contato');
}

module.exports.sobre_nos_get = (req, res) => {
   res.render('sobre-nos');
}

module.exports.seja_afiliado_get = (req, res) => {
   res.render('seja-afiliado');
}

module.exports.rastrear_pedido_get = (req, res) => {
   res.render('rastrear-pedido');
}

module.exports.logout_admin_get = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

// funções de controle na página de gerenciamento de vendas
module.exports.excluir_venda_post = async (req, res) => {
  const {codigo} = req.body;
  const venda = await Venda.deleteOne({ codigoCompra: codigo });
  res.status(201).json({ mensagem: 'Registro de venda excluído com sucesso!' });
}

module.exports.confirmar_compra_whatsapp_post = async (req, res) => {
  const {codigo} = req.body;
  const venda = await Venda.where('codigoCompra').equals(codigo).limit(1);
  venda[0].compraConfirmada = 'Sim';
  venda[0].save();
  res.status(201).json({ mensagem: 'Compra confirmada com sucesso!' });
}

module.exports.informar_codigo_rastreio_post = async (req, res) => {
  const {codigo, codigoRastreio} = req.body;
  const venda = await Venda.where('codigoCompra').equals(codigo).limit(1);
  venda[0].codigoRastreio = codigoRastreio;
  venda[0].save();

  res.status(201).json({ mensagem: 'Código de rastreio atualizado com sucesso!' });
  // res.status(400).json(erro);
}

module.exports.confirmar_repasse_post = async (req, res) => {
  const {codigo} = req.body;
  const venda = await Venda.where('codigoCompra').equals(codigo).limit(1);
  venda[0].repasse = 'Sim';
  venda[0].save();
  res.status(201).json({ mensagem: 'A venda foi dada como repassada.' });
}
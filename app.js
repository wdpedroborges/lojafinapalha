const express = require('express');
const mongoose = require('mongoose');
const mainRoutes = require('./routes/mainRoutes');
const session = require('express-session');
const { senhaDB, codigoSessao } = require('./config');

const app = express();

app.use(session({
	secret: codigoSessao, 
	resave: true, 
	saveUninitialized: true,
	maxAge: 3600000	// 1 hour (in milliseconds)
})); 

// middleware
app.use(express.static('public'));
app.use(express.json());

// view engine
app.set('view engine', 'ejs');

// conexão com o banco de dados
const dbURI = `mongodb+srv://LojaFinaPalha:${senhaDB}@cluster0.fcew9vg.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => { console.log('Conectado.'); app.listen(process.env.PORT || 3000)})
  .catch((err) => console.log(err));

// checa usuário atual
const checkUser = (req, res, next) => {
    if (req.session.usuario) {
    	res.locals.usuario = req.session.usuario;
    } else {
        res.locals.usuario = null;
    }
    next();
}

app.get('*', checkUser); // middleware aplicado a todas as rotas get
app.use(mainRoutes);
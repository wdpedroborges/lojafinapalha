const express = require('express');
const mainController = require('../controllers/mainController');
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
        destination: './public/produtos',
        filename: function (req, file, cb) {
            switch (file.mimetype) {
                case 'image/jpeg':
                    ext = '.jpeg';
                    break;
                case 'image/png':
                    ext = '.png';
                    break;
            }
            cb(null, Date.now() + file.originalname);
        }
    });

const upload = multer({storage: storage});

router.use(upload.single('imagem'));

const requireAuth = (req, res, next) => {
    if (!req.session.usuario) {
        res.redirect('/');
    } else {
    	next();
    }
}

const checkAuth = (req, res, next) => {
    if (req.session.usuario) {
        res.redirect('/');
    } else {
        next();
    }
}

router.get('/login-admin', checkAuth, mainController.login_admin_get);
router.post('/login-admin', mainController.login_admin_post);

router.get('/', mainController.home_get);

router.get('/produtos', requireAuth, mainController.produtos_get);
router.post('/produtos', mainController.produtos_post);
router.post('/finaliza-compra', mainController.finaliza_compra_post);
router.post('/confirma-compra', mainController.confirma_compra_post);

router.post('/excluir-venda', mainController.excluir_venda_post);
router.post('/confirmar-compra-whatsapp', mainController.confirmar_compra_whatsapp_post);
router.post('/informar-codigo-rastreio', mainController.informar_codigo_rastreio_post);
router.post('/confirmar-repasse', mainController.confirmar_repasse_post);

router.get('/dados-cep/:cep', mainController.dados_cep_get);

router.get('/contato', mainController.contato_get);
router.get('/sobre-nos', mainController.sobre_nos_get);
router.get('/seja-afiliado', mainController.seja_afiliado_get);
router.get('/rastrear-pedido', mainController.rastrear_pedido_get);

router.get('/logout-admin', mainController.logout_admin_get);

module.exports = router;
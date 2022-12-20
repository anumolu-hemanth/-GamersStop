const express = require('express');
const controller = require('../controllers/tradeController');
const {isLoggedIn, isAuthor} = require('../middlewares/auth'); 
const {validateId} = require('../middlewares/validator');
const {validateTrade, validateeditTrade, validateResult} = require('../middlewares/validator');

const router = express.Router();

//GET /trades: send all the trades to the user
router.get('/', controller.index);

//GET /trades/new: sends a html form to create new trade
router.get('/new', isLoggedIn, controller.new);

//POST /trades: create new trades
router.post('/', isLoggedIn, validateTrade, validateResult, controller.create);

//GET /trades/:id: send the details of the trade identified
router.get('/:id', validateId, controller.show);

//POST /trades/:id/watch: Add the itemt/game to user's watchlist
router.post('/:id/watch', validateId, isLoggedIn, controller.addtowatchlist);

//POST /trades/:id/unwatch: delete the itemt/game from user's watchlist
router.post('/:id/unwatch', validateId, isLoggedIn, controller.deletefromwatchlist);

//GET /trades/:id: send the html form for editing the details of the trade identified
router.get('/:id/edit', validateId, isLoggedIn, isAuthor, controller.edit);

//PUT /trades/:id: update the details of the trade identified
router.put('/:id', validateId, isLoggedIn, isAuthor, validateeditTrade, validateResult, controller.update);

//DELETE /trades/:id: delete the details of the trade identified
router.delete('/:id',  validateId, isLoggedIn, isAuthor, controller.delete);

module.exports = router;
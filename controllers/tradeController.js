const model = require('../models/trade');
const User = require('../models/user');
const Offer = require('../models/offer');

exports.index =  (req, res, next) => {
    model.find()
    .then(trades => {
        let categories = [...new Set(trades.map(trade => trade.category))];
        res.render('./trade/index', {trades, categories});
    })
    .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./trade/new');
};

exports.create = (req, res, next) => {
    let trade = new model(req.body);
    trade.author = req.session.user;
    if(!trade.imgurl)
        trade.imgurl = '/images/item-image.png';
    trade.offered = false;
    trade.initiated = false;
    trade.save()
    .then(trade => {
        req.flash('success', 'Trade has been created successfully');
        res.redirect('/trades');
    })
    .catch(err => {
        if(err.name == 'ValidationError'){
            req.flash('error', err.message);
            return res.redirect('/back');
        }
        next(err);
    });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    model.findById(id).populate('author', 'firstName lastName')
    .then(trade => {
        if(trade){
            User.findById(req.session.user)
            .then(user => {
                let watchlisted = false;
                if(user){
                    console.log(req.session.user+ " " +user);
                    if(user.watchlist.length > 0){
                        if(user.watchlist.indexOf(trade._id) !== -1)
                            watchlisted = true;
                    }
                }
                res.render('./trade/show', {trade, watchlisted}); 
            })
            .catch(err => next(err));
        }
        else{
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id).populate('author', 'author')
    .then(trade => {
        if(trade){
            res.render('./trade/edit', {trade}); 
        }
        else{
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.update = (req, res, next) => {
    let trade = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
    .then(trade => {
        if(trade){
            res.redirect('/trades/'+id); 
        }
        else{
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if(err.name === "ValidationError"){
            req.flash('error', err.message);
            return res.redirect('/back');
        }
        next(err);
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(trade => {
        if(trade && (trade.status == "Available")){
            res.redirect('/trades');
        }
        else if(trade && (trade.status != "Traded")){
            if(trade.offerto == id){
                console.log(trade.offerto," ",id);
                Offer.find({offer_to: id})
                .then(offer => {
                    console.log(offer);
                    model.findByIdAndUpdate(offer[0].item_to_trade, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                    .then(updt_trade => {
                        Offer.findOneAndDelete({offer_to: id}, {useFindAndModify: false})
                        .then(updt_offer => {
                            res.redirect('/trades');
                        })
                        .catch(err => next(err));
                    })
                    .catch(err => next(err));
                })
                .catch(err => next(err));
            }
            else if(trade.offerby == id){
                console.log(trade.offerby," ",id);
                Offer.find({item_to_trade: id})
                .then(offer => {
                    console.log(offer);
                    model.findByIdAndUpdate(offer[0].offer_to, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                    .then(trade => {
                        Offer.findOneAndDelete({item_to_trade: id}, {useFindAndModify: false})
                        .then(offer => {
                            res.redirect('/trades');
                        })
                        .catch(err => next(err));
                    })
                    .catch(err => next(err));
                })
                .catch(err => next(err));
            }
        }
        else if(trade && (trade.status == "Traded")){
            if(trade.offerby == id){
                model.findByIdAndUpdate(trade.offerto, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                .then(updt_trade => {
                    res.redirect('/trades');
                })
                .catch(err => next(err));
            }
            else if(trade.offerto == id){
                model.findByIdAndUpdate(trade.offerby, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                .then(trade => {
                    res.redirect('/trades');
                })
                .catch(err => next(err));
            }
        }
        else{
            res.redirect('/trades');
        }
    })
    .catch(err => next(err));
};

exports.addtowatchlist = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    User.findByIdAndUpdate(user, {$push: {watchlist: id}}, {useFindAndModify: false, runValidators: true})
    .then(user => {
        if(user){
            req.flash('success', 'Item added to watchlist successfully'); 
            res.redirect('../../users/profile');
        }
        else
            res.redirect('/users/login');
    })
    .catch(err => next(err));
};

exports.deletefromwatchlist = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    User.findByIdAndUpdate(user, {$pull: {watchlist: id}}, {useFindAndModify: false, runValidators: true})
    .then(user => {
        if(user)
            req.flash('success', 'Item removed from watchlist successfully'); 
            res.redirect('back');
    })
    .catch(err => next(err));
};
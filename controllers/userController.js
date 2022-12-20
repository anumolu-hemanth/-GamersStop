const model = require('../models/user');
const Trade = require('../models/trade');
const Offer = require('../models/offer');

exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new trade');
    let user = new model(req.body);//create a new trade document
    user.save()//insert the document to the database
    .then(user=> {
        req.flash('success', 'Registration succeeded!');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }
        if(err.code === 11000) {
            req.flash('error', 'Email address has already been used');  
            return res.redirect('back');
        }
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                } else {
                    req.flash('error', 'wrong password');      
                    res.redirect('/users/login');
                }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), Trade.find({author: id}), Offer.find({offer_initiated_by: id}), Offer.find()])
    .then(results => {
        const [user, trades, offers] = results;
        Trade.find({'_id':{$in:user.watchlist}})
        .then(watchlist => {
            res.render('./user/profile', {user, trades, watchlist, offers});
        })
        .catch(err => next(err));
    })
    .catch(err=>next(err));
};

exports.selectitem = (req, res, next) => {
    let id = req.params.id;
    Trade.find({author: req.session.user})
    .then(trades => {
        if(trades.length > 0)
            res.render('./user/trade', {trades, id});
        else{
            req.flash('error', 'You don\'t have any items to trade');      
            res.redirect('back');
        }
    })
    .catch(err => next(err));
};

exports.createoffer = (req, res, next) => {
    let id = req.params.id; //item id that you are interested in
    let user_item = req.body.item; //user's item to trade
    Promise.all([
        Trade.findByIdAndUpdate(id, {status: "Offer Pending", offerby: user_item, offerto: id, offered: true}, {useFindAndModify: false, runValidators: true}),
        Trade.findByIdAndUpdate(user_item, {status: "Offer Pending",  offerto: id, offerby: user_item, initiated: true}, {useFindAndModify: false, runValidators: true})])
    .then(results => {
        let [trade, user_trade] = results;
        console.log(trade, user_trade);
        let offer = new Offer();
        offer.offer_initiated_by = req.session.user;
        offer.title = trade.title;
        offer.category = trade.category;
        offer.status = trade.status;
        offer.item_to_trade = user_item;
        offer.offer_to = id;
        offer.save()
        .then(offer => {
            console.log("Offer:",offer);
            res.redirect('/users/profile');
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.canceloffer = (req, res, next) => {
    let id = req.session.user;
    let item = req.params.id;
    Offer.findOneAndDelete({offer_to: item}, {useFindAndModify: false})
    .then(offer => {
        console.log(offer);
        Trade.findByIdAndUpdate(item, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
        .then(trade => {
            Trade.findByIdAndUpdate(trade.offerby, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
            .then(trade => {
                console.log("trade: ", trade);
                res.redirect('/users/profile');
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.manageoffer = (req, res, next) => {
    let id = req.params.id;
    Trade.findById(id)
    .then(trade => {
        if(!trade.offered){
            Offer.find({item_to_trade: id})
            .then(offer => {
                if(offer.length > 0){
                    Promise.all([Trade.findById(offer[0].offer_to), Trade.findById(offer[0].item_to_trade)])
                    .then(results => {
                        let [trade, item] = results;
                        console.log(trade, item);
                        let initiated = item.initiated;
                        res.render('./user/manageoffer', {trade, item, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find an offer');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
        else{
            Offer.find({offer_to: id})
            .then(offer => {
                if(offer.length > 0){
                    Promise.all([Trade.findById(offer[0].offer_to), Trade.findById(offer[0].item_to_trade)])
                    .then(results => {
                        let [trade, item] = results;
                        console.log(trade, item);
                        let initiated = trade.initiated;
                        res.render('./user/manageoffer', {trade, item, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find an offer');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));

    
};

exports.acceptoffer = (req, res, next) => {
    let id = req.session.user;
    let item = req.params.id;
    Offer.find({offer_to: item, offer_initiated_by: id}, {useFindAndModify: false})
    .then(offer => {
        Trade.findByIdAndUpdate(item, {status: 'Traded', intitiated: false, offered: false}, {useFindAndModify: false, runValidators: true})
        .then(trade => {
            Trade.findByIdAndUpdate(trade.offerby, {status: 'Traded', initiated: false, offered: false}, {useFindAndModify: false, runValidators: true})
            .then(trade => {
                Offer.findOneAndDelete({offer_to: item}, {useFindAndModify: false})
                .then(offer => {
                    res.redirect('/users/profile');
                })
                .catch(err => next(err));
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };




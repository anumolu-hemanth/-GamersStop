//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const tradeRoutes = require('./routes/tradeRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

//create app
const app = express();

//configure app
let port = process.env.PORT || 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect tp database
mongoose.connect('mongodb://localhost:27017/trades',
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(() => {
    //start server
    app.listen(port, host, () => {
        console.log("server is running on port: ", port);
    });
})
.catch(err => console.log(err.message));

//mount middleware
//mount middlware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public')); //serving static files from public folder
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use('/', mainRoutes);

app.use('/trades', tradeRoutes);

app.use('/users', userRoutes);

app.use((req,res,next) => {
    let err= new Error('The server cannot locate the url: '+req.url);
    err.status=404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error', {error: err});
});

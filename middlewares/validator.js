const {body} = require('express-validator');
const {validationResult} = require('express-validator');

//check if the id is valid
exports.validateId = (req, res, next) => {
    let id = req.params.id;
    console.log(id);
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade id');
        err.status = 400;
        return next(err);
    } else {
        next();
    }
}

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be atleast 8 characters and atmost 64 characters').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be atleast 8 characters and atmost 64 characters').isLength({min: 8, max: 64})];

exports.validateTrade = [body('author', 'Author cannot be empty').notEmpty().trim().escape(),
body('title', 'Title cannot be empty').notEmpty().trim().escape(),
body('imgurl', 'Image url cannot be empty').notEmpty(),
body('category', 'Category cannot be empty').notEmpty().trim().escape(),
body('status', 'Status cannot be empty').notEmpty().trim().escape(),
body('content', 'Content cannot be empty and must be atleast 10 characters').isLength({min: 10}).trim().escape()];

exports.validateeditTrade = [body('title', 'Title cannot be empty').notEmpty().trim().escape(),
body('imgurl', 'Image url cannot be empty').notEmpty(),
body('category', 'Category cannot be empty').notEmpty().trim().escape(),
body('status', 'Status cannot be empty').notEmpty().trim().escape(),
body('content', 'Content cannot be empty and must be atleast 10 characters').isLength({min: 10}).trim().escape()];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    }
    else{
        return next();
    }
}
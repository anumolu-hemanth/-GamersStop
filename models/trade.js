const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    title: {type: String, required: [true, 'title is required']},
    category: {type: String, required: [true, 'category is required']},
    content: {type: String, required: [true, 'content is required'],
                minLength: [10, 'content should have atleast 10 characters']},
    status: {type: String, required: [true, 'status is required']},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    imgurl: {type: String, required: [true, 'imageurl is required']},
    offerby: {type: Schema.Types.ObjectId, ref: 'Trade'},
    offerto: {type: Schema.Types.ObjectId, ref: 'Trade'},
    offered: {type: Boolean},
    initiated: {type: Boolean}
},
{timestamps: true});

//collection name is trades in the database (always lowercase and plural of the model)
module.exports = mongoose.model('Trade', tradeSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    offer_initiated_by: {type: Schema.Types.ObjectId, ref: 'User'},
    item_to_trade: {type: Schema.Types.ObjectId, ref: 'Trade'},
    title: {type: String, required: [true, 'title is required']},
    category: {type: String, required: [true, 'category is required']},
    status: {type: String, required: [true, 'status is required']},
    offer_to: {type: Schema.Types.ObjectId, ref: 'Trade'}
}
);

module.exports = mongoose.model('Offer', offerSchema);
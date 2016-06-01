var mongoose = require('../lib/mongoose'),
	Schema = mongoose.Schema;

var schema = new Schema({
	body: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: new Date(),
		required: true
	}
});

module.exports = mongoose.model('Note', schema);
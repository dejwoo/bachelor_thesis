var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	created_at: {type: Date, default: Date.now}
});
var journalSchema = new mongoose.Schema({
	text: String,
	username: String,
	created_at: {type: Date, default: Date.now}
});
//declaring a model called User which has schema userSchema
mongoose.model("User", userSchema);
// console.log("User registered");
mongoose.model('Journal', journalSchema);
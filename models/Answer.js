var mongoose=require('mongoose');

var AnswerSchema=new mongoose.Schema({
	body:String,
	date:{type:Date,default:Date.now},
	postedby:String,
	question:{type:mongoose.Schema.Types.ObjectId,ref:'question'},
	comments:[{body:String,date:{type:Date,default:Date.now},
	postedby:String}]
});

mongoose.model('Answer',AnswerSchema);
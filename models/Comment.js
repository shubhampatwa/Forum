var mongoose=require('mongoose');

var CommentSchema=new mongoose.Schema({
	body:String,
	// author:String,
	// upvotes:{type:Number,upvotes:0},
//	comments:[{type:mongoose.Schema.Types.ObjectId,ref:'Comment'}]
	answer:{type:mongoose.Schema.Types.ObjectId,ref:'Answer'}
});

mongoose.model('Comment',CommentSchema);
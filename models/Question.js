var mongoose=require('mongoose');

var questionSchema=new mongoose.Schema({
	title:String,
	description:String,
	views:{type:Number,default:0},
	date:{type:Date,default:Date.now},
	postedby:String,
	answers:[{type:mongoose.Schema.Types.ObjectId,ref:'Answer'}],
	comments:[{body:String,date:{type:Date,default:Date.now},
	postedby:String}]
});
questionSchema.methods.view=function(cb){
this.views+=1;
this.save(cb);
};
mongoose.model('question',questionSchema);

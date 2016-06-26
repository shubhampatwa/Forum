var express = require('express');
var session = require('express-session');
var flash = require('express-flash');
var router = express.Router();
var mongoose=require('mongoose');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var question=mongoose.model('question');
var Answer=mongoose.model('Answer');
var Comment=mongoose.model('Comment');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user:req.user });
});
router.get('/diseases',function(req,res,next){
  res.render('diseases',{ user:req.user });
});

router.get('/medicines',function(req,res,next){
  res.render('medicines',{ user:req.user });
});

router.get('/news',function(req,res,next){
  res.render('news',{ user:req.user });
});






router.post('/addquestion',function(req,res,next){
	//res.render(,{body:body});
	var q=new question({title:req.body.title,description:req.body.description,postedby:req.user.username});
	q.save(function (err,body) {
		// body...
		if (err) {
			res.json(err);
			return next(err);
		}
		return res.redirect('/forum');
	});
});
 router.get('/forum',function(req,res,next){
 	question.find(function(err,docs){
 		if (err) {
 			return next(err);
 		}
 		return res.render('showquestion',{question:docs,user:req.user });
 	});
 });
router.param('post',function(req,res,next,id){
	var query=question.findById(id);
	query.exec(function(err,post){
		if(err)return next(err);
		if(!post) return next(new Error('cant found post'));
		req.post=post;
		return next();
	});
});
 router.get('/post/:post/:title',function(req,res,next){
 		req.post.view(function(err,post){
 			if (err) {return err;}
 		})
 		req.post.populate('answers',function(err,post){
 			if (err) {return err;}
 			// res.json(post);
 			// res.render('addanswer',{post:post});
 			// var ans;
 			// //console.log(post);
 			// for(var i=0;i<post.answers.length;i++)
 			// {
 			// 	post.answers[i].populate('comments',function(err,answer){
 			// 		if (err) {return err;}
 			// 		console.log(answer);
 			// 		ans=answer;
 			// 	})
 			// 	//console.log(post.answers[i]._id);
 			// }
 			console.log(post);
 			res.render('addanswer',{post:post,user:req.user });
 		})
 	 })
router.post('/post/:post/answer',function(req,res,next){
	//console.log(req.body.ans);
	var answer=new Answer({body:req.body.ans,postedby:req.user.username});
	answer.question=req.post;
  // answer.postedby=req.user.username;
	answer.save(function(err,answer){
		if (err) {return err;}
		req.post.answers.push(answer);
		req.post.save(function(err,post){
			if (err) {return err;}
			//console.log(post);
			//res.json(post);
		})
		//res.json(answer);
	})	
	var ur="/post/"+req.post._id+"/"+req.post.title;
	console.log(ur);
	return res.redirect(ur);
})

router.post('/post/:post/comment',function(req,res,next){
	req.post.comments.push({body:req.body.com,postedby:req.user.username});
	req.post.save(function(err,post){
		if (err) {return err;}
	})
		var ur="/post/"+req.post._id+"/"+req.post.title;
	console.log(ur);
	return res.redirect(ur);
})
router.param('answer',function(req,res,next,id){
	var query=Answer.findById(id);
	query.exec(function(err,answer){
		if(err)return next(err);
		if(!answer) return next(new Error('cant found answer'));
		req.answer=answer;
		return next();
	});
});



 router.post('/post/:post/answer/:answer/comment',function(req,res,next){
 	// var comment=new Comment({body:req.body.com});
 	// comment.answer=req.answer;
 	// comment.save(function(err,comment){
 	// 	if (err) {return err;}
 		req.answer.comments.push({body:req.body.com,postedby:req.user.username});
 		req.answer.save(function(err,comment){
 			if (err) {return err;}
 		})
 	// })
 	var ur="/post/"+req.post._id+"/"+req.post.title;
	console.log(ur);
	return res.redirect(ur);	
 })
//for logout

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user, error) {
    if (err) return done(err);
    if (!user){
    	//req.flash('error','sorry incorrect username ');
    	return done(null, false, { messages: 'Incorrect username.' });
    }
    user.comparePassword(password, function(err, isMatch, error) {
      if (isMatch) {
        return done(null, user);
      } else {
      	//req.flash('error','sorry incorrect password ');
        return done(null, false, { messages: 'Incorrect password.' });
      }
    });
  });

}));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var userSchema= new mongoose.Schema({
	 username:{type:String ,require:true,unique:true},
	 email:{type:String ,require:true,unique:true},
	 password:{type:String ,require:true},
	 resetPasswordToken: String,
  	 resetPasswordExpires: Date
});
userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
var User=mongoose.model('User',userSchema);
 
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err,user, info) {
    if (err) return next(err); 
    if (!user) {
    	req.flash('info','sorry information is not correct');	
      return res.redirect('/')
    }
    req.logIn(user, function(err, info) {
      if (err) return next(err);
      console.log(req.user);
      req.flash('info','Hey '+ user.username +' Logged In Successfully!!');
      return res.redirect('/');	
    });
  })(req, res, next);
});
router.post('/signup', function(req, res) {
  var user = new User({username: req.body.username,email: req.body.email,password: req.body.password
    });
  user.save(function(err) {
    req.logIn(user, function(err,success) {
      console.log(req.user);
      req.flash('success','Hello '+ user.username +' Welcome to CareForYou!!');
      return res.redirect('/');
    });
  });
});
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
module.exports = router;

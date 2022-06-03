var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, function () {
    console.log('서버 실행 중...');
});

var connection = mysql.createConnection({
    host: "database-1.c0qu7ertkcgw.us-west-1.rds.amazonaws.com",
    user: "admin",
    database: "dopt",
    password: "caudopt2022",
    port: 3000
});


app.post('/userJoin', (req,res)=> {
    console.log(req.body);
    var userEmail = req.body.userEmail;
    var userPw = req.body.userPw;
    var userNm = req.body.userNm;
    var userLoc = req.body.userLoc;
    var nicknm = req.body.nicknm;
    var sql = "INSERT INTO User_Signup (userEmail, userPw, userNm, userLoc, nicknm) VALUES (?,?,?,?,?);";
    var params = [userEmail, userPw,userNm,userLoc, nicknm];
    connection.query(sql, params, function (err, result){
	    var resultCode=404;
	    var message = '에러 발생';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='회원가입 성공';
	    }
	    res.json({
		    'code':resultCode,
		    'message':message
	});
    });
});


var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var { spawn } = require('child_process')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, function () {
    console.log('running server...');
});

var connection = mysql.createConnection({
 	host: "database-1.c0qu7ertkcgw.us-west-1.rds.amazonaws.com",
    user: "admin",
    database: "dopt",
    password: "caudopt2022",
    port: 3306
});

/////////////// Scheduler - Statistics(Start) ////////////////////

//https://mintaku.tistory.com/26
var nodeschedule = require('node-schedule');
const { acceptsLanguages } = require('express/lib/request');

// nodeschedule rule 지정. 
// '초 분 시 일 월 요일(0 과 7 은 일요일)'
// ex) '0 0 15 1 * *' <- 매월 1일 오후 3시 정각
// 매일 오전 9시 정각​
const rule = '0 0 9 * * *'; 

// https://curryyou.tistory.com/225
// nodeschedule.scheduleJob(rule, function(){
// 	// 수행할 작업
// 	const spawn = require('child_process2').spawn; 

// 	const result = spawn('python', ['statistics.py']); 

// 	result.stdout.on('data', function(data) { 
// 		console.log(data.toString());
// 	}); 

// 	result.stderr.on('data', function(data) { 
// 		console.log(data.toString());
// 	});

// });

/////////////// Scheduler - Statistics (Done) ////////////////////

//Done
// python child process 코드입니다.
// pythonOne.stdout.on에서는 python 코드에서 print 되는 코드를 data1에 저장하고
// python.on('close')에서는 data1에 저장된 결과를 send합니다.
app.get('/Match/get', (req, res)=>{ 
    let data1="";
	var name = req.query.name;
	var userEmail = req.query.userEmail;
	var breed = req.query.breed;
	var age = req.query.age;
	var sex = req.query.sex;
	var color = req.query.color;
	var type = req.query.type; 
	var userLoc = req.query.userLoc;
	const fs = require('fs');
	//https://stackoverflow.com/questions/42755142/pass-muliple-args-to-a-python-script-spawned-from-node-js
	const args = [name, userEmail, breed, age, sex, color, type, userLoc];
    //const pythonOne = spawn('python3',['-u','recommend.py', name, userEmail, breed, age, sex, color, type]);
    //https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
	//unshift() 메서드는 새로운 요소를 배열의 맨 앞쪽에 추가하고, 새로운 길이를 반환합니다.
	args.unshift('recommend.py')
	const pythonOne = spawn('python3', args)
	pythonOne.stdout.on('data',(data)=>{	  
      data1 += data.toString();
      console.log("data1",data1);
    });

    pythonOne.on('close', (code)=>{
      console.log('on process');
	  console.log("code",code);
      console.log("data1", data1);
      res.send(data1);


    });

    pythonOne.on('exit', function (code, signal) {
      console.log('child process exited with ' +
                  `code ${code} and signal ${signal}`);
    });

    pythonOne.stderr.on('data', (data) => {
      console.error(`child stderr:\n${data}`);
    });
});

//Done
//req에는 request의 내용이, res에는 result의 내용이 들어간다.
//https://velog.io/@shitaikoto/SQL-Nodejs-MySQL
app.post('/User_Signup/post', (req,res)=> {
    console.log(req.body);
	//req.의 body에는 안드로이드에서 보낸 데이터 객체가 있다.
    var userEmail= req.body.userEmail;
    var userPw = req.body.userPw;
    var userNm = req.body.userNm;
    var userLoc = req.body.userLoc;
    var nicknm = req.body.nicknm;
	//?는 placeholder로,
	//sql문에 ?로 설정한 위치에 params를 적용하여 
	//sql문을 실행할 수 있도록 한다.
	//또한 params를 2차원배열로 하면
	//여러개의 sql명령을 하는 것과 같다.
    var sql = "INSERT INTO User_Signup (userEmail, userPw, userNm, userLoc, nicknm) VALUES (?,?,?,?,?);";
    var params = [userEmail, userPw,userNm,userLoc, nicknm];
    connection.query(sql, params, function (err, result){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='POST User_Login success';
	    }
	    res.json({
		    'code':resultCode,
		    'message':message
	});
    });
});

//app testing Done
app.get('/User_Signup/get', (req,res)=> {
    console.log(req.body);
	var userEmail = req.query.userEmail;
	console.log(userEmail)
	//https://gist.github.com/livelikeabel/909d5dc35e96e3f0bed0cd28cddcdeaf
    //https://stackoverflow.com/questions/60562892/how-to-use-android-retrofit2-with-nodejs-server
	//https://developer88.tistory.com/376
	var sql = "SELECT * FROM User_Signup WHERE userEmail=\"" + userEmail + "\";";
    var params = [userEmail];
	console.log(sql);
	//rows는 반환된 릴레이션의 각 행의 집합
	//fields는 릴레이션의 attribute
	//사용하지 않으면 function인자에서 없애도 무관
    connection.query(sql, params, function (err, rows, fields){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET User_Signup success';
			//res.send(JSON.stringify(result))
			res.json({
				//rows는 배열이므로 인덱스로 접근,,
				//더 나은 방법이 있을지도?
				//userEmail은 primary key로 오직 하나의 행만을 반환
			 	'userEmail':rows[0].userEmail,
			 	'userPw':rows[0].userPw,
				'userNm':rows[0].userNm,
				'userLoc':rows[0].userLoc,
				'nicknm':rows[0].nicknm
			});
			//console.log(result);
			//console.log(res);
			// console.log(rows)
			// console.log(rows[0].userEmail)
	    }

    });
});

//Done
app.post('/User_Signup/update', (req,res)=> {
    console.log(req.body);
    var userEmail= req.body.userEmail;
    var userPw = req.body.userPw;
    var userNm = req.body.userNm;
    var userLoc = req.body.userLoc;
    var nicknm = req.body.nicknm;
	
	//sql문 예시
	//UPDATE User_Signup SET userLoc = 'test흑석', userNm = 'test흑석' WHERE userEmail='123@123';
	//var sql = "DELETE FROM After_Share WHERE userEmail=\"" + userEmail + "\" and desertionNo=\"" + desertinoNo + "\" and week=\"" + week + "\";";
    var sql = "UPDATE User_Signup SET userPw =\"" + userPw + "\", userNm=\"" + userNm + "\", userLoc=\"" + userLoc + "\", nicknm=\"" + nicknm + "\" WHERE userEmail=\"" + userEmail + "\";";
    //var params = [userEmail, userPw,userNm,userLoc, nicknm];
    connection.query(sql, function (err, result){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='UPDATE User_Login success';
	    }
	    res.json({
		    'code':resultCode,
		    'message':message
	});
    });
});

//done
app.post('/After_Share/post', (req,res)=>{
	console.log(req.body);
	var userEmail = req.body.userEmail;
	var careNm = req.body.careNm;
	var desertionNo = req.body.desertionNo;
	var week = req.body.week;
	var image = req.body.image;
	var script = req.body.script;
	var sql = "INSERT INTO After_Share (userEmail, careNm, desertionNo, week, image, script) VALUES (?,?,?,?,?,?);";
	var params = [userEmail, careNm, desertionNo, week, image, script];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='POST After_Share success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//done
app.get('/After_Share/get', (req,res)=> {
    console.log(req.body);
	var userEmail = req.query.userEmail;
	console.log(userEmail)
	//TODO: 날짜별 데이터 정렬 필요
	var sql = "SELECT * FROM After_Share WHERE userEmail=\"" + userEmail + "\";";
    var params = [userEmail];
	console.log(sql);
    connection.query(sql, params, function (err, rows, fields){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET After_Share success';
			//res.send(JSON.stringify(result))
			res.json({
			 	'After_Share' : rows
			});
			//console.log(result);
			//console.log(res);
			// console.log(rows)
			// console.log(rows[0].userEmail)
	    }

    });
});

//근황공유 삭제
//Done
app.delete('/After_Share/delete', (req,res)=>{
	console.log(req.body);
	var userEmail = req.body.userEmail;
	var desertionNo = req.body.desertionNo;
	var week = req.body.week;

	//sql문 예시
	//DELETE FROM After_Share WHERE userEmail='123@123' and animalId ='1' and week = 1;
	//var sql = "DELETE FROM Bookmark WHERE userEmail=\"" + userEmail + "\" and desertionNo=\"" + desertionNo + "\";";
	var sql = "DELETE FROM After_Share WHERE userEmail=\"" + userEmail + "\" and desertionNo=\"" + desertionNo + "\" and week=\"" + week + "\";";
	var params = [userEmail, desertionNo, week];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='DELETE After_Share success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
//week까지는 못 바꿈

app.post('/After_Share/update', (req,res)=>{
	console.log(req.body);
	var userEmail = req.body.userEmail;
	var careNm = req.body.careNm;
	var desertionNo = req.body.animalId;
	var week = req.body.week;
	var image = req.body.image;
	var script = req.body.script;

	// UPDATE After_Share 
	// SET image = "newImage.jpg", script = "푸앙푸앙" 
	// WHERE userEmail = "123@123" and desertionNo = "desertionNo1" and week = 1; 

    var sql = "UPDATE After_Share SET image=\"" + image + "\", script=\"" + script + "\" WHERE userEmail=\"" + userEmail + "\"and desertionNo=\"" + desertionNo + "\" and week="+week+";";
	connection.query(sql, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='UPDATE After_Share success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
app.post('/Bookmark/post', (req,res)=>{
	console.log(req.body);
	var userEmail = req.body.userEmail;
	var age = req.body.age;
	var careAddr = req.body.careAddr;
	var careNm = req.body.careNm;
	var careTel = req.body.careTel;
	var chargeNm = req.body.chargeNm;
	var colorCd = req.body.colorCd;
	var desertionNo = req.body.desertionNo;
	var filename = req.body.filename;
	var happenDt = req.body.happenDt;
	var happenPlace = req.body.happenPlace;
	var kindCd = req.body.kindCd;
	var neuterYn = req.body.neuterYn;
	var noticeEdt = req.body.noticeEdt;
	var noticeNo = req.body.noticeNo;
	var noticeSdt = req.body.noticeSdt;
	var officetel = req.body.officetel;
	var orgNm = req.body.orgNm;
	var popfile = req.body.popfile;
	var processState = req.body.processState;
	var sexCd = req.body.sexCd;
	var specialMark = req.body.specialMark;
	var weight = req.body.weight;
	var isConsidered = req.body.isConsidered;
	//총 24개
	var sql = "INSERT INTO Bookmark (userEmail, age, careAddr, careNm, careTel, chargeNm, colorCd, desertionNo, filename, happenDt, happenPlace, kindCd, neuterYn, noticeEdt, noticeNo, noticeSdt, officetel, orgNm, popfile, processState, sexCd, specialMark, weight, isConsidered) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
	var params = [userEmail, age, careAddr, careNm, careTel, chargeNm, colorCd, desertionNo, filename, happenDt, happenPlace, kindCd, neuterYn, noticeEdt, noticeNo, noticeSdt, officetel, orgNm, popfile, processState, sexCd, specialMark, weight, isConsidered];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='POST Bookmark success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
app.get('/Bookmark/get', (req,res)=> {
	console.log(req.body);
	var userEmail = req.query.userEmail;
	console.log(userEmail)
	//TODO: (trivial) Bookmark한 순서대로 나와야함..?!
	//예를들어, 시간 순서상 1, 2, 3 을 Bookmark했다면
	//화면상 3, 2, 1 떠야한다던지...
	var sql = "SELECT * FROM Bookmark WHERE userEmail=\"" + userEmail + "\";";
    var params = [userEmail];
	console.log(sql);
    connection.query(sql, params, function (err, rows, fields){
		var resultCode=404;
	    var message = 'error has occured';
		
	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET Bookmark success';
			//res.send(JSON.stringify(result))
			res.json({
				//Bookmark의 리스트를 받을 것이므로
				//모든 객체를 넘겨준다.
				'Bookmark' : rows
			});
			//console.log(result);
			//console.log(res);
			// console.log(rows)
			// console.log(rows[0].userEmail)
	    }
		
    });
});

//Done
//http://egloos.zum.com/Cliver/v/2002622
// 북마크 삭제
app.delete('/Bookmark/delete', (req,res)=>{

	console.log(req.body);
	var userEmail = req.body.userEmail;
	var desertionNo = req.body.desertionNo;

	//sql문 예시
	//DELETE FROM Bookmark WHERE userEmail='123@123' and desertionNo ='desertionNo1';
	//https://stackoverflow.com/questions/65445989/error-in-delete-db-record-using-node-js-and-mysql
	var sql = "DELETE FROM Bookmark WHERE userEmail=\"" + userEmail + "\" and desertionNo=\"" + desertionNo + "\";";
	var params = [userEmail, desertionNo];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='DELETE Bookmark success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});

});


//Done
app.post('/Checklist/post', (req,res)=>{
	console.log(req.body);
	var userEmail = req.body.userEmail;
	var q1 = req.body.q1;
	var q2 = req.body.q2;
	var q3 = req.body.q3;
	var q4 = req.body.q4;
	var q5 = req.body.q5;
	var q6 = req.body.q6;
	var q7 = req.body.q7;
	var q8 = req.body.q8;
	var q9 = req.body.q9;
	var q10 = req.body.q10;
	var q11 = req.body.q11;
	var q12 = req.body.q12;
	var sql = "INSERT INTO Checklist (userEmail, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);";
	var params = [userEmail, q1, q2, q3, q4, q5, q6, q7,q8, q9, q10, q11, q12];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='POST Checklist success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
app.get('/Checklist/get', (req,res)=> {
    console.log(req.body);
	var userEmail = req.query.userEmail;
	console.log(userEmail)
	
	var sql = "SELECT * FROM Checklist WHERE userEmail=\"" + userEmail + "\";";
    var params = [userEmail];
	console.log(sql);
    connection.query(sql, params, function (err, rows, fields){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET Checklist success';
			//res.send(JSON.stringify(result))
			res.json({
			 	'userEmail' : rows[0].userEmail,
				'q1' : rows[0].q1,
				'q2' : rows[0].q2,
				'q3' : rows[0].q3,
				'q4' : rows[0].q4,
				'q5' : rows[0].q5,
				'q6' : rows[0].q6,
				'q7' : rows[0].q7,
				'q8' : rows[0].q8,
				'q9' : rows[0].q9,
				'q10' : rows[0].q10,
				'q11' : rows[0].q11,
				'q12' : rows[0].q12
			});
			//console.log(result);
			//console.log(res);
			// console.log(rows)
			// console.log(rows[0].userEmail)
	    }

    });
});

//Done
app.post('/Preference/post', (req,res)=>{
	console.log(req.body);
	var name = req.body.name;
	var userEmail = req.body.userEmail;
	var breed = req.body.breed;
	var age = req.body.age;
	var sex = req.body.sex;
	var color = req.body.color;
	var type = req.body.type;
	var sql = "INSERT INTO Preference (name, userEmail, breed, age, sex, color, type) VALUES (?,?,?,?,?,?,?);";
	var params = [name, userEmail, breed, age, sex, color, type];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='POST Preference success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
app.get('/Preference/get', (req,res)=> {
    console.log(req.body);
	var userEmail = req.query.userEmail;
	console.log(userEmail)
	
	var sql = "SELECT * FROM Preference WHERE userEmail=\"" + userEmail + "\";";
    var params = [userEmail];
	console.log(sql);
    connection.query(sql, params, function (err, rows, fields){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET Preference success';
			//res.send(JSON.stringify(result))
			res.json({
				//Preference의 리스트를 받을 것이므로
				//모든 객체를 넘겨준다.
			 	'Preference' : rows
			});
			//console.log(result);
			//console.log(res);
			// console.log(rows)
			// console.log(rows[0].userEmail)
	    }

    });
});

//Done
app.delete('/Preference/delete', (req,res)=>{
	console.log(req.body);
	var name = req.body.name;
	var userEmail = req.body.userEmail;

	var sql = "DELETE FROM Preference WHERE name=\"" + name + "\" and userEmail=\"" + userEmail + "\";";
	var params = [name, userEmail];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='DELETE Preference success';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
//name까지는 못 바꾼다..
//수정하면 가능
//현재는 선호를 지우고 새로 만들어야 이름 바꿀 수 있음.
app.post('/Preference/update', (req,res)=> {
    console.log(req.body);
    var name = req.body.name;
	var userEmail = req.body.userEmail;
	var breed = req.body.breed;
	var age = req.body.age; 
	var sex = req.body.sex;
	var color = req.body.color;
	var type = req.body.type;
	var sql = "UPDATE Preference SET breed=\"" + breed + "\", age=\"" + age + "\", sex=\"" + sex + "\", color=\"" + color + "\", type=\"" + type + "\" WHERE userEmail=\"" + userEmail + "\" and name =\"" + name + "\";";
    //var params = [userEmail, userPw,userNm,userLoc, nicknm];
    connection.query(sql, function (err, result){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='UPDATE Preference success';
	    }
	    res.json({
		    'code':resultCode,
		    'message':message
	});
    });
});

//Done
app.post('/Shelter_Signup/post', (req,res)=>{
	console.log(req.body);
	var shelterEmail = req.body.shelterEmail;
	var shelterPw = req.body.shelterPw;
	var shelterNm = req.body.shelterNm;
	var phone = req.body.phone;
	var shelterLoc = req.body.shelterLoc;
	var busRegImg = req.body.busRegImg;
	var shelterImg = req.body.shelterImg;
	var sql = "INSERT INTO Shelter_Signup (shelterEmail, shelterPw, shelterNm, phone, shelterLoc, busRegImg, shelterImg) VALUES (?,?,?,?,?,?,?);";
	var params = [shelterEmail, shelterPw, shelterNm, phone, shelterLoc, busRegImg, shelterImg];
	connection.query(sql, params, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='POST Shelter_Signup Success!';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
app.get('/Shelter_Signup/get', (req,res)=> {
    console.log(req.body);
	var shelterEmail = req.query.shelterEmail;
	console.log(shelterEmail)
	
	var sql = "SELECT * FROM Shelter_Signup WHERE shelterEmail=\"" + shelterEmail + "\";";
    var params = [shelterEmail];
	console.log(sql);
    connection.query(sql, params, function (err, rows, fields){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET Shelter_Signup success';
			//res.send(JSON.stringify(result))
			res.json({
			 	'shelterEmail' : rows[0].shelterEmail,
				'shelterPw' : rows[0].shelterPw,
				'shelterNm' : rows[0].shelterNm,
				'phone' : rows[0].phone,
				'shelterLoc' : rows[0].shelterLoc,
				'busRegImg' : rows[0].busRegImg,
				'shelterImg' : rows[0].shelterImg
			});
	    }
    });
});


//Done
app.post('/Shelter_Signup/update', (req,res)=>{
	console.log(req.body);
	var shelterEmail = req.body.shelterEmail;
	var shelterPw = req.body.shelterPw;
	var shelterNm = req.body.shelterNm;
	var phone = req.body.phone;
	var shelterLoc = req.body.shelterLoc;
	var busRegImg = req.body.busRegImg;
	var shelterImg = req.body.shelterImg;
	var sql = "UPDATE Shelter_Signup SET shelterPw =\"" + shelterPw + "\", shelterNm=\"" + shelterNm + "\", phone=\"" + phone + "\", shelterLoc=\"" + shelterLoc + "\", busRegImg=\"" + busRegImg + "\", shelterImg=\"" + shelterImg + "\" WHERE shelterEmail=\"" + shelterEmail + "\";";
	connection.query(sql, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='UPDATE Shelter_Signup Success!';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
//보호소 Bookmark update
app.post('/Shelter/updateBookmark', (req,res)=>{
	console.log(req.body);
	var careNm = req.body.careNm;
	var desertionNo = req.body.desertionNo;
	var isConsidered = req.body.isConsidered; //INT
	//UPDATE Bookmark SET isConsidered = 1 WHERE desertionNo = 'desertionNo2' and careNm = 'careNm1';
	var sql = "UPDATE Bookmark SET isConsidered =" + isConsidered + " WHERE desertionNo=\"" + desertionNo + "\" and careNm=\"" + careNm + "\";";
	connection.query(sql, function (err, result){
		var resultCode = 404;
		var message = 'error has occured';

		if(err){
			console.log(err);
		}else{
			resultCode=200;
			message='UPDATE Bookmark from Shelter Success!';
		}
		res.json({
			'code':resultCode,
			'message':message
		});
	});
});

//Done
//보호소 사용자 북마크 GET
app.get('/Shelter/getBookmark', (req,res)=> {
    console.log(req.body);
	var shelterNm = req.query.shelterNm;
	var sql = "SELECT * FROM Bookmark WHERE careNm=\"" + shelterNm + "\";";
	console.log(sql)
    connection.query(sql, function (err, rows, fields){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET Bookmark from shelter success';
	    }
		res.json({
			'Bookmark' : rows
		});
    });
});

//Done
//보호소 사용자 After_Share GET
app.get('/Shelter/getAfter_Share', (req,res)=> {
    console.log(req.body);
	var shelterNm = req.query.shelterNm;
	var sql = "SELECT * FROM After_Share WHERE careNm=\"" + shelterNm + "\";";
    connection.query(sql, function (err, rows, fields){
	    var resultCode=404;
	    var message = 'error has occured';

	    if (err){
		    console.log(err);
	    } else{
		    resultCode=200;
		    message='GET After_Share from shelter success';
			res.json({
				'After_Share' : rows
			});
	    }
    });
});



//Done
app.get('/statistics/30days/get', (req,res)=> {
	//https://daehopark.tistory.com/entry/NodeJS-JSON-%ED%8C%8C%EC%9D%BC-%EC%9D%BD%EA%B8%B0
	const fs = require('fs');

	fs.readFile('./statistics.json', 'utf8', (error, jsonFile) => {
		if (error) return console.log(error);
		console.log(jsonFile);

		const jsonData = JSON.parse(jsonFile);
		console.log(jsonFile);

		const schema = jsonData.schema;
		const data = jsonData.data;

		data.forEach(data => {
			console.log(data);
		});

		res.json({
			'data' : data,
			'schema' : schema
		});

	});

});

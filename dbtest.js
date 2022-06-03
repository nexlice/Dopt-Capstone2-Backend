var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, 'localhost', function () {
    console.log('서버 실행 중...');
});

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "database-1.c0qu7ertkcgw.us-west-1.rds.amazonaws.com",
    user: "admin",
    database: "dopt",
    password: "caudopt2022",
    port: 3306
});

connection.connect(); // DB 접속

var testQuery = "INSERT INTO User_Signup (userEmail,userPw, userNm, userLoc, nicknm) VALUES ('test@naver.com','mypw', 'myNm', 'myLoc', 'mynick');";
 
connection.query(testQuery, function (err, results, fields) { // testQuery 실행
    if (err) {
        console.log(err);
    }
    console.log(results);
});
 
testQuery = "SELECT * FROM User_Signup";
 
connection.query(testQuery, function (err, results, fields) { // testQuery 실행
    if (err) {
        console.log(err);
    }
    console.log(results);
});
 
 
connection.end(); // DB 접속 jk종료

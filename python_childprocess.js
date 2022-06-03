// 참고 : https://www.youtube.com/watch?v=oU78UmZpfCU&ab_channel=CodeSolution

const express = require('express')
const { spawn } = require('child_process')
const app = express();

app.get('/', (req, res)=>{
    let data1="";
    const pythonOne = spawn('python3',['-u','recommend.py']);
    pythonOne.stdout.on('data',(data)=>{
      data1 += data.toString();
      console.log("data1",data1);
    })

    pythonOne.on('close', (code)=>{
      console.log("code",code);
      console.log("data1", data1);
      res.send(data1);
    })

    pythonOne.on('exit', function (code, signal) {
      console.log('child process exited with ' +
                  `code ${code} and signal ${signal}`);
    });

    pythonOne.stderr.on('data', (data) => {
      console.error(`child stderr:\n${data}`);
    });
})

app.listen(8080, () => {
    console.log('listening on *:8080');
});
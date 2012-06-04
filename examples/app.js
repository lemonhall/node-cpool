// app.js
var cpool  = require('cpool');

// create an empty child process pool   
var p = cpool.createPool();

// create 4 child processes in the pool
// child processes execute the code in ./echo.js 
// maximum 10 messages in pending queue
p.init(4,'./echo.js',10);

// receive responses from the child process pool
p.on('message',function(msg) {
  console.log('msg',msg);
});

// send a message to the child process pool
p.send('hello world');

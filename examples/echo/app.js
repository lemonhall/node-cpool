// app.js
var cpool  = require('cpool');

// create an empty child process pool   
var p = cpool.createPool(4,10);

// create 4 child processes in the pool
// child processes execute the code in ./echo.js 
// maximum 10 messages in pending queue
p.fork('./echo.js');

// receive responses from the child process pool
p.on('message',function(msg) {
  console.log('msg',msg);
});

// send a message to the child process pool
p.send('hello world');

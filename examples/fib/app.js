var util = require('util')
   ,cp  = require('./cp_pool.js');
   
var p = cp.createPool();

p.init(4,'./fib.js',10);


p.on('message',function(msg) {
  console.log('msg',msg);
  console.log('app',p.getReadyQueueLength(),p.getMessageQueueLength());
});

setInterval(function() {
      console.log(p.send(35),35);
      console.log(p.send(36),36);
      console.log(p.send(37),37);
      console.log(p.send(38),38);
      console.log(p.send(40),40);
    },5000);


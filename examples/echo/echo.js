// process.argv has any arguments that are used for initialization
// when the child script is loaded
// console.log(process.argv);

process.on('message',function(msg) {
  // echo the input message
  process.send(msg);
});


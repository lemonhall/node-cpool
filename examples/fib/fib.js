// process.argv has any arguments that are used for initialization
// console.log(process.argv);

var fib = function(m) {
  if ((m === 0)||(m === 1)) {
    return m;
  }
  return fib(m-1) + fib(m-2);
}

process.on('message',function(msg) {
  var r;

  // do some processing
  r = fib(msg);
  
  // return the result
  process.send(r);
});


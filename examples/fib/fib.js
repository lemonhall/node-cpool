function fib(m) {
  if ((m === 0)||(m === 1)) {
    return m;
  }
  else {
    return fib(m-1) + fib(m-2);
  }
}

process.on('message',function(msg) {
  var r;
  
  // compute fibonacci number
  r = fib(msg);
  
  // return it to caller
  process.send(r);
});


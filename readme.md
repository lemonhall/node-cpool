cpool
==========

A module that provides pools of child processes for executing long running synchronous tasks, such as
long computations.

The API is similar to the child_process.fork API except that it is backed by a pool of child
processes rather than a single one. 


Features
========

* runs under node.js
* The client and the child are coded the same as if it was regular child_process.fork.
 
API
===

the cpool module object
-----------------------
var cpool = require('cpool');


###cpool Module Functions

    function cpool.createPool()
        returns an empty child process pool object. 
        the empty child process object is not initialized at this point
        the child object is an event emitter.
        var cp = cpool.createPool();
        see example/fib/app.js
        
    function cp.init(childCount,modulePath,maxPendQueue,[optional arguments]) 
        this function initializes the object created by cpool.createPool
        childCount   : required : number of child processes to be created for the pool
        modulePath   : required : path to javascript source module (see child_process.fork)
        maxPendQueue : required : max size of pending message queue (see below)
        [optional arguments] : initial arguments passed to each child process when created. 
        these arguments show up in the child in process.argv
        see example/fib/app.js
        the function will throw an exception if any of the first 3 arguments are 
        invalid or not specified.
        
    function cp.send(msg)
        returns true if the message is sent, false if the message would make the 
        size of the pending message
        same as child_process.send except does not support a serverHandle second argument
        
    function cp.on('message',function(msg) {...})
        executed when one of the child processes sends a response event using process.send(msg)
        same as child_process.on except does not support a serverHandle second 
        argument to the event handler function

    function cp.getReadyQueueLength()
        returns the number of child processes that are idle and waiting to process a 
        message from the cp.send function
        
    function cp.getPendQueueLength()
        returns the number of pending messages waiting to be given to a child process. 
        messages go into the pend queue
        when all child processes are busy servicing other messages.
        
### Usage
#### client application 
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


#### child process
    // echo.js
    
    // process.argv has any arguments that are used for initialization
    // when the child is loaded
    console.log(process.argv);

    process.on('message',function(msg) {
      // echo the input message
      process.send(msg);
    });


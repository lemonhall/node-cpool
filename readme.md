cpool
==========

A module that provides pools of child processes for executing long running synchronous tasks, such as
long computations.

The node.js core API provides a module named 'child_process'.  This module contains several functions
that spawn external programs that run as operating system child processes to the calling node.js
function. One of these functions is child_process.fork(), which spawns a new instance of node.js
and executes a javascript program in a specified filename. The function returns a child
process object that has a bidirectional communications channel to the new child process. The 
communications channels supports event-driven sending and receiving of javascript objects between the
child and main processes. [node child_process.fork](http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options).

These child processes allow execution of a long running javascript function that doesn't not block the 
main node.js program, and provides an event interface to respond to messages from the child process.

Use of the child_process.fork is one way to execute long running computations or other synchronous
activities. However, the documentation warns that the spawn time is on the order of 30 msec with a memory
footprint of 10MB. So certainly you would not want to fork a child every time you wanted to execute a computation.
Because the child process is a node instance, it will wait for events so it is better to fork the child
once then send it messages to execute computations.

However, if you system has many clients and only one child process, you could end serializing all the clients
waiting on the child process to complete its queue of messages. So typically you would fork multiple children
and farm out the messages to the pool. 

The cpool module does this for you. It presents an API that is similar to the child_process.fork API with the difference
that it is backed by a pool of forked node processes. Cpool manages the processes and doles out messages in 
an efficient manner. It keeps track of which children are busy and which are ready to run, and activates
the ready ones when new messages arrive to be sent to the children.  If the main node process sends
more messages than there are ready children, they are queued in the 'pend queue' and are serviced
in FIFO order as busy child processes finish their previous operation and become ready.

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

    function cpool.createPool(childCount,maxPendQueue)
        childCount   : required : number of child processes to be created for the pool
        maxPendQueue : required : max size of pending message queue (see below)
        returns an empty child process pool object. 
        the empty child process object is not initialized at this point
        the child object is an event emitter.
        var cp = cpool.createPool();
        see example/fib/app.js
        
    function cp.fork(modulePath,[optional arguments],[options]) 
        this function initializes the object created by cpool.createPool, forking
        the requested number of children and creating the message queue of the 
        requested size
        modulePath   : required : path to javascript source module (see child_process.fork)
        [optional arguments] : initial arguments passed to each child process when created in process.argv 
        [options]      : Object
            cwd          String Current working directory of the child process
            customFds    Array Deprecated File descriptors for the child to use for stdio. (not supported)
            env          Object Environment key-value pairs
            setsid       Boolean
            encoding     String (Default: 'utf8')
            timeout      Number (Default: 0)
        Return: Cpool object
        
        var cp = cpool.init(5,10,'./file.js',args,options);

        
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

    // create 4 child processes in the pool
    // maximum 10 messages in pending queue
    var p = cpool.createPool(4,10);

    // child processes execute the code in ./echo.js 
    p.fork('./echo.js');

    // receive responses from the child process pool
    p.on('message',function(msg) {
      console.log('msg',msg);
    });

    // send a message to the child process pool
    p.send('hello world');


#### child process
    // echo.js
    
    // process.argv contains the [optional arguments] and 
    // can be used for initialization when the child is 
    // loaded
    console.log(process.argv);

    process.on('message',function(msg) {
      // echo the input message
      process.send(msg);
    });


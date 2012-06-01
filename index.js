var util = require('util')
   ,cp   = require('child_process')
   ,events = require('events');
   
var cpool = {
  
};

var CProc = function() {
  if (!(this instanceof CProc)) {
    return new CProc();
  }

  // inherit from EventEmitter
  events.EventEmitter.call(this);
    
  this.busy = false;
  this.child = null;
  
  this.fork = function(modulePath,args) {
    var self = this;
    // spawn the child
    this.child = cp.fork(modulePath,args);

    this.child.on('message',function(msg) {
      // when the process sends, alert the pool handler
      // with the message and the reference to this child
      // so it can be added back to the ready list
      self.emit('message',{message:msg,child:self});
      self.busy = false;
    });
    
    return this;
  }
  
  this.send = function(msg) {
    this.child.send(msg);
    this.busy = true;
  }
  
}
util.inherits(CProc,events.EventEmitter);

var CPool = function() {
  var i;
  var p;
  var m_ready_queue   = [];
  var m_msg_queue     = [];
  var m_max_msgq      = 0;
  var m_modulePath    = '';
  var m_moduleArgs    = undefined;
  var m_count         = 0;
  
  if (!(this instanceof CPool)) {
    return new CPool();
  }
  
  // inherit event emitter
  events.EventEmitter.call(this);
  
  this.getReadyQueueLength = function() {
    return m_ready_queue.length;
  }
  
  this.getMessageQueueLength = function() {
    return m_msg_queue.length;
  }
  
  // client send function
  this.send = function(msg) {
    var p;
    // if any of the children are ready to run
    if (m_ready_queue.length > 0) {
      // dispatch the message
      p = m_ready_queue.shift();
      p.send(msg);
    }
    else if (m_msg_queue.length < m_max_msgq) {
      // no ready processes
      m_msg_queue.push(msg);
    }
    else {
      // no room in message buffer queue
      return false;
    }
    // succeeded
    return true;
  };
  
  this.init = function(childCount,modulePath,maxMessageQueue) {
    var self = this;
    var args;
    var p;
    
    if ((childCount === undefined)||(childCount <= 0)) {
      throw new Error('childCount > 0 is required');
    }
    
    if (modulePath === undefined) {
      throw new Error('modulePath is required');
    }
    
    if (maxMessageQueue === undefined) {
      throw new Error('maxMessageQueue is required')
    }
    
    // get remaining arguments if any
    args = Array.prototype.slice.call(arguments,2);

    // record input parameters
    m_max_msgq   = maxMessageQueue;
    m_modulePath = modulePath;
    m_count      = childCount;
    m_args       = args;

    // spawn the child processes
    for(i=0;i<m_count;++i) {
      // create the proxy child
      p = new CProc();
      
      // fork the child process
      p.fork(modulePath,args);
      
      // add to list of runnable children
      m_ready_queue.push(p);
      
      // receive return messages from child process
      p.on('message',function(msg) {
        var m;
        // forward the message piece to the client
        self.emit('message',msg.message);
        
        // if there are any queued client messages, get next one and send it
        // else add this child back to the ready list
        if (m_msg_queue.length > 0) {
          m = m_msg_queue.shift();
          msg.child.send(m);  
        }
        else {
          m_ready_queue.push(msg.child);
        }
      });
    }
  }
}
util.inherits(CPool,events.EventEmitter);

cpool.createPool = function() {
  var cp = new CPool();
  
  return cp;
}

module.exports = cpool;

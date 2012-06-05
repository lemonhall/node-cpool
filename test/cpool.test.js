var util   = require('util');
var cpool  = require('../lib/cpool.js');
var assert = require('assert');
var assert = require('chai').assert;

suite('cpool',function() {
    setup(function() {
        
    });
    
    test("create cpool",function() {
      var p = cpool.createPool(1,1);
      assert.ok(p);
    });
    
    test("create pool required arguments",function() {
      assert.throws(function() {
          cpool.createPool();
        },"requires childCount");
      assert.throws(function() {
          cpool.createPool(1);
        },"requires maxPendQueue");
      });
    
    test("initialize pool and test queries",function() {
      var p = cpool.createPool(1,1);
      var status;
      var n;
      assert.ok(p);
      status = p.fork('../examples/echo/echo.js');
      assert.ok(status);
      n = p.getReadyQueueLength();
      assert.equal(n,1);
      n = p.getPendQueueLength();
      assert.equal(n,0);
      
      // terminate the pool
      p.on('exit',function() {
        console.log('exit');
      });
      p.kill();
    });
    
    test("initialize pool and send a message",function(done) {
      var status;
      
      var p = cpool.createPool(1,1);
      assert.ok(p);
      
      status = p.fork('../examples/echo/echo.js');
      assert.ok(status);
      
      p.on('message',function(msg) {
        assert.equal(msg,1);
        p.kill();
      });
      
      p.on('exit',function() {
        console.log('exit');
        done();
      });
      
      p.send(1);
    });
    
    test("initialize pool and send messages, test pendq",function(done) {
      var status;
      var m = 1;
      var n = 10;
      var q = 10;
      var i;
      
      var p = cpool.createPool(m,q);
      assert.ok(p);
      
      status = p.fork('../examples/echo/echo.js');
      assert.ok(status);
      
      p.on('message',function(msg) {
        assert.isNumber(msg,'is number');
        n--;
        if (n === 0) {
          p.kill();
        }
      });
      
      p.on('exit',function() {
        console.log('exit');
        done();
      });
      
      for(i=0;i<n;i++) {
        p.send(i);
      }
    });    
    
    test("initialize pool and send messages, test readyq",function(done) {
      var status;
      var m = 10;
      var n = 10;
      var q = 1;
      var i;
      
      var p = cpool.createPool(m,q);
      assert.ok(p);
      
      status = p.fork('../examples/echo/echo.js');
      assert.ok(status);
      
      p.on('message',function(msg) {
        assert.isNumber(msg,'is number');
        n--;
        if (n === 0) {
          p.kill(); 
        }
      });
      
      p.on('exit',function() {
        console.log('exit');
        done();
      });
      
      for(i=0;i<n;i++) {
        p.send(i);
      }
    });    
   
    test("initialize pool and send messages, test readyq and pendq",function(done) {
      var status;
      var n = 20;
      var m = 5;
      var q = 20;
      var i;
      
      var p = cpool.createPool(m,q);
      assert.ok(p);
      
      // limited number of children, large pend q
      status = p.fork('../examples/echo/echo.js');
      assert.ok(status);
      
      p.on('message',function(msg) {
        assert.isNumber(msg,'is number');
        n--;
        if (n === 0) {
          p.kill();
        }
      });
      
      p.on('exit',function() {
        console.log('exit');
        done();
      });
      
      // send messages
      for(i=0;i<n;i++) {
        p.send(i);
      }
    });    
    
});

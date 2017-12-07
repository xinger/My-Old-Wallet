// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// require('./app/main.js');


window.addEventListener('storage', function(e) {
    if (localStorage.files_count) {
        console.log('-----', localStorage.files_count);
    }
});


var f = function functionName() {
    console.count();
    requestAnimationFrame(f);
};

// f();



const drivelist = require('drivelist');

drivelist.list((error, drives) => {
  if (error) {
    throw error;
  }

  console.log(drives);
});

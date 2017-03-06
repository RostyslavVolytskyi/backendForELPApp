let gulp = require('gulp');
let exec = require('child_process').exec;

function runCommand(command) {
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }
}

//Running mongo
//http://stackoverflow.com/a/28048696/46810
gulp.task('start-mongo', runCommand('mongod --dbpath C:/mongoData'));
gulp.task('stop-mongo', runCommand('mongo admin --eval "db.shutdownServer();"'));
gulp.task('start', runCommand('nodemon'));

gulp.task('default', ['start-mongo', 'start']);
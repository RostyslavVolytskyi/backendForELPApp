let gulp = require('gulp');
let exec = require('child_process').exec;
let runSequence = require('run-sequence');
let open = require('gulp-open');


//Running mongo
//http://stackoverflow.com/a/28048696/46810
gulp.task('start-mongo', (done) => {
    const mongoserver = exec('mongod --dbpath mongo');

    mongoserver.stdout.on('data', data => {
        console.log('stdout: ' + data.toString());

        // wait for mongo to be ready to receive connections
        if (data.toString().indexOf('waiting for connections on port') > 0) {
            done();
        }
    });
    mongoserver.stderr.on('data', (data) => console.log('stderr: ' + data.toString()));
    mongoserver.on('exit', (code) => console.log('start-mongo process exited with code ' + code.toString()));

});

gulp.task('stop-mongo', () => {
    const mongoserver = exec('mongo admin --eval "db.shutdownServer();"');

    mongoserver.stdout.on('data', data => console.log('stdout: ' + data.toString()));
    mongoserver.stderr.on('data', (data) => console.log('stderr: ' + data.toString()));
    mongoserver.on('exit', (code) => console.log('stop-mongo with code ' + code.toString()));
});

gulp.task('start', (done) => {
    const nodemon = exec('nodemon');

    nodemon.stdout.on('data', data => {
        console.log('stdout: ' + data.toString());

        // wait for nodemon to be ready to receive connections
        if (data.toString().indexOf('Connected') >= 0) {
            done();
        }
    });
    nodemon.stderr.on('data', (data) => console.log('stderr: ' + data.toString()));
    nodemon.on('exit', (code) => console.log('start with code ' + code.toString()));
});

gulp.task('open', function () {
    gulp.src('./app/index.html')
        .pipe(open({
            uri: 'http://localhost:9999'
        }));
});

gulp.task('default', (done) => {
    runSequence('start-mongo', 'start', 'open', () => done());
});

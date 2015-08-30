var through = require('through2')
  ,	concat = require('concat-stream')
  ,	fs = require('fs')
  ,	path = require('path')
  ,	spawn = require('child_process').spawn;

module.exports = function(opts){
	
	if (!opts) opts = {};
	if (opts.gulp == undefined || opts.gulp == null) opts.gulp = true;
		
	if (opts.gulp) {
		
		return through.obj(function(file, enc, next){

			if (file.isStream()) {
				this.emit('error', new Error('Streaming not supported'));
				return next();
			}
			
			var self = this;
			var errstr = '';
			var end = false;
			var exit = false;
			var child = spawn('gpp', opts.argv);

			// stdout
			child
				.stdout
				.pipe(concat(function(buf){
					if (buf instanceof Buffer) {
						file.contents = buf;
						self.push(file);
					}
					end = true;
					if (exit) next();
				}));
				
			// stderr
			child
				.stderr
				.pipe(through(function(_buf, _enc, _next){
					errstr += _buf.toString();
					_next();
				}, function(_done){
					this.push(new Buffer(errstr.replace(/^stdin:/, path.basename(file.path) + ':')));
					_done();
				}))
				.pipe(fs.createWriteStream('gpp.log', { flags: 'a' }));

			// exit code
			child
				.on('exit', function(code, signal){
					if (code) {
						var err = new Error('Exit code is not zero. See gpp.log file.');
						err.name = 'ChildProcessError';
						err.code = code;
						err.signal = signal;
						self.emit('error', err);
					}
					exit = true;
					if (end) next();
				});
			
			// stdin
			child
				.stdin
				.end(file.contents);
			
			return;
		});

	} else {

		return through(function(buf, enc, next){
			
			var self = this;
			var end = false;
			var exit = false;
			var child = spawn('gpp', opts.argv);
			
			// stdout
			child
				.stdout
				.pipe(concat(function(buf){
					if (buf instanceof Buffer) {
						self.push(buf);
					}
					end = true;
					if (exit) next();
				}));
				
			// stderr
			child
				.stderr
				.pipe(fs.createWriteStream('gpp.log', { flags: 'a' }));

			// exit code
			child
				.on('exit', function(code, signal){
					if (code) {
						var err = new Error('Exit code is not zero. See gpp.log file.');
						err.name = 'ChildProcessError';
						err.code = code;
						err.signal = signal;
						self.emit('error', err);
					}
					exit = true;
					if (end) next();
				});
			
			// stdin
			child
				.stdin
				.end(buf);
			
			return;
		});
	}
};

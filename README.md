## Features

* You can use it as a gulp plugin or with conventional streams.
* Guaranteed error event triggering before data is passed to the next stream in pipeline.
* Error log with file names when used with gulp

## Install

Install general purpose preprocessor first.

For Ubuntu and Debian users it looks like this:
`sudo apt-get install gpp`

Install gulp-gpp:
`npm install gulp-gpp`

## Usage examples

### Using with gulp

```
var gpp = require('gulp-gpp');

gulp.task('myTask', function(cb){
	
	return gulp
			.src('./lib/*.js')
			.pipe(gpp())
			.on('error', function(err){
				console.log('Preprocessig error');	// Actual error log is in gpp.log file
				cb();
			})
			.pipe(gulp.dest('./dist'));
});
```

### Using with conventional streams

```
var gpp = require('gulp-gpp')
  ,	fs = require('fs');

	fs
	.createReadStream('lib/myfile.js')
	.pipe(gpp({ gulp: false }))
	.on('error', function(err){
		console.log('Preprocessig error');	// Actual error log is in gpp.log file
	})
	.pipe(createWriteStream('dist/myfile.js'));	
```

## API

### gpp([options])
Generate a transform stream.

**Options**

- *gulp* `Boolean` - Use as a gulp plugin. Default is `true`.
- *argv* `Array` - Command line arguments for gpp. Array of strings. For example: `[ '-I/usr/local/include' ]`.

**Returns**: `stream.Transform` - Stream wrapper for gpp command line utility.

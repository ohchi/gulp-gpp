var expect = require('chai').expect
  ,	assert = require('chai').assert
  ,	concat = require('concat-stream')
  ,	glob = require('glob')
  ,	fs = require('fs')
  ,	vfs = require('vinyl-fs')
  ,	gpp = require('../index.js');

	if (fs.existsSync('./gpp.log')) fs.unlinkSync('./gpp.log');
	
describe('gulp mode is on:', function(){

	it('no options, no error handling', function(done){

		cleanOutput();
		
		vfs
		.src('./test/source/1.js')
		.pipe(gpp())
		.pipe(vfs.dest('./test/output'))
		.on('finish', function(){
			var m = require('./output/1');
			expect(m()).to.equal(123456);
			done();
		});
	});
	
	it('custom include paths, no error handling', function(done){
		
		cleanOutput();
		
		vfs
		.src('./test/source/2.js')
		.pipe(gpp({ argv: [ '-I' + process.cwd() + '/test/source/include' ]}))
		.pipe(vfs.dest('./test/output'))
		.on('finish', function(){
			var m = require('./output/2');
			expect(m()).to.equal(654321);
			done();
		});
	});

	
	it('wrong include paths, error handling', function(done){
		
		var error = false;
		cleanOutput();
		
		vfs
		.src('./test/source/2.js')
		.pipe(gpp({ argv: [ '-I' + process.cwd() + '/test/source/unexisting' ]}))
		.on('error', function(err){
			error = true;
			expect(err.name).to.equal('ChildProcessError');
		})
		.pipe(concat(function(buf){
			// make sure that error was emited erlier then data would be used
			assert.ok(error);
			done();
		}));
	});
});	

describe('gulp mode is off:', function(){

	it('no options, no error handling', function(done){

		cleanOutput();
		
		fs
		.createReadStream('./test/source/1.js')
		.pipe(gpp({ gulp: false }))
		.pipe(fs.createWriteStream('./test/output/1.js'))
		.on('finish', function(){
			var m = require('./output/1');
			expect(m()).to.equal(123456);
			done();
		});
	});

	it('custom include paths, no error handling', function(done){

		cleanOutput();
		
		fs
		.createReadStream('./test/source/1.js')
		.pipe(gpp({ gulp: false, argv: [ '-I' + process.cwd() + '/test/source/include' ]}))
		.pipe(fs.createWriteStream('./test/output/2.js'))
		.on('finish', function(){
			var m = require('./output/2');
			expect(m()).to.equal(654321);
			done();
		});
	});

	it('wrong include paths, error handling', function(done){

		var error = false;
		cleanOutput();
		
		fs
		.createReadStream('./test/source/2.js')
		.pipe(gpp({ gulp: false, argv: [ '-I' + process.cwd() + '/test/source/unexisting' ]}))
		.on('error', function(err){
			error = true;
			expect(err.name).to.equal('ChildProcessError');
		})
		.pipe(concat(function(buf){
			// make sure that error was emited erlier then data would be used
			assert.ok(error);
			done();
		}));
	});
});

function cleanOutput(){
	var farr = glob.sync('./test/output/*');

	for (var i=0; i<farr.length; i++) {
		fs.unlinkSync(farr[i]);
	}
}

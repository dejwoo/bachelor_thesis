util = require('util');
const Duplex = require('stream').Duplex;
util.inherits(inputStreamWrapper, Duplex);

function inputStreamWrapper(inputSource, sourceOptions) {
  var streamOptions = {};  
  streamOptions.writableObjectMode = true;
  streamOptions.readableObjectMode = true;
  Duplex.call(this, streamOptions);
  this._source = new inputSource(sourceOptions);
  this._isReading = false;

  // Every time there's data, we push it into the internal buffer.
  this._source.on('data', (chunk) => {
    // if push() returns false, then we need to stop reading from source
    if (!this.push(chunk)) {
      this._source.readStop();
      this._isReading = false;
    }
  });
  // When the source ends, we push the EOF-signaling `null` chunk
  this._source.on('end', () => {
    this.push(null);
  });
  this._source.on('configured', (response,err) => {
    if (err) {
      console.info("Config error of " + _source.name + ": " + response );
    }
    console.info("Config response of " + _source.name + ": " + response );
  });
}
// _read will be called when the stream wants to pull more data in
// the advisory size argument is ignored in this case.
inputStreamWrapper.prototype._read = function(size) {
  if (!this._isReading) {
    this._source.readStart();
    this._isReading = true;
  }
};
inputStreamWrapper.prototype._write = function(data, encoding, callback) {
  console.log("WRITING: ");
  console.log(data);
  callback();
};
module.exports = inputStreamWrapper
// const myInputStreamWrapper = new inputWrapper({},0);
// myInputStreamWrapper.pipe(process.stdout);
// myInputStreamWrapper._source.readStart()

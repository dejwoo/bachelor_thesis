// inputSource is an object with readStop() and readStart() methods,
// and an `ondata` member that gets called when it has data, and
// an `onend` member that gets called when the data is over.
// This object will be created for every input source and 
// will handle communication with the main nodejs app.
// inputWrapper is a stream, which will enable us to listen
// in main app on event data and fire up neccessary actions
// with input data, right now we can call options with creation
// of said stream, but later it will be set to objectMode:true,
// which will enable as to send between inputSources and main app
// whole JSON object without need to stringify and parse them.
// easy build up upon inputWrapper will be transformWrapper which will take
// stream and transform it(HEX code -> normal values), after streaming it forwar
// which will not clutter our code in main up, we will just conect pipes from one to another.
util = require('util');
const Readable = require('stream').Readable;
util.inherits(inputStreamWrapper, Readable);

function inputStreamWrapper(inputSource, options, sampleRate) {
  Readable.call(this, options);
  //source is an object, which will provide readStop(),readStart(),configure().
  this._source = new inputSource(sampleRate);
  this._isReading = this._source.emitting;

  // Every time there's data, we push it into the internal buffer.
  this._source.on('data', (chunk) => {
    //BEAWARE: u can send objects with stream using objectMode:true as option in creating
    // stream, BUT be careful where are you piping this stream, e.g process.stdout
    // if push() returns false, then we need to stop reading from source
    if (!this.push(chunk))
      this._source.readStop();
      this._isReading = false;
  });

  // When the source ends, we push the EOF-signaling `null` chunk
  this._source.on('end', () => {
    this.push(null);
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
module.exports = inputStreamWrapper
// const myInputStreamWrapper = new inputWrapper({},0);
// myInputStreamWrapper.pipe(process.stdout);
// myInputStreamWrapper._source.readStart()
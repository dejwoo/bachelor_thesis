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
inputSource = require('./time.js');
util = require('util');
var Readable = require('stream').Readable;
util.inherits(inputWrapper, Readable);

function inputWrapper(options,sampleRate) {
  Readable.call(this, options);
  //source is an object, which will provide readStop(),readStart(),configure().
  this._source = new InputSource(sampleRate);

  // Every time there's data, we push it into the internal buffer.
  this._source.ondata = (chunk) => {
    // if push() returns false, then we need to stop reading from source
    if (!this.push(chunk))
      this._source.readStop();
  };

  // When the source ends, we push the EOF-signaling `null` chunk
  this._source.onend = () => {
    this.push(null);
  };
}

// _read will be called when the stream wants to pull more data in
// the advisory size argument is ignored in this case.
inputWrapper.prototype._read = function(size) {
  this._source.readStart();
};
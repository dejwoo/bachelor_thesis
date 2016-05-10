var amqp = require('amqplib/callback_api')
const Writable = require('stream').Writable;
const util = require('util');
const _ = require('lodash');

function RabbitOutput(moduleConfig) {
    var self = this;
    this.ready = false;
    this.moduleConfig = moduleConfig;
    this.queue = [];
    if (_.isUndefined(this.moduleConfig)) {
        console.error("rabbitMQ.module.js: Undefined moduleConfig");
    }
    this.configure();
}
util.inherits(RabbitOutput, Writable);

RabbitOutput.prototype.configure = function() {
    var self = this;
    if (_.isUndefined(this.moduleConfig.streamOptions)) {
        var streamOptions = {};
    } else {
        var streamOptions = this.moduleConfig.streamOptions;
    }
    //this settings must be always set to this value
    streamOptions.objectMode = true;
    Writable.call(this, streamOptions);
    if (typeof this.moduleConfig.serverConnection === 'undefined') {
        console.error("rabbitMQ.module.js: RabbitMQ serverConnection is undefined in moduleConfig");
    }
    this.moduleConfig.amqpURI = "amqp://"
    // authentication details
    this.moduleConfig.amqpURI += this.moduleConfig.serverConnection.login + ":" + this.moduleConfig.serverConnection.password + "@"
    //  url:port
    this.moduleConfig.amqpURI += this.moduleConfig.serverConnection.host + ":" + this.moduleConfig.serverConnection.port;

}
RabbitOutput.prototype.init = function() {
    var self = this;
    console.log(this.moduleConfig);
    amqp.connect(self.moduleConfig.amqpURI,function (err, con) {
        if (err) {
            throw err;
        }
        self.connection = con;
        console.log("Connection to rabbitMQ successfull.");
        if (typeof self.channel === 'undefined') {
            self.connection.createChannel(function(err,ch) {
                if (err) {
                    console.error(err);
                }
                self.channel = ch
                self.ready = true;
                console.log("Cleaning queue:")
                console.log(self.queue);
                for (var index = 0; index < self.queue.length; index++) {
                    self.send(self.queue[index]);
                }
                self.queue = [];
            });
        }
    });
}
RabbitOutput.prototype.close = function (callback) {
    if (_.isUndefined(this.connection)) {
        return;
    }
    this.connection.close(function(err) {
        if (err) {
            if (typeof callback !== undefined) {
                callback(err);
            } else {
                console.error(err);
            }
        }
    });
    return;
}
RabbitOutput.prototype.send = function (data) {
    if (this.ready) {
        this.channel.assertQueue(data.header.id, {durable: true});
        this.channel.sendToQueue(data.header.id, new Buffer( JSON.stringify( data ) ));
    } else {
        this.queue.push(data);
    }
}
RabbitOutput.prototype._write = function(chunk, encoding, cb) {
    //ConsoleOutput writable stream is in object mode we can igonore encoding;
    this.send(chunk);
    cb();
}
module.exports = RabbitOutput;

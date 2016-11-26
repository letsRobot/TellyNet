/* eslint new-cap: 0 */
/* eslint padded-blocks: 0 */
/* eslint brace-style: 0 */
const WebSocketServer = require('websocket').server;
const logger = require('winston');

/**
 * ConnectionManager - Web Sockets client manager.
 *
 * @param server
 * @constructor
 */
function ConnectionManager(server) {

  this.Server = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  this.socketConnections = [];
  this.setupListeners();

}

ConnectionManager.prototype.setupListeners = function setupListeners() {
  this.Server.on('request', request => {

    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      logger.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      request.reject();
      logger.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    const connection = request.accept(undefined, request.origin);
    this.socketConnections.push(connection);

    logger.log(new Date() + ' Connection accepted.');
    console.log('connection accepted');
    connection.on('message', message => {
      console.log(message);
      if (message.type === 'utf8') {
        connection.sendUTF(message.utf8Data);
      }
      else if (message.type === 'binary') {
        connection.sendBytes(message.binaryData);
      }
    });

    connection.on('close', () => {

      const index = this.socketConnections.indexOf(connection);
      if (index > -1) {
        this.socketConnections.splice(index, 1);
      }

      logger.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });

};

function originIsAllowed(origin) {
  // @TODO: Set the origin of the web socket and verify here
  // return config.get('allowedOrigins').indexOf(origin) !== -1;
  //return origin !== undefined;
  return true;
}

module.exports = ConnectionManager;

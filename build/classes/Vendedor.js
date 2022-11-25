export class VendedorComunication {
    constructor(socketConnection) {
        this.socket = socketConnection;
    }
    sendMessage(message, options, cb) {
        this.socket.send(JSON.stringify(message), options, cb);
    }
}

'use strict'

class UniappImpl {

	constructor() {

		this._socket = null;
	}

	open(endpoint) {
        let self = this;
        
		
		try {			
			this._socket = uni.connectSocket({
			    url: endpoint,
				binaryType: 'arraybuffer',
			    complete: ()=> {
					
				}
			});
					
        } catch (err) {
            this.emit('error', err);
            return;
        }

        this._socket.binaryType = 'arraybuffer';

		this._socket.onOpen(()=>{
		    self.emit('open');
		})
		
		this._socket.onMessage((evt)=>{
			if (evt.data instanceof ArrayBuffer) {
			    const view = new Uint8Array(evt.data);
				self.emit('message', view);
			}
		});
		
		this._socket.onClose(()=>{
		    self.emit('close');
		});
		
		this._socket.onError(()=>{
		    self.emit('error', 'connect error'); 
		});
	}

	send(data) {

		try {
            
            this._socket.send({data});
        } catch (err) {
            this.emit('error', err);
            return;
        }
	}

	close() {

		if (this._socket) {

			this._socket.close();
		}
	}

	get isOpen() {

		if (this._socket) {
	        return this._socket.readyState == 1;
        }

        return false;
	}

	get isConnecting() {

		if (this._socket) {

	        // return this._socket.readyState == WebSocket.CONNECTING;
			return this._socket.readyState == 0;
        }

        return false;
	}
}

//module.exports = UniappImpl;
export default UniappImpl;
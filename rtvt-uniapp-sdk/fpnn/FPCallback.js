'use strict'

//const FPConfig = require('./FPConfig');
//const FPError = require('./FPError');

import FPConfig from './FPConfig';
import FPError from './FPError';

class FPCallback {

    constructor() {

        this._cbMap = {};
        this._exMap = {};

        checkExpire.call(this);
    }

    addCb(key, cb, timeout) {

        if (!this._cbMap.hasOwnProperty(key)) {

            this._cbMap[key] = cb;
        } 

        if (!timeout) {

            timeout = FPConfig.SEND_TIMEOUT;
        }

        this._exMap[key] = timeout + Date.now();
    }

    removeCb(key) {

        if (key) {

            delayRemove.call(this, key);
            return;
        }

        for (let key in this._cbMap) {

            delayExec.call(this, key, new FPError(FPConfig.ERROR_CODE.FPNN_EC_CORE_CONNECTION_CLOSED, new Error('Connection Closed')));
        }
    }

    execCb(key, data) {

        delayExec.call(this, key, data);
    }
}

function checkExpire() {

    let self = this;
	
	setTimeout(() => {
	    for (let key in self._exMap) {
	    
	        if (self._exMap[key] > Date.now()) {
	        
	            continue;
	        } 
	        delayExec.call(self, key, new FPError(FPConfig.ERROR_CODE.FPNN_EC_CORE_TIMEOUT, Error('Timeout')));
	    }
		
		checkExpire.call(self);
	}, FPConfig.CHECK_CBS_INTERVAL); 
}

async function delayExec(key, data) {

    let self = this;
	
	cbExec.call(self, key, data);
}

function cbExec(key, data) {
    if (this._cbMap.hasOwnProperty(key)) {
    
        let cb = this._cbMap[key];
        cbRemove.call(this, key);
        cb && cb(data);
    }
}

async function delayRemove(key) {

    let self = this;

	await (async function() {
		cbRemove.call(self, key);
	})();
	
    /*setTimeout(function() {

        cbRemove.call(self, key);
    }, 0);*/
}

function cbRemove(key) {

    if (this._cbMap.hasOwnProperty(key)) {

        delete this._cbMap[key];
    }

    if (this._exMap.hasOwnProperty(key)) {

        delete this._exMap[key];
    } 
}

module.exports = FPCallback
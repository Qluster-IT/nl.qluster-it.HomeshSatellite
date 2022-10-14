'use strict';

const Homey = require('homey');
const _ = require('lodash-core');


module.exports = {
    // async getAdvancedFlows({ homey, query }) {
    //     return await homey.drivers.getDriver('virtualdevice').getAdvancedFlows({ homey,  query });
    // },   
    async getAuthorization({ homey,  body: { pincode } }) {
        if(homey.app.pincode === pincode) return {token:homey.app.token};
        console.log('pincode: ');//return await homey.drivers.getDriver('virtualdevice').getAdvancedFlowsJSON({ homey,  advancedflowsselected });
        console.log(pincode);

        return false;
    },
    async startFlow({ homey,  body: { token, name, text, number, boolean } }) {
        if(!validateToken(homey, token)) throw new Error('Unauthorized');
    },
    async getFlowEventNames({ homey,  body: { token, query } }) {
        if(!validateToken(homey, token)) throw new Error('Unauthorized');
        return await Object.keys(_.filter(homey.app.triggers, (t,key)=>!query || query=='' || key.toLowerCase().indexOf(query.toLowerCase())).events);
    }
    
};


function validateToken(homey, token) {
    return token === homey.app.token;
}
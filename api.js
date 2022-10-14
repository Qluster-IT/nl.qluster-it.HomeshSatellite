'use strict';

const Homey = require('homey');
const _ = require('lodash-core');


module.exports = {
    // async getAdvancedFlows({ homey, query }) {
    //     return await homey.drivers.getDriver('virtualdevice').getAdvancedFlows({ homey,  query });
    // },   
    async startFlow({ homey,  body: { token, name, text, number, boolean } }) {
        if(!validateToken(homey, token)) throw new Error('Unauthorized');
        console.log('Start Flow!');//return await homey.drivers.getDriver('virtualdevice').getAdvancedFlowsJSON({ homey,  advancedflowsselected });
    }, 
    async getAuthorization({ homey,  body: { pincode } }) {
        if(homey.app.pincode === pincode) return {token:homey.app.token};
        console.log('pincode: ');//return await homey.drivers.getDriver('virtualdevice').getAdvancedFlowsJSON({ homey,  advancedflowsselected });
        console.log(pincode);

        return false;
    }    
};


function validateToken(homey, token) {
    return token === homey.app.token;
}
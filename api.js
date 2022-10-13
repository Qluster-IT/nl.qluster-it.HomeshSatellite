'use strict';

const Homey = require('homey');
const _ = require('lodash-core');


module.exports = {
    // async getAdvancedFlows({ homey, query }) {
    //     return await homey.drivers.getDriver('virtualdevice').getAdvancedFlows({ homey,  query });
    // },   
    async startFlow({ homey,  body: { name, text, number, boolean } }) {        
        console.log('Start Flow!');//return await homey.drivers.getDriver('virtualdevice').getAdvancedFlowsJSON({ homey,  advancedflowsselected });
    }, 
    async getAuthorization({ homey,  body: { pincode } }) {        
        console.log('pincode: ');//return await homey.drivers.getDriver('virtualdevice').getAdvancedFlowsJSON({ homey,  advancedflowsselected });
        console.log(pincode);
    }, 
};
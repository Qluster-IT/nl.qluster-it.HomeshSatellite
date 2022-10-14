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
        try {
            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return _.filter(_.first(homey.app.triggers).events, (t,key)=>!query || query=='' || key.toLowerCase().indexOf(query.toLowerCase())).map(x=>{return {name:x.name};});
        } catch (error) {
            this.error('getFlowEventNames error: ');
            this.error(error);
        }
    }
    
};


function validateToken(homey, token) {
    return token === homey.app.token;
}
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
    async startFlow({ homey,  body: { token, name, text1, number1, boolean1 } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return await homey.app.triggers[0].card.trigger({text1, number1, boolean1}, {name, textCount:1, numberCount:1, booleanCount:1});
        } catch (error) { handleError(this, 'startFlow error: ', error); }
    },
    async getFlowEventNames({ homey,  body: { token, query } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return _.filter(_.first(homey.app.triggers).events, (t,key)=>!query || query=='' || key.toLowerCase().indexOf(query.toLowerCase())>-1).map(x=>{return {name:x.name};});
        } catch (error) { handleError(this, 'getFlowEventNames error: ', error); }
    },
    async playUrl({ homey,  body: { token, url } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return homey.app.playUrl(url);
        } catch (error) { handleError(this, 'playUrl error: ', error); }
    },
    async sayAthom({ homey,  body: { token, text } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return homey.speechOutput.say(text);
        } catch (error) { handleError(this, 'playUrl error: ', error); }
    }
    
};

function handleError(_this, id, error) {
    console.log('getFlowEventNames error: ');
    console.log(error);
}
function validateToken(homey, token) {
    return token === homey.app.token;
}
'use strict';

const Homey = require('homey');
const _ = require('lodash-core');

module.exports = {
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
        } catch (error) { return handleError(this, 'startFlow error: ', error); }
    },
    async getFlowEventNames({ homey,  body: { token, query } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return _.filter(_.first(homey.app.triggers).events, (t,key)=>!query || query=='' || key.toLowerCase().indexOf(query.toLowerCase())>-1).map(x=>{return {name:x.name};});
        } catch (error) { return handleError(this, 'getFlowEventNames error: ', error); }
    },
    async playUrl({ homey,  body: { token, url } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return homey.app.playUrl(url);
        } catch (error) { return handleError(this, 'playUrl error: ', error); }
    },
    async sayAthom({ homey,  body: { token, text } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            return homey.speechOutput.say(text);
        } catch (error) { return handleError(this, 'playUrl error: ', error); }
    },
    async getSoundboards({ homey,  body: { token, text } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            const soundboardApp = await getApp(homey, 'com.athom.soundboard', 'Soundboard');
            const r = await soundboardApp.get('/');
            return r;

        } catch (error) { return handleError(this, 'getSoundboards error: ', error); }
    },    
    async playSoundboard({ homey,  body: { token, file } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            const soundboardApp = await getApp(homey, 'com.athom.soundboard', 'Soundboard');
            const r = await soundboardApp.post('/'+file.id+'/play');
            return r;

        } catch (error) { return handleError(this, 'playSoundboard error: ', error); }
    },     
    async getScreensavers({ homey,  body: { token } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');
            let ledCollectionArray = [];
            let ledItBeArray = [];
            try {             
                const ledCollectionApp = await getApp(homey, 'openmindnl.ledcollection', 'Led Collection');
                ledCollectionArray = await ledCollectionApp.get('/screensavers/');   
                ledCollectionArray = ledCollectionArray.map(x=>{return{id:x.id, uri:'homey:app:openmindnl.ledcollection', name:x.name};});
            } catch (error) {
                throw error;
             }
            let r =ledCollectionArray;// _.join(ledCollectionArray, ledItBeArray);
            //let r = await homey.app.homeyAPI.ledring.getScreensavers();
            return r.sort(x=>(x.uri==='homey:app:openmindnl.ledcollection' && x.id==='led_solid_black'?'1' : '2') + x.title);

        } catch (error) { return handleError(this, 'getScreensavers error: ', error); }
    },
    async setScreensaver({ homey,  body: { token, screensaver } }) {
        try {            
            if(!validateToken(homey, token)) throw new Error('Unauthorized');

            switch (screensaver.uri) {
                case 'homey:app:openmindnl.ledcollection':
                    const ledCollectionApp = await getApp(homey, 'openmindnl.ledcollection', 'Led Collection');
                    return await ledCollectionApp.post('/screensaver/' + screensaver.id);
                // case 'homey:app:nl.fellownet.leditbe':
                //     const ledItBeApp = getApp('nl.fellownet.leditbe', homey);
                //     return await ledItBeApp.post('/screensaver/' + screensaver.id);
                default:
                    break;
            }
        } catch (error) { return handleError(this, 'getScreensavers error: ', error); }
    }
    
};

async function getApp(homey, appId, appname) {
    if(!homey.app[appId]) homey.app[appId] = homey.api.getApiApp(appId);
    
    if(!homey.app[appId]) throw new Error(appname + ' is not installed.');
    else if(!await homey.app[appId].getInstalled()) throw new Error(appname + ' is not installed.');    

    return homey.app[appId];
}

function handleError(_this, id, error) {
    console.log('getFlowEventNames error: ');
    console.log(error);
    return {__error__:error.message||error};
}
function validateToken(homey, token) {
    return token === homey.app.token;
}
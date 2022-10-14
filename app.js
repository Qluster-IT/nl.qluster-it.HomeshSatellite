'use strict';

const Homey = require('homey');
const { Defer, encrypt, generateKey } = require('./lib/proto');
const _ = require('lodash-core');
const UrlSoundConverterApp = require('./lib/MusicUrlConverter');

class HominySatellite extends Homey.App {  
  static get lastName() { return this._lastName; }
  static set lastName(value) { this._lastName = value; }

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {    
    this.lastName = null;
    this.uniqueId = 0;

    
    this.log('HominySatellite App has been initialized');
    
    if (process.env.DEBUG === '1') require('inspector').open(9224, '0.0.0.0', true);


    
    
    this.pincode = await this.homey.settings.get('pincode');
    if(!this.pincode || this.pincode=='') await this.generateAndSetPincode();
    
    this.token = await this.homey.settings.get('token');
    if(!this.token || this.token=='') await this.generateAndSetToken();
    

    this.homey.settings.on('set', async (token)=> {
      switch (token) {
        case "pincode":
          this.pincode = await this.homey.settings.get('pincode');
          
          break;
        case "token":
            this.token = await this.homey.settings.get('token');
            if(!this.token || this.token=='') await this.generateAndSetToken();            
            break;
        default:
          break;
      }
    });



    
    //#region Triggercards Looper
    var triggers = this.triggers = [
      { id: 'trigger__startflow__text1_number1_boolean1' }
    ];
    for (let i = 0; i < triggers.length; i++) {
      const trigger = triggers[i];
      const triggerCard = this.homey.flow.getTriggerCard(trigger.id);
      trigger.card = triggerCard;
      this.setCounts(trigger);

      triggerCard.registerRunListener(async (args, state, more) => { //async
        //let s = 'trigger__startflow__text' + state.textCount + (state.numberCount ? '_number' + state.numberCount : '') + (state.booleanCount? '_boolean' + state.booleanCount : '');
        return (trigger.id.startsWith('trigger__startflow__text' + state.textCount + (state.numberCount ? '_number' + state.numberCount : '') + (state.booleanCount? '_boolean' + state.booleanCount : '')) || args.overloadable == 'true');        
      });

      triggerCard.on("update", async () => { await this.setTrigger(trigger); });
      await this.setTrigger(trigger);
    }
    //#endregion



    this.urlSoundConverter = new UrlSoundConverterApp(this.homey);
    
  }
  async playUrl(url) {
    return await this.urlSoundConverter.playUrl(url);
  }

  
  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async generateAndSetPincode() {
    this.pincode = Math.floor(Math.random() * 10000).toString().padStart(4,"0");
    this.homey.settings.set('pincode', this.pincode);

  }
  async generateAndSetToken() {
    this.token = await generateKey();
    this.homey.settings.set('token', this.token);

  }

  
  //#region Functions the same as AdvancedTriggers
  
  setCounts(card) {
    card.textCount = card.numberCount = card.booleanCount = card.jsonCount = 0;
      var arrArgumentTypes = _.last(card.id.split('__')).split('_');
      for (let i = 0; i < arrArgumentTypes.length; i++) {
        const type = arrArgumentTypes[i];
        if(type.startsWith('text')) card.textCount = Number.parseInt(type.replace('text',''));
        else if(type.startsWith('number')) card.numberCount = Number.parseInt(type.replace('number',''));
        else if(type.startsWith('boolean')) card.booleanCount = Number.parseInt(type.replace('boolean',''));    
        else if(type.startsWith('json')) card.jsonCount = Number.parseInt(type.replace('json',''));    
      }
  }


  async setArgumentValues(cardObject, cardCard) {
    cardObject.argumentValues = await cardCard.getArgumentValues();
  }

  async setTrigger(trigger) {
    await this.setArgumentValues(trigger, trigger.card);
    if (!trigger.events) trigger.events = {};
    trigger.events = {};

    for (let i = 0; i < trigger.argumentValues.length; i++) {
      const argumentValue = trigger.argumentValues[i];
      if (!trigger.events[argumentValue.name]) trigger.events[argumentValue.name] = { name: argumentValue.name, arguments: [argumentValue], debounce: argumentValue.debounce};
      else {
        var event = trigger.events[argumentValue.name];
        if (argumentValue.debounce && argumentValue.debounce != 'none') {
          if (event.debounce); //ALERT that this will not work correctly.
          event.debounce = argumentValue.debounce;
        }
        event.arguments.push(argumentValue);
      }
    }
  }
  //#endregion

}

module.exports = HominySatellite;

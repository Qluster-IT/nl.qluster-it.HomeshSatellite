'use strict';

const Homey = require('homey');
const { Defer, encrypt, generateKey } = require('./lib/proto');
const _ = require('lodash-core');

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
      triggerCard.getArgument('name').registerAutocompleteListener(async (query, args) => {
        try {
          trigger.lastName = query;
          return await this.getEventNames({ targetCard: trigger.actionCard, query: query, args: args });
        } catch (error) { this.error('trigger.name.registerAutocompleteListener.error :', error); throw error; }
      });

      triggerCard.on("update", async () => { await this.setTrigger(trigger); });
      await this.setTrigger(trigger);
    }
    //#endregion

    
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
      if (!trigger.events[argumentValue.name.name]) trigger.events[argumentValue.name.name] = { name: argumentValue.name.name, arguments: [argumentValue], debounce: argumentValue.debounce};
      else {
        var event = trigger.events[argumentValue.name.name];
        if (argumentValue.debounce && argumentValue.debounce != 'none') {
          if (event.debounce); //ALERT that this will not work correctly.
          event.debounce = argumentValue.debounce;
        }
        event.arguments.push(argumentValue);
      }
    }
  }

  async getEventNames({ targetCard, query, args, isAction = false } = {}) {
    var _return = query && query != '' && query.trim() != '' ? [{ name: query, description: this.homey.__("return_description_create") }] : [];
    var cards = [];
    // if (isAction) cards = _.filter(this.triggers, x => { return !x.deprecated && x.textCount >= targetCard.textCount && x.numberCount >= targetCard.numberCount && x.booleanCount >= targetCard.booleanCount; });
    // else if (!isAction && args.overloadable == 'true') cards = _.filter(this.actions, x => { return !x.deprecated && x.textCount <= targetCard.textCount && x.numberCount <= targetCard.numberCount && x.booleanCount <= targetCard.booleanCount; });
    // else cards.push(targetCard);
    //cards = _.filter(this.triggers, x => { return !x.deprecated && x.textCount >= targetCard.textCount && x.numberCount >= targetCard.numberCount && x.booleanCount >= targetCard.booleanCount; });
    cards = _.toArray(this.triggers);
    
    for (let iCards = 0; iCards < cards.length; iCards++) {
      const card = cards[iCards];
      if (card.lastName && (!isAction || card == targetCard)) {
        var o = null;
        if (!(o = _.find(_return, x => { return x.name == card.lastName; }))) _return.push({ name: card.lastName, description: this.homey.__("return_description_select") });
        else o.description = this.homey.__("return_description_select");
      }
    }
    for (let iCards = 0; iCards < cards.length; iCards++) {
      const card = cards[iCards];
      for (let i = 0; i < card.argumentValues.length; i++) {
        const element = card.argumentValues[i];
        if (!element.name) continue;
        //if (isAction && (card.textCount > targetCard.textCount || card.numberCount > targetCard.numberCount || card.booleanCount > targetCard.booleanCount) && element.overloadable != 'true') continue;
        //else if (!isAction && (card.textCount < targetCard.textCount || card.numberCount < targetCard.numberCount || card.booleanCount < targetCard.booleanCount) && (!args || args.overloadable != 'true')) continue;

        if (query && query != '') {
          if (element.name.name.indexOf(query) > -1) {
            let o = null;
            if (!(o = _.find(_return, x => { return x.name == element.name.name; })))
              _return.push({ name: element.name.name, description: this.homey.__("return_description_select") });
            else o.description = this.homey.__("return_description_select");
          }
        }
        else {
          let o = null;
          if (!(o = _.find(_return, x => { return x.name == element.name.name; })))
            _return.push({ name: element.name.name, description: this.homey.__("return_description_select") });
          else o.description = this.homey.__("return_description_select");
          //if(!_.find(_return, x=>{return x.name==element.name.name;})) _return.push({ name: element.name.name, description:this.homey.__("return_description_select") });
        }
      }
    }
    return _return;
  }
  //#endregion

}

module.exports = HominySatellite;

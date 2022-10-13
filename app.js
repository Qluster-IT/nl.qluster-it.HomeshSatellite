'use strict';

const Homey = require('homey');
const { Defer, encrypt, generateKey } = require('./lib/proto');

class HominySatellite extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    
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
            if(!this.token || this.token=='') {
              await this.generateAndSetToken();
            }
            
            break;
        default:
          break;
      }
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

}

module.exports = HominySatellite;

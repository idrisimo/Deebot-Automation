const tools = require('./tools');
const ecovacsDeebot = require('ecovacs-deebot');
const EcoVacsAPI = ecovacsDeebot.EcoVacsAPI;
const nodeMachineId = require('node-machine-id');

class EcoVacsControl {
    constructor() {
        this.settingsFile = tools.getSettingsFile();
        this.account_id = this.settingsFile.ACCOUNT_ID;
        this.password = this.settingsFile.PASSWORD;
        this.deviceID = 0;
        this.countryCode = this.settingsFile.COUNTRY_CODE;
        this.device_id = EcoVacsAPI.getDeviceId(nodeMachineId.machineIdSync(), this.deviceID);
        this.continent = ecovacsDeebot.countries[this.countryCode.toUpperCase()].continent.toLowerCase();
        this.authDomain = 'ecovacs.com';
        this.api = new EcoVacsAPI(this.device_id, this.countryCode, this.continent, this.authDomain);
        this.password_hash = EcoVacsAPI.md5(this.password);
        this.mapData = null;
        this.mapSpotAreaDetails = {};
        this.vacbot = null;
        this.mapSpotAreaDetailsPopulated = false;
        this.counter = 0;
        this.maxRetries = 10
        this.roomsList = []
    }

    async connectAndControl() {
        try {
            await this.api.connect(this.account_id, this.password_hash);
            console.log("-------------------Begin Control-------------------")
            const devices = await this.api.devices();
            console.log("Devices:", JSON.stringify(devices, null, 2));
            const vacuum = devices[this.deviceID];
            this.vacbot = this.api.getVacBot(this.api.uid, EcoVacsAPI.REALM, this.api.resource, this.api.user_access_token, vacuum, this.continent);
            this.setupListeners();
            this.vacbot.connect();
        } catch (error) {
            console.error("Failure in connecting!");
            console.log(error);
        }
    }
    async cleanHouse() {
        console.log("Cleaning House")
        // this.vacbot.clean();
    }
    async cleanRoom(roomName) {
        while (!this.mapSpotAreaDetailsPopulated && this.counter < this.maxRetries) {
            console.log("mapSpotAreaDetails not populated yet. Waiting...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.counter += 1;
        }
        if (this.counter === this.maxRetries) {
            console.log("Timeout: Unable to populate mapSpotAreaDetails.");
            return;
        } else if (this.mapSpotAreaDetailsPopulated) {
            console.log("mapSpotAreaDetails populated.");
        }
        const selectedRoomName = this.mapSpotAreaDetails[roomName][0];
        const selectedRoomId = this.mapSpotAreaDetails[roomName][1];
        if (selectedRoomName !== undefined) {
            console.log(`Cleaning room: ${selectedRoomName}`);
            // this.vacbot.spotArea(selectedRoomId);
        } else {
            console.log(`Room  ${selectedRoomName} does not exist.`);
        }
    }
    async stopAndGoHome() {
        console.log("Stopping");
        // this.vacbot.stop();
        console.log("Returning to dock");
        // this.vacbot.charge();
    }
    async pauseClean() {
        console.log("Pausing");
        // this.vacbot.pause();
    }
    async resumeClean() {
        console.log("Resuming");
        // this.vacbot.resume();
    }

    setupListeners() {
        this.vacbot.on("ready", (event) => {
            console.log("vacbot ready");
            this.vacbot.run("BatteryState");
            this.vacbot.run("GetCleanState");
            this.vacbot.run("GetChargeState");
            this.vacbot.on("BatteryInfo", (battery) => {
                console.log("Battery level: " + Math.round(battery));
            });
            this.vacbot.on('CleanReport', (value) => {
                console.log("Clean status: " + value);
            });
            this.vacbot.on('ChargeState', (value) => {
                console.log("Charge status: " + value);
            });
            
            console.log("---Vac Bot map---");
            this.vacbot.run("GetMaps", true);
            this.vacbot.on('MapDataObject', (mapDataObject) => {
                this.mapSpotAreaDetailsPopulated = true;
                this.mapData = Object.assign(mapDataObject[0]);
                
                for (let i = 0; i < this.mapData.mapSpotAreas.length; i++) {
                    const mapSpotArea = this.mapData.mapSpotAreas[i];
                    let roomName = mapSpotArea.mapSpotAreaName;
                    let roomId = parseInt(mapSpotArea.mapSpotAreaID);
                    this.mapSpotAreaDetails[roomName] = [roomName,roomId];
                    this.roomsList.push(roomName);
                }
                console.log(this.mapSpotAreaDetails)
                this.initGetPosition();
            });
            this.vacbot.on('Error', (value) => {
                this.api.logError('Error: ' + value);
            });
        });

        process.on('SIGINT', () => {
            this.api.logInfo("Gracefully shutting down from SIGINT (Ctrl+C)");
            this.disconnect();
        });
    }

    initGetPosition() {
        setInterval(() => {
            if (this.vacbot.getProtocol() === 'XMPP') {
                this.vacbot.run('GetPosition');
            }
        }, 6000);
    }

    async disconnect() {
        try {
            await this.vacbot.disconnectAsync();
            this.api.logEvent("Exiting...");
            process.exit();
        } catch (error) {
            this.api.logError('Failure in disconnecting: ', error.message);
        }
    }
}

module.exports = EcoVacsControl;

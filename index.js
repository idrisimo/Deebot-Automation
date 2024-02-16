const EcoVacsControl = require('./EcoVacsControl');

const ecoVacsControl = new EcoVacsControl();
ecoVacsControl.connectAndControl().then(() => {
    ecoVacsControl.cleanRoom(0); 
});


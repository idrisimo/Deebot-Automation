const EcoVacsControl = require('../../EcoVacsControl');

exports.handler = async (event, context) => {
    const ecoVacsControl = new EcoVacsControl();
    ecoVacsControl.connectAndControl()
    // Determine action based on endpoint
    let action;
    const url = '/.netlify/functions/netlifyFunctions'
    switch (event.path) {
        case url.concat("",'/clean/house'):
            action = ecoVacsControl.cleanHouse();
            break;
        
        case url.concat("",'/control/stop-and-go-home'):
            action = ecoVacsControl.stopAndGoHome();
            break;
        case url.concat("",'/control/pause-clean'):
            action = ecoVacsControl.pauseClean();
            break;
        case url.concat("",'/control/resume-clean'):
            action = ecoVacsControl.resumeClean();
            break;
            default:
                const roomNames = {
                    'dining-room': 'Dining room', 
                    'study': 'Study', 
                    'living-room': 'Living room', 
                    'corridor': 'Corridor', 
                    'bedroom': 'Bedroom', 
                    'bathroom': 'Bathroom'
                };
            
                if (event.path.includes('/clean/')) {
                    const roomName = event.path.split('/').pop(); // Extract room name from endpoint
                    console.log(roomName);
            
                    if (roomName in roomNames) {
                        action = ecoVacsControl.cleanRoom(roomNames[roomName]);
                    } else {
                        return {
                            statusCode: 404,
                            body: JSON.stringify({ error: 'Endpoint not found' })
                        };
                    }
                }
                break;            
    }

    try {
        await action;
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Action completed successfully' })
        };
    } catch (error) {
        console.error('Error occurred:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

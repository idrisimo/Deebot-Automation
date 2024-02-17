const EcoVacsControl = require('../../../EcoVacsControl');

exports.handler = async (event, context) => {
    const ecoVacsControl = new EcoVacsControl();
    await ecoVacsControl.connectAndControl();

    // Determine action based on endpoint
    let action;
    switch (event.path) {
        case '/clean/house':
            action = ecoVacsControl.cleanHouse();
            break;
        
        case '/control/stop-and-go-home':
            action = ecoVacsControl.stopAndGoHome();
            break;
        case '/control/pause-clean':
            action = ecoVacsControl.pauseClean();
            break;
        case '/control/resume-clean':
            action = ecoVacsControl.resumeClean();
            break;
        default:
            const roomNames = [
                'Dining room', 
                'Study', 
                'Living room', 
                'Corridor', 
                'Bedroom', 
                'Bathroom'
            ];
            if (event.path.startsWith('/clean/')) {
                const roomName = event.path.split('/').pop(); // Extract room name from endpoint
                if(roomNames.includes(roomName)){
                    action = ecoVacsControl.cleanRoom(roomName);
                } else {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ error: 'Endpoint not found' })
                    };
                }
            } 
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

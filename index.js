//http://localhost:3000/clean/

const express = require('express');
const EcoVacsControl = require('./EcoVacsControl');

const app = express();
const ecoVacsControl = new EcoVacsControl();

// Connect to Ecovacs and control
ecoVacsControl.connectAndControl().then(() => {
    // Helper function to generate room-specific endpoints
    function createRoomEndpoint(roomName) {
        app.get(`/clean/${roomName}`, async (req, res) => {
            try {
                await ecoVacsControl.cleanRoom(roomName);
                res.status(200).json({ message: `Cleaning room: ${roomName}` });
            } catch (error) {
                console.error(`Error cleaning room ${roomName}:`, error);
                res.status(500).json({ error: `Failed to clean room ${roomName}` });
            }
        });
    }
    app.get('/clean/house', async (req, res) => {
        try {
            await ecoVacsControl.cleanHouse();
            res.status(200).json({ message: 'Cleaning the entire house' });
        } catch (error) {
            console.error('Error cleaning the house:', error);
            res.status(500).json({ error: 'Failed to clean the house' });
        }
    });
        // Stop and send the vacuum to the dock
        app.get('/control/stop-and-go-home', async (req, res) => {
            try {
                await ecoVacsControl.stopAndGoHome();
                res.status(200).json({ message: 'Stopping and returning to dock' });
            } catch (error) {
                console.error('Error stopping and returning to dock:', error);
                res.status(500).json({ error: 'Failed to stop and return to dock' });
            }
        });
    
        // Pause the cleaning process
        app.get('/control/pause-clean', async (req, res) => {
            try {
                await ecoVacsControl.pauseClean();
                res.status(200).json({ message: 'Pausing cleaning process' });
            } catch (error) {
                console.error('Error pausing cleaning process:', error);
                res.status(500).json({ error: 'Failed to pause cleaning process' });
            }
        });
    
        // Resume the cleaning process
        app.get('/control/resume-clean', async (req, res) => {
            try {
                await ecoVacsControl.resumeClean();
                res.status(200).json({ message: 'Resuming cleaning process' });
            } catch (error) {
                console.error('Error resuming cleaning process:', error);
                res.status(500).json({ error: 'Failed to resume cleaning process' });
            }
        });

    // Define your room names
    const roomNames = [
        'Dining room', 
        'Study', 
        'Living room', 
        'Corridor', 
        'Bedroom', 
        'Bathroom'
    ];

    // Create endpoints for each room
    roomNames.forEach(roomName => createRoomEndpoint(roomName));

    // Start the Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect and control Ecovacs:', error);
});

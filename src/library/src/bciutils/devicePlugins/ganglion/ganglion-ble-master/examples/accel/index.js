
let ganglion;

const onConnectClick = async () => {
    ganglion = new Ganglion({ accelData: true });
    await ganglion.connect();
    await ganglion.start();
    ganglion.accelData
        .subscribe(sample => {
            console.log('sample with accelData', sample);
        });
};

const onDisconnectClick = async () => {
    ganglion.disconnect();
};

document.getElementById('connect')
    .addEventListener('click', onConnectClick);

document.getElementById('disconnect')
    .addEventListener('click', onDisconnectClick);
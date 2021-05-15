
let ganglion;

const onConnectClick = async () => {
    ganglion = new Ganglion();
    await ganglion.connect();
    await ganglion.start();
    ganglion.stream.subscribe(sample => {
        console.log('sample', sample);
    });
};

const onDisconnectClick = async () => {
    ganglion.disconnect();
};

document.getElementById('connect')
    .addEventListener('click', onConnectClick);

document.getElementById('disconnect')
    .addEventListener('click', onDisconnectClick);
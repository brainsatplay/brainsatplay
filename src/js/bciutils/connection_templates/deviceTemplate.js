//Template system to feed into the deviceStream class for creating possible configurations. 
//Just fill out the template functions accordingly and add this class (with a unique name) to the list of usable devices.


class device {
    constructor() {
        this.name = 'device';
        this.sps = '';
        this.scalar = 1; //Voltage scalar (e.g. if you have raw ADC values)
        
        this.class = null; //Invoke a device class here if needed
    }

    init = () => {

    }

    connect = () => {

    }

    disconnect = () => {

    }


}
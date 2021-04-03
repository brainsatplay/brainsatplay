
export class geolocateJS {
    constructor() {
      if(navigator.geolocation) {
        
      } else {
        alert("Geolocation not supported in this browser!");
      }

      this.locationData = [];
    }

    showPosition(position) {
      // alert("Lat: "+position.coords.latitude+", Lon: "+position.coords.longitude);
      this.locationData.push(new Date().toISOString() + "," + position.coords.latitude + "," + position.coords.longitude);
      return position;
    }

    getPosition() {
      navigator.geolocation.getCurrentPosition(this.showPosition);
    }

}
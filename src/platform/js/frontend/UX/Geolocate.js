
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

    getPosition = () => {
      let position = undefined;
      navigator.geolocation.getCurrentPosition((position)=>{
        position = this.showPosition();
      },(e)=>{console.error(e)});
      return position;
    }

}
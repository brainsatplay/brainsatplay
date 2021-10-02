
export class StorageManager{
    constructor(method = 'local'){
        
        this.defaultMethod = method

    }

    set(route, item, value, method=this.defaultMethod) {
        switch(method){
            case 'mongodb':
                return this._setMongoDB(route, item, value)
            case 'google':
                return this._setGoogle(route, item, value)
            case 'local': 
                return this._setLocal(route, item, value)
        }
    }

    get(route, item, method=this.defaultMethod) {
        switch(method){
            case 'mongodb':
                return this._getMongoDB(route, item)
            case 'google':
                return this._getGoogle(route, item)
            case 'local': 
                return this._getLocal(route, item)
        }
    }



    // Set Methods
    _setMongoDB = (route, item, value) => {

    }

    _setGoogle = (route, item, value) => {
        
    }

    _setLocal = (route, item, value) => {
        return localStorage.setItem(route + item , value);
    }

    // Get Methods
    _getMongoDB = (route, item, value) => {

    }

    _getGoogle = (route, item, value) => {
        
    }

    _getLocal = (route, item) => {
        return JSON.parse(localStorage.getItem(route + item))
    }
}
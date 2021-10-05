
export class StorageManager{
    constructor(session, method = 'local'){
        
        this.session = session
        this.defaultMethod = method

    }

    set(route, item, value, method=this.defaultMethod) {

        // redefine
        item = this._encode(item)
        route = this._encode(route)

        switch(method){
            case 'mongodb':
                return this._setMongoDB(route, item, value)
            case 'google':
                return this._setGoogle(route, item, value)
            case 'local': 
                return this._setLocal(route, item, value)
        }
    }

    async get(route, item, method=this.defaultMethod) {

        // encode
        item = this._encode(item)
        route = this._encode(route)

        // Route Only: Find Matches and Return as Array
        if (item == null){

            // Local Storage
            // for (var key in localStorage) if (key.includes(`${route}_`)) matches.push(this.get(route, key, method))

            // IndexedDB
            let files = await this.session.dataManager.readFiles(`/${route}/`)
            // res = Promise.all([res])

            let contents = []
            await Promise.all(files.map(async (key) => {
                let res = await this.get(route, key, method)
                contents.push(res)
                return res
            }));

            return contents
        } 
        
        // Route and Item: Grab Specific Value
        else {
            let val;
            switch(method){
                case 'mongodb':
                    val = await this._getMongoDB(route, item)
                case 'google':
                    val = await this._getGoogle(route, item)
                case 'local': 
                    val =  await this._getLocal(route, item)
            }
            return val
        }
    }



    // Set Methods
    _setMongoDB = (route, item, value) => {

    }

    _setGoogle = (route, item, value) => {
        
    }

    _setLocal = (route, item, value) => {

        // Local Storage
        // return localStorage.setItem(`${route}_${item.replace(' ', '')}`, value);

        // IndexedDB
        let query = `/${route}/${item}`
        let file = JSON.stringify(value) ?? value.toString()

        return this.session.dataManager.saveFile(file, query)
    }

    // Get Methods
    _getMongoDB = (route, item, value) => {

    }

    _getGoogle = (route, item, value) => {
        
    }

    _getLocal = async (route, item) => {


            // Local Storage
            // let res = localStorage.getItem(`${route}_${item.replace(' ', '')}`)
            // // Booleans
            // try {
            //     return JSON.parse(res)
            // } 
            
            // // Strings
            // catch {
            //     return JSON.parse(JSON.stringify(res))
            // }

            // IndexedDB
            let res = await this.session.dataManager.readFile(`/${route}/${item}`)

            if (res != undefined) {

                // Reverse Stringification
                try {
                    res = JSON.parse(res)
                    return res
                } 
                
                // Create Class from String
                catch (e){
                    try {
                        let cls = eval(`(${res})`)
                        return cls
                    } 
                    catch (e){
                        try {
                            let val = eval(`${res}`)
                            return val
                        } 
                        catch (e){
                            console.error(e)
                        }  
                    }   
                }
            }
    }

    _encode(str){
        if (str != null) return str.replace(' ', '').toLowerCase();
    }
}
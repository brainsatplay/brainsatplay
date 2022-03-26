//Local and MongoDB database functions
//Users, user data, notifications, access controls
// Joshua Brewster, Garrett Flynn, AGPL v3.0
// import ObjectID from "bson-objectid"
// import { UserObject } from '../../common/general.types';
import { Router } from "../../core/Router";
import { Service } from "../../core/Service";
// import { randomId, pseudoObjectId } from '../../common/id.utils';
import * as mongooseExtension from './mongoose.extension'

type CollectionsType = {
    users?: CollectionType
    [x:string]: CollectionType
}


type CollectionType = any | {
    instance?: any; // MongoDB Collection Instance
    match?: string[],
    filters?: {
        post: (user, args,collections) => boolean,
        get: (responseArr, collections) => boolean,
        delete: (user, args, collections) => boolean
    }
}


type DatabaseMode = 'local' | ('mongodb' | 'mongo' | 'mongoose') | string 


class DatabaseService extends Service {
    
    name = 'database'
    controller: Router;
    collections: CollectionsType = {}


    constructor (Router, dbOptions:{
        collections?: CollectionsType
    } = {}, debug=true) {
        super(Router)

        // Experimental APIs
        // https://developer.mozilla.org/en-US/docs/Web/API/StorageManager
        // console.log(globalThis.navigator?.storage)

        // https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
        // https://developer.mozilla.org/en-US/docs/Web/API/FileSystem
        // https://web.dev/file-system-access/
        // https://stackoverflow.com/questions/65086325/how-to-stream-files-to-and-from-the-computer-in-browser-javascript

        // if(!Router) { console.error('Requires a Router instance.'); return; }

        // Fill in Default collections
        if (!dbOptions.collections) dbOptions.collections = {}
        Object.values(dbOptions.collections).forEach(o => o.reference = {})
        this.collections = dbOptions.collections // Add Reference for Local Data

        // Populate Collections Object & Routes
        for (let key in this.collections){

            // Populate Filters
            if (!this.collections[key].filters) this.collections[key].filters = {}
            if (!this.collections[key].filters.get) this.collections[key].filters.get = () => true // Filter Nothing
            if (!this.collections[key].filters.post) this.collections[key].filters.post = () => true // Pass
            if (!this.collections[key].filters.delete) this.collections[key].filters.delete = () => true // Pass


            // Grab Object Reference
            const object = this.collections[key].reference

            const getHandler = async (...args: any[]) => {
    
                let data = []
                args = args
                .filter(v => typeof v === 'string')
                .map(v => {
                    const split = v.split(',')
                    if (split.length > 0) return split
                    else return [v]
                }) // TODO: Allow JSON passing

                const len:number = args.length
                const values = args.shift() ?? [undefined]

                await Promise.all(values.map(async v => {

                    const query:any[] = []
                    if (this.collections[key].match) this.collections[key].match.forEach(k => query.push({[k]: v}))
                    
                    // Check MongoDB or Local
                    if(this.collections[key].model) data.push(await mongooseExtension.get(this, this.collections[key].model, query, v))
                    else {
                        data.push((len > 0) ? Object.values(object).find((dict) => {
                            query.forEach(o => {
                                const k = Object.keys(o)[0]
                                return dict[k] === o[k]
                            })
                        }) : object)
                    }
                }))


                // Drill Into Properties
                try {
                    args.forEach(k => data = data[k[0]]) // Only drill by the first value
                } catch (e) {}

                // Check Permission to Access Data
                return (typeof data === 'object' && data != null) 
                ? await Object.values(data).filter((v) => this.collections[key].filters.get(v, this.collections))  // Object
                : (this.collections[key].filters.get(data, this.collections)) ? data : null // Single  Non-Object
            }

            this.routes.push({
                route: `${key}/**`,

                // Generic Get Handler
                get: {
                    object,
                    transform: getHandler
                },

                // Generic Delete Handler
                delete: async (self, args, origin): Promise<boolean> => {

                    // Don't Allow Users to Delete until Logged In
                    const u = self.USERS[origin]
                    if (!u) return null

                    // Check filters
                    let passed = (this.collections[key]?.filters?.delete) ? await this.collections[key].filters.delete(u, args, this.collections) : true
                    if (passed) {
                        // Set MongoDB or Local
                        if(this.collections[key].model) {

                            let o = await getHandler(...args)
                            if (o) {
                                await mongooseExtension.del(this, this.collections[key].model, args[0])
                                return true
                            } else return false
                            // if(u.id !== userId) this.router.sendMsg(userId,'deleted',userId);
                        }
                        else {
                            let s = this.collections[key].reference[args[0]._id] // Delete by ObjectID only
                            if(s) {

                                const toDelete = this.collections[key].reference[s._id]
                                delete this.collections[key].reference[s._id]
                                if (toDelete) return true
                                else return false
                            }
                        }
                    } return null
                }, 
                
                // Generic Post Handler
                post: async (self, args, origin): Promise<boolean | any[]> => {
                    
                    // Don't Allow Users to Request until Logged In
                    const u = self.USERS[origin]

                    if (!u) return null

                    let data;
                    if (args.length === 0) return getHandler(...args) // Use Get if post has no arguments
                    // Check filters
                    let passed = (this.collections[key]?.filters?.post) ? await this.collections[key].filters.post(u, args, this.collections) : true
                    if (passed) {
                        // Set MongoDB or Local
                        if(this.collections[key].model) {
                            data = await mongooseExtension.post(this, this.collections[key].model, args)
                        }
                        else {
                            // TODO: Ensure this is actually the right scope (may be args[0])
                            args.forEach((s)=> this.collections[key].reference[s._id] = s);
                        }

                    } else return null

                    return !!data // Return Boolean
                }
            })
        }
    }
}

export default DatabaseService

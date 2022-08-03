import ObjectID from "bson-objectid"
import { AuthorizationStruct, CommentStruct, GroupStruct, ProfileStruct } from "brainsatplay-data/dist/src/types";
import { Routes, Service, ServiceOptions } from "../Service";
import { UserProps } from '../../routers/users/User.router'

export const randomId = (prefix?) => ((prefix) ? `${prefix}_` : '')  + Math.floor(1000000000000000*Math.random())

export const toObjectID = (str) => {
    return (typeof str === 'string' && str.length === 24) ? ObjectID(str) : str //wraps a string with an objectid if it isn't
}

export const getStringId = (mongoid:string|ObjectID) => {
    if(typeof mongoid === 'object') return mongoid.toString() //parse strig from mongo objectid
    else return mongoid;
}

type CollectionsType = {
    users?: CollectionType
    [x:string]: CollectionType
}

type CollectionType = any | {
    instance?: any; // MongoDB Collection Instance
    reference: {[key:string]:any}
    // match?: string[],
    // filters?: {
    //     post: (user, args,collections) => boolean,
    //     get: (responseArr, collections) => boolean,
    //     delete: (user, args, collections) => boolean
    // }
}

export type UserStruct = UserProps & ProfileStruct;

const defaultCollections = [
    'profile',
    'group',
    'authorization',
    'discussion',
    'chatroom',
    'comment',
    'dataInstance',
    'event',
    'notification',
    'schedule',
    'date'
];

export class StructBackend extends Service {
    
    name='structs'

    debug:boolean=false;

    db: any; // mongodb instance (mongoose)
    users:{[key:string]:{_id:string, [key:string]:any}} = {}
    collections: CollectionsType = {}
    mode: 'local' | 'mongodb' | string 
    useAuths: boolean = true //check if the user querying has the correct permissions 

    constructor(
        options?:ServiceOptions,
        dboptions?:{
            users?:{[key:string]:{_id:string, [key:string]:any}},
            mode?:'local' | 'mongodb' | string,
            db?:any, //mongodb instance (mongoose)
            collections?:CollectionsType
        }
    ) {
        super(options);
        this.load(this.routes);
        if(dboptions?.users) this.users = dboptions.users; //set the reference so this keeps concurrent with the user router
        if(dboptions?.db) this.mode = (this.db) ? ((dboptions.mode) ? dboptions.mode : 'local') : 'local'
        if(dboptions?.collections) this.collections = dboptions.collections;
        defaultCollections.forEach(k => {
            if (!this.collections[k])  {
                this.collections[k] = (this.db) ? {instance: this.db.collection(k)} : {}
                this.collections[k].reference = {}
            }
        })


    }

    //------------------------------------
    //routes to be loaded
    query = async (self=this, origin:any, user:Partial<UserStruct>,collection?:any,queryObj?:any,findOne?:boolean,skip?:number) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        if(this.mode.indexOf('mongo') > -1) {
            return await this.queryMongo(user,collection,queryObj,findOne,skip)
        } else {
            let res = this.getLocalData(user,collection);
            if(res && !Array.isArray(res)) {
                let passed = !this.useAuths;
                if(!res?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,res);
            }
            if(typeof skip === 'number' && Array.isArray(res)) if(res.length > skip) res.splice(0,skip);
            let data:any[] = [];
            if(res) await Promise.all(res.map(async(s) => {
                let struct = this.getLocalData(getStringId(s._id));
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                if(passed) data.push(struct);
            }));
            return data;
        }
    }

    getUser = async (self=this, origin:any, user:Partial<UserStruct>,lookupId:string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data:any;
        if(this.mode.indexOf('mongo') > -1) {
            data = await this.getMongoUser(user,lookupId);
        } else {
            let struct = this.getLocalData('profile',{_id:lookupId});
            if(!struct) data = {user:{}};
            else {
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                if(passed) {
                    let groups = this.getLocalData('group',{ownerId:lookupId});
                    let auths = this.getLocalData('authorization',{ownerId:lookupId});
                    data = {user:struct,groups:groups,authorizations:auths};
                } else data = {user:{}};
            }
        }
        if(this.debug) console.log('getUser: user:',user,'input:',lookupId,'output',data)
        return data;
    }

    setUser = async (self=this, origin:any, user:Partial<UserStruct>, struct:Partial<UserStruct>) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data:any;
        if(this.mode.indexOf('mongo') > -1) {
            data = await this.setMongoUser(user,struct);
        } else {
            let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct, 'WRITE');
                if(passed) this.setLocalData(struct);
                return true;
            }
            if(this.debug) console.log('setUser user:',user,'input:',struct,'output',data)
            return data;
    }

    getUsersByIds = async (self=this, origin:any, user:Partial<UserStruct>, userIds:string[]) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.getMongoUsersByIds(user,userIds);
        } else {
            data = [];
            if(Array.isArray(userIds)) {
                let struct = this.getLocalData('profile',{_id:userIds});
                if(struct) data.push(struct);
            }
        }
        if(this.debug) console.log('getUserByIds: user:',user,'input:',userIds,'output',data)
        return data;
    }

    getUsersByRole = async (self=this, origin:any, user:Partial<UserStruct>, role:string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.getMongoUsersByRole(user,role);
        } else {
            let profiles = this.getLocalData('profile');
            data = [];
            profiles.forEach((struct) => {
                if(struct.userRoles[role]) {
                    data.push(struct);
                }
            });
        }
        if(this.debug) console.log('getUserByRoles: user:',user,'input:',role,'output',data)
        return data;
    }

    deleteUser = async (self=this, origin:any, user:Partial<UserStruct>, userId:string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.deleteMongoUser(user,userId);
        } else {
            data = false;
            let struct = this.getLocalData(userId);
            if(struct) {
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct,'WRITE');
                if(passed) data = this.deleteLocalData(struct);
            }
        }
        if(this.debug) console.log('deleteUser: user:',user,'input:',userId,'output',data)
        return data;
    }

    setData = async (self=this, origin:any, user:Partial<UserStruct>, structs:any[], notify?:boolean) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;

        if(this.mode.includes('mongo')) {
            data = await this.setMongoData(user,structs,notify); //input array of structs
        } else { 
            let non_notes:any[] = [];
            data = [];
            await Promise.all(structs.map(async(structId) => {
                let struct = this.getLocalData(structId);
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user, struct,'WRITE');
                if(passed) {
                    if(!this.collections[struct.structType]) {
                        this.collections[struct.structType] = (this.db) ? {instance: this.db.collection(struct.structType)} : {}
                        this.collections[struct.structType].reference = {}
                    }
                    this.setLocalData(struct);
                    data.push(struct);
                    if(struct.structType !== 'notification') non_notes.push(struct);
                }
            }));
            if(non_notes.length > 0 && (notify === true || typeof notify === 'undefined')) this.checkToNotify(user, non_notes, this.mode);
            if(this.debug) console.log('setData:',user,structs,data);
            return true;
        }
        if(this.debug) console.log('setData: user:',user,'input:',structs,notify,'output',data)
        return data;
    }

    getData = async (self=this, origin:any, user:Partial<UserStruct>, collection?: string, ownerId?: string, dict?: any, limit?: number, skip?: number) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.getMongoData(user, collection, ownerId, dict, limit, skip);
        } else {
            data = [];
            let structs;
            if(collection) structs = this.getLocalData(collection);
            if(structs && ownerId) structs = structs.filter((o)=>{if(o.ownerId === ownerId) return true;});
            //bandaid
            if(structs) await Promise.all(structs.map(async(s) => {
                let struct = this.getLocalData(getStringId(s._id));
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                if(passed) data.push(struct);
            }));
        }
        if(this.debug) console.log('getData: user:',user,'input:',collection, ownerId, dict, limit, skip,'output',data)
        return data;
    }

    getDataByIds = async (self=this, origin:any, user:Partial<UserStruct>, structIds:string[], ownerId?:string, collection?:string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.getMongoDataByIds(user, structIds, ownerId, collection);
        } else {
            data = [];
            let structs;
            if(collection) structs = this.getLocalData(collection);
            if(structs && ownerId) structs = structs.filter((o)=>{if(o.ownerId === ownerId) return true;});
            if(structs)await Promise.all(structs.map(async(s) => {
                let struct = this.getLocalData(getStringId(s._id));
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                if(passed) data.push(struct);
            }));
        }
        if(this.debug) console.log('getDataByIds: user:',user,'input:',structIds,ownerId,collection,'output',data)
        return data;
    }

    getAllData = async (self=this, origin:any, user:Partial<UserStruct>, ownerId:string, excludedCollections?:string[]) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.getAllUserMongoData(user,ownerId,excludedCollections);
        } else {
            let result = this.getLocalData(undefined,{ownerId:ownerId});
            data = [];
            await Promise.all(result.map(async (struct) => {
                if(excludedCollections) {
                    if(excludedCollections.indexOf(struct.structType) < 0) {
                        let passed = !this.useAuths;
                        if(!struct?.ownerId) passed = true;
                        else if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                        if(passed) data.push(struct);
                    }
                } else {
                    let passed = !this.useAuths;
                    
                    if(!struct?.ownerId) passed = true;
                    else if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                    if(passed) data.push(struct);
                }
            }));
        }
        if(this.debug) console.log('getAllData: user:',user,'input:',ownerId, excludedCollections,'output',data)
        return data;
    }   

    deleteData = async (self=this, origin:any, user:Partial<UserStruct>, structIds:string[]) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.deleteMongoData(user,structIds);
        } else {
            data = false;
            await Promise.all(structIds.map(async (structId) => {
                let struct = this.getLocalData(structId);
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct,'WRITE');
                if(passed) this.deleteLocalData(struct);
                data = true;
            }));
        }
        if(this.debug) console.log('deleteData: user:',user,'input:',structIds,'output',data)
        return data;
    }

    getUserGroups = async (self=this, origin:any, user:Partial<UserStruct>, userId?:string, groupId?:string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.getMongoGroups(user,userId,groupId);
        } else {
            if(typeof groupId === 'string') {
                data = this.getLocalData('group',{_id:groupId});
            } else {
                data = [];
                let result = this.getLocalData('group');
                if(userId) {
                    result.forEach((struct)=>{
                        if(Object.keys(struct.users).includes(userId)) data.push(struct);
                    });
                }
                else {
                    result.forEach((struct)=>{
                        if(Object.keys(struct.users).includes(getStringId(user._id as string|ObjectID))) data.push(struct);
                    });
                }
            }
        }
        if(this.debug) console.log('getGroups: user:',user,'input:',userId, groupId,'output',data)
        return data;
    }

    deleteGroup = async (self=this, origin:any, user:Partial<UserStruct>, groupId:string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.deleteMongoGroup(user,groupId);
        } else {
            let struct = this.getLocalData('group',groupId);
            let passed = !this.useAuths;
            if(struct) {
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct,'WRITE');
            }
            if(passed) {
                data = true;
            }
        }
        if(this.debug) console.log('deleteGroup: user:',user,'input:',groupId,'output',data)
        return data;
    }

    getAuthorizations = async (self=this, origin:any, user:Partial<UserStruct>, ownerId?: string, authId?: string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.getMongoAuthorizations(user,ownerId,authId);
        } else {
            if(authId) {
                let result = this.getLocalData('authorization',{_id:authId});
                if(result) data = [result];
            } else {
                data = this.getLocalData('authorization',{ownerId});
            }
        }
        if(this.debug) console.log('getAuths: user:',user,'input:',ownerId,authId,'output',data)
        return data;
    }

    deleteAuthorization = async (self=this, origin:any, user:Partial<UserStruct>, authId:string) => {
        if(!user && origin) {user = this.users[origin]}
        if(!user) return false;

        let data;
        if(this.mode.includes('mongo')) {
            data = await this.deleteMongoAuthorization(user,authId);
        } else {
            data = true;
            let struct = this.getLocalData('authorization',{_id:authId});
            if(struct) {
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct,'WRITE');
                if(passed) data = this.deleteLocalData(struct);
            }
        } 
        if(this.debug) console.log('deleteAuth: user:',user,'input:',authId,'output',data)
        return data;
    }

    //------------------------------------

    //internalish stuff
     
    notificationStruct(parentStruct:any= {}) {
        let structType = 'notification';
        let struct = {
            structType:structType,
            timestamp:Date.now(),
            _id:randomId(structType),
            note:'',
            alert:false, //can throw an alert if there is an alert flag on the struct
            ownerId: '',
            parentUserId: '',
            parent: {structType:parentStruct?.structType,_id:getStringId(parentStruct?._id)}, //where it belongs
        };

        return struct;
    }    

    //when passing structs to be set, check them for if notifications need to be created
    //TODO: need to make this more flexible in the cases you DON'T want an update
    async checkToNotify(user:Partial<UserStruct>,structs:any[]=[], mode=this.mode) {
        //console.log('CHECK TO NOTIFY', structs)
        if(structs.length === 0) return false;
        if(typeof user === 'string') {
            for (let key in this.users){
                const obj = this.users[key]
                if (getStringId(obj._id) === (user as any)) user = obj;
            }
        }
        if(typeof user === 'string' || user == null) return false;
        let usersToNotify = {};
        //console.log('Check to notify ',user,structs);

        let newNotifications :any[] = [];
        structs.forEach(async (struct)=>{
            if(struct?._id) {
                if (user?._id !== struct.ownerId) { //a struct you own being updated by another user
                    let newNotification = this.notificationStruct(struct);
                    newNotification._id = 'notification_'+getStringId(struct._id); //overwrites notifications for the same parent
                    newNotification.ownerId = struct.ownerId;
                    newNotification.note = struct.structType; //redundant now
                    newNotification.parentUserId = struct.ownerId;
                    if(struct.alert) newNotification.alert = struct.alert;
                    newNotifications.push(newNotification);
                    usersToNotify[struct.ownerId] = struct.ownerId;
                }
                if(struct.users) { //explicit user ids assigned to this struct
                    //console.log(struct.users);
                    Object.keys(struct.users).forEach((usr)=>{
                        if(usr !== user._id as string) {
                            let newNotification = this.notificationStruct(struct);
                            newNotification._id = 'notification_'+getStringId(struct._id); //overwrites notifications for the same parent
                            newNotification.ownerId = usr;
                            newNotification.note = struct.structType;
                            if(struct.alert) newNotification.alert = struct.alert;
                            newNotification.parentUserId = struct.ownerId;
                            newNotifications.push(newNotification);
                            usersToNotify[usr] = usr;
                        }
                    });
                }
                else { //users not explicitly assigned so check if there are authorized users with access
                    let auths :any[] = [];
                    if(mode.includes('mongo')) {
                        let s = this.collections.authorization.instance.find({ $or:[{authorizedId: user._id as string},{authorizerId: user._id as string}] });
                        if(await s.count() > 0) {
                            await s.forEach(d => auths.push(d));
                        }
                    } else {
                        auths = this.getLocalData('authorization',{authorizedId:user._id as string});
                        auths.push(...this.getLocalData('authorization',{authorizerId:user._id as string}));
                    }
                    if(auths.length > 0) {
                        auths.forEach((auth)=>{
                            if(struct.authorizerId === struct.ownerId && !usersToNotify[struct.authorizedId]) {
                                if(auth.status === 'OKAY' && auth.authorizations['peer']) {
                                    let newNotification =  this.notificationStruct(struct);
                                    newNotification.ownerId = auth.authorizedId;
                                    newNotification._id = 'notification_'+getStringId(struct._id); //overwrites notifications for the same parent
                                    newNotification.note = struct.structType;
                                    newNotification.parentUserId = struct.ownerId;
                                    if(struct.alert) newNotification.alert = struct.alert;
                                    newNotifications.push(newNotification);
                                    usersToNotify[newNotification.ownerId] = newNotification.ownerId;
                                }
                            }
                        });
                    }
                }
            }
        });
        
        //console.log('new notifications\n\n', JSON.stringify(newNotifications), '\n\nfor structs\n\n', JSON.stringify(structs));
        //console.log('NEW NOTIFICATIONS', newNotifications)
        if(newNotifications.length > 0) {
            if(mode.includes('mongo')){
                await this.setMongoData(user, newNotifications); //set the DB, let the user get them 
            } else {
                this.setLocalData(newNotifications);
            }
            // console.log(usersToNotify);
            for(const uid in usersToNotify) {
                this.users[uid].send({route:'structNotification',args:true});
            }

            return true;
        } else return false;
    }

    //general mongodb query
    async queryMongo(user:Partial<UserStruct>,collection:string, queryObj:any={}, findOne:boolean=false, skip:number=0) {
        if(!collection && !queryObj) return undefined;
        else if(findOne){
            let res = this.db.collection(collection).findOne(queryObj);
            if(!res) return undefined;
            let passed = !this.useAuths;
            if(!res?.ownerId) {  //return anyway if not matching our struct format
                passed = true;
            }
            else if((getStringId(user._id as string) !== res.ownerId || (getStringId(user._id as string) === res.ownerId && (user.userRoles as any)?.admincontrol))) {
                if(this.useAuths) passed = await this.checkAuthorization(user,res);
            }
            if(passed) return res;
            else return undefined;
        }
        else {
            let res = await this.db.collection(collection).find(queryObj).sort({ $natural: -1 }).skip(skip);
            let structs :any[] = [];
            if(await res.count() > 0) {
                let passed = !this.useAuths;
                let checkedAuth = '';
                await res.forEach(async (s) => {
                    
                    if(!s?.ownerId) {  //return anyway if not matching our struct format
                        passed = true;
                    }
                    else if((getStringId(user._id as string) !== s.ownerId || (getStringId(user._id as string) === s.ownerId && (user.userRoles as any)?.admincontrol)) && checkedAuth !== s.ownerId) {
                        if(this.useAuths) passed = await this.checkAuthorization(user,s);
                        checkedAuth = s.ownerId;
                    }
                    
                    if(passed) structs.push(s);
                })
            }
            return structs;
        }
    }

    //structs can be Struct objects or they can be an array with a secondary option e.g. [Struct,{$push:{x:[1,2,3]}}]
    async setMongoData(user:Partial<UserStruct>,structs:any[] = [], notify=true) {
        
        //console.log(structs,user);
        let firstwrite = false;
        //console.log(structs);
        if(structs.length > 0) {
            let passed = !this.useAuths;
            let checkedAuth = '';
            await Promise.all(structs.map(async (struct) => {
                let secondary = {}; // e.g. $push
                if(Array.isArray(struct)) {
                    secondary = struct[1];
                    struct = struct[0];
                }
                if(!struct?.ownerId) passed = true; //if no owner, it's public
                else if((getStringId(user._id as string) !== struct.ownerId || (getStringId(user._id as string) === struct.ownerId && (user.userRoles as any)?.admincontrol)) && checkedAuth !== struct.ownerId) {
                    if(this.useAuths) passed = await this.checkAuthorization(user,struct,'WRITE');
                    checkedAuth = struct.ownerId;
                }
                if(passed) {
                    if(struct.structType) {

                        if(!this.collections[struct.structType]) {
                            this.collections[struct.structType] = (this.db) ? {instance: this.db.collection(struct.structType)} : {}
                            this.collections[struct.structType].reference = {}
                        }

                        let copy = JSON.parse(JSON.stringify(struct));
                        if(copy._id) delete copy._id;
                        //if(copy._id && copy.structType !== 'profile' && copy.structType !== 'notification')
                        //else copy._id = toObjectID(struct._id);
                        //if(struct.structType === 'notification') console.log(struct);
                        if (struct._id) {
                            if(getStringId(struct._id).includes('defaultId')) {
                                await this.db.collection(struct.structType).insertOne(copy);   
                                firstwrite = true; 
                            }
                            else if (struct.structType === 'notification') await this.db.collection(struct.structType).updateOne({parent: struct.parent, _id:struct._id}, {$set: copy, ...secondary}, {upsert: true, unique: false});
                            else await this.db.collection(struct.structType).updateOne({_id: toObjectID(struct._id)}, {$set: copy, ...secondary}, {upsert: true});
                        } else if(struct.structType) {
                            this.db.collection(struct.structType).insertOne(copy);   
                        }
                    }
                }
            }));

            if((firstwrite as boolean) === true) {
                //console.log('first writes', structs)
                //console.log('firstwrite');
                let toReturn :any[] = []; //pull the server copies with the updated Ids
                await Promise.all(structs.map(async (struct,j)=>{ //for all of the structs we wrote, let's go through and swap out any dummyId references and push updated id references to mapped objects
                    let copy = JSON.parse(JSON.stringify(struct));
                    if(copy._id && copy.structType !== 'profile') delete copy._id;

                    if(struct.structType !== 'comment') {
                        let pulled;
                        if(struct.structType !== 'notification') pulled = await this.db.collection(copy.structType).findOne(copy);
                        if(pulled){
                            pulled._id = getStringId(pulled._id);
                            toReturn.push(pulled);
                        }
                    }
                    else if(struct.structType === 'comment') { //comments are always pushed with their updated counterparts. TODO handle dataInstances
                        let comment = struct as CommentStruct;
                        let copy2 = JSON.parse(JSON.stringify(comment));
                        if(copy2._id) delete copy2._id;
                        let pulledComment = await this.db.collection('comment').findOne(copy2);
                        
                        let replyToId = pulledComment?.replyTo;
                        let replyTo = structs.find((s)=>{
                            if(getStringId(s._id) === replyToId) return true;
                        });
                        if(replyTo) {
                            let copy3 = JSON.parse(JSON.stringify(replyTo));
                            if(copy3._id) delete copy3._id;
                            let pulledReply;

                            await Promise.all(['discussion','chatroom','comment'].map(async (name) => {
                                let found = await this.db.collection(name).findOne({_id:toObjectID(replyToId)});
                                if(found) pulledReply = found;
                            }));
                            //console.log(pulledReply)
                            if(pulledReply) {
                                let roomId = getStringId(pulledComment.parent._id);
                                let room, pulledRoom;
                                if(roomId !== replyToId) {
                                    room = structs.find((s)=>{
                                        if(getStringId(s._id) === roomId) return true;
                                    });
                                    if(room) {
                                        delete room._id;
                                        await Promise.all(['discussion','chatroom'].map(async (name) => {
                                            let found = await this.db.collection(name).findOne(room);
                                            if(found) pulledRoom = found;
                                        }));
                                    }
                                } else pulledRoom = pulledReply;
                                let toUpdate = [pulledComment];
                                if(pulledReply) {
                                    let i = pulledReply.replies.indexOf(getStringId(pulledComment._id));
                                    if(i < 0) {
                                        pulledReply.replies.push(getStringId(pulledComment._id));
                                        pulledComment.replyTo = getStringId(pulledReply._id);
                                    }
                                    toUpdate.push(pulledReply);
                                } 
                                if (pulledRoom) {
                                    let i = pulledRoom.comments.indexOf(pulledComment._id);
                                    if(i < 0) {
                                        pulledRoom.comments.push(getStringId(pulledComment._id));
                                        pulledComment.parent._id = getStringId(pulledRoom._id);
                                    }
                                }
                                await Promise.all(toUpdate.map(async(s)=>{
                                    let copy = JSON.parse(JSON.stringify(s));
                                    delete copy._id;
                                    await this.db.collection(s.structType).updateOne({_id:toObjectID(s._id)},{$set: copy},{upsert: false});
                                }));

                                // console.log('pulled comment',pulledComment)
                                // console.log('pulled replyTo',pulledReply)
                                // console.log('pulled room',pulledRoom);
                                [...toReturn].reverse().forEach((s,j) => {
                                    if(toUpdate.find((o)=>{
                                        if(getStringId(s._id) === getStringId(o._id)) return true;
                                    })){
                                        toReturn.splice(toReturn.length-j-1,1); //pop off redundant
                                    }
                                });
                                toReturn.push(...toUpdate); 
                            } 
                        } else if(pulledComment) {
                            toReturn.push(pulledComment);
                        }
                    }
                }));
                //console.log('toReturn: ',toReturn)
                if(notify) this.checkToNotify(user,toReturn);
                return toReturn;
            }
            else {
                let non_notes :any[] = [];
                structs.forEach((s) => {
                    if(s.structType !== 'notification') non_notes.push(s);
                })
                if(notify) this.checkToNotify(user,non_notes);
                return true;
            }
        }
        else return false;
    }

    async setMongoUser(user:Partial<UserStruct>,struct:Partial<UserStruct>) {

        if(struct._id) { //this has a second id that matches the token id
    
            const _id = toObjectID(struct._id);
            let usersearch = (_id !== struct._id) ? { _id } : {id: struct.id};
            let userexists = await this.collections.profile.instance.findOne(usersearch);
            
            if(userexists) {
                if(getStringId(user._id as string) !== struct.ownerId || (getStringId(user._id as string) === struct.ownerId && (user.userRoles as any)?.admincontrol)) {
                    let passed = !this.useAuths;
                    if(!struct?.ownerId) passed = true;
                    else if(this.useAuths) passed = await this.checkAuthorization(user,struct,'WRITE');
                    if(!passed) return false;
                }
            }

            let copy = JSON.parse(JSON.stringify(struct));

            if(this.debug) console.log('RETURNS PROFILE', struct)
            
            // Only Set _id if Appropriate
            await this.collections.profile.instance.updateOne(usersearch, {$set: copy}, {upsert: true}); 

            user = await this.collections.profile.instance.findOne(usersearch);
            this.checkToNotify(user, [struct]);
            return user as ProfileStruct;
        } else return false;
    }

    async setGroup(user:Partial<UserStruct>,struct:any, mode=this.mode) {
        if(struct?._id) {
            let exists:any = undefined;
            if(mode.includes('mongo')) {
                exists = await this.collections.group.instance.findOne({name:struct.name});
            } else {
                exists = this.getLocalData('group',{_id:getStringId(struct._id)});
            }
            if(exists && (exists.ownerId !== struct.ownerId || struct.admins.indexOf(getStringId(user._id as string)) < 0) ) return false; //BOUNCE

            if(getStringId(user._id as string) !== struct.ownerId) {
                let passed = !this.useAuths;
                if(!struct?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,struct,'WRITE');
                if(!passed) return false;
            }

            let allusers :any[] = [];
            Object.keys(struct.users).forEach((u) => {
                allusers.push({email: u},{id: u},{username:u})    
            });
            
            //replace everything with ids
            let users = {};
            let ids = {};
            if(mode.includes('mongo')) {
                let cursor = this.collections.profile.instance.find({ $or: allusers }); //encryption references
                if( await cursor.count() > 0) {
                    await cursor.forEach((user) => {
                        users[getStringId(user._id as string)] = user;
                        ids[getStringId(user._id as string)] = true;
                    });
                }
            } else {
                allusers.forEach((search) => {
                    let result = this.getLocalData('profile',search);
                    if(result.length > 0) {
                        users[getStringId(result[0]._id)] = result[0];
                        ids[getStringId(result[0]._id)] = true;
                    }
                });
            }

            struct.users = ids;
            let admins = {};
            let peers = {};
            let clients = {};
            Object.keys(users).forEach((id) => {
                let u = users[id];
                if(struct.admins[getStringId(u._id)] || struct.admins[u.email] || struct.admins[u.username] || struct.admins[struct.ownerId]) {
                    if(!admins[getStringId(u._id)]) admins[getStringId(u._id)] = true;
                }
                if(struct.peers[getStringId(u._id)] || struct.peers[u.email] || struct.peers[u.username] || struct.peers[struct.ownerId]) {
                    if(!peers[getStringId(u._id)]) peers[getStringId(u._id)] = true;
                }
                if(struct.clients[getStringId(u._id)] || struct.clients[u.email] || struct.clients[u.username] || struct.clients[struct.ownerId]) {
                    if(!clients[getStringId(u._id)]) clients[getStringId(u._id)] = true;
                }
            });
            struct.admins = admins;
            struct.peers = peers;
            struct.clients = clients;


            //All now replaced with lookup ids

            let copy = JSON.parse(JSON.stringify(struct));
            if(copy._id) delete copy._id;
            //console.log(struct)
            if(mode.includes('mongo')){
                if(getStringId(struct._id).includes('defaultId')) {
                    await this.db.collection(struct.structType).insertOne(copy);
                    delete struct._id;
                    struct = await this.db.collection(struct.structType).findOne(struct);
                    struct._id = getStringId(struct._id);
                }
                else await this.collections.group.instance.updateOne({ _id: toObjectID(struct._id) }, {$set: copy}, {upsert: true}); 
            } else {
                this.setLocalData(struct);
            }
            this.checkToNotify(user, [struct], this.mode);
            //console.log(struct);
            if(this.debug) console.log('setGroup: user:',user,'output',struct)
            return struct as GroupStruct;
        } else return false;
    }

    //
    async getMongoUser(user:Partial<UserStruct>,info='', bypassAuth=false):Promise<{}|{user:ProfileStruct,authorizations:AuthorizationStruct[], groups:GroupStruct[]|{user:ProfileStruct}}>  {
        return new Promise(async resolve => {
            const query:any[] = [{email: info},{id: info},{username:info}]
            try {query.push({_id: toObjectID(info)})} catch (e) {}

            let u = await this.collections.profile.instance.findOne({$or: query}); //encryption references
           
            if(!u || u == null) resolve({});
            else {
                u._id = getStringId(u._id)

                if (!u.ownerId) u.ownerId = u._id

                if (u && bypassAuth === false){
                    if(getStringId(user._id as string) !== u._id || (getStringId(user._id as string) === u._id && (user.userRoles as any)?.admincontrol)) { // TODO: Ensure that passed users will always have the same ObjectId (not necessarily id...)
                        let passed = !this.useAuths;
                        if(this.useAuths) passed = await this.checkAuthorization(user,u);
                        if(!passed) resolve(undefined as any);
                    }
                    // console.log(u);
                    let authorizations :any[] = [];
                    let auths = this.collections.authorization.instance.find({ownerId:u._id});
                    if((await auths.count() > 0)) {
                        await auths.forEach(d => authorizations.push(d));
                    }
                    let gs = this.collections.group.instance.find({users:{$all:[u._id]}});
                    let groups :any[] = [];
                    if((await gs.count() > 0)) {
                        await gs.forEach(d => groups.push(d));
                    }
                    resolve({user:u, authorizations, groups});
                } else resolve({user:u});
            }
        });   
    }

    //safely returns the profile id, username, and email and other basic info based on the user role set applied
    async getMongoUsersByIds(user:Partial<UserStruct>,userIds:any[]=[]) {
        let usrs :any[] = [];
        userIds.forEach((u) => {
            try {usrs.push({_id:toObjectID(u)});} catch {}
        });

        let found :any[] = [];
        if (usrs.length > 0){
            let users = this.collections.profile.instance.find({$or:usrs});
            if(await users.count() > 0) {
                await users.forEach((u) => {
                    found.push(u);
                });
            }
        }

        return found as ProfileStruct[];
    }

    //safely returns the profile id, username, and email and other basic info based on the user role set applied
    async getMongoUsersByRoles(user:Partial<UserStruct>,role:string) {
        let users = this.collections.profile.instance.find({
            userRoles:{$all: {[role]:true}}
        });
        let found :any[] = [];
        if(await users.count() > 0) {
            await users.forEach((u) => {
                found.push(u);
            });
        }
        return found as ProfileStruct[];
    }

    async getMongoDataByIds(user:Partial<UserStruct>, structIds:string[], ownerId:string|undefined, collection:string|undefined) {
        if(structIds.length > 0) {
            let query :any[] = [];
            structIds.forEach(
                (_id)=>{
                    let q = {_id:toObjectID(_id)};
                    if(ownerId) (q as any).ownerId = ownerId;
                    query.push(q);
                })
            let found :any[] = [];
            if(!collection) {
                await Promise.all(Object.keys(this.collections).map(async (name) => {
                    let cursor = await this.db.collection(name).find({$or:query});
                    
                    if(await cursor.count() > 0) {
                        let passed = true;
                        let checkedAuth = '';
                        await cursor.forEach(async (s) => {
                            if(!s?.ownerId) passed = true;
                            else if((getStringId(user._id as string) !== s.ownerId || (getStringId(user._id as string) === s.ownerId && (user.userRoles as any)?.admincontrol)) && checkedAuth !== s.ownerId) {
                                if(this.useAuths) passed = await this.checkAuthorization(user,s);
                                checkedAuth = s.ownerId;
                            }
                            if(passed) found.push(s);
                        })
                    }
                }));
            }
            else {
                let cursor = await this.db.collection(collection).find({$or:query});
                if(await cursor.count() > 0) {
                    let passed = true;
                    let checkedAuth = '';
                    await cursor.forEach(async (s) => {
                        if(!s?.ownerId) passed = true;
                        else if((getStringId(user._id as string) !== s.ownerId || (getStringId(user._id as string) === s.ownerId && (user.userRoles as any)?.admincontrol)) && checkedAuth !== s.ownerId) {
                            if(this.useAuths) passed = await this.checkAuthorization(user,s);
                            checkedAuth = s.ownerId;
                        }
                        if(passed) found.push(s);
                    })
                }
            }
            //console.log('GETTING DATA BY IDS: ', query, 'found:', found);
            return found;
        }
    }

    //get all data for an associated user, can add a search string
    async getMongoData(user:Partial<UserStruct>, collection:string|undefined, ownerId:string|undefined, dict:any|undefined={}, limit=0, skip=0) {
        if (!ownerId) ownerId = dict?.ownerId // TODO: Ensure that replacing ownerId, key, value with dict was successful
        if(!dict) dict = {};
        if (dict._id) dict._id = toObjectID(dict._id)

        let structs :any[] = [];
        let passed = true;
        let checkedAuth = '';
        if(!collection && !ownerId && !dict) return [];
        else if(!collection && ownerId && Object.keys(dict).length === 0) return await this.getAllUserMongoData(user,ownerId);
        else if((!dict || Object.keys(dict).length === 0) && ownerId && collection) {
            let cursor = this.db.collection(collection).find({ownerId}).sort({ $natural: -1 }).skip(skip);
            if(limit > 0) cursor.limit(limit);
            if(await cursor.count() > 0) {
                await cursor.forEach(async (s) => {
                    if(!s?.ownerId) passed = true;
                    else if((getStringId(user._id as string) !== s.ownerId || (getStringId(user._id as string) === s.ownerId && (user.userRoles as any)?.admincontrol)) && checkedAuth !== s.ownerId) {
                        if(this.useAuths) passed = await this.checkAuthorization(user,s);
                        checkedAuth = s.ownerId;
                    }
                    if(passed === true) structs.push(s);
                });
            }
        } else if (Object.keys(dict).length > 0 && ownerId) {
            let found = await this.db.collection(collection).findOne({ownerId:ownerId,...dict});
            if(found) structs.push(found);
        } else if (Object.keys(dict).length > 0 && !ownerId) { //need to search all collections in this case
            await Promise.all(Object.keys(this.collections).map(async (name) => {
                let found = await this.db.collection(name).findOne(dict);
                if(found) {
                    if(!found?.ownerId) passed = true;
                    else if((getStringId(user._id as string) !== found.ownerId  || (getStringId(user._id as string) === found.ownerId && (user.userRoles as any)?.admincontrol)) && checkedAuth !== found.ownerId) {
                        if(this.useAuths) passed = await this.checkAuthorization(user,found);
                        checkedAuth = found.ownerId;
                    }
                    structs.push(found);
                    return
                }
            }));
        }
        //console.log('\n\n\n getData passed:',passed, '\n\n\n res:', JSON.stringify(structs), '\n\nargs', collection, ownerId, JSON.stringify(dict));
        if(!passed) return [];
        return structs;
    }

    async getAllUserMongoData(user:Partial<UserStruct>,ownerId,excluded:any[]=[]) {
        let structs :any[] = [];

        let passed = true;
        let checkedId = '';
        await Promise.all(Object.keys(this.collections).map(async (name,j) => {
            if(passed && excluded.indexOf(name) < 0) {
                let cursor = this.db.collection(name).find({ownerId:ownerId});
                let count = await cursor.count();
                for(let k = 0; k < count; k++) {
                    let struct = await cursor.next();
                    if(!ownerId) passed = true;
                    else if((getStringId(user._id as string) !== ownerId  || (getStringId(user._id as string) === ownerId && (user.userRoles as any)?.admincontrol)) && checkedId !== ownerId) {
                        if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                        //console.log(passed)
                        checkedId = ownerId;
                    }
                    //if(j === 0 && k === 0) console.log(passed,structs);
                    if(passed) structs.push(struct);
                }
                
            }
        }));

        if(!passed) return [];
        //console.log(structs);
        //console.log(passed, structs);
        return structs;
    }

    //passing in structrefs to define the collection (structType) and id
    async getMongoDataByRefs(user:Partial<UserStruct>,structRefs:any[]=[]) {
        let structs :any[] = [];
        //structRef = {structType, id}
        if(structs.length > 0) {
            let checkedAuth = '';
            structRefs.forEach(async (ref)=>{
                if(ref.structType && getStringId(ref._id)) {
                    let struct = await this.db.collection(ref.structType).findOne({_id: toObjectID(ref._id)});
                    if(struct) {
                        let passed = true;
                        if(!struct?.ownerId) passed = true;
                        else if((getStringId(user._id as string) !== struct.ownerId || (getStringId(user._id as string) === struct.ownerId && (user.userRoles as any)?.admincontrol)) && checkedAuth !== struct.ownerId) {
                            if(this.useAuths) passed = await this.checkAuthorization(user,struct);
                            checkedAuth = struct.ownerId;
                        }
                        if(passed === true) {
                            structs.push(struct);
                        }
                    }
                }
            });
        } 
        return structs;
    }

    async getMongoAuthorizations(user:Partial<UserStruct>,ownerId=getStringId(user._id as string), authId='') {
        let auths :any[] = [];
        //console.log(user);
        if(authId.length === 0 ) {
            let cursor = this.collections.authorization.instance.find({ownerId:ownerId});
            if(await cursor.count > 0) {
                await cursor.forEach((a) => {
                    auths.push(a)
                });
            }
        }
        else auths.push(await this.collections.authorization.instance.findOne({_id: toObjectID(authId), ownerId:ownerId}));
        
        if(!auths[0]?.ownerId) true;
        else if(getStringId(user._id as string) !== auths[0]?.ownerId) {
            let passed = !this.useAuths;
            if(this.useAuths) passed = await this.checkAuthorization(user,auths[0]);
            if(!passed) return undefined;
        }
        return auths as AuthorizationStruct[];

    }

    async getMongoGroups(user:Partial<UserStruct>, userId=getStringId(user._id as string), groupId='') {
        let groups :any[] = [];
        if(groupId.length === 0 ) {
            let cursor = this.collections.group.instance.find({users:{$all:[userId]}});
            if(await cursor.count > 0) {
                await cursor.forEach((a) => {
                    groups.push(a)
                });
            }
        }
        else {
            try {groups.push(await this.collections.group.instance.findOne({_id:toObjectID(groupId), users:{$all:[userId]}}));} catch {}
        }

        return groups as GroupStruct[];
    }

    //general delete function
    async deleteMongoData(user:Partial<UserStruct>,structRefs:any[]=[]) {
        // let ids :any[] = [];
        let structs :any[] = [];

        await Promise.all(structRefs.map(async (ref) => {

            try {
                let _id = toObjectID(ref._id)
                let struct = await this.db.collection(ref.structType).findOne({_id});
                if(struct) {
                    structs.push(struct);
                    let notifications = await this.collections.notifications.instance.find({parent:{structType:ref.structType,_id:getStringId(ref._id)}});
                    let count = await notifications.count();
                    for(let i = 0; i < count; i++) {
                        let note = await notifications.next();
                        if(note) structs.push(note); //remove any associated notifications with a piece of data
                    }
                }
            } catch {}

        }));

        let checkedOwner = '';
        await Promise.all(structs.map(async (struct,i)=>{
            let passed = true;
            if(!struct?.ownerId) passed = true;
            else if((struct.ownerId !== getStringId(user._id as string) || (getStringId(user._id as string) === struct.ownerId && (user.userRoles as any)?.admincontrol)) && struct.ownerId !== checkedOwner) {
                checkedOwner = struct.ownerId;
                if(this.useAuths) passed = await this.checkAuthorization(user, struct,'WRITE');
            }
            if(passed) {
                //console.log(passed);
                await this.db.collection(struct.structType).deleteOne({_id:toObjectID(struct._id)});
                //delete any associated notifications, too
                if(struct.users) {
                    Object.keys(struct.users).forEach((uid)=> {
                        if(uid !== getStringId(user._id as string) && uid !== struct.ownerId && this.users[uid]) this.users[uid].send({route:'structDeleted',args:getStringId(struct._id)})
                    });
                }
                if(struct.ownerId !== user._id as string && this.users[struct.ownerId]) {
                    this.users[struct.ownerId].send({route:'structDeleted',args:getStringId(struct._id)})
                }
            }
        }));
        //console.log('deleted', JSON.stringify(structs), 'from', structRefs);
        return true; 
    }

    //specific delete functions (the above works for everything)
    async deleteMongoUser(user:Partial<UserStruct>,userId) {
        
        if(getStringId(user._id as string) !== userId || (getStringId(user._id as string) === userId && (user.userRoles as any)?.admincontrol)) {
            let u = await this.collections.profile.instance.findOne({ id: userId });
            let passed = !this.useAuths;
            if(!u?.ownerId) passed = true;
            else if(this.useAuths) passed = await this.checkAuthorization(user,u,'WRITE');
            if(!passed) return false;
        }

        await this.collections.profile.instance.deleteOne({ id: userId });

        if(getStringId(user._id as string) !== userId && this.users[userId]) this.users[userId].send({route:'structDeleted',args:userId});

        //now delete their authorizations and data too (optional?)
        return true; 
    }

    async deleteMongoGroup(user:Partial<UserStruct>,groupId) {
        let s = await this.collections.group.instance.findOne({ _id: toObjectID(groupId) });
        if(s) {
            if(!s?.ownerId) true;
            else if(getStringId(user._id as string) !== s.ownerId || (getStringId(user._id as string) === s.ownerId && (user.userRoles as any)?.admincontrol) ) {
                let passed = !this.useAuths;
                if(this.useAuths) passed = await this.checkAuthorization(user,s,'WRITE');
                if(!passed) return false;
            }
            if(s.users) {
                Object.keys(s.users).forEach((u) => { this.users[s.authorizerId].send({route:'structDeleted',args:getStringId(s._id)}); });
            }
            await this.collections.group.instance.deleteOne({ _id:toObjectID(groupId) });
            return true;
        } else return false; 
    }


    async deleteMongoAuthorization(user:Partial<UserStruct>,authId) {
        let s = await this.collections.authorization.instance.findOne({ _id: toObjectID(authId) });
        if(s) {
            if(getStringId(user._id as string) !== s.ownerId || (getStringId(user._id as string) === s.ownerId && (user.userRoles as any)?.admincontrol)) {
                let passed = !this.useAuths;
                if(!s?.ownerId) passed = true;
                else if(this.useAuths) passed = await this.checkAuthorization(user,s,'WRITE');
                if(!passed) return false;
            }
            if(s.associatedAuthId) {
                if(this.debug) console.log(s);
                await this.collections.authorization.instance.deleteOne({ _id: toObjectID(s.associatedAuthId) }); //remove the other auth too 
                if(s.authorizerId && s.authorizerId !== getStringId(user._id as string)) this.users[s.authorizerId].send({route:'structDeleted',args:getStringId(s._id)});
                else if (s.authorizedId && s.authorizedId !== getStringId(user._id as string)) this.users[s.authorizerId].send({route:'structDeleted',args:getStringId(s._id)});
            }
            await this.collections.authorization.instance.deleteOne({ _id: toObjectID(authId) });
            return true;
        } else return false; 
    }

    async setAuthorization(user:Partial<UserStruct>, authStruct, mode=this.mode) {
        //check against authorization db to allow or deny client/professional requests.
        //i.e. we need to preauthorize people to use stuff and allow each other to view sensitive data to cover our asses

        /**
         *  structType:'authorization',
            authorizedId:'',
            authorizerId:'',
            authorizedName:'',
            authorizerName:'',
            authorizations:[], //authorization types e.g. what types of data the person has access to
            structIds:[], //necessary files e.g. HIPAA compliance //encrypt all of these individually, decrypt ONLY on access with hash keys and secrets and 2FA stuff
            status:'PENDING',
            expires:'', //PENDING for non-approved auths
            timestamp:Date.now(), //time of creation
            id:randomId(structType),
            ownerId: '',
            parentId: parentStruct?._id, //where it belongs
         */

        let u1, u2;
        if(mode.includes('mongo')) {
            u1 = (await this.getMongoUser(user, authStruct.authorizedId, true) as any).user; //can authorize via email, id, or username
            u2 = (await this.getMongoUser(user, authStruct.authorizerId, true) as any).user;
        } else {
            u1 = this.getLocalData('profile',{'_id':authStruct.authorizedId})[0];
            u2 = this.getLocalData('profile',{'_id':authStruct.authorizerId})[0];
        }

        //console.log(u1,u2)

        if(!u1 || !u2) return false; //no profile data

        if(authStruct.authorizedId !== getStringId(u1._id)) authStruct.authorizedId = getStringId(u1._id);
        if(authStruct.authorizerId !== getStringId(u2._id)) authStruct.authorizerId = getStringId(u2._id);

        if(!authStruct.authorizedName) {
            if(u1.username) authStruct.authorizedName = u1.username;
            else if (u1.email) authStruct.authorizedName = u1.email;
        }
        if(!authStruct.authorizerName) {
            if(u2.username) authStruct.authorizerName = u2.username;
            else if (u2.email) authStruct.authorizerName = u2.email;
        }

        //console.log(authStruct);

        if(!authStruct?.ownerId) true;
        else if((getStringId(user._id as string) !== authStruct.ownerId || (getStringId(user._id as string) === authStruct.ownerId && (user.userRoles as any)?.admincontrol)) && (getStringId(user._id as string) !== authStruct.authorizedId && getStringId(user._id as string) !== authStruct.authorizerId)) {
            let passed = !this.useAuths;
            if(this.useAuths) passed = await this.checkAuthorization(user,authStruct,'WRITE');
            if(!passed) return false;
        }

        let auths :any[] = [];

        if(mode.includes('mongo')){
            let s = this.collections.authorization.instance.find(
                { $and: [ { authorizedId: authStruct.authorizedId }, { authorizerId: authStruct.authorizerId } ] }
            );
            if ((await s.count()) > 0) {
                await s.forEach(d => auths.push(d));
            }
        } else {
            let s = this.getLocalData('authorization',{authorizedId:authStruct.authorizedId});
            if(Array.isArray(s)) {
                s.forEach((d)=>{
                    if(d.authorizerId === authStruct.authorizerId) auths.push(d);
                });
            }
        }

        let otherAuthset;
        if(Array.isArray(auths)) {
            auths.forEach(async (auth) => {
                if(auth.ownerId === getStringId(user._id as string)) { //got your own auth
                    //do nothing, just update your struct on the server if the other isn't found
                } else { //got the other associated user's auth, now can compare and verify
                    if(authStruct.authorizerId === getStringId(user._id as string)) { //if you are the one authorizing
                        auth.authorizations = authStruct.authorizations; //you set their permissions
                        auth.structs = authStruct.structs; //you set their permissions
                        auth.excluded = authStruct.excluded;
                        auth.expires = authStruct.expires;
                        //auth.group = authStruct.group;
                        auth.status = 'OKAY';
                        authStruct.status = 'OKAY'; //now both auths are valid, delete to invalidate
                    } else { //if they are the authorizor
                        authStruct.authorizations = auth.authorizations; //they set your permissions
                        authStruct.structs = auth.structs; //they set your permissions
                        authStruct.excluded = auth.excluded;
                        authStruct.expires = auth.expires;
                        //authStruct.group = auth.group;
                        auth.status = 'OKAY';
                        authStruct.status = 'OKAY'; //now both auths are valid, delete to invalidate
                    }
                    authStruct.associatedAuthId = getStringId(auth._id);
                    auth.associatedAuthId = getStringId(authStruct._id);
                    otherAuthset = auth;
                    let copy = JSON.parse(JSON.stringify(auth));
                    if(mode.includes('mongo')) {
                        delete copy._id;
                        await this.collections.authorization.instance.updateOne({ $and: [ { authorizedId: authStruct.authorizedId }, { authorizerId: authStruct.authorizerId }, { ownerId: auth.ownerId } ] }, {$set: copy}, {upsert: true});
                    } else {
                        this.setLocalData(copy);
                    }
                }
            });
        }

        
        let copy = JSON.parse(JSON.stringify(authStruct));
        if(mode.includes('mongo')) {
            delete copy._id;
            await this.collections.authorization.instance.updateOne({ $and: [ { authorizedId: authStruct.authorizedId }, { authorizerId: authStruct.authorizerId }, { ownerId: authStruct.ownerId } ] }, {$set: copy}, {upsert: true});
        } else {
            this.setLocalData(copy);
        }

        if(getStringId(authStruct._id).includes('defaultId') && mode.includes('mongo')) {
            let replacedAuth = await this.collections.authorization.instance.findOne(copy);
            if(replacedAuth) {
                authStruct._id = getStringId(replacedAuth._id);
                if(otherAuthset) {
                    let otherAuth = await this.collections.authorization.instance.findOne({$and: [ { authorizedId: otherAuthset.authorizedId }, { authorizerId: otherAuthset.authorizerId }, { ownerId: otherAuthset.ownerId } ] });
                    if(otherAuth) {
                        otherAuth.associatedAuthId = getStringId(authStruct._id);
                        let copy2 = JSON.parse(JSON.stringify(otherAuth));
                        delete copy2._id;
                        await this.collections.authorization.instance.updateOne({ $and: [ { authorizedId: otherAuth.authorizedId }, { authorizerId: otherAuth.authorizerId }, { ownerId: otherAuth.ownerId } ] }, {$set: copy2}, {upsert: true}); 
                        this.checkToNotify(user,[otherAuth]);
                    }
                }
            }
        }

        return authStruct as AuthorizationStruct; //pass back the (potentially modified) authStruct
    }

    
    async checkAuthorization(
        user:string|Partial<UserStruct>|{_id:string}, 
        struct, 
        request='READ', //'WRITE'
        mode = this.mode
    ) {
        /*
            If user is not the owner of the struct, check that they have permissions
        */
        //console.log(struct)
        if(!user || !struct) return false;

        if(!struct.ownerId) return true; //no owner, return true

        if(typeof user === 'object') {
            if(struct.ownerId === getStringId(user._id as string)) {
                if((user as ProfileStruct).userRoles?.['admincontrol']) {
                   //do somethign
                }
                else return true; 
            }
        } else if (typeof user === 'string') {
            if(struct.ownerId === user) { 
                return true;
            }
            else user = {_id:user};
        }

        let auth1, auth2;
        if(mode.includes('mongo')) {
            auth1 = await this.collections.authorization.instance.findOne({$or: [{authorizedId:getStringId(user._id as string),authorizerId:struct.ownerId, ownerId:getStringId(user._id as string)},{authorizedId:struct.ownerId,authorizerId:getStringId(user._id as string), ownerId:getStringId(user._id as string)}]});
            auth2 = await this.collections.authorization.instance.findOne({$or: [{authorizedId:getStringId(user._id as string),authorizerId:struct.ownerId, ownerId:struct.ownerId},{authorizedId:struct.ownerId,authorizerId:getStringId(user._id as string), ownerId:struct.ownerId}]});
        }
        else {
            auth1 = this.getLocalData('authorization', {ownerId:getStringId(user._id as string)}).find((o) => {
                if(o.authorizedId === getStringId((user as any)._id) && o.authorizerId === struct.ownerId) return true;
            });
            auth2 = this.getLocalData('authorization', {ownerId:struct.ownerId}).find((o) => {
                if(o.authorizedId === getStringId((user as any)._id) && o.authorizerId === struct.ownerId) return true;
            });
        }
         if(!auth1 || !auth2) {
            //console.log('auth bounced', user, struct, auth1, auth2);
            return false;
        }

        /*
            check if both users have the correct overlapping authorizations for the authorized user for the specific content, check first based on structId metadata to save calls
                i.e. 
                check relevant scenarios like
                e.g. is the user an assigned peer?
                e.g. does this user have the required specific access permissions set? i.e. for different types of sensitive data
        */
    
        let passed = false;

        if(auth1.status === 'OKAY' && auth2.status === 'OKAY') { //both users have the corresponding authorization
            //check permissions on particular structs

            // let checked = this.checkPermissionSets(user, struct, auth1, auth2, request);
            // if(checked !== undefined) passed = checked;

            if(struct.structType === 'group') {
                if (auth1.authorizations[struct.name+'_admin'] && auth2.authorizations[struct.name+'_admin']) passed = true;
                else passed = false;
            }
            //peers have access to most data for a user
            else if(auth1.authorizations['peer'] && auth2.authorizations['peer']) passed = true;
            //admincontrol will reject the user's own attempts to modify their data
            else if(auth1.authorizations['admincontrol'] && auth2.authorizations['admincontrol']) passed = true;
            //included specific structs
            else if (auth1.structIds[getStringId(struct._id)] && auth2.structIds[getStringId(struct._id)]) passed = true;
            //exclude collections from writing
            else if (auth1.excluded[struct.structType] && struct.ownerId === getStringId(user._id as string) && request === 'WRITE') passed = false;
            //other filters?
        }

        //if(!passed) console.log('auth bounced', auth1, auth2);

        return passed;
    }

    // permissionSets = [ //return undefined to pass to next or return a boolean to break the checks
    //     (user, struct, auth1, auth2, request) => {
    //         if (auth1.excluded[struct.structType] && struct.ownerId === getStringId(user._id as string) && request === 'WRITE') return false;
    //     },
    //     (user, struct, auth1, auth2, request) => {
    //         if(struct.structType === 'group') {
    //             if (auth1.authorizations[struct.name+'_admin'] && auth2.authorizations[struct.name+'_admin']) return true;
    //             else return false;
    //         }
    //     },
    //     (user, struct, auth1, auth2, request) => {
    //         if(auth1.authorizations['peer'] && auth2.authorizations['peer']) return true;
    //     },
    //     (user, struct, auth1, auth2, request) => {
    //         if(auth1.authorizations['admincontrol'] && auth2.authorizations['admincontrol']) return true;
    //     },
    //     (user, struct, auth1, auth2, request) => {
    //         if (auth1.structIds[getStringId(struct._id)] && auth2.structIds[getStringId(struct._id)]) return true;
    //     }
    // ]

    // //return undefined if nothing passes
    // checkPermissionSets(user, struct, auth1, auth2, request): boolean|undefined {
    //     let checked:any = undefined;
    //     for(let i = 0; i < this.permissionSets.length; i++) {
    //         checked = this.permissionSets[i](user,struct,auth1,auth2,request);
    //         if(checked !== undefined) break;
    //     }
    //     return checked;
    // }

    // addPermissionSet(callback=(struct, auth1, auth2)=>{return true;}) {
    //     if(typeof callback === 'function') {
    //         this.permissionSets.push(callback);
    //         return true;
    //     }
    //     return false;
    // }

    wipeDB = async () => {
        //await this.collections.authorization.instance.deleteMany({});
        //await this.collections.group.instance.deleteMany({});
        await Promise.all(Object.values(this.collections).map((c:any) => {
            try{
                c.instance.remove({})
            }
            catch(err) {}
        }))

        return true;
    }


    //Local Data stuff (for non-mongodb usage of this server)

    //just assigns replacement object to old object if it exists, keeps things from losing parent context in UI
    overwriteLocalData (structs) {
        if(Array.isArray(structs)){
            structs.forEach((struct) => {
                let localdat =  this.getLocalData(struct.structType,{'ownerId': struct.ownerId, '_id':getStringId(struct._id)});
                if(!localdat || localdat?.length === 0) {
                    this.setLocalData(struct);       //set
                }
                else Object.assign(localdat,struct); //overwrite
            })
        } else {
            let localdat =  this.getLocalData(structs.structType,{'ownerId': structs.ownerId, '_id':getStringId(structs._id)});
            if(!localdat || localdat?.length === 0) {
                this.setLocalData(structs);       //set
            }
            else Object.assign(localdat,structs); //overwrite
        }
    }

    setLocalData (structs) {

        let setInCollection = (s) => {
            let type = s.structType;
            let collection = this.collections[type]?.reference
            if(!collection) {
                collection = {}
                if (!this.collections[type]) this.collections[type] = {}
                this.collections[type].reference = collection
            }
            collection[getStringId(s._id)] = s

        }

        if(Array.isArray(structs)) {
            structs.forEach((s)=>{
                setInCollection(s)
            });
        }
        else setInCollection(structs)
    }

    //pull a struct by collection, owner, and key/value pair from the local platform, leave collection blank to pull all ownerId associated data
    getLocalData(collection, query?): any {

        // Split Query
        let ownerId, key, value;
        if (typeof query === 'object'){
            ownerId = query.ownerId
            // TODO: Make more robust. Does not support more than one key (aside from ownerId)
            const keys = Object.keys(query).filter(k => k != 'ownerId')
            key = keys[0]
            value = query[key]
        } else value = query
        
        if (!collection && !ownerId && !key && !value) return [];

        let result :any[] = [];
        if(!collection && (ownerId || key)) {
            Object.values(this.collections).forEach((c: any) => { //search all collections
                c = c.reference // Drop to reference
                if((key === '_id' || key === 'id') && value) {
                    let found = c[value]
                    if(found) result.push(found);
                }
                else {
                    Object.values(c).forEach((struct:any) => {
                        if(key && value) {
                            if(struct[key] === value && struct.ownerId === ownerId) {
                                result.push(struct);
                            }
                        }
                        else if(struct.ownerId === ownerId) {
                            result.push(struct);
                        }
                    });
                }
            });
            return result;
        }
        else {
            let c = this.collections[collection]?.reference
            if(!c) return result; 

            if(!key && !ownerId) {
                Object.values(c).forEach((struct) => {result.push(struct);})
                return result; //return the whole collection
            }
            
            if((key === '_id' || key === 'id') && value) return getStringId(c[value]) //collections store structs by id so just get the one struct
            else {
                Object.keys(c).forEach((k) => {
                    const struct = c[k]
                    if(key && value && !ownerId) {
                        if(struct[key] === value) result.push(struct);
                    }   
                    else if(ownerId && !key) {
                        if(struct.ownerId === ownerId) result.push(struct);
                    } 
                    else if (ownerId && key && value) {
                        if(struct.ownerId === ownerId && struct[key]) {
                            if(struct[key] === value) result.push(struct);
                        }
                    }
                });
            }
        }
        return result;                            //return an array of results
    }

    
    deleteLocalData(struct) {
        if(!struct) throw new Error('Struct not supplied')
        if(!struct.structType || !struct._id) return false;

        // Delete the Reference by ID
        if (this.collections[struct.structType]) delete this.collections[struct.structType].reference[struct._id]
        return true;
    }

    routes:Routes = {
        query:this.query,
        getUser:this.getUser,
        setUser:this.setUser,
        getUsersByIds:this.getUsersByIds,
        getUsersByRole:this.getUsersByRole,
        deleteUser:this.deleteUser,
        setData:this.setData,
        getData:this.getData,
        getDataByIds:this.getDataByIds,
        getAllData:this.getAllData,
        deleteData:this.deleteData,
        getUserGroups:this.getUserGroups,
        setGroup:this.setGroup,
        deleteGroup:this.deleteGroup,
        setAuthorization:this.setAuthorization,
        getAuthorizations:this.getAuthorizations,
        deleteAuthorization:this.deleteAuthorization
    }

}
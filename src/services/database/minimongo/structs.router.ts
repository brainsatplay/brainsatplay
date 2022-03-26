import { DataTablet, DS } from 'brainsatplay-data'
import { UserObject, RouterOptions, ArbitraryObject } from '../../../common/general.types';
import { Router } from '../../../core/Router'
import { randomId } from '../../../common/id.utils';
import StructService from './structs.service';
import { dbOptions } from '../types/database.types';
//Joshua Brewster, Garrett Flynn   -   GNU Affero GPL V3.0 License
//
// Description
// A client-side Router class with macros for struct management
//

export default class StructRouter extends Router {

    currentUser: Partial<UserObject> // Different from this.user (base user)
		        
    tablet = new DataTablet(); //DataTablet 
    collections = this.tablet.collections;
    
    id: string = randomId()

    constructor (userInfo:Partial<UserObject>={}, options?:RouterOptions, dbOptions:dbOptions={}) {
        super(options)

        if (userInfo instanceof Object && Object.keys(userInfo).length > 0) this.setupUser(userInfo) // Declares currentUser
       
        // Auto-Connect Database Client Service
        this.load(new StructService(this, dbOptions)) // TODO: Why load?
    }

    //TODO: make this able to be awaited to return the currentUser
    //uses a bunch of the functions below to set up a user and get their data w/ some cross checking for consistent profiles
    async setupUser(userinfo:Partial<UserObject>, callback=(currentUser)=>{}) {

        if(!userinfo) {
            console.error('must provide an info object! e.g. {_id:"abc123"}');
            callback(undefined);
            return undefined;
        }
        let changed = false;

        if(userinfo.id) userinfo._id = userinfo.id;

        // let res = await this.login();
        console.log("Generating/Getting User: ", userinfo._id)
        let user = await this.getUser(userinfo._id);
        // console.log("getUser", user);
        let u;
        let newu = false;
        if (!user) return false
        else if(!user._id) { //no profile, create new one and push initial results
            // if(!userinfo._id) userinfo._id = userinfo._id;
            u = this.userStruct(userinfo,true);
            newu = true;
            let wasSet = await this.setUser(u);
            let structs = this.getLocalData(undefined,{'ownerId': u._id});
            if(structs?.length > 0) this.updateServerData(structs, (data)=>{
                console.log('setData', data);
            });

            this.setAuthorizationsByGroup(u);
        }
        else {
            u = user.user;
            // u._id = user._id; //replace the unique mongo id for the secondary profile struct with the id for the userinfo for temp lookup purposes
            
            for(const prop in userinfo) { //checking that the token and user profile overlap correctly
                let dummystruct = this.userStruct();
                if(u[prop] && prop !== '_id') {
                    if(Array.isArray(userinfo[prop])) {
                        for(let i = 0; i < u[prop].length; i++) { //check user props that are not in the token
                            //console.log(userinfo[prop][i]);
                            if(userinfo[prop].indexOf(u[prop][i]) < 0) {
                                u[prop] = userinfo[prop]; 
                                changed = true;
                                break;
                            }
                        }
                        if(!changed) for(let i = 0; i < userinfo[prop].length; i++) { //check tlken props that are not in the user
                            //console.log(userinfo[prop][i]);
                            if(u[prop].indexOf(userinfo[prop][i]) < 0) {
                                u[prop] = userinfo[prop]; 
                                changed = true;
                                break;
                            }
                        }
                    }
                    else if(u[prop] !== userinfo[prop]) { 
                        u[prop] = userinfo[prop];  
                        changed = true;
                    }
                } else if (u[prop] !== userinfo[prop] && typeof dummystruct[prop] == 'string' && prop !== '_id') {
                    //console.log(prop, u[prop])
                    u[prop] = userinfo[prop];  
                    changed = true;
                }
            }

            if(user?.authorizations){
                if(Array.isArray(user.authorizations)) {
                    this.setLocalData(user.authorizations);
                }
            }

            if (user?.groups){
                if(Array.isArray(user.groups)) {
                    this.setLocalData(user.groups);
                }
            }
        }

        if(newu) {this.currentUser = u; this.setLocalData(u);}
        else {
            let data = await this.getAllUserData(u._id,undefined);

            console.log("getServerData", data);
            if(!data || data.length === 0) { 
            } else {
                this.setLocalData(data);
                
                //resolve redundant notifications
                let notes = data.filter((s) => {
                    if(s.structType === 'notification') {
                        if(this.getLocalData('authorization',s.parent._id)) {  
                            return true;
                        }
                        if(s.parent.structType === 'user' || s.parent.structType === 'authorization') {
                            return true;
                        }
                        if(!this.getLocalData(s.parent.structType,s.parent._id))
                            return true;
                    }
                });

                //resolves extraneous comments
                let comments = data.filter((s) => {
                    if(s.structType === 'comment') {                           
                        return true;
                    }
                });

                let toDelete = [];
                comments.forEach((comment) => {
                    if(!this.getLocalData('comment',{'_id':comment._id})) toDelete.push(comment._id);
                });
                if(toDelete.length > 0) this.deleteData(toDelete); //extraneous comments

                if(notes.length > 0) {
                    this.resolveNotifications(notes, false, undefined);
                    changed = true;
                }

                let filtered = data.filter((o) => {
                    if(o.structType !== 'notification') return true;
                });

                if(this.tablet) this.tablet.sortStructsIntoTable(filtered);

            }

            // u = new UserObj(u)
            // u = getUserCodes(u, true)
            this.setLocalData(u); //user is now set up in whatever case 
            
            console.log('currentUser', u)
            this.currentUser = u;  
            console.log('collections', this.tablet.collections);
        }
        callback(this.currentUser);
        return this.currentUser;
    }

    //default socket response for the platform
    baseServerCallback = (data) => {

        let structs = data;
        if(typeof data === 'object' && data?.structType) structs = [data];
        if(Array.isArray(data)) { //getUserData response
            
            let filtered = structs.filter((o) => {
                if(o.structType !== 'notification') return true;
            });

            if(this.tablet) this.tablet.sortStructsIntoTable(filtered);

            structs.forEach((struct)=>{
                if((!struct.structType) || struct.structType === 'USER') {
                    // console.log(struct)
                    if(struct.email) struct.structType = 'user';
                    else struct.structType = 'uncategorized';
                }
                if(struct.structType === 'user' || struct.structType === 'authorization' || struct.structType === 'group') {
                    if(struct.structType === 'user') {
                        struct._id = struct.id; //replacer
                        // struct = new UserObj(struct); // set user obj
                        // struct = getUserCodes(struct, true);
                    }
                    this.setLocalData(struct);
                } else {

                    if(struct.structType === 'notification') {
                        let found = this.getLocalData('notification',{'ownerId': struct.ownerId, '_id':struct.parent._id});
                        if(found) {
                            this.setLocalData(struct);
                        } else {
                            if(this.getLocalData(struct.structType,{'_id':struct.parent._id})) {
                                //this.resolveNotifications([struct],false);
                            } else {
                                this.overwriteLocalData(struct);
                            }
                        }

                        // TODO: Ignores notifications when the current user still has not resolved
                        if(struct.ownerId === this.currentUser?._id && 
                            (struct.parent.structType === 'user' || //all of the notification instances we want to pull automatically, chats etc should resolve when we want to view/are actively viewing them
                            struct.parent.structType === 'dataInstance'  || 
                            struct.parent.structType === 'schedule'  || 
                            struct.parent.structType === 'authorization')) 
                            {
                            this.resolveNotifications([struct],true);
                        }
                    } else { 
                        this.overwriteLocalData(struct);
                        //console.log(struct)
                    }
                }
            });
        } 

        if (data?.message === 'notifications') {
            this.checkForNotifications(); //pull notifications
        }
        if (data?.message === 'deleted') {
            this.deleteLocalData(data.id); //remove local instance
        }
        
        this.onResult(data);
    }

    //just a customizable callback to preserve the default while adding your own
    onResult(data) {

    }


    //---------------------------------------------
    
    randomId(tag = '') {
        return `${tag+Math.floor(Math.random()+Math.random()*Math.random()*10000000000000000)}`;
    }    

    //generically add any struct to a user's server data

    /**
        let struct = {
            _id: randomId(structType+'defaultId'),   //random id associated for unique identification, used for lookup and indexing
            structType: structType,     //this is how you will look it up by type in the server
            ownerId: parentUser?._id,     //owner user
            timestamp: Date.now(),      //date of creation
            parent: {structType:parentStruct?.structType,_id:parentStruct?._id}, //parent struct it's associated with (e.g. if it needs to spawn with it)
        }
     */
    async addStruct (
        structType:string='struct', 
        props:any={}, //add any props you want to set, adding users[] with ids will tell who to notify if this struct is updated
        parentUser:any={}, 
        parentStruct:any={}, 
        updateServer:boolean = true
    ) {
        let newStruct = DS.Struct(structType, props, parentUser, parentStruct);

        if(updateServer) newStruct = await this.updateServerData([newStruct])[0];

        return newStruct;
    }
    
    //simple response test
    async ping(callback=(res)=>{console.log(res);}) {
        let res = (await this.send('ping'))?.[0]
        callback(res)
        return res
    }

    //send a direct message to somebody
    async sendMessage(userId:string='',message:any='',data:any=undefined,callback=(res)=>{console.log(res);}) {
        let args = [userId,message];
        if(data) args[2] = data;

        let res = (await this.send('sendMessage', ...args))?.[0]
        callback(res)
        return res
    }

    //info can be email, id, username, or name. Returns their profile and authorizations
    async getUser (info:string|number='',callback=this.baseServerCallback) {
        let res = (await this.send({
            service: 'database',
            route: 'getUser'
        }, info))?.[0]
        callback(res)
        return res
    }

    //get user basic info by id
    async getUsers (ids:string|number[]=[],callback=this.baseServerCallback) {
        let res = (await this.send({
            route:  'getUsers',
            service: 'structs'
        }, ...ids))?.[0] // Pass Array
        callback(res)
        return res
    }
    
    //info can be email, id, username, or name. Returns their profile and authorizations
    async getUsersByRoles (userRoles:string[]=[],callback=this.baseServerCallback) {
        let res = (await this.send('database/getUsersByRoles', userRoles))?.[0]
        callback(res)
        return res
    }

    //pull all of the collections (except excluded collection names e.g. 'groups') for a user from the server
    async getAllUserData(ownerId:string|number, excluded=[], callback=this.baseServerCallback) {
        let res = (await this.send('structs/getAllData', ownerId, excluded))?.[0]
        callback(res)
        return res
    }

    //get data by specified details from the server. You can provide only one of the first 3 elements. The searchDict is for mongoDB search keys
    async getData(collection:string,ownerId?:string|number|undefined,searchDict?,limit:number=0,skip:number=0,callback=this.baseServerCallback) {
        let res = (await this.send('structs/getData', collection,ownerId,searchDict,limit,skip))?.[0]
        callback(res);
        return res;
    }

    //get data by specified details from the server. You can provide only one of the first 3 elements. The searchDict is for mongoDB search keys
    async getDataByIds(structIds=[],ownerId?:string|number|undefined,collection?:string|undefined,callback=this.baseServerCallback) {
        let res = (await this.send('structs/getDataByIdss', structIds, ownerId, collection))?.[0]
        callback(res);
        return res
    }

    //get struct based on the parentId 
    async getStructParentData (struct:any,callback=this.baseServerCallback) {
        if(!struct.parent) return;
        let args = [struct.parent?.structType,'_id',struct.parent?._id];

        let res = (await this.send('structs/getData', ...args))?.[0]
        callback(res);
        return res;
    }
    
    // //get struct(s) based on an array of ids or string id in the parent struct
    // async getStructChildData (struct,childPropName='', limit=0, skip=0, callback=this.baseServerCallback) {
    //     let children = struct[childPropName];
    //     if(!children) return;
      
    //     return await this.WebsocketClient.run(
    //         'getChildren',
    //         [children,limit,skip],
    //         this.socketId,
    //         this.WebsocketClient.origin,
    //         callback
    //     );
    // }

    
    //sets the user profile data on the server
    async setUser (userStruct={},callback=this.baseServerCallback) {
        let res = (await this.send('structs/users', this.stripStruct(userStruct)))?.[0]
        callback(res)
        return res
    }

    //updates a user's necessary profile details if there are any discrepancies with the token
    async checkUserToken(usertoken,user=this.currentUser,callback=this.baseServerCallback) {
        if(!usertoken) return false;
        let changed = false;
        for(const prop in usertoken) {
            let dummystruct = this.userStruct()
            if(user[prop] && prop !== '_id') {
                //console.log(prop)
                if (Array.isArray(usertoken[prop])) {
                    for(let i = 0; i < user[prop].length; i++) { //check user props that are not in the token
                        //console.log(usertoken[prop][i]);
                        if(usertoken[prop].indexOf(user[prop][i]) < 0) {
                            user[prop] = usertoken[prop]; 
                            changed = true;
                            break;
                        }
                    }
                    if(!changed) for(let i = 0; i < usertoken[prop].length; i++) { //check token props that are not in the user
                        //console.log(usertoken[prop][i]);
                        if(user[prop].indexOf(usertoken[prop][i]) < 0) {
                            user[prop] = usertoken[prop]; 
                            changed = true;
                            break;
                        }
                    }
                }
                else if(user[prop] !== usertoken[prop]) { 
                    user[prop] = usertoken[prop];  changed = true;
                }
            } else if (!user[prop] && dummystruct[prop]) {
                user[prop] = usertoken[prop];  changed = true;
            }
        }
        if(changed) return await this.setUser(user,callback);
        return changed;
    }

    /* strip circular references and update data on the server */
    async updateServerData (structs=[],callback=this.baseServerCallback) {
        const copies = new Array();
        structs.forEach((struct)=>{
            copies.push(this.stripStruct(struct));
        })

        let res = (await this.send('structs/setData', ...copies))?.[0]
        callback(res)
        return res

    }
    
    //delete a list of structs from local and server
    async deleteData (structs=[],callback=this.baseServerCallback) {
        let toDelete = [];
        structs.forEach((struct) => {
            if(struct?.structType && struct?._id) {
            toDelete.push(
                {
                    structType:struct.structType,
                    _id:struct._id
                }
            );
            this.deleteLocalData(struct);
            }
        });

        console.log('deleting',toDelete);
        let res = (await this.send('structs/deleteData', ...toDelete))?.[0]
        callback(res)
        return res

    }

    //delete user profile by ID on the server
    async deleteUser (userId, callback=this.baseServerCallback) {
        if(!userId) return;

        let res = (await this.send({
            route:  'deleteUser',
            service: 'structs'
        }, userId))?.[0]
        callback(res)
        return res
    }

    //set a group struct on the server
    async setGroup (groupStruct={},callback=this.baseServerCallback) {
        let res = (await this.send({
            route:  'setGroup',
            service: 'structs'
        }, this.stripStruct(groupStruct)))?.[0]
        callback(res)
        return res
    }

    //get group structs or single one by Id
    async getGroups (userId=this.currentUser._id, groupId='',callback=this.baseServerCallback) {
        let res = (await this.send({
            route:  'setGroups',
            service: 'structs'
        }, userId,groupId))?.[0]
        callback(res)
        return res
    }

    //deletes a group off the server
    async deleteGroup (groupId,callback=this.baseServerCallback) {
        if(!groupId) return;
        this.deleteLocalData(groupId);

        let res = (await this.send({
            route:  'deleteGroup',
            service: 'structs'
        }, groupId))?.[0]
        callback(res)
        return res
    }

    //set an authorization struct on the server
    async setAuthorization (authorizationStruct={},callback=this.baseServerCallback) {

        let res = (await this.send({
            route:  'setAuthorization',
            service: 'structs'
        }, this.stripStruct(authorizationStruct)))?.[0]
        callback(res)
        return res
    }

    //get an authorization struct by Id
    async getAuthorizations (userId=this.currentUser?._id, authorizationId='',callback=this.baseServerCallback) {
        if(userId === undefined) return;
        let res = (await this.send({
            route:  'getAuthorization/'+ userId,
            service: 'structs'
        }, authorizationId))?.[0]
        callback(res)
        return res
    }

    //delete an authoriztion off the server
    async deleteAuthorization (authorizationId,callback=this.baseServerCallback) {
        if(!authorizationId) return;
        this.deleteLocalData(authorizationId);
        
        let res = (await this.send({
            route:  'deleteAuthorization',
            service: 'structs'
        }, authorizationId))?.[0]
        callback(res)
        return res
    }

    //notifications are GENERALIZED for all structs, where all authorized users will receive notifications when those structs are updated
    async checkForNotifications(userId=this.currentUser?._id) {
        return await this.getData('notification',userId);
    }

    
    //pass notifications you're ready to resolve and set pull to true to grab the associated data structure.
    resolveNotifications = async (notifications=[], pull=true, user=this.currentUser) => {
        if(!user || notifications.length === 0) return;
        let structIds = [];
        let notificationIds = [];
        let nTypes = [];
        //console.log(notifications);
        let unote = false;
        if(notifications.length === 0) notifications = this.getLocalData('notification',{'ownerId':user._id});
        notifications.forEach((struct)=>{
            if(struct.parent.structType === 'user') unote = true;
            nTypes.push(struct.parent.structType);
            structIds.push(struct.parent._id);
            notificationIds.push(struct._id);
            //console.log(struct)
            this.deleteLocalData(struct); //delete local entries and update profile
            //console.log(this.structs.get(struct._id));
        });

        this.deleteData(notificationIds); //delete server entries
        if(pull) {
            nTypes.reverse().forEach((note,i)=>{
                // if(note === 'comment') { //when resolving comments we need to pull the tree (temp)
                //     this.getParentData(structIds[i],(res)=>{
                //         this.defaultCallback(res);
                //         if(res.data) this.getChildData(res.data._id,'comments');
                //     });
                //     structIds.splice(i,1);
                // }
                if(note === 'user') {
                    this.getUser(notificationIds[i]);
                    structIds.splice(structIds.length-i-1,1);
                }
            });
            if(structIds.length > 0) return await this.getDataByIds(structIds,user._id,'notification');
        }
        return true;
    } 


    //setup authorizations automatically based on group
    async setAuthorizationsByGroup(user=this.currentUser) {

        let auths = this.getLocalData('authorization',{'ownerId': user._id});
        // console.log(u);

        user.userRoles.forEach((group)=>{ //auto generate access authorizations accordingly
            //group format e.g.
            //reddoor_client
            //reddoor_peer
            let split = group.split('_');
            let team = split[0];
            let otherrole;
            if(group.includes('client')) {
                otherrole = team+'_peer';
            } else if (group.includes('peer')) {
                otherrole = team+'_client';
            } else if (group.includes('admin')) {
                otherrole = team+'_owner';
            }
            if(otherrole) {
                this.getUsersByRoles([otherrole],(data) => {
                    //console.log(res.data)
                    data?.forEach((groupie)=>{
                        let theirname = groupie.username;
                        if(!theirname) theirname = groupie.email;
                        if(!theirname) theirname = groupie.id;
                        let myname = user.username;
                        if(!myname) myname = user.email;
                        if(!myname) myname = user.id;

                        if(theirname !== myname) {
                            if(group.includes('client')) {

                                //don't re-set up existing authorizations 
                                let found = auths.find((a)=>{
                                    if(a.authorizerId === groupie.id && a.authorizedId === user.id) return true;
                                });

                                if(!found) this.authorizeUser(
                                    user,
                                    groupie.id,
                                    theirname,
                                    user.id,
                                    myname,
                                    ['peer'],
                                    undefined,
                                    [group]
                                )   
                            } else if (group.includes('peer')) {

                                //don't re-set up existing authorizations 
                                let found = auths.find((a)=>{
                                    if(a.authorizedId === groupie.id && a.authorizerId === user.id) return true;
                                });

                                if(!found) this.authorizeUser(
                                    user,
                                    user.id,
                                    myname,
                                    groupie.id,
                                    theirname,
                                    ['peer'],
                                    undefined,
                                    [group]
                                )   
                            }
                        }
                    });
                });
            }
        });
    }

    
    //delete a discussion or chatroom and associated comments
    async deleteRoom(roomStruct) {
        if(!roomStruct) return false;

        let toDelete = [roomStruct];

        roomStruct.comments?.forEach((id)=>{
            let struct = this.getLocalData('comment',{'_id':id});
            toDelete.push(struct);
        });

        if(roomStruct)
            return await this.deleteData(toDelete);
        else return false;

    }

    //delete comment and associated replies by recursive gets
    async deleteComment(commentStruct) {
        let allReplies = [commentStruct];
        let getRepliesRecursive = (head=commentStruct) => {
            if(head?.replies) {
                head.replies.forEach((replyId) => {
                    let reply = this.getLocalData('comment',{'_id':replyId});
                    if(reply) {
                        if(reply.replies.length > 0) {
                            reply.replies.forEach((replyId2) => {
                                getRepliesRecursive(replyId2); //check down a level if it exists
                            });
                        }
                        allReplies.push(reply); //then return this level's id
                    }
                });
            }
        }
        
        getRepliesRecursive(commentStruct);
        
        //need to wipe the commentIds off the parent struct comments and replyTo replies
        let parent = this.getLocalData(commentStruct.parent?.structType,{'_id':commentStruct.parent?._id})
        let toUpdate = [];
        if(parent) {
            toUpdate = [parent];
            allReplies.forEach((r) => {
                let idx = parent.replies?.indexOf(r._id);
                if(idx > -1) parent.replies.splice(idx,1);
                let idx2 = parent.comments?.indexOf(r._id);
                if(idx2 > -1) parent.comments.splice(idx2,1);
            });
        }
        let replyTo = this.getLocalData('comment',{'_id':commentStruct.replyTo});
        if(replyTo?._id !== parent?._id) {
            let idx = replyTo.replies?.indexOf(parent._id); // NOTE: Should this look for the corresponding parent id?
            if(idx > -1) replyTo.replies.splice(idx,1);
            toUpdate.push(replyTo);
        }

        if(toUpdate.length > 0) await this.updateServerData(toUpdate);
        return await this.deleteData(allReplies);
        
    }

    //get user data by their auth struct (e.g. if you don't grab their id directly), includes collection, limits, skips
    async getUserDataByAuthorization (authorizationStruct, collection, searchDict, limit=0, skip=0, callback=this.baseServerCallback) {

        let u = authorizationStruct.authorizerId;
        if(u) {
            return new Promise(async resolve => {
               this.getUser(u,async (data)=> {
                    if(!collection) await this.getAllUserData(u,['notification'],callback);
                    else await this.getData(collection,u,searchDict,limit,skip,callback);

                    resolve(data)
                    callback(data);
                }); //gets profile deets
            })
        } else return undefined;
    }

    //get user data for all users in a group, includes collection, limits, skips
    async getUserDataByAuthorizationGroup (groupId='', collection, searchDict, limit=0, skip=0, callback=this.baseServerCallback) {
        let auths = this.getLocalData('authorization');

        let results = [];
        await Promise.all(auths.map(async (o) => {
            if(o.groups?.includes(groupId)) {
                let u = o.authorizerId;
                if(u) {
                    let data;
                    let user = await this.getUser(u,callback);
                    
                    if(user) results.push(user);
                    if(!collection) data = await this.getAllUserData(u,['notification'],callback);
                    else data = await this.getData(collection,u,searchDict,limit,skip,callback);
                    if(data) results.push(data);
                }
                return true;
            }
        }))
        
        return results; //will be a weird result till this is tested more
    }

    //

    //just assigns replacement object to old object if it exists, keeps things from losing parent context in UI
    overwriteLocalData (structs) {
        if(Array.isArray(structs)){
            structs.forEach((struct) => {
                let localdat =  this.getLocalData(struct.structType,{'ownerId': struct.ownerId, '_id':struct._id});
                if(!localdat || localdat?.length === 0) {
                    this.setLocalData(struct);       //set
                }
                else Object.assign(localdat,struct); //overwrite
            })
        } else {
            let localdat =  this.getLocalData(structs.structType,{'ownerId': structs.ownerId, '_id':structs._id});
            if(!localdat || localdat?.length === 0) {
                this.setLocalData(structs);       //set
            }
            else Object.assign(localdat,structs); //overwrite
        }
    }

    setLocalData (structs) {
        this.tablet.setLocalData(structs);
    }

    //pull a struct by collection, owner, and key/value pair from the local platform, leave collection blank to pull all ownerId associated data
    getLocalData(collection, query?) {
        return this.tablet.getLocalData(collection,query);
    }

    //get auths where you have granted somebody peer access
    getLocalUserPeerIds = (user=this.currentUser) => {
        if(!user) return [];
        let result = [];
        let authorizations = this.getLocalData('authorization',user._id);
        authorizations.forEach((a)=>{
            if(a.authorizations.indexOf('peer') > -1 && a.authorizerId === user._id) result.push(a.authorizedId);
        });
        return result;
    }

    getLocalReplies(struct) {
        let replies = [];

        if(!struct.replies) return replies;
        else if (struct.replies.reduce((a,b) => a*((typeof b === 'object')? 1 : 0), 1)) return struct.replies // just return objects
        
        replies = this.getLocalData('comment',{'replyTo':struct._id});
        return replies;
    }

    hasLocalAuthorization(otherUserId, ownerId=this.currentUser._id) {
        let auths = this.getLocalData('authorization',{ownerId});
        let found = auths.find((a) => {
            if(a.authorizedId === ownerId && a.authorizerId === otherUserId) return true;
            if(a.authorizerId === ownerId && a.authorizedId === otherUserId) return true;
        });
        if(found){
            return found;
        } else return false;
    }

    //pass a single struct or array of structs
    deleteLocalData(structs) {
        if(Array.isArray(structs)) structs.forEach(s => this.deleteStruct(s));
        else this.deleteStruct(structs); //single
        return true;
    }

    deleteStruct(struct) {
        if(typeof struct === 'string') struct = this.getLocalData(struct); //get the struct if an id was supplied
        if(!struct) throw new Error('Struct not supplied')
        if(!struct.structType || !struct._id) return false;
        this.tablet.collections.get(struct.structType).delete(struct._id);
        return true;
    }

    //strips circular references from the struct used clientside, returns a soft copy with the changes
    stripStruct(struct={}) {
        const copy = Object.assign({ }, struct);
        for(const prop in copy) {
            if(copy[prop] === undefined || copy[prop].constructor.name === 'Map') delete copy[prop]; //delete undefined 
        }
        return copy;
    }

    //create a struct with the prepared props to be filled out
    createStruct(structType,props,parentUser=this.currentUser,parentStruct?):any {
        let struct = DS.Struct(structType,props,parentUser,parentStruct)
        return struct;
    }

    userStruct (props: {
        _id?: string
        id?: string
    }={}, currentUser=false) {
        let user = DS.ProfileStruct(undefined,props,undefined,props);

        if(props._id) user.id = props._id; //references the token id
        else if(props.id) user.id = props.id;
        else user.id = 'user'+Math.floor(Math.random()*10000000000);
        user._id = user.id; //for mongo stuff
        user.ownerId = user.id;
        for(const prop in props) {
            if(Object.keys(DS.ProfileStruct()).indexOf(prop) < 0) {
                delete user[prop];
            } //delete non-dependent data (e.g. tokens we only want to keep in a secure collection)
        }
        if(currentUser) this.currentUser = user;
        return user as ArbitraryObject
    }

    //TODO: Update the rest of these to use the DB structs but this should all work the same for now
    authorizeUser = async (
        parentUser=this.userStruct(),
        authorizerUserId='',
        authorizerUserName='',
        authorizedUserId='',
        authorizedUserName='',
        authorizations=[], // TODO: really any[] or has type??
        structs=[],
        excluded=[],
        groups=[],
        expires=false
    ) => {
        let newAuthorization = this.createStruct('authorization',undefined,parentUser,undefined);  
        newAuthorization.authorizedId = authorizedUserId; // Only pass ID
        newAuthorization.authorizedName = authorizedUserName; //set name
        newAuthorization.authorizerId = authorizerUserId; // Only pass ID
        newAuthorization.authorizerName = authorizerUserName; //set name
        newAuthorization.authorizations = authorizations;
        newAuthorization.structs = structs;
        newAuthorization.excluded = excluded;
        newAuthorization.groups = groups;
        newAuthorization.expires = expires;
        newAuthorization.status = 'PENDING';
        newAuthorization.associatedAuthId = '';
        newAuthorization.ownerId = parentUser._id;

        newAuthorization = await this.setAuthorization(newAuthorization);
       
        return newAuthorization;
    }

    addGroup = async (
        parentUser= this.userStruct(), 
        name='',  
        details='',
        admins=[], 
        peers=[], 
        clients=[], 
        updateServer=true
    ) => {
        let newGroup = this.createStruct('group',undefined,parentUser); //auto assigns instances to assigned users' data views

        newGroup.name = name;
        newGroup.details = details;
        newGroup.admins = admins;
        newGroup.peers = peers;
        newGroup.clients = clients;
        newGroup.users = [...admins,...peers,...clients];
        newGroup.ownerId = parentUser._id;
        
        //this.setLocalData(newGroup);
        
        if(updateServer) {
            newGroup = await this.setGroup(newGroup);
        }

        return newGroup;
    }

    //these can be used to add some metadata to arrays of data kept in a DataStruct
    dataObject (
        data:any=undefined,
        type:string='any',
        timestamp:string|number=Date.now()
    ) {
        return {
            type,
            data,
            timestamp
        };
    }

    addData = async (
        parentUser= this.userStruct(), 
        author='', 
        title='', 
        type='', 
        data=[], 
        expires=false, 
        updateServer=true
    ) => {
        let newDataInstance = this.createStruct('dataInstance',undefined,parentUser); //auto assigns instances to assigned users' data views
        newDataInstance.author = author;
        newDataInstance.title = title;
        newDataInstance.type = type;
        newDataInstance.data = data;
        newDataInstance.expires = expires;
        newDataInstance.ownerId = parentUser._id;
        
        //this.setLocalData(newDataInstance);
        
        if(updateServer) newDataInstance = await this.updateServerData([newDataInstance])[0];

        return newDataInstance;
    }

    addEvent = async (
        parentUser=this.userStruct(), 
        author='', 
        event='', 
        notes='', 
        startTime=0, 
        endTime=0,
        grade=0, 
        attachments=[], 
        users=[], 
        updateServer=true
    ) => {
        if(users.length === 0) users = this.getLocalUserPeerIds(parentUser);
        
        let newEvent = this.createStruct('event',undefined,parentUser);
        newEvent.author = author;
        newEvent.event = event;
        newEvent.notes = notes;
        newEvent.startTime = startTime;
        newEvent.endTime = endTime;
        newEvent.grade = grade;
        newEvent.attachments = attachments;
        newEvent.users = users;
        newEvent.ownerId = parentUser._id;

        //this.setLocalData(newEvent);
        if(updateServer) newEvent = await this.updateServerData([newEvent])[0];

        return newEvent;
    }

    //create discussion board topic
    addDiscussion = async (
        parentUser=this.userStruct(), 
        authorId='',  
        topic='', 
        category='', 
        message='',
        attachments=[], 
        users=[], 
        updateServer=true) => {
        
        if(users.length === 0) users = this.getLocalUserPeerIds(parentUser); //adds the peer ids if none other provided
        
        let newDiscussion = this.createStruct('discussion',undefined,parentUser);
        newDiscussion.topic = topic;
        newDiscussion.category = category;
        newDiscussion.message = message;
        newDiscussion.attachments = attachments;
        newDiscussion.authorId = authorId;
        newDiscussion.users = users; 
        newDiscussion.comments = [];
        newDiscussion.replies = [];
        newDiscussion.ownerId = parentUser._id;

        //this.setLocalData(newDiscussion);
    
        let update = [newDiscussion];
        if(updateServer) newDiscussion = await this.updateServerData(update)[0];
        return newDiscussion;
    }

    addChatroom = async (
        parentUser=this.userStruct(), 
        authorId='', 
        message='', 
        attachments=[], 
        users=[], 
        updateServer=true
    ) => {
        if(users.length === 0) users = this.getLocalUserPeerIds(parentUser); //adds the peer ids if none other provided
        
        let newChatroom = this.createStruct('chatroom',undefined,parentUser);
        newChatroom.message = message;
        newChatroom.attachments = attachments;
        newChatroom.authorId = authorId;
        newChatroom.users = users;
        newChatroom.replies = [];
        newChatroom.comments = [];
        newChatroom.ownerId = parentUser._id;

        let update = [newChatroom];
        if(updateServer) newChatroom = await this.updateServerData(update)[0];

        return newChatroom;
    }

    //add comment to chatroom or discussion board
    addComment = async (
        parentUser=this.userStruct(), 
        roomStruct?:{
            _id: string;
            users: any[];
            comments: any[];
        }, 
        replyTo?:{
            _id: string;
            replies: any[];
        }, 
        authorId='', 
        message='', 
        attachments=[],
        updateServer=true
        ) => {
            let newComment = this.createStruct('comment',undefined,parentUser,roomStruct);
            newComment.authorId = authorId;
            newComment.replyTo = replyTo?._id;
            newComment.message = message;
            newComment.attachments = attachments;
            newComment.users = roomStruct?.users;
            newComment.replies = [];
            newComment.ownerId = parentUser._id;


            if (updateServer) replyTo?.replies.push(newComment._id);
            else replyTo?.replies.push(newComment); // push full reply if not on server
            
            if (updateServer) roomStruct?.comments.push(newComment._id);
            else roomStruct?.comments.push(newComment); // push full comment if not on server

            //this.setLocalData(newComment);
            let update = [newComment,roomStruct];
            if(replyTo._id !== roomStruct._id) update.push(replyTo);
            if(updateServer) newComment = await this.updateServerData(update)[0];

            return newComment;
    }
}
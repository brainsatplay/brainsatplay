import { DataTablet, DS } from 'brainsatplay-data'
import { RouterOptions, ArbitraryObject } from '../../common/general.types';
import { Router } from '../../core_old/Router'
import { randomId } from '../../common/id.utils';
import StructService from './structs.service';
import { Data, ProfileStruct, AuthorizationStruct, GroupStruct, DataStruct, EventStruct, ChatroomStruct, CommentStruct, Struct } from 'brainsatplay-data/dist/src/types';

//Joshua Brewster, Garrett Flynn   -   GNU Affero GPL V3.0 License
//
// Description
// A client-side Router class with macros
//

class StructRouter extends Router {

    currentUser: Partial<ProfileStruct> // Different from this.user (base user)
    tablet = new DataTablet(); //DataTablet 
    collections = this.tablet.collections;
    id: string = randomId()

    constructor (userInfo:Partial<ProfileStruct>={}, options?:RouterOptions) {
        super(options)

        if (userInfo instanceof Object && Object.keys(userInfo).length > 0) this.setupUser(userInfo) // Declares currentUser
       
        // Auto-Connect Struct Client Service
        this.load(new StructService(this))
    }

    //TODO: make this able to be awaited to return the currentUser
    //uses a bunch of the functions below to set up a user and get their data w/ some cross checking for consistent profiles
    async setupUser(userinfo:Partial<ProfileStruct>, callback=(currentUser)=>{}) {

        if(!userinfo) {
            console.error('must provide an info object! e.g. {_id:"abc123"}');
            callback(undefined);
            return undefined;
        }
        let changed = false;

        if(userinfo.id && !userinfo._id) userinfo._id = userinfo.id;
        else if (userinfo._id) userinfo.id = userinfo._id;

        // let res = await this.login();
        //console.log("Generating/Getting User: ", userinfo._id)

        let res = await this.getUser(userinfo._id);
        let user = res?.user;
        // console.log('user gotten', user)
        // console.log("getUser", user);
        let u;
        let newu = false;
        
        console.log('getUser result',user);
        if(!user || !user._id) { //no profile, create new one and push initial results
            // if(!userinfo._id) userinfo._id = userinfo._id;
            console.log('creating new profile');
            u = this.userStruct(userinfo,true);
            newu = true;
            let wasSet = await this.setUser(u);
            let structs = this.getLocalData(undefined,{'ownerId': u._id});
            if(structs?.length > 0) this.updateServerData(structs);//, 
            //     (data)=>{
            //     console.log('setData', data);
            // }

            this.setAuthorizationsByGroup(u);
        }
        else {
            u = user;
            // u._id = user._id; //replace the unique mongo id for the secondary profile struct with the id for the userinfo for temp lookup purposes

            if(res?.authorizations){
                if(Array.isArray(res.authorizations)) {
                    this.setLocalData(res.authorizations);
                }
            }

            if (res?.groups){
                if(Array.isArray(res.groups)) {
                    this.setLocalData(res.groups);
                }
            }
        }

        if(newu) {this.setLocalData(u);}
        else {
            let data = await this.getAllUserData(u._id,undefined);

            //console.log("getServerData", data);
            if(!data || data.length === 0) { 
            } else {
                this.setLocalData(data);
                
                //resolve redundant notifications
                //console.log('DATA',data);
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
            console.log('collections', this.tablet.collections);
        }
        //console.log('u::',u)
        if(u)  {
            this.currentUser = u;  
            callback(this.currentUser);
            //console.log('currentUser', u)
            return this.currentUser;
        } else {
            callback(u);
            return u;
        }
    }

    //default socket response for the platform
    baseServerCallback = (data) => {
        let structs = data;
        if(typeof data === 'object' && data?.structType) structs = [data];
        if(Array.isArray(structs)) { //getUserData response
            
            let filtered = structs.filter((o) => {
                if(o.structType !== 'notification') return true;
            });

            if(this.tablet) this.tablet.sortStructsIntoTable(filtered);

            structs.forEach((struct)=>{
                if(typeof struct === 'object') {
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
                        else if (struct.structType === 'group') {
                            if(this.currentUser) {
                                let uset = false;
                                if(struct.admins[this.currentUser?._id] && !this.currentUser.userRoles[struct.name+'_admin']) {
                                    this.currentUser.userRoles[struct.name+'_admin'] = true;
                                    uset = true;
                                }
                                else if (!struct.admins[this.currentUser?._id] && this.currentUser.userRoles[struct.name+'_admin']) {
                                    delete this.currentUser.userRoles[struct.name+'_admin'];
                                    uset = true;
                                }
                                if(struct.admins[this.currentUser?._id] && !this.currentUser.userRoles[struct.name+'_peer']) {
                                    this.currentUser.userRoles[struct.name+'_peer'] = true;
                                    uset = true;
                                }
                                else if (!struct.admins[this.currentUser?._id] && this.currentUser.userRoles[struct.name+'_peer']) {
                                    delete this.currentUser.userRoles[struct.name+'_peer'];
                                    uset = true;
                                }if(struct.admins[this.currentUser?._id] && !this.currentUser.userRoles[struct.name+'_client']) {
                                    this.currentUser.userRoles[struct.name+'_client'] = true;
                                    uset = true;
                                }
                                else if (!struct.admins[this.currentUser?._id] && this.currentUser.userRoles[struct.name+'_client']) {
                                    delete this.currentUser.userRoles[struct.name+'_client'];
                                    uset = true;
                                }
                                if(uset) this.setUser(this.currentUser); //update roles
                            }
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
                }
            });
        } 

        //console.log(data);
        if (data?.message === 'notifications') {
            //console.log('notifications', this.currentUser);
            this.checkForNotifications(); //pull notifications
        }
        if (data?.message === 'deleted') {
            this.deleteLocalData(data.data); //remove local instance
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
        parentUser:ArbitraryObject=undefined, 
        parentStruct:ArbitraryObject=undefined,
        updateServer:boolean = true
    ) {
        let newStruct = DS.Struct(structType, props, parentUser, parentStruct);

        if(updateServer) newStruct = await this.updateServerData([newStruct])[0];

        return newStruct;
    }
    
    //simple response test
    ping = async (callback=(res)=>{console.log(res);}) => {
        let res = (await this.send('ping'))?.[0]
        callback(res)
        return res;
    }

    //send a direct message to somebody
    sendMessage = async (userId:string='',message:any='',data:any=undefined,callback=(res)=>{console.log(res);}) => {
        let args = [userId,message];
        if(data) args[2] = data;

        let res = (await this.send('sendMessage', ...args))?.[0]
        callback(res)
        return res
    }

    //info can be email, id, username, or name. Returns their profile and authorizations
    getUser = async (info:string|number='',callback=this.baseServerCallback) => {
        let res = (await this.send('structs/getUser', info))?.[0];
        callback(res);
        return (res as {user:ProfileStruct, groups:[], authorizations:[]} | undefined);
    }

    //get user basic info by id
    getUsers = async (ids:(string|number)[]=[],callback=this.baseServerCallback) => {
        let res = (await this.send('structs/getUsersByIds', ...ids)) // Pass Array
        callback(res)
        return res
    }
    
    //info can be email, id, username, or name. Returns their profile and authorizations
    getUsersByRoles = async (userRoles:{}={},callback=this.baseServerCallback) => {
        let res = (await this.send('structs/getUsersByRoles', userRoles));
        callback(res)
        return res
    }

    //pull all of the collections (except excluded collection names e.g. 'groups') for a user from the server
    getAllUserData = async (ownerId:string|number, excluded=[], callback=this.baseServerCallback) => {
        let res = (await this.send('structs/getAllData', ownerId, excluded));
        callback(res)
        return res
    }

    query = async (collection:string, queryObj={}, findOne=false, skip=0, callback=this.baseServerCallback) => {
        if(!collection || !queryObj) return undefined;
        let res = (await this.send('structs/query',[collection,queryObj,findOne,skip]));
        if(typeof callback === 'function') callback(res);
        return res;
    }

    //get data by specified details from the server. You can provide only one of the first 3 elements. The searchDict is for mongoDB search keys
    getData = async (collection:string,ownerId?:string|number|undefined,searchDict?,limit:number=0,skip:number=0,callback=this.baseServerCallback) => {
        let res = (await this.send('structs/getData', collection, ownerId, searchDict, limit, skip));//?.[0]
        //console.log('GET DATA RES', res, JSON.stringify(collection), JSON.stringify(ownerId));
        if(typeof callback === 'function') callback(res);
        return res;
    }

    //get data by specified details from the server. You can provide only one of the first 3 elements. The searchDict is for mongoDB search keys
    getDataByIds = async (structIds:any[]=[],ownerId?:string|number|undefined,collection?:string|undefined,callback=this.baseServerCallback) => {
        let res = (await this.send('structs/getDataByIds', structIds, ownerId, collection));
        if(typeof callback === 'function') callback(res);
        return res
    }

    //get struct based on the parentId 
    getStructParentData = async (struct:any,callback=this.baseServerCallback) => {
        if(!struct.parent) return;
        let args = [struct.parent?.structType,'_id',struct.parent?._id];

        let res = (await this.send('structs/getData', ...args))?.[0]
        if(typeof callback === 'function') callback(res);
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
    setUser = async (userStruct={},callback=this.baseServerCallback) => {
        let res = (await this.send('structs/setUser', this.stripStruct(userStruct)))?.[0]
        if(typeof callback === 'function') callback(res)
        return res
    }

    //updates a user's necessary profile details if there are any discrepancies with the token
    checkUserToken = async (usertoken,user=this.currentUser,callback=this.baseServerCallback) => {
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

    /* strip circular references and update data on the server, default callback will process the returned structs back into  */
    setData = async (structs:Partial<Struct>|Partial<Struct>[]=[],notify=true,callback=this.baseServerCallback) => {
        const copies = new Array();
        if(!Array.isArray(structs) && typeof structs === 'object') structs = [structs];
        structs.forEach((struct)=>{
            copies.push(this.stripStruct(struct));
        })

        let res = (await this.send('structs/setData', [copies,notify]));
        if(typeof callback === 'function') callback(res);
        return res;

    }

    updateServerData = this.setData;
    
    //delete a list of structs from local and server
    deleteData = async (structs:any[]=[],callback=this.baseServerCallback) => {
        let toDelete = [];
        //console.log('LOCAL TABLET DATA: ',this.tablet.collections)
        structs.forEach((struct) => {
            if(typeof struct === 'object') {
                if(struct?.structType && struct?._id) {
                toDelete.push(
                    {
                        structType:struct.structType,
                        _id:struct._id
                    }
                );
                this.deleteLocalData(struct);
                }
            }
            else if (typeof struct === 'string'){
                let localstruct = this.getLocalData(undefined,{_id:struct});
                if(localstruct && !Array.isArray(localstruct)) {
                    toDelete.push(
                        {
                            structType:localstruct.structType,
                            _id:localstruct._id
                        }
                    );
                } else {
                    toDelete.push(
                        {
                            _id:struct
                        } //still need a structType but we'll pass this anyway for now
                    );
                }
            }
        });
        //console.log('deleting',toDelete);
        let res = (await this.send('structs/deleteData', ...toDelete))?.[0]
        if(typeof callback === 'function') callback(res)
        return res

    }

    //delete user profile by ID on the server
    deleteUser = async (userId, callback=this.baseServerCallback) => {
        if(!userId) return;

        let res = (await this.send('structs/deleteUser', userId))?.[0]
        if(typeof callback === 'function') callback(res)
        return res
    }

    //set a group struct on the server
    setGroup = async (groupStruct={},callback=this.baseServerCallback) => {
        let res = (await this.send('structs/setGroup', this.stripStruct(groupStruct)))?.[0]
        if(typeof callback === 'function') callback(res)
        return res
    }

    //get group structs or single one by Id
    getGroups = async (userId=this.currentUser._id, groupId='',callback=this.baseServerCallback) => {
        let res = (await this.send('structs/getGroups', userId,groupId))
        if(typeof callback === 'function') callback(res)
        return res
    }

    //deletes a group off the server
    deleteGroup = async (groupId,callback=this.baseServerCallback) => {
        if(!groupId) return;
        this.deleteLocalData(groupId);

        let res = (await this.send('structs/deleteGroup', groupId))?.[0]
        if(typeof callback === 'function') callback(res)
        return res
    }

    //set an authorization struct on the server
    setAuthorization = async (authorizationStruct={},callback=this.baseServerCallback) => {
        let res = (await this.send('structs/setAuth', this.stripStruct(authorizationStruct)))?.[0]
        if(typeof callback === 'function') callback(res)
        return res
    }

    //get an authorization struct by Id
    getAuthorizations = async (userId=this.currentUser?._id, authorizationId='',callback=this.baseServerCallback) => {
        if(userId === undefined) return;
        let res = (await this.send('structs/getAuths', userId, authorizationId))
        if(typeof callback === 'function') callback(res)
        return res
    }

    //delete an authoriztion off the server
    deleteAuthorization = async (authorizationId,callback=this.baseServerCallback) => {
        if(!authorizationId) return;
        this.deleteLocalData(authorizationId);
        
        let res = (await this.send('structs/deleteAuth', authorizationId))?.[0]
        if(typeof callback === 'function') callback(res)
        return res
    }

    //notifications are GENERALIZED for all structs, where all authorized users will receive notifications when those structs are updated
    checkForNotifications = async (userId:string=this.currentUser?._id) => {
        return await this.getData('notification',userId);
    }

    
    //pass notifications you're ready to resolve and set pull to true to grab the associated data structure.
    resolveNotifications = async (notifications:any[]=[], pull:boolean=true, user:Partial<ProfileStruct>=this.currentUser) => {
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
            structIds.push(struct.parent._id); //
            notificationIds.push(struct._id); //ids of the notifications structs
            //console.log(struct)
            this.deleteLocalData(struct); //delete local entries and update profile
            //console.log(this.structs.get(struct._id));
        });

        this.deleteData(notifications); //delete server entries for the notifications
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
                    this.getUser(structIds[i]);
                    structIds.splice(structIds.length-i-1,1);
                }
            }); 
            if(structIds.length === 1) return await this.getDataByIds(structIds,undefined,notifications[0].parent.structType)
            if(structIds.length > 0) return await this.getDataByIds(structIds);
        }
        return true;
    } 


    //setup authorizations automatically based on group
    setAuthorizationsByGroup = async (user=this.currentUser) => {

        let auths = this.getLocalData('authorization',{'ownerId': user._id});
        //console.log('auths',auths, 'user', user);
        let newauths = [];
        await Promise.all(Object.keys(user.userRoles).map(async (role)=>{ //auto generate access authorizations accordingly
            //group format e.g.
            //reddoor_client
            //reddoor_peer
            let split = role.split('_');
            let team = split[0];
            let otherrole;
            if(role.includes('client')) {
                otherrole = team+'_peer';
            } else if (role.includes('peer')) {
                otherrole = team+'_client';
            } else if (role.includes('admin')) {
                otherrole = team+'_owner';
            }
            if(otherrole) {
                let users = await this.getUsersByRoles([otherrole]);
                    //console.log(res.data)
                
                if(users) await Promise.all(users.map(async (groupie)=>{
                    let theirname = groupie.username;
                    if(!theirname) theirname = groupie.email;
                    if(!theirname) theirname = groupie._id;
                    let myname = user.username;
                    if(!myname) myname = user.email;
                    if(!myname) myname = user._id;

                    if(theirname !== myname) {
                        if(role.includes('client')) {

                            //don't re-set up existing authorizations 
                            let found = auths.find((a)=>{
                                if(a.authorizerId === groupie._id && a.authorizedId === user._id) return true;
                            });

                            if(!found) {
                                let auth = await this.authorizeUser(
                                    DS.ProfileStruct('user', user, user),
                                    groupie._id,
                                    theirname,
                                    user._id,
                                    myname,
                                    {'peer':true},
                                    undefined,
                                    {group:team}
                                );
                                newauths.push(auth);
                            }
                        } else if (role.includes('peer')) {

                            //don't re-set up existing authorizations 
                            let found = auths.find((a)=>{
                                if(a.authorizedId === groupie._id && a.authorizerId === user._id) return true;
                            });

                            if(!found) {
                                let auth = await this.authorizeUser(
                                    DS.ProfileStruct('user', user, user),
                                    user._id,
                                    myname,
                                    groupie._id,
                                    theirname,
                                    {'peer':true},
                                    undefined,
                                    {group:team}
                                );
                                newauths.push(auth);
                            }
                        }
                    }
                }));
            }
        }));
        if(newauths.length > 0)
            return newauths;

        return undefined;
    }

    
    //delete a discussion or chatroom and associated comments
    deleteRoom = async (roomStruct) => {
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
    deleteComment = async (commentStruct) => {
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
    getUserDataByAuthorization = async (authorizationStruct, collection, searchDict, limit=0, skip=0, callback=this.baseServerCallback) => {

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
    getUserDataByAuthorizationGroup = async (groupId='', collection, searchDict, limit=0, skip=0, callback=this.baseServerCallback) => {
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
            if(a.authorizations['peer'] && a.authorizerId === user._id) result.push(a.authorizedId);
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

    userStruct (
        props: Partial<ProfileStruct>={}, 
        currentUser=false
    ) {
        let user = DS.ProfileStruct(undefined, props, props);

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
        return user as ProfileStruct;
    }

    //TODO: Update the rest of these to use the DB structs but this should all work the same for now
    authorizeUser = async (
        parentUser:Partial<ProfileStruct>,
        authorizerUserId='',
        authorizerUserName='',
        authorizedUserId='',
        authorizedUserName='',
        authorizations:{}={}, // TODO: really any[] or has type??
        structs:{}={},
        excluded:{}={},
        groups:{}={},
        expires=false
    ) => {
        if(!parentUser) return undefined;

        let newAuthorization = this.createStruct('authorization',undefined,parentUser,undefined);  
        newAuthorization.authorizedId = authorizedUserId; // Only pass ID
        newAuthorization.authorizedName = authorizedUserName; //set name
        newAuthorization.authorizerId = authorizerUserId; // Only pass ID
        newAuthorization.authorizerName = authorizerUserName; //set name
        newAuthorization.authorizations = authorizations; //object
        newAuthorization.structs = structs;   // object
        newAuthorization.excluded = excluded; // object
        newAuthorization.groups = groups;     // array 
        newAuthorization.expires = expires; 
        newAuthorization.status = 'PENDING';
        newAuthorization.associatedAuthId = '';
        newAuthorization.ownerId = parentUser._id;
        //console.log('new authorization', newAuthorization)
        newAuthorization = await this.setAuthorization(newAuthorization);
       
        return newAuthorization as AuthorizationStruct;
    }

    addGroup = async (
        parentUser:Partial<ProfileStruct>,
        name='',  
        details='',
        admins:{}={}, 
        peers:{}={}, 
        clients:{}={}, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;

        let newGroup = this.createStruct('group',undefined,parentUser); //auto assigns instances to assigned users' data views

        newGroup.name = name;
        newGroup.details = details;
        newGroup.admins = admins;
        newGroup.peers = peers;
        newGroup.clients = clients;
        newGroup.users = {};
        Object.assign(newGroup.users, newGroup.admins);
        Object.assign(newGroup.users, newGroup.peers);
        Object.assign(newGroup.users, newGroup.clients);
        newGroup.ownerId = parentUser._id;
        
        //this.setLocalData(newGroup);
        
        if(updateServer) {
            newGroup = await this.setGroup(newGroup);
        }

        return newGroup as GroupStruct;
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
        parentUser:Partial<ProfileStruct>, 
        author='', 
        title='', 
        type='', 
        data:string|Data[]=[], 
        expires=false, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;

        let newDataInstance = this.createStruct('dataInstance',undefined,parentUser); //auto assigns instances to assigned users' data views
        newDataInstance.author = author;
        newDataInstance.title = title;
        newDataInstance.type = type;
        newDataInstance.data = data;
        newDataInstance.expires = expires;
        newDataInstance.ownerId = parentUser._id;
        
        //this.setLocalData(newDataInstance);
        
        if(updateServer) newDataInstance = await this.updateServerData([newDataInstance])[0];

        return newDataInstance as DataStruct;
    }

    addEvent = async (
        parentUser:Partial<ProfileStruct>,
        author='', 
        event='', 
        notes='', 
        startTime=0, 
        endTime=0,
        grade=0, 
        attachments:string|Data[]=[], 
        users:{}={}, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;
        if(Object.keys(users).length === 0) users = this.getLocalUserPeerIds(parentUser);
        
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

        return newEvent as EventStruct;
    }

    addChatroom = async (
        parentUser:Partial<ProfileStruct>,
        authorId='', 
        message='', 
        attachments:string|Data[]=[], 
        users:{}={}, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;
        if(Object.keys(users).length === 0) users = this.getLocalUserPeerIds(parentUser); //adds the peer ids if none other provided
        
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

        return newChatroom as ChatroomStruct;
    }

    //add comment to chatroom or discussion board
    addComment = async (
        parentUser:Partial<ProfileStruct>,
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
        attachments:string|Data[]=[],
        updateServer=true
        ) => {
            if(!roomStruct) return undefined;
            if(!replyTo) replyTo = (roomStruct as any);

            if(!parentUser) return undefined;
            let newComment = this.createStruct('comment',undefined,parentUser,roomStruct);
            newComment.authorId = authorId;
            newComment.replyTo = replyTo?._id;
            newComment.message = message;
            newComment.attachments = attachments;
            newComment.users = roomStruct?.users;
            newComment.replies = [];
            newComment.ownerId = parentUser._id;


            if (!updateServer) replyTo?.replies.push(newComment._id); //keep a local reference
            //else replyTo?.replies.push(newComment._id); // push full reply if not on server
            
            if (!updateServer) roomStruct?.comments.push(newComment._id); //keep a local reference
            //else roomStruct?.comments.push(newComment._id); // push full comment if not on server

            //this.setLocalData(newComment);
            let update = [newComment,roomStruct];
            if(replyTo._id !== roomStruct._id) update.push(replyTo);
            let res;
            if(updateServer) res = await this.updateServerData(update);
            let updatedComment;
            if(typeof res === 'object') { //comment results will return all updated structs (replies and chatrooms, etc) so find the right struct
                updatedComment = res.find((s) => {
                    if(newComment.ownerId === s.ownerId && newComment.timestamp === s.timestamp && newComment.message === s.message) {
                        return true;
                    }
                });
            }
            if(updatedComment) return updatedComment as CommentStruct;
            return res as Array<any>;
    }
}


export default StructRouter
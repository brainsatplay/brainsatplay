## Route Structure

### Get
Gets data from the collection.
1. Multiple Entries: If you specify a route with commas (e.g. 'database/users/me,you'), you'll be able to grab multiple entries.
2. All Entries: Spcify the base route (e.g. 'database/users') to get all entries.

### Post
Places data into the collection.

### Delete
Deletes data from the collection.


```
//ES6 style
import { WebsocketClient, UsersClient } from 'brainsatplay-frontend'

let client = new WebsocketClient(
    socketUrl='https://localhost:80', 
    subprotocols={_id:`user${Math.floor(Math.random() * 10000000000)}`},
    true
);

let socketId = client.getSocket().id; //or just leave blank to make a new socket just for the service

let userinfo = {
    _id:'123456', //we are using randomly generated ones from realm/mongodb
    username:johnnyboi,
    email:johnnyboi@boyo.com,
    firstName:johnny,
    lastName:boyo
};

const platform = new UsersClient(client, userinfo, socketId); //sets up the user automatically if info provided, use null or false in userinfo otherwise or it will create a dummy user

platform.sendMessage('123456','test');
platform.ping();



//check console. 

// You can create another user with another platform (platform2 = new UsersClient(client, userinfo2)) instance as well and test it that way

```

And lots of functions for handling a user database with some basic form filling for stock data structures

```

//You can optionally await most of these callbacks or pass a custom callback in.
//The default callback is the baseServerCallback for most of these which you don't want to mess with ordinarily, or write it back in otherwise in custom callbacks

let user = await platform.setupUser(userinfo,callback=(currentUser)=>{}) //asks the server for the data of the given user info object to st up the user platform. This runs automatically if provided in the constructor

platform.onResult = (data) => {} //can set this to be run after the default server callback


platform.closeSocket(); //close the active socket

platform.logout(); //log the user out of the server (closes connections)

//create arbitrary structs with arbitrary data in our given format
platform.addStruct(
    structType,
    props={},
    parentUser,
    parentStruct,
    updateServer=true
);

/* General struct format:
    let struct = {
        _id: randomId(structType+'defaultId'),   //random id associated for unique identification, used for lookup and indexing
        structType: structType,     //this is how you will look it up by type in the server
        ownerId: parentUser?._id,     //owner user
        timestamp: Date.now(),      //date of creation
        parent: {structType:parentStruct?.structType,_id:parentStruct?._id}, //parent struct it's associated with (e.g. if it needs to spawn with it)
    }
*/

let sent = await platform.sendMessage(
    userId,
    message, //e.g. a string (or whatever really)
    data, //e.g. an additional object e.g. with a custom message above
    callback //callback fulfilled asynchronously
)

//info can be email, id, username, or name. Returns their profile and authorizations
platform.getUserFromServer(info)

//get user basic info by id
platform.getUsersByIdsFromServer([...ids])

//info can be email, id, username, or name. Returns their profile and authorizations
platform.getUsersByRolesFromServer([...roles]) //e.g. 'groupname_admin'

//pull all of the collections (except excluded collection names e.g. 'groups') for a user from the server
platform.getAllUserDataFromServer(ownerId,excluded=[])

//get data by specified details from the server. You can provide only one of the first 3 elements. The searchDict is for mongoDB search keys
platform.getDataFromServer(collection,ownerId,searchDict,limit,skip);

//sets the user profile data on the server
platform.setUserOnServer(userStruct={})

//updates a user's necessary profile details if there are any discrepancies with a token (e.g. a larger user info thing with data you don't necessarily want written)
platform.checkUserToken(usertoken={},user={});

/* strip circular references and update data on the server */
platform.updateServerData(structs=[])

//delete a list of structs from local and server
platform.deleteDataFromServer(structs=[])

//delete user profile by id, pass a struct in
platform.deleteUser(userId);

//set a group struct on the server
platform.setGroupOnServer(groupStruct={})

//get group structs for a user or single one by Id
platform.getGroupsFromServer(userId,groupId)

//deletes a group off the server, pass a struct in
platform.deleteGroupFromServer(groupId)

//set an authorization struct on the server
platform.setAuthorizationOnServer(authorizationStruct={});

//get an authorization struct by Id
platform.getAuthorizationsFromServer(userId,authorizationId);

//delete an authorization off the server
platform.deleteAuthorizationOnServer(authorizationId);

//notifications are GENERALIZED for all structs, where all authorized users will receive notifications when those structs are updated
platform.checkForNotificationsOnServer(userId);

//pass notifications you're ready to resolve and set pull to true to grab the associated data structure.
platform.resolveNotifications(notifications=[],pull=true,user);

//setup authorizations for this user automatically based on group
platform.setAuthorizationsByGroupOnServer(u);

//delete a discussion or chatroom and associated comments
platform.deleteRoomOnServer(roomStruct);

//delete comment and associated replies by recursive gets
platform.deleteCommentOnServer(commentStruct);

 //get user data by their auth struct (e.g. if you don't grab their id directly), includes collection, limits, skips
platform.getUserDataByAuthorizationFromServer (authorizationStruct, collection, searchDict, limit, skip);

//get user data by auth struct group, includes structType, limits, skips
platform.getUserDataByAuthorizationGroupFromServer(group, collection, searchDict, limit, skip);


//More local operations
platform.setLocalData(structs);
platform.getLocalData(collection, query); //collection = structType
platform.deleteLocalData(structs);
platform.deleteStruct(struct);
platform.getLocalUserPeerIds(user);
platform.getLocalReplies(struct);
platform.hasLocalAuthorization(otherUserId, ownerId);
platform.createStruct(structType,props,parentUser,parentStruct);
platform.userStruct(props,currentUser); //generate a user structure, deletes any non-default properties (for very basic security)


//UX stuff for making stock structures with filled out data, parented to the parentUser's account (they own it)
platform.authorizeUser(
    parentUser={},
    authorizerUserId='',
    authorizerUserName='',
    authorizedUserId='',
    authorizedUserName='',
    authorizations=[], // TODO: really any[] or has type??
    structs=[],
    excluded=[],
    groups=[],
    expires=''
)

platform.addGroup(
    parentUser={}, 
    name='',  
    details='',
    admins=[], 
    peers=[], 
    clients=[], 
    updateServer=true
)

platform.addData(
    parentUser={}, 
    author='', 
    title='', 
    type='', 
    data=[], 
    expires='', 
    updateServer=true
)

platform.addEvent(
    parentUser={}, 
    author='', 
    event='', 
    notes='', 
    startTime=0, 
    endTime=0,
    grade='', 
    attachments=[], 
    users=[], 
    updateServer=true
)

platform.addDiscussion(
    parentUser={}, 
    authorId='',  
    topic='', 
    category='', 
    message='',
    attachments=[], 
    users=[], 
    updateServer=true
)

platform.addChatroom(
    parentUser={}, 
    authorId='', 
    message='', 
    attachments=[], 
    users=[], 
    updateServer=true
)

platform.addComment(
    parentUser={}, 
    roomStruct={}, 
    replyTo={}, 
    authorId='', 
    message='', 
    attachments=[],
    updateServer=true
)

```

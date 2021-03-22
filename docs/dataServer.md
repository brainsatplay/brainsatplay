# dataServer.js

This is a lightweight server side data organizing method for letting users talk to each other through sockets. It will organize user data streams and allow data grouping with games for streaming purposes. It will only send the latest data to stay lean and not flood you with repeated values and save bandwith

## Commands via WebSocket

Send dicts to the socket like `{msg:'[getUsers]',username:username}` to run commands and receive output to your username. Data returned from the server is accessed in different ways, with callbacks customized in processSocketMessage in the brainsatplay class

* `['getUsers',username]` leave username blank to get all users with the same appname as you. Returns an object: `{msg:'getUsersResult,userData:[]}` if found and `{msg:'userNotFound, userData:[username]}` if not.
* `['getUserData',username,propnames]` Get specified userdata, leave props blank to get all of the data for that user. Appname does not matter here
* `['createGame',appname,[propnames]]` Create a game session with the name and propnames set which will set expected parameters for users subscribing to the game
* `['getGameInfo',appname]` Get the subscription information for the desired game, so you can know what needs to be configured. We use this to autoconfigure stream parameters to quickly jump into games
* `['getGameData',appname]` Get the latest game data from the game subscription including all available relevant user data 
* `['subscribeToUser',username,propnames]` subscribe to specified user (can be yourself), propnames are optional to specify only certain data to receive, or all of it if you leave it blank.
* `['subscribeToGame',username,appname,spectating]` Subscribe specified user to specified game, if spectating they will receive data but not be expected to send any. 
* `['unsubscribeFromUser',username,propnames]` Unsubscribe from user. If propnames not specified as an array, you will completely unsubscribe from the user.
* `['leaveGame',appname,username]` Unsubscribe from game, leave username blank to unsub yourself, or you can select users to kick.
* `['deleteGame',appname]` Deletes the game subscription
* `['ping']` Returns 'pong' if successfully connected to the server. Simple test command.
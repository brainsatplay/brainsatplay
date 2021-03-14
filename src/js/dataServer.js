
class dataServer { //Just some working concepts for handling data sockets serverside
	constructor(appnames=[]) {
		this.userData=[];
		this.serverInstances=appnames;
		this.userSubscriptions=[];
		this.gameSubscriptions=[];
	}

	addUser(username='',appname='',socket=null,availableProps=[]) {
		this.userData.push({
			username:username,
			appname:appname,
			socket:socket,
            lastUpdate:Date.now(),
            lastTransmit:0,
            latency:0
		});
		let idx = this.userData.length-1;s
		availableProps.forEach((prop,i) => {
			this.userData[idx][prop] = '';
		});
	}

    removeUser(username='username') {
        //remove user, remove user streams, remove user from game instances
    }

    removeUserToUserStream(listener,source,propnames=null) { //delete stream or just particular props

    }

    removeGameStream(appname='') {

    }

	getUser(username=''){
		let u = this.userData.find((o,i) => {
			if(o.username === username) {
				return true;
			}
		});
		return u;
	}

    processUserCommand(username='',command='[]') { //Commands should be an array of arguments
        let u = this.getUser(username); 
        let command = JSON.parse(command);
        if(command[0] === 'getUsers' > -1) {
            let users = [];
            this.userData.forEach((o,i) => {
                if(command[1] !== undefined) {
                    if(o.appname === command[1]) {
                        users.push(o);
                    }
                }
                else if(o.appname === u.appname) {
                    users.push(o);
                }
            });
            u.socket.send(JSON.stringify({msg:'getUsers result', userData:users}))
        }
        else if(command[0] === 'subscribeToUser' > -1) {
            this.streamBetweenUsers(username,command[1],command[2]);
        }
        else if(command[0] === 'subscribeToGame' > -1) {
            this.subscribeUserToGame(username,command[1]);
        }

    }

	//Received a message from a user socket, now parse it into system
	updateUserData(data=`{msg:'',username:'',prop1:[],prop2:[]}`){ 

		//Send previous data off to storage

		let obj = JSON.parse(data);

        let hasData = false;
        for(const prop in obj) {
            if(prop !== 'username' && prop !== 'msg'){
                hasData = true;
                break;
            }
        }
        if(hasData) {
            let u = this.userData.find((o,i) => {
                if(o.username === obj.username) {
                    for(const prop in obj) {
                        o[prop] = obj[prop];
                    }
                    let now = performance.now();
                    o.latency = now-o.lastUpdate;
                    o.lastUpdate = Date.now();
                    return true;
                }
            });

            this.userSubscriptions.forEach((o,i) => {
                if(o.source === obj.username) {
                    o.newData = true;
                }
            });
        }
        else {
            this.processUserCommand(obj.username,obj.msg);
        }

	}

	streamBetweenUsers(listenerUser,sourceUser,propnames=[]) {
		this.userSubscriptions.push({
			listener:listenerUser,
			source:sourceUser,
			propnames:propnames,
			newData:false
		});
	}

	createGameSubscription(appname='',propnames=[]) {
		this.gameSubscriptions.push({
			usernames:[],
			appname:appname,
			propnames:propnames,
            lastTransmit:Date.now()
		});
	}

	getGameSubscription(appname='') {
		let g = this.gameSubscriptions.find((o,i) => {
			if(o.appname === appname) {
				return true;
			}
		});

		return g;
	}

	subscribeUserToGame(username,appname) {
		let g = this.getGameSubscription(appname);
		if((g !== undefined) && (g !== 'undefined')) {
			g.usernames.push(username);
			let u = this.getUser(username);
			g.propnames.forEach((prop,j) => {
				u[prop] = '';
			});
			//Now send to the user which props are expected from their client to the server on successful subscription
			u.socket.send(JSON.stringify({msg:'OK',appname:appname,propnames:g.propnames}));
		}
		else {
			u.socket.send(JSON.stringify({msg:'NOT_FOUND',appname:appname}));
		}
	}

	subscriptionLoop = () => {
        let time = Date.now();
        //Should have delay interval checks for each subscription update for rate limiting
		this.userSubscriptions.forEach((sub,i) => {

            if(sub.lastTransmit - time > 100){
                let listener = this.getUser(sub.listener);
                let source = this.getUser(sub.source);

                if(sub.newData === true){
                    let dataToSend = {
                        msg:'update',
                        destination:'',
                        username:source.username
                    };
                    sub.propnames.forEach((prop,j) => {
                        dataToSend[prop] = source[prop];
                    });
                    listener.socket.send(JSON.stringify(dataToSend));
                    sub.newData = false;
                    sub.lastTransmit = time;
                }
            }
		});

		this.gameSubscriptions.forEach((sub,i) => {
            if(sub.lastTransmit - time > 100){
                let updateObj = {
                    msg:'update',
                    destination:'',
                    appname:sub.appname,
                    userData:[]
                };
                
                sub.usernames.forEach((user,j) => {
                    let userObj = {
                        username:user
                    }
                    let listener = this.getUser(user);
                    sub.propnames.forEach((prop,k) => {
                        userObj[prop] = listener[prop];
                    });
                    updateObj.userData.push(userObj);
                });

                sub.userNames.forEach((user,j) => {
                    user.socket.send(JSON.stringify(updateObj));
                });
            }
            sub.lastTransmit = time;
		});

		requestAnimationFrame(this.subscriptionLoop);
	}

}
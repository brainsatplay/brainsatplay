class dataServer { //Just some working concepts for handling data sockets serverside
	constructor(appnames=[]) {
		this.userData=new Map();
		this.serverInstances=appnames;
		this.userSubscriptions=[];
		this.gameSubscriptions=[];
	}

	addUser(username='',appname='',socket=null,availableProps=[]) {
        
        if (!this.userData.has(username)){
            this.userData.set(username, {
                username:username,
                appname:appname,
                socket: socket,
                props: {},
                lastUpdate:Date.now(),
                lastTransmit:0,
                latency:0
            })
            availableProps.forEach((prop,i) => {
                this.userData.get(username).props[prop] = '';
            });
        }


	}

    removeUser(username='username') {
        this.userData.delete(username)
    }

    removeUserToUserStream(listener,source,propnames=null) { //delete stream or just particular props

    }

    removeGameStream(appname='') {

    }

    
    processUserCommand(username='',command=[]) { //Commands should be an array of arguments
        let u = this.userData.get(username);
        if(command[0] === 'getUsers') {
            let users = [];
            this.userData.forEach((name,o) => {
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
        else if(command[0] === 'subscribeToUser') {
            this.streamBetweenUsers(username,command[1],command[2]);
        }
        else if(command[0] === 'subscribeToGame') {
            this.subscribeUserToGame(username,command[1]);
        } else if( command[0] === 'ping' || command === 'ping') {
            u.socket.send(JSON.stringify({msg:'pong'}))
        }

    }

	//Received a message from a user socket, now parse it into system
	updateUserData(data=`{msg:'',username:'',prop1:[],prop2:[]}`){ 

		//Send previous data off to storage

		let obj = JSON.parse(data);

        let hasData = false;
        if(data.msg === '' || data.msg === 'data') {
            for(const prop in obj) {
                if(prop !== 'msg' && prop !== 'username') {
                    hasData = true;
                }
            }
        } 
        
        if(hasData) {
            let o = this.userData.get(obj.username)
            for(const prop in obj) {
                if(prop !== 'msg' && prop !== 'username') o.props[prop] = obj[prop];
                    }
            let now = performance.now();
            o.latency = now-o.lastUpdate;
            o.lastUpdate = Date.now();

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
			let u = this.userData.get(username);
			g.propnames.forEach((prop,j) => {
				if(!(prop in u.props)) u.props[prop] = '';
			});
			//Now send to the user which props are expected from their client to the server on successful subscription
			u.sockets.get('user').send(JSON.stringify({msg:'OK',appname:appname,propnames:g.propnames}));
		}
		else {
			u.sockets.get('user').send(JSON.stringify({msg:'NOT_FOUND',appname:appname}));
		}
	}

	subscriptionLoop = () => {
        let time = Date.now();
        //Should have delay interval checks for each subscription update for rate limiting
		this.userSubscriptions.forEach((sub,i) => {

            if(sub.lastTransmit - time > 100){
                let listener = this.userData.get(sub.listener);
                let source = this.userData.get(sub.source);

                if(sub.newData === true){
                    let dataToSend = {
                        msg:'update',
                        destination:'',
                        username:source.username
                    };
                    sub.propnames.forEach((prop,j) => {
                        dataToSend[prop] = source.props[prop];
                    });
                    listener.get('user').send(JSON.stringify(dataToSend));
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
                    let listener = this.userData.get(user);
                    sub.propnames.forEach((prop,k) => {
                        userObj[prop] = listener.props[prop];
                    });
                    updateObj.userData.push(userObj);
                });

                sub.userNames.forEach((user,j) => {
                    user.sockets.get('user').send(JSON.stringify(updateObj));
                });
            }
            sub.lastTransmit = time;
		});

		requestAnimationFrame(this.subscriptionLoop);
	}

}

module.exports = dataServer
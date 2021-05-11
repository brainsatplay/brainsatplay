let uuid = require('uuid')

const dbName = "brainsatplay";

var SALT_FACTOR = 5;

const check = async (auth, mongodb) => {
    let username = auth.username
    let dict = {result:'incomplete',msg:'no message set'};

    if (mongodb != undefined){
      const db = mongodb.db(dbName);
      if (username === undefined) {
        dict = { result: 'incomplete', msg: 'username not defined' }
    } else {
            if (username !== '' && username != 'guest'){
            let numDocs = await db.collection('profiles').find({ username: username }).count();
            if (numDocs == 0){
                dict = { result: 'OK', msg: username }
            } else {
                dict = { result: 'incomplete', msg: 'profile exists with this username. please choose a different ID.' }
            }
            } else {
            username = uuid.v4();
            dict = { result: 'OK', msg: username}
            }
        } 
    } else {
      dict = { result: 'OK', msg: username }
    }
return dict
}

module.exports = check
const uuid = require('uuid');
var bcrypt = require('bcrypt-nodejs');

const dbName = "brainsatplay";

var SALT_FACTOR = 5;

// req.app.get('mongo_client')
module.exports.check = async (auth, mongodb) => {
    let username = auth.username
    let password = auth.password
    const db = mongodb.db(dbName);
    let profile;
    let msg;
    let dict = {result:'incomplete',msg:'no message set'};

    if (password === ''){
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
    } else {
    if (username === undefined) {
        dict = { result: 'incomplete', msg: 'username not defined' }
    } else {
      profile = await db.collection('profiles').findOne({ $or: [ { username: username }, { email: username } ] })      
      if (profile===null){
        msg = 'no profile exists with this username or email. please try again.'
        dict = { result: 'incomplete', msg: msg }
      } else {
        dict = await compareAsync(password,profile.password)
        if (dict.result === 'OK'){
            dict.msg = username
        }
    } 
  }
}
return dict
}

function compareAsync(param1, param2) {
    return new Promise((resolve, reject) => {
        let dict = {result:'OK'}
        bcrypt.compare(param1,param2, function(err, isMatch) {
            if (err) {
              reject(err);
              dict = { result: 'incomplete', msg: err }
            } else if (!isMatch) {
              msg = 'incorrect password. please try again.'
              dict = { result: 'incomplete', msg: msg }
            }
            resolve(dict)
          })
        })
    }


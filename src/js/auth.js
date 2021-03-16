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
    let dict;

    if (password === ''){
        if (username !== ''){
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
        bcrypt.compare(password, profile.password, function(err, isMatch) {
          if (err) {
            throw err
          } else if (!isMatch) {
            msg = 'incorrect password. please try again.'
            dict = { result: 'incomplete', msg: msg }
          } else {
            dict = { result: 'OK', msg: username}
          }
        })
      }
    } 
  }
  return dict
}

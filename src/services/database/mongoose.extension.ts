import ObjectID from "bson-objectid"
import { pseudoObjectId } from '../../common/id.utils';

export const safeObjectID = (str) => {
    return (typeof str === 'string' && str.length === 24) ? ObjectID(str) : pseudoObjectId() // Just create one if it is invalid
}

export const get = async (_, Model, query=[], value) => {
    query.push({_id: safeObjectID(value)})
    if (Model){
        const res = (Object.values(query[0])[0] !== undefined) 
            ? await Model.findOne({$or: query}).exec() //encryption references
            : await Model.find({}).exec(); //encryption references  
        return res
    } else throw 'Model not defined'
}

export const del = async (_, Model, o ) => {
    if (Model){
        await Model.deleteOne({ id: o.id });
    } else throw 'Model not defined'
}

export const post = async (_, Model, args) => {

    if (Model){

    await Promise.all(args.map(async struct => {
        let copy = JSON.parse(JSON.stringify(struct)); // Deep Copy
        if(copy._id) delete copy._id;                                
        // Only Set _id if Appropriate
        const _id = safeObjectID(struct._id)
        const toFind = (_id !== struct._id) ? { _id } : {id: struct.id}
        await Model.updateOne(toFind, {$set: copy}, {upsert: true});   

        // TODO: Add subscriptions rather than checkToNotify                              
        // this.checkToNotify(user, [struct]);

        return true;
    }))
} else throw 'Model not defined'

}
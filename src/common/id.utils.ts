import { UserObject } from './general.types';

export const randomId = (prefix?) => ((prefix) ? `${prefix}_` : '')  + Math.floor(100000*Math.random())

export const pseudoObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))


export const generateCredentials = (o:Partial<UserObject> = {}) => {

    const creds = {_id: null, id: null}

    // _id, id, pseudoObjectId
    creds._id = (o._id) ? o._id : ((o.id) ? o.id : pseudoObjectId())
    creds.id = (o.id) ? o.id : creds._id

    return creds
}
import { UserObj } from "../models/user.model";
import { model, Schema, Document } from "mongoose";

const userFitbitToken = new Schema<UserObj['fitbit']>({
    token: { type: String, required: true },
    id: { type: String, required: true },
    expiresOn: { type: Number, required: true },
});

const schema = new Schema<UserObj>({
    email: { type: String },
    username: String,
    userRoles: { type: [String] },
    missingKeyVals: [String],
    fullName: String,
    firstName: String,
    lastName: String,
    status: String,
    sex: {
        type: String,
        enum: ['male', 'female'],
        lowercase: true,
    },

    fitbit: { type: userFitbitToken, default: null },

    clientInfo: { type: String, default: '' },

    clients: [String],

    birthday: String,
}, {
    timestamps: true,
});

export const User = model('users', schema);

export type User_Doc = UserObj & Document;

// ::: REFERENCE FOR NEST.JS | Don't remove :::
// import { UserModelType, UserRole } from '@myalyce/common/models/user.model';
// // import { objKeys } from '@giveback007/util-lib';
// // import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import { _Base } from './_base.schema';

// export type UserDocument = _User & Document;

// // @Schema()
// export class _User extends _Base<typeof UserModelType> {

//   // @Prop({ type: String, required: true })
//   name!: string;

//   // @Prop({ type: String, required: true })
//   email!: string;

//   // @Prop({ type: String, required: true })
//   username!: string;

//   // @Prop({ type: [String], enum: objKeys(UserRole), required: true })
//   userRoles!: UserRole[];

//   // @Prop({ type: [String] })
//   missingKeyVals!: (keyof _User)[];

//   constructor() {
//     super(UserModelType);
//   }
// }

// // export const UserSchema = SchemaFactory.createForClass(_User);
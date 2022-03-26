import { NoteObj } from "../models/note.model";
import { model, Schema } from "mongoose";

const schema = new Schema<NoteObj>({
    message: { type: String, required: true },
    clientId: { type: String, required: true },
    submittedBy: { type: String, required: true }
}, {
    timestamps: true
});

export const Note = model('notes', schema);

export type Note_Doc = NoteObj & Document;

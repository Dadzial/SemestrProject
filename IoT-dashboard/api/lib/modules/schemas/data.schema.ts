import {Schema, model} from "mongoose";
import {IData} from "../models/data.model";

export const dataSchema = new Schema<IData>({
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: false},
    createdAt: { type: Date, default: Date.now, index: { expires: 3600 } },
    deviceId: {type: String, required: true}
});

export default  model<IData>('Params', dataSchema);
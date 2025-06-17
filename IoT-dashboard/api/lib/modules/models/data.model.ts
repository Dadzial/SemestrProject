export interface IData {
    temperature: number;
    humidity?: number;
    deviceId: String;
    createdAt?: Date;
}

export type Query<T> = {
    [key :string] : T;
}
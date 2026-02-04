import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Row = Array<string>;
export type Key = string;
export interface Record_ {
    key: Key;
    row: Row;
}
export interface backendInterface {
    addRecord(key: Key, row: Row): Promise<void>;
    containsKey(key: Key): Promise<boolean>;
    getAllRecords(): Promise<Array<Record_>>;
    getRecord(key: Key): Promise<Record_>;
    getSize(): Promise<bigint>;
}

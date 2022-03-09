import path from "path";
import fs from "fs";
import {Platform} from "koishi-core";
import {LevelDB} from "./index";

export interface BroadcastInfo {
    platform: Platform
    selfId: string
    channelId: string
    groupId?: string
}

if (!fs.existsSync(path.join(process.cwd(), "/data"))) fs.mkdirSync(path.join(process.cwd(), "/data"));
const db = new LevelDB(path.join(process.cwd(), "/data/news"));

export async function getLastLoadRss(): Promise<Date | null> {
    const result = db.get<string>("last_load");
    return (typeof result === "string") ? new Date(result) : null;
}

export async function setLastLoadRss(date: Date | string | number): Promise<void> {
    await db.put("last_load", new Date(date).toISOString());
}

export async function getBroadcastInfo(): Promise<BroadcastInfo[]> {
    const result = await db.get<string>("broadcast");
    try {
        return JSON.parse(result) as BroadcastInfo[] || [];
    } catch {
        return [];
    }
}

export async function addBroadcastInfo(info: BroadcastInfo): Promise<boolean> {
    const list = await getBroadcastInfo();
    if (broadcastInfoIndex(list, info) === -1) {
        list.push(info);
        await db.put("broadcast", JSON.stringify(list));
        return true;
    }
    return false;
}

export function broadcastInfoIndex(list: BroadcastInfo[], info: BroadcastInfo): number {
    for (let i = 0; i < list.length; ) {
        if (list[i].platform === info.platform &&
            list[i].selfId === info.selfId &&
            list[i].channelId === info.channelId &&
            (!info.groupId || (info.groupId && list[i].groupId === info.groupId)))
            return i;
        i++;
    }
    return -1;
}

export async function removeBroadcastInfo(info: BroadcastInfo): Promise<void> {
    const list = await getBroadcastInfo();
    let i = broadcastInfoIndex(list, info);
    while(i >= 0) {
        list.splice(i, 1);
        i = broadcastInfoIndex(list, info);
    }
    await db.put("broadcast", list);
}

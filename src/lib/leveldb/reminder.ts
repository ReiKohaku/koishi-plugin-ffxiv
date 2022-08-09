import path from "path";
import fs from "fs";
import {LevelDB} from "./index";

export interface BroadcastInfo {
    selfId: string
    channelId: string
}

export enum RemindRepeat {
    once = 0,               // 不重复，此情境下最早的一个时间有效
    day = 1,                // 每天重复一次
    week = 2,               // 每周重复一次
    month = 3,              // 每月重复一次
    year = 4                // 每年重复一次
}

export interface RemindItem {
    startAt: Date
    endAt: Date
    repeat: RemindRepeat
    name: string
    comment?: string
}

if (!fs.existsSync(path.join(process.cwd(), "/data"))) fs.mkdirSync(path.join(process.cwd(), "/data"));
const db = new LevelDB(path.join(process.cwd(), "/data/reminder"));

export async function getLastRemindTime(): Promise<Date | null> {
    const result = await db.get<string>("last_remind");
    try {
        return result ? new Date(result.toString()) : null;
    } catch {
        return null;
    }
}

export async function setLastRemindTime(date: Date | string | number): Promise<void> {
    await db.put("last_remind", new Date(date).toISOString());
}

export async function getRemindList(): Promise<RemindItem[]> {
    const result = await db.get<string>("remind");
    try {
        return JSON.parse(result).map(i => {
            return {
                startAt: new Date(i.startAt),
                endAt: new Date(i.endAt),
                repeat: i.repeat,
                name: i.name,
                comment: i.comment
            }
        }) || [];
    } catch {
        return [];
    }
}

export async function addRemindItem(item: RemindItem): Promise<boolean> {
    const list = await getRemindList();
    if (remindItemIndex(list, item) === -1) {
        list.push(item);
        await db.put("remind", JSON.stringify(list));
        return true;
    }
    return false;
}


export function remindItemIndex(list: RemindItem[], item: RemindItem): number {
    for (let i = 0; i < list.length; i++) if (list[i].name === item.name) return i;
    return -1;
}

export async function removeRemindItem(item: RemindItem): Promise<boolean> {
    const list = await getRemindList();
    const i = remindItemIndex(list, item);
    if (i === -1) return false;
    list.splice(i, 1);
    await db.put("remind", JSON.stringify(list));
    return true;
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

export async function getBroadcastInfo(): Promise<BroadcastInfo[]> {
    const result = await db.get<string>("broadcast");
    try {
        return JSON.parse(result) as BroadcastInfo[] || [];
    } catch {
        return [];
    }
}

export async function removeBroadcastInfo(info: BroadcastInfo): Promise<void> {
    const list = await getBroadcastInfo();
    let i = broadcastInfoIndex(list, info);
    while(i >= 0) {
        list.splice(i, 1);
        i = broadcastInfoIndex(list, info);
    }
    await db.put("broadcast", JSON.stringify(list));
}

export function broadcastInfoIndex(list: BroadcastInfo[], info: BroadcastInfo): number {
    for (let i = 0; i < list.length; ) {
        if (list[i].selfId === info.selfId &&
            list[i].channelId === info.channelId)
            return i;
        i++;
    }
    return -1;
}



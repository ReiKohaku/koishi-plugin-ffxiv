import {Context} from "koishi";
import {
    addBroadcastInfo,
    addRemindItem,
    BroadcastInfo,
    getBroadcastInfo,
    getLastRemindTime,
    getRemindList,
    RemindItem,
    RemindRepeat,
    removeBroadcastInfo,
    removeRemindItem,
    setLastRemindTime
} from "./lib/leveldb/reminder";

export interface Config {
    admin?: string[]
}

export async function apply(ctx: Context, config: Config = {}) {
    /* 启动rss定时检查推送 */
    let broadcastList: BroadcastInfo[] = await getBroadcastInfo();

    let timer: NodeJS.Timeout;
    const clearTimer = () => {
        if (timer) {
            clearTimeout(timer);
            timer = undefined;
        }
    }
    async function broadcastReminds() {
        clearTimer();
        try {
            console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 正在检查事项……`);
            const reminds = await getRemindList();
            console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 从库中读取到${reminds.length}个提醒事项。`)
            const lastRemindTime = await getLastRemindTime() || new Date("2014-07-22 16:00:00");
            const now = new Date();
            const list = reminds.filter(i => {
                if (now.getTime() < i.startAt.getTime() && now.getTime() > i.endAt.getTime()) return false;
                else if (i.repeat === RemindRepeat.day) return true;
                else if (i.repeat === RemindRepeat.week && i.startAt.getDay() !== now.getDay()) return false;
                else if (i.repeat === RemindRepeat.month && i.startAt.getDate() !== now.getDate()) return false;
                else if (i.repeat === RemindRepeat.year && i.startAt.getMonth() !== now.getMonth()) return false;
                else if (i.repeat === RemindRepeat.once && now.toDateString() !== i.startAt.toDateString()) return false;
                return true;
            }).map(i => {
                let time: Date = new Date(now);
                time.setHours(i.startAt.getHours());
                time.setMinutes(i.startAt.getMinutes());
                time.setSeconds(i.startAt.getSeconds());
                return {
                    time,
                    name: i.name,
                    comment: i.comment
                }
            });
            list.sort((a, b) => b.time.getTime() - a.time.getTime());

            const remindTomorrow = () => {
                const tomorrow = new Date();
                tomorrow.setDate(now.getDate() + 1);
                tomorrow.setHours(0);
                tomorrow.setMinutes(0);
                tomorrow.setSeconds(1);
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 第二天的00:00:01将重新检查提醒事项。`);
                timer = setTimeout(broadcastReminds, tomorrow.getTime() - now.getTime());
            }

            if (list.length) console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 获取完毕，今日共有${list.length}条提醒。`);
            else {
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 获取完毕，今日没有提醒。`);
                remindTomorrow();
                return;
            }

            const remindList: { time: Date, name: string, comment: string }[] = [];
            let nextTime: Date;
            for (const i of list) {
                if (i.time.getTime() <= lastRemindTime.getTime()) {
                    console.log()
                    continue;
                }
                if (i.time.getTime() > now.getTime()) {
                    nextTime = i.time;
                    break;
                }
                remindList.push(i);
            }

            if (!remindList.length) console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 没有任何推送内容。`);
            else {
                await setLastRemindTime(now);
                const content = `现在是${now.toLocaleString("zh-CN", { hour12: false })}\r--------\r` + remindList.map(i => `${i.name}${i.comment ? "\r" + i.comment : ""}`).join("\r--------\r");
                for (const ch of broadcastList) {
                    const bot = (() => {
                        for (const bot of ctx.bots) {
                            if (bot.selfId === ch.selfId) return bot;
                        }
                        return null;
                    })()
                    if (!bot) console.error(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 找不到指定的Bot：${ch.selfId}`);
                    await bot.sendMessage(ch.channelId, content);
                }
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 已推送消息至${broadcastList.length}个会话。`);
            }
            if (nextTime) {
                const duration = nextTime.getTime() - now.getTime();
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] ${Math.floor(duration / 1000)}秒后将重新检查提醒事项。`);
                setTimeout(broadcastReminds, duration);
            } else {
                remindTomorrow();
            }
        } catch (e) {
            console.error(e);
            console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 5分钟后将重新检查提醒事项。`);
            setTimeout(broadcastReminds, 5 * 60 * 1000);
        }
    }
    void broadcastReminds();

    ctx.command("ffxiv.reminder <status:string> [...args]")
        .alias("提醒助手")
        .action(async ({session}, status?: string, ...args) => {
            const broadcastInfo: BroadcastInfo = {
                selfId: session.selfId,
                channelId: session.channelId
            }
            if (status && ["on", "off", "开", "关"].includes(status.toLowerCase())) {
                if (status.toLowerCase() === "on" || status.toLowerCase() === "开") {
                    if (await addBroadcastInfo(broadcastInfo)) {
                        console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] ${session.channelId}打开了艾欧泽亚提醒助手。`)
                        broadcastList = await getBroadcastInfo();
                        return "成功开启艾欧泽亚提醒助手。";
                    }
                    else return "艾欧泽亚提醒助手已开启，无需重复开启。";
                }
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] ${session.channelId}关闭了艾欧泽亚提醒助手。`)
                await removeBroadcastInfo(broadcastInfo);
                broadcastList = await getBroadcastInfo();
                return "成功关闭艾欧泽亚提醒助手。";
            } else if (status && ["new", "新增"].includes(status.toLowerCase())) {
                if (config.admin && (!session.userId || !config.admin.includes(session.userId))) return;
                if (args.length >= 4) {
                    const startAt = new Date(args[0]);
                    const endAt = new Date(args[1]);
                    const repeat = (input => {
                        input = input.toLowerCase();
                        if (["once", "不重复", "单次"].includes(input)) return RemindRepeat.once;
                        else if (["day", "daily", "每天", "每日"].includes(input)) return RemindRepeat.day;
                        else if (["week", "weekly", "每周", "每星期"].includes(input)) return RemindRepeat.week;
                        else if (["month", "monthly", "每月"].includes(input)) return RemindRepeat.month;
                        else if (["year", "yearly", "每年"].includes(input)) return RemindRepeat.year;
                        return -1;
                    })(args[2]);
                    if (repeat === -1) return "输入的重复方式不正确，请确认后再试。";
                    const name = args[4];
                    const comment = args.length > 4 ? args.slice(4).join(" ") : undefined;
                    await session.send(
                        `您正创建新的提醒事项，请确认以下信息：\r` +
                        remindItemToString({startAt, endAt, repeat, name, comment}) + "\r" +
                        "请在30秒内发送“y”确认添加，发送其它任何消息或超时未响应都将取消添加。");
                    const prompt = await session.prompt(30000);
                    if (prompt.toLowerCase() === "y") {
                        if (await addRemindItem({startAt, endAt, repeat, name, comment})) {
                            await broadcastReminds();
                            return "已成功添加新提醒事项。";
                        }
                        return "添加提醒事项失败，存在同名的事件。";
                    } else {
                        return "已取消添加新提醒事项。";
                    }
                }
            } else if (status && ["delete", "del", "删除", "移除"].includes(status.toLowerCase())) {
                if (config.admin && (!session.userId || !config.admin.includes(session.userId))) return;
                const remindItems = await getRemindList();
                if (!remindItems.length) return "当前没有提醒事项。"
                const limit = 5;
                let offset = 0;
                let prompt: string;
                while (!prompt) {
                    await session.send(
                        "当前数据库内有如下事件：\r" +
                        remindItems.slice(offset, offset + limit).map((v, i) => `[${i + 1}]${remindItemToString(v)}\r`).join("--------\r") +
                        `请在30秒内发送对应项目最前方的数字标号以移除该项${offset - limit >= limit ? "，发送P则翻到上一页" : ""}${offset + limit < remindItems.length ? "，发送N则翻到下一页" : ""}。`
                    )
                    prompt = await session.prompt(30000);
                    if (prompt.toLowerCase() === "n" && offset + limit < remindItems.length) {
                        offset += limit;
                        prompt = undefined;
                    } else if (prompt.toLowerCase() === "p" && offset - limit >= limit) {
                        offset -= limit;
                        prompt = undefined;
                    } else if (Number.parseInt(prompt) >= 1 && Number.parseInt(prompt) <= limit) {
                        if (await removeRemindItem(remindItems.slice(offset, offset + limit)[Number.parseInt(prompt) - 1]))
                            return "已成功移除该事件。"
                        else return "移除事件失败。"
                    }
                }

            }
        })
}

const remindItemToString = (item: RemindItem) => {
    let result: string;
    if (item.repeat === RemindRepeat.day) {
        result = `${item.startAt.toLocaleDateString("zh-CN")}到${item.endAt.toLocaleDateString("zh-CN")}的每天${item.startAt.toLocaleTimeString("zh-CN", { hour12: false })}`;
    } else if (item.repeat === RemindRepeat.week) {
        result = `${item.startAt.toLocaleDateString("zh-CN")}到${item.endAt.toLocaleDateString("zh-CN")}期间每周${["日", "一", "二", "三", "四", "五", "六"][item.startAt.getDay()]}的${item.startAt.toLocaleTimeString("zh-CN", { hour12: false })}`;
    } else if (item.repeat === RemindRepeat.month) {
        result = `${item.startAt.toLocaleDateString("zh-CN")}到${item.endAt.toLocaleDateString("zh-CN")}期间每个${item.startAt.getDate()}日的${item.startAt.toLocaleTimeString("zh-CN", { hour12: false })}`;
    } else if (item.repeat === RemindRepeat.year) {
        result = `${item.startAt.toLocaleDateString("zh-CN")}到${item.endAt.toLocaleDateString("zh-CN")}期间每个${item.startAt.getMonth() + 1}月${item.startAt.getDate()}日的${item.startAt.toLocaleTimeString("zh-CN", { hour12: false })}`;
    } else {
        result = `在${item.startAt.toLocaleString("zh-CN", { hour12: false })}`
    }
    result += `\r${item.name}：${item.comment}`;
    return result;
}
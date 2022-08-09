import {Context, segment} from "koishi";
import {EorzeaTime} from "./lib/util/eorzeaTime";
import {insertStr, prefixNum} from "./lib/util/format";

/*
const events = {
    "fishing": {
        alias: ["海钓"],
        time: {
            repeat: true,
            calculate: () => {}
        }
    }
}

interface Schedule {
    time: number
}
*/

enum AlarmType {
    LOCAL = 0,
    SERVER = 1,
    EORZEA = 2
}

const toAlarmTypeName = (type: AlarmType) => {
    if (type === AlarmType.LOCAL) return "本";
    if (type === AlarmType.SERVER) return "服";
    if (type === AlarmType.EORZEA) return "艾";
}

interface Alarm {
    name: string
    type: AlarmType
    repeat: boolean
    time: number
    advance: number
}

const alarms: Record<string, Alarm & { uid: string, action: (alarm: Alarm) => any }> = {};

function getAlarmsByUid (uid: string) {
    const userAlarms = [];
    for (const id in alarms) {
        if (alarms[id].uid === uid) userAlarms.push({ ...alarms[id], id });
    }
    return userAlarms;
}

let timer;

function setupAlarm() {
    if (timer) clearTimeout(timer);

    const userAlarms: (Alarm & { id: string, uid: string, action: (alarm: Alarm) => any })[] = [];
    for (const id in alarms) userAlarms.push({ ...alarms[id], id });
    if (!userAlarms.length) return;
    const now: Date = new Date();
    const mappedAlarms = userAlarms.map(a => {
        let time;
        if (a.type === AlarmType.LOCAL) {
            const targetTime = new Date(`${now.toDateString()}T${insertStr(prefixNum(a.time, 4), 2, ":")}:00`);
            if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);
            targetTime.setMinutes(targetTime.getMinutes() - a.advance);
            time = targetTime;
        } else if (a.type === AlarmType.SERVER) {
            const targetTime = new Date(`${now.getUTCFullYear()}-${prefixNum(now.getUTCMonth() + 1)}-${prefixNum(now.getUTCDate())}T${insertStr(prefixNum(a.time, 4), 2, ":")}:00Z`);
            if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);
            targetTime.setMinutes(targetTime.getMinutes() - a.advance);
            time = targetTime;
        } else if (a.type === AlarmType.EORZEA) {
            const eHour = Math.floor(a.time / 100);
            const eMinute = Math.floor(a.time % 100);
            const targetTime = new EorzeaTime().setHour(eHour).setMinute(eMinute).toNextEarthTime();
            targetTime.setMinutes(targetTime.getMinutes() - a.advance);
            time = targetTime;
        }
        return { id: a.id, uid: a.uid, name: a.name, repeat: a.repeat, advance: a.advance, time, action: a.action, data: a }
    });
    mappedAlarms.sort((a, b) => a.time.getTime() - b.time.getTime());
    const nextTime: number = mappedAlarms[0].time.getTime();
    const nextArray = mappedAlarms.filter(a => a.time.getTime() === nextTime);
    timer = setTimeout(() => {
        nextArray.forEach(v => {
            v.action(v.data as Alarm);
            if (!v.repeat) {
                for (const i in alarms) {
                    if (i === v.id) {
                        delete alarms[i];
                        break;
                    }
                }
            }
        });
        setupAlarm();
    }, nextTime - now.getTime());
}

export function apply(ctx: Context) {
    // const schedule = []

    ctx.command("ffxiv.time")
        .alias("艾欧泽亚时间")
        .shortcut("艾欧泽亚几点了")
        .action(async() => {
            return `现在是艾欧泽亚时间（ET） ${new EorzeaTime().toTimeString()}。`;
        })

    ctx.command("ffxiv.alarm [...args]")
        .alias("闹钟")
        .alias("alarm")
        .alias("/闹钟")
        .alias("/alarm")
        .option("remove", "-r 撤除某个/所有闹钟。")
        .usage(() => {
            return "使用方法：\r" +
                   "/闹钟 <闹钟名字> <本|服|艾> [重复|不重复] <时间(0000-2400)> [提前提醒的分钟数]\r" +
                   "例如：/闹钟 小柠檬 艾 重复 0600 1\r" +
                   "效果：每到艾欧泽亚时间06:00，提前地球时间1分钟发出提醒。"
        })
        .action(async({ session, options }, ...args) => {
            if (options.remove) {
                const userAlarms = getAlarmsByUid(session.uid);
                if (!userAlarms.length)
                    return "您当前未设定任何闹钟。";
                await session.send(`${segment("at", { id: session.uid })}当前设定的闹钟：\r` +
                    userAlarms.map((a, i) => `[${i}]${a.name}(${toAlarmTypeName(a.type)}) ${insertStr(prefixNum(a.time, 4), 2, ":")}${a.advance ? ` (提前${a.advance}分钟)` : ""}`).join("\r") +
                    "\r请在 30 秒内发送闹钟前的数字序号，来撤除该闹钟；或发送“all”撤除所有。发送其它内容或不发送则取消操作。");
                const result = await session.prompt(30000);
                if (!result || !result.length) return;
                if (result.toLowerCase() === "all") {
                    userAlarms.forEach(a => delete alarms[a.id]);
                    setupAlarm();
                    return "已撤除所有闹钟。"
                } else if (parseInt(result) >= 0 && parseInt(result) < userAlarms.length) {
                    delete alarms[userAlarms[parseInt(result)].id]
                    setupAlarm();
                    return `已撤除 ${parseInt(result)} 号闹钟。`;
                } else return;
            }

            const ltName = ["本", "lt"], stName = ["服", "st"], etName = ["艾", "et"];

            if (args.length < 3) return "参数不足，请检查后再试。";
            if (args.length > 5) return "参数过多，请检查后再试。";
            const alarm = {
                name: "",
                type: -1,
                repeat: false,
                time: -1,
                advance: 0,
                uid: session.uid
            }
            while(args.length) {
                const arg: string = args[0];
                if (!alarm.name.length) {
                    alarm.name = (arg && arg.length) ? arg : "未命名闹钟";
                } else if (alarm.type === -1) {
                    if (!arg || !arg.length || (!ltName.includes(arg) && !stName.includes(arg) && !etName.includes(arg)))
                        return "闹钟类型设置错误，只能是“本”、“服”或“艾”中的一种。"
                    alarm.type =
                        ltName.includes(arg.toLowerCase()) ? AlarmType.LOCAL :
                        stName.includes(arg.toLowerCase()) ? AlarmType.SERVER :
                        AlarmType.EORZEA;
                    if (args[1] && ["重复", "rp"].includes(args[1].toLowerCase())) {
                        args.splice(1, 1);
                        alarm.repeat = true;
                    } else if (args.length > 3)
                        return "参数过多，请检查后再试。";
                } else if (alarm.time === -1) {
                    if (!arg || !arg.length || !/\d{4}/.test(arg) || Number.isNaN(arg) || parseInt(arg) > 2400)
                        return "时间设置错误，必须是4位纯数字且处于0000-2400之间。";
                    alarm.time = parseInt(arg);
                } else if (alarm.advance === 0) {
                    if (!arg || !arg.length || !/\d+/.test(arg) || Number.isNaN(arg) || parseInt(arg) < 0)
                        return "提前提醒时间设置错误，必须是一个非负整数。"
                    alarm.advance = parseInt(arg);
                }
                args.splice(0, 1);
            }
            for (let i = 0; ; i++) {
                if (!alarms[i]) {
                    alarms[i] = {
                        ...alarm,
                        action: (alarm: Alarm) => {
                            session.send(`${session.subtype === "group" ? segment("at", { id: session.userId }) : ""}闹钟 - ${alarm.name}(${toAlarmTypeName(alarm.type)}) ${insertStr(prefixNum(alarm.time, 4), 2, ":")}${alarm.advance ? ` (还有${alarm.advance}分钟)` : ""}`);
                        }
                    };
                    break;
                }
            }
            setupAlarm();
            return "已成功设定闹钟。";
        });

    /*
    ctx.command("ffxiv.scheduler <event:string>")
        .alias("提醒")
        .shortcut("海钓提醒", { args: [ "海钓" ] })
        .usage(() => "订阅定时资源提醒。如果指定事件为“海钓”则在下一个偶数小时发送提醒；也可")
        .action(async({ session, options }, event: string) => {
            if (event === "海钓") {}
        })
     */
}

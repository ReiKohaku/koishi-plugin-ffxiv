import {Context} from "koishi-core";
import {EorzeaTime} from "./lib/util/eorzeaTime";

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

export function apply(ctx: Context) {
    // const schedule = []

    ctx.command("ffxiv.time")
        .alias("艾欧泽亚时间")
        .shortcut("艾欧泽亚几点了")
        .action(async() => {
            return `现在是艾欧泽亚时间（ET） ${new EorzeaTime().toTimeString()}。`;
        })

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

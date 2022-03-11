import {Context} from "koishi-core";
import {getData, getQuest, getQuests} from "./lib/API/GarlandTools";
import {insertStr} from "./lib/util/format";

export async function apply(ctx: Context) {
    ctx.command("ffxiv.quest <name:string>")
        .alias("任务进度")
        .alias("/quest")
        .action(async ({ session }, name: string) => {
            const questList = await getQuests();
            const targetQuest = (() => {
                const list = questList.filter(q => q.n.includes(name));
                const allMatchedList = list.filter(q => q.n === name);
                allMatchedList.sort((a, b) => b.i - a.i);
                console.log(allMatchedList[0]);
                if (allMatchedList.length >= 1) return allMatchedList[0];
                else if (list.length === 1) return list[0];
                else if (!list.length || !allMatchedList.length) return null;
                return list;
            })();
            if (!targetQuest) return "没有找到相关任务，请确认输入正确后再试。";
            else if (Array.isArray(targetQuest)) return "关键字对应了多个任务，请输入完整的任务名后再试。";
            else {
                const questInfo = await getQuest(targetQuest.i);
                let process = undefined;
                if (questInfo.quest.sort && questInfo.quest.genre) {
                    const sortQuests = questList.filter(q => q.g === questInfo.quest.genre);
                    sortQuests.sort((a, b) => a.s - b.s);
                    process = {
                        current: sortQuests.map(q => q.i).indexOf(questInfo.quest.id) + 1,
                        total: sortQuests.length
                    }
                }
                const data = await getData();
                const genre = (() => {
                    for (const i in data.questGenreIndex) {
                        const g = data.questGenreIndex[i];
                        if (g.id === questInfo.quest.genre) return g;
                    }
                    return null;
                })();
                const patch = data.patch.partialIndex[insertStr(`${Math.floor(questInfo.quest.patch * 10)}`, 1, ".")];
                const issuerNpc = (() => {
                    const npcs = questInfo.partials.filter(p => p.type === "npc" && p.id === questInfo.quest.issuer.toString());
                    if (!npcs.length) return null;
                    return npcs[0];
                })();
                return `任务：${targetQuest.n}\r` +
                       ((genre && genre.id) ? `分类：${genre.section} - ${genre.category}\r` : "") +
                       (patch ? `版本：${patch.id}\r` : "") +
                       ((genre && patch && process) ? `${genre.name}进度已达到${Math.round(process.current / process.total * 10000) / 100}%(${process.current}/${process.total})。\r` : "") +
                       (issuerNpc ? `任务开始于【${questInfo.quest.location}】${issuerNpc.obj.n}处。\r` : "") +
                       `https://ff14.huijiwiki.com/wiki/${encodeURI("任务:" + targetQuest.n)}`;
            }
        })
}

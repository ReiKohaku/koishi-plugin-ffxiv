import {Context} from "koishi";
import {newsConfig, rssFF14Sdo} from "./lib/rss/sdo";
import {
    addBroadcastInfo,
    BroadcastInfo,
    getBroadcastInfo,
    getLastLoadRss,
    removeBroadcastInfo, setLastLoadRss
} from "./lib/leveldb/news";

export async function apply(ctx: Context) {
    ctx.command("ffxiv.news [status:string]")
        .alias("新闻推送")
        .action(async ({session}, status?: string) => {
            const broadcastInfo: BroadcastInfo = {
                selfId: session.selfId,
                channelId: session.channelId
            }
            if (status && ["on", "off", "开", "关"].includes(status.toLowerCase())) {
                if (status.toLowerCase() === "on" || status.toLowerCase() === "开") {
                    if (await addBroadcastInfo(broadcastInfo)) {
                        console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] ${session.channelId}打开了国服新闻推送。`)
                        broadcastList = await getBroadcastInfo();
                        return "成功开启国服新闻推送。";
                    }
                    else return "国服新闻推送已开启，无需重复开启。";
                }
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] ${session.channelId}关闭了国服新闻推送。`)
                await removeBroadcastInfo(broadcastInfo);
                broadcastList = await getBroadcastInfo();
                return "成功关闭国服新闻推送。";
            }
        })

    /* 启动rss定时检查推送 */
    let broadcastList: BroadcastInfo[] = await getBroadcastInfo();

    async function broadcastNews() {
        try {
            console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 正在检查国服官网RSS源……`);
            const news = await rssFF14Sdo();
            let lastLoadDate = await getLastLoadRss();
            if (!lastLoadDate) {
                await setLastLoadRss(new Date().toISOString());
                lastLoadDate = new Date();
            }
            news.items.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
            if (news.items.length)
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 国服官网最新的文章发布于${new Date(news.items[0].isoDate).toLocaleString("zh-CN", { hour12: false })}。`)
            else console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 未获取到国服官网文章信息。`);
            console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 本地最后检查于${lastLoadDate.toLocaleString("zh-CN", { hour12: false })}`)
            let i: number;
            for (i = 0; i < news.items.length && new Date(news.items[i].isoDate).getTime() > lastLoadDate.getTime(); i++) {}
            if (!i) console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 没有任何推送内容。`);
            else {
                await setLastLoadRss(new Date(news.items[0].isoDate));
                const content = news.items.slice(0, i)
                    .map(n =>
                        `${n.title}\r` +
                        `[${new Date(n.isoDate).toLocaleString("zh-CN", { hour12: false })}]\r` +
                        `${(n.contentSnippet.length >= 100) ? (n.contentSnippet.slice(0, 97) + "...") : n.contentSnippet}\r` +
                        `${n.link}`)
                    .join("\r--------\r")
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
                console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 已推送消息至${broadcastList.length}个会话。`)
            }
        } catch (e) {
            console.error(e);
        } finally {
            console.log(`[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] ${Math.floor(newsConfig.duration / 1000 / 60)}分钟后将重新检查RSS源。`)
            setTimeout(broadcastNews, newsConfig.duration);
        }
    }
    void broadcastNews();
}

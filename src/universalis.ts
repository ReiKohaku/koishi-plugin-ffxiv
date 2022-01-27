import {Context, segment} from "koishi-core";
import {getMarketCurrentlyShown, ItemBase, searchItem} from "./lib/API/universalis";
import {drawItemPriceList} from "./lib/canvas/universalis";

export function apply(ctx: Context) {
    ctx.command("ffxiv.market <name:string>")
        .alias("物价查询")
        .option("hq", "--hq 携带此参数时只查询HQ结果。")
        .option("s", "--server <serverOrDc:string> 指定要查询的服务器或大区，默认为“莫古力”。")
        .shortcut("鸟区物价", { fuzzy: true, options: { s: "陆行鸟" } })
        .shortcut("猪区物价", { fuzzy: true, options: { s: "莫古力" } })
        .shortcut("猫区物价", { fuzzy: true, options: { s: "猫小胖" } })
        .shortcut("狗区物价", { fuzzy: true, options: { s: "豆豆柴" } })
        .action(async({ session, options }, name: string) => {
            if (!name || !name.length) return "请输入要查询物价的物品名称！";
            /*
                koishi v3特性：自动进行繁转简
                导致问题：“猛”会转为“勐”，导致查询失败
                目前先使用特判解决此问题
             */
            name = name.replace("勐", "猛");

            const isGroupMsg: boolean = session.subtype === "group";
            try {
                if (name.toLowerCase().endsWith("hq")) {
                    name = name.slice(0, name.length - 2);
                    options.hq = true;
                }
                const limit = isGroupMsg ? 5 : 10;
                let item: ItemBase, page: number = 1;
                while (!item) {
                    const searchResult = await searchItem(name, { limit, page });
                    if (searchResult.Pagination.ResultsTotal > 1) {
                        const textResult =
                            `查询到 ${searchResult.Pagination.ResultsTotal} 个名字中包含“${name}”的物品。\r` +
                            searchResult.Results.map((item, index) => `${index + 1}. [${item.LevelItem}]${item.Name}`).join("\r") +
                            "\r" +
                            `当前第 ${searchResult.Pagination.Page} 页，共 ${searchResult.Pagination.PageTotal} 页。\r` +
                            "请在 30 秒内输入要检索价格的物品前面的序号，超时或输入无效数据则取消查询。" +
                            ((searchResult.Pagination.PageNext || searchResult.Pagination.PagePrev) ? "输入P/N翻到上一页/下一页。" : "");
                        session?.send(textResult);
                        const reply = await session?.prompt(30000);
                        if (!reply || !reply.length) return;
                        if (reply.toLowerCase() === "n" && searchResult.Pagination.PageNext) {
                            page++;
                            continue;
                        } else if (reply.toLowerCase() === "p" && searchResult.Pagination.PagePrev) {
                            page--;
                            continue;
                        }
                        const replyInt: number = parseInt(reply);
                        if (Number.isNaN(replyInt) || !replyInt || replyInt < 1 || replyInt > searchResult.Results.length) return;
                        item = searchResult.Results[replyInt - 1];
                    } else if (searchResult.Pagination.ResultsTotal === 1) item = searchResult.Results[0];
                    else return `没有找到名字中包含“${name}”的物品。`;
                }

                const saleInfo = await getMarketCurrentlyShown(options.s || "莫古力", item.ID, { hq: options.hq ? 1 : undefined });
                const listImg: Buffer = await drawItemPriceList(item, saleInfo);
                return segment("image", { url: "base64://" + listImg.toString("base64") });
                /*
                return (isGroupMsg ? "" : `${segment("image", {url: `https://cafemaker.wakingsands.com${item.Icon}`})}\r`) +
                    `[${item.LevelItem}]${item.Name}` +
                    `在${saleInfo.worldName || `${saleInfo.dcName}区`}的售卖信息：\r` +
                    `最后更新于 ${new Date(saleInfo.lastUploadTime).toLocaleString()}\r` +
                    `最高NQ/HQ价格：${saleInfo.maxPriceNQ}/${saleInfo.maxPriceHQ}\r` +
                    `最低NQ/HQ价格：${saleInfo.minPriceNQ}/${saleInfo.minPriceHQ}\r` +
                    `正售卖的前${Math.min(saleInfo.listings.length, limit)}组商品信息：\r` +
                    saleInfo.listings.slice(0, limit).map(item => `${item.worldName ? `[${item.worldName}]` : ""}${item.hq ? "[HQ]" : ""}${item.quantity}个×${item.pricePerUnit}金＝${item.total}金`).join("\r");
                 */
            } catch (e) {
                console.error(e);
                return "查询失败，错误信息：\r" + e;
            }
        })
}

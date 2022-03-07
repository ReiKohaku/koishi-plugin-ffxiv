import {Context, segment} from "koishi-core";
import {getMarketCurrentlyShown, ItemBase, searchItem} from "./lib/API/universalis";
import {drawItemPriceList} from "./lib/canvas/universalis";

const alias = {
    "g1": "陈旧的鞣革地图",
    "g2": "陈旧的山羊革地图",
    "g3": "陈旧的巨蟾蜍革地图",
    "g4": "陈旧的野猪革地图",
    "g5": "陈旧的毒蜥蜴革地图",
    "g6": "陈旧的古鸟革地图",
    "g7": "陈旧的飞龙革地图",
    "g8": "陈旧的巨龙革地图",
    "g9": "陈旧的迦迦纳怪鸟革地图",
    "g10": "陈旧的瞪羚革地图",
    "g11": "陈旧的绿飘龙革地图",
    "g12": "陈旧的缠尾蛟革地图",
    "单人绿图": "鞣革制的隐藏地图"
}

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
                /* 特性：允许部分商品使用简称 */
                for (const alia in alias) {
                    if (new RegExp(`^${alia}$`, "iu").test(name)) {
                        name = alias[alia];
                        break;
                    }
                }
                const limit = isGroupMsg ? 5 : 10;
                let item: ItemBase, page: number = 1;

                /* 获取所有物品列表 */
                let searchPage = 1;
                const itemList: ItemBase[] = [];
                while (true) {
                    const searchResult = await searchItem(name, { limit: 100, page: searchPage });
                    if (!searchResult.Pagination.Results) return `没有找到名字中包含“${name}”的物品。`;
                    else itemList.push(...searchResult.Results);
                    if (!searchResult.Pagination.PageNext) break;
                    searchPage++;
                }

                /* 如果全字匹配，则无需再选择 */
                for (const i of itemList) {
                    if (i.Name === name) {
                        item = i;
                        break;
                    }
                }
                const maxPage = Math.ceil(itemList.length / limit);

                while (!item) {
                    if (itemList.length > 1) {
                        const pageItemList = itemList.slice((page - 1) * limit, page * limit)
                        const textResult =
                            `查询到 ${itemList.length} 个名字中包含“${name}”的物品。\r` +
                            pageItemList.map((item, index) => `${index + 1}. [${item.LevelItem}]${item.Name}`)
                                .join("\r") +
                            "\r" +
                            `当前第 ${page} 页，共 ${maxPage} 页。\r` +
                            "请在 30 秒内输入要检索价格的物品前面的序号，超时或输入无效数据则取消查询。" +
                            ((maxPage > 1) ? "输入P/N翻到上一页/下一页。" : "");
                        await session?.send(textResult);
                        const reply = await session?.prompt(30000);
                        if (!reply || !reply.length) return;
                        if (reply.toLowerCase() === "n" && page < maxPage) {
                            page++;
                            continue;
                        } else if (reply.toLowerCase() === "p" && page > 1) {
                            page--;
                            continue;
                        }
                        const replyInt: number = parseInt(reply);
                        if (Number.isNaN(replyInt) || !replyInt || replyInt < 1 || replyInt > pageItemList.length) return;
                        item = pageItemList[replyInt - 1];
                    } else item = itemList[0];
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

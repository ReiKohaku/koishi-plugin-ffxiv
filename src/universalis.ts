import {Context, segment} from "koishi";
import {getMarketBoardCurrentData} from "./lib/API/universalis";
import {drawItemPriceList} from "./lib/canvas/universalis";
import {getItem, ItemBase, searchItem} from "./lib/API/xivapi";
import itemAlias from "./lib/util/alias";
import {toCurrentTimeDifference} from "./lib/util/format";

export function apply(ctx: Context) {
    ctx.command("ffxiv.market <name:string>")
        .alias("物价查询")
        .usage(
            "使用“物价查询”进行基本的物价查询操作。\r" +
            "示例1：查询莫古力区潮风亭服务器的“弦月睡袍”物品最低的若干条价格\r" +
            "物价查询 -s 潮风亭 弦月睡袍\r" +
            "示例2：查询陆行鸟区全区的高品质“巨匠药酒”物品最低的若干条价格\r" +
            "鸟区物价 巨匠药酒hq\r" +
            "\r" +
            "使用提示：\r" +
            "1、可以少字，但千万不要多字或错字，否则将无法查询到物品；\r" +
            "2、可以直接用“鸟/猪/猫/狗+区物价”查询对应大区的物价，正如示例2所示；\r" +
            "3、数据来源于universalis，全部由玩家上传（如使用Match抹茶插件自动上传），因此很有可能会出现不准确的情况，故本功能查询到的结果仅供参考。")
        .option("hq", "--hq 携带此参数时只查询HQ结果。")
        .option("s", "--server <serverOrDc:string> 指定要查询的服务器或大区，默认为“莫古力”。")
        .shortcut("鸟区物价", { fuzzy: true, options: { s: "陆行鸟" } })
        .shortcut("猪区物价", { fuzzy: true, options: { s: "莫古力" } })
        .shortcut("猫区物价", { fuzzy: true, options: { s: "猫小胖" } })
        .shortcut("狗区物价", { fuzzy: true, options: { s: "豆豆柴" } })
        .shortcut("国服物价", { fuzzy: true, options: { s: "China" } })
        .shortcut("日服物价", { fuzzy: true, options: { s: "Japan" } })
        .shortcut("欧服物价", { fuzzy: true, options: { s: "Europe" } })
        .shortcut("北美服物价", { fuzzy: true, options: { s: "North-America" } })
        .shortcut("大洋洲服物价", { fuzzy: true, options: { s: "Oceania" } })
        .action(async({ session, options }, name: string) => {
            if (!name || !name.length) return "请输入要查询物价的物品名称！";

            const isGroupMsg: boolean = session.subtype === "group";
            try {
                if (name.toLowerCase().endsWith("hq")) {
                    name = name.slice(0, name.length - 2);
                    options.hq = true;
                }
                /* 特性：允许部分商品使用简称 */
                name = itemAlias.findItemName(name);
                const limit = isGroupMsg ? 5 : 10;
                let item: ItemBase, page: number = 1;

                /* 获取所有物品列表 */
                let searchPage = 1;
                const itemList: ItemBase[] = [];
                while (true) {
                    const searchResult = await searchItem(name, {
                        indexes: "item",
                        filters: "ItemSearchCategory.ID>=1",
                        columns: "ID,Icon,Name,LevelItem,Rarity,ItemSearchCategory.Name,ItemSearchCategory.ID,ItemKind.Name",
                        limit: 100,
                        page: searchPage,
                        sort_field: "LevelItem",
                        sort_order: "desc"
                    });
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
                const itemInfo = await getItem(item.ID);
                if (!itemInfo.CanBeHq && options.hq) return `${itemInfo.Name}不存在HQ版本。`

                const saleInfo = await getMarketBoardCurrentData(options.s || "莫古力", item.ID, { hq: options.hq ? 1 : undefined });
                if (!saleInfo.listings.length) return `当前没有售卖${itemInfo.Name}${options.hq ? "HQ" : ""}的记录（最后更新于${toCurrentTimeDifference(new Date(saleInfo.lastUploadTime), true)}）。`

                const listImg: Buffer = await drawItemPriceList(itemInfo, saleInfo);
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

    // TODO: 物价统计功能，预计将于下个小版本推出
    /*
    ctx.command("ffxiv.price-statistics <type:string>")
        .alias("物价统计")
        .usage("")
        .action(async({ session, options }, type: string) => {
            //  由于统计需要扫描所有可能的物品，因此更新频率不宜过高，设计为每24小时全部扫描更新一次
            //  支持的统计种类：
            //  1. 最赚钱单品：即可通过生产职业制造获得的物品，根据原料价格（含税）计算得出单品成本，再根据当前最低的价格计算出利润空间，最后按照金额得出赚钱数额排序；
            //  2. 最赚钱雇员委托物品：计算各服务器的雇员能带回的物品中，平均到每个探险币收益最大的物品；
        })
    */
}

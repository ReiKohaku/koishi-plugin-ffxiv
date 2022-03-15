import {Context, segment} from "koishi-core";
import {ItemBase, searchItem} from "./lib/API/xivapi";
import {itemAlias} from "./lib/util/alias";
import {getData, getItem} from "./lib/API/GarlandTools";
import {drawItemInfo} from "./lib/canvas/item";
import {wrapReply} from "./lib/util/message";

export function apply(ctx: Context) {
    ctx.command("ffxiv.item <name:text>")
        .alias("艾欧泽亚图鉴")
        .alias("物品查询")
        .alias("查询物品")
        .action(async ({ session }, name) => {
            if (!name || !name.length) return "请输入要查询物价的物品名称！";
            name = name.replace("勐", "猛");

            const isGroupMsg: boolean = session.subtype === "group";
            try {
                for (const alia in itemAlias) {
                    if (new RegExp(`^${alia}$`, "iu").test(name)) {
                        name = itemAlias[alia];
                        break;
                    }
                }
                const limit = isGroupMsg ? 5 : 10;
                let item: ItemBase, page: number = 1;

                /* 获取所有物品列表 */
                let searchPage = 1;
                const itemList: ItemBase[] = [];
                while (true) {
                    const searchResult = await searchItem(name, {
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

                const timer = setTimeout(() => {
                    session.send(wrapReply(session, "由于数据量较大，生成需要一段时间，请耐心等待……"));
                }, 5000);
                const itemInfo = await getItem(item.ID);
                const data = await getData();
                const image = await drawItemInfo(itemInfo, data);
                clearTimeout(timer);
                return segment("image", { url: "base64://" + image.toString("base64") })

            } catch (e) {
                console.error(e);
                return "查询失败，错误信息：\r" + e;
            }
        })
}

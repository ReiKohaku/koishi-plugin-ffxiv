import {Context} from "koishi-core";
import {getServerAllHouseInfo, servers, territories} from "./lib/API/iWanaHome";
import {prefixNum, toCurrentTimeDifference} from "./lib/util/format";

export function apply(ctx: Context) {
    ctx.command("ffxiv.house <server:string>")
        .alias("空房查询")
        .action(async({ session }, server) => {
            if (!server || !server.length) return "使用命令时请一并输入您要查询房价的服务器，如想要查询潮风亭的房价：房价查询 潮风亭";
            for (const id in servers) {
                if (servers[id] === server) {
                    const serverAllHouseInfo = await getServerAllHouseInfo(parseInt(id));
                    if (!serverAllHouseInfo.onsale.length) {
                        return `目前${servers[id]}没有在售的房屋（最后更新于${toCurrentTimeDifference(new Date(serverAllHouseInfo.last_update * 1000), true)}）。`
                    }
                    serverAllHouseInfo.onsale.sort((a, b) => a.start_sell - b.start_sell);
                    return `※${servers[id]}的房屋信息\r` +
                           `最后更新于${toCurrentTimeDifference(new Date(serverAllHouseInfo.last_update * 1000), true)}\r` +
                           `在售时间最长的${Math.min(serverAllHouseInfo.onsale.length, 5)}条房屋信息：\r` +
                           serverAllHouseInfo.onsale.slice(0, 5).map(h => {
                               const houseLoc = `${territories[h.territory_id].short}${prefixNum(h.ward_id + 1, 2)}-${prefixNum(h.house_id + 1, 2)}`;
                               return `${houseLoc} | ${h.price}Gil\r已空置${toCurrentTimeDifference(new Date(h.start_sell * 1000))}（${new Date(h.start_sell * 1000).toLocaleString()}开始空置）`;
                           }).join("\r");
                }
            }
            return `服务器“${server}”不存在，请检查输入是否正确，或向插件仓库提出issue：https://github.com/ReiKohaku/koishi-plugin-ffxiv/issues。`;
        })
}

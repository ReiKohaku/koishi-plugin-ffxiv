import {Context} from "koishi";
import {getServerAllHouseInfo, servers, territories} from "./lib/API/iWanaHome";
import {prefixNum, toCurrentTimeDifference, toReadableNum} from "./lib/util/format";

/* 此部分代码已弃用 */
export function apply(ctx: Context) {
    ctx.command("ffxiv.house <server:string> [size:string] [territory:string] [ward:number]")
        .alias("空房查询")
        .example('查询潮风亭白银乡14区的L房：空房查询 潮风亭 L 白 14')
        .action(async({ session }, server, size, territory, ward) => {
            if (!server || !server.length) return "使用命令时请一并输入您要查询房价的服务器，如想要查询潮风亭的房价：房价查询 潮风亭";
            const sliceNum = 6;
            const sizeType = ['S', 'M', 'L'];
            const sizeNumber = !sizeType.includes(size.toUpperCase()) ? undefined : sizeType.indexOf(size.toUpperCase());
            for (const id in servers) {
                if (servers[id] === server) {
                    const serverAllHouseInfo = await getServerAllHouseInfo(parseInt(id));
                    const filter = []
                    if (sizeNumber !== undefined) {
                        serverAllHouseInfo.onsale = serverAllHouseInfo.onsale.filter(v => v.size - 1 === sizeNumber);
                        filter.push(`${sizeType[sizeNumber]}房`)
                    }
                    if (Object.values(territories).map(v => v.short).includes(territory) || Object.values(territories).map(v => v.full).includes(territory)) {
                        serverAllHouseInfo.onsale = serverAllHouseInfo.onsale.filter(v => territories[v.territory_id].short === territory || territories[v.territory_id].full === territory);
                        filter.push(territory)
                    }
                    if (!Number.isNaN(ward) && Number.isFinite(ward)) {
                        serverAllHouseInfo.onsale = serverAllHouseInfo.onsale.filter(v => v.ward_id === ward - 1);
                        filter.push(`${ward}区`)
                    }
                    if (!serverAllHouseInfo.onsale.length) {
                        return `目前${servers[id]}没有在售的房屋（最后更新于${toCurrentTimeDifference(new Date(serverAllHouseInfo.last_update * 1000), true)}）。` +
                               (filter.length ? `\r筛选条件：${filter.join(' ')}` : '')
                    }
                    serverAllHouseInfo.onsale.sort((a, b) => a.start_sell - b.start_sell);
                    const onSale = serverAllHouseInfo.onsale
                    return `※${servers[id]}的房屋信息\r` +
                           (filter.length ? `筛选条件：${filter.join(' ')}\r` : '') +
                           `最后更新于${toCurrentTimeDifference(new Date(serverAllHouseInfo.last_update * 1000), true)}\r` +
                           `共查询到${onSale.length}条记录${(onSale.length > sliceNum) ? `，其中在售时间最长的${Math.min(onSale.length, sliceNum)}条${sizeNumber === undefined ? '' : `${sizeType[sizeNumber]}房`}房屋信息` : ''}：\r` +
                           onSale.slice(0, sliceNum).map(h => {
                               const houseLoc = `${territories[h.territory_id].short}${prefixNum(h.ward_id + 1, 2)}-${prefixNum(h.house_id + 1, 2)}`;
                               return `${houseLoc} | ${toReadableNum(h.price)}Gil\r已空置${toCurrentTimeDifference(new Date(h.start_sell * 1000))}（${new Date(h.start_sell * 1000).toLocaleString("zh-CN", { hour12: false })}）`;
                           }).join("\r") +
                           `\r更多信息请点击链接查看：https://wanahome.ffxiv.bingyin.org/state/${parseInt(id)}`;
                }
            }
            return `服务器“${server}”不存在，请检查输入是否正确，或向插件仓库提出issue：https://github.com/ReiKohaku/koishi-plugin-ffxiv/issues。`;
        })
}

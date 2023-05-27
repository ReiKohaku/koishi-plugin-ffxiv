import Axios, {AxiosResponse} from "axios";
const axios = Axios.create({
    baseURL: "https://house.ffxiv.cyou/api/"
});

/**
 * 又一个需要手动维护的API T_T
 * 好在旧版本已经弃用了，只用新版就行
 * 但是还要吐槽一下，一次性把所有房子数据都拉下来，真有你的……
 */

interface SaleHouseInfo {
    Area: number
    EndTime: number
    FirstSeen: number  // 首次获取时间，10位时间戳
    ID: number
    LastSeen: number  // 最后更新时间，10位时间戳
    Participate: number
    Price: number
    PurchaseType: number
    RegionType: number
    Server: number
    Size: number
    Slot: number
    State: number
    UpdateTime: number
    Winner: number
}

export const areas: { [key: number]: { full: string, short: string } } = {
    0: { full: "海雾村", short: "海" },
    1: { full: "薰衣草苗圃", short: "森" },
    2: { full: "高脚孤丘", short: "沙" },
    3: { full: "白银乡", short: "白" },
    4: { full: "穹顶皓天", short: "天" }
}

export const dc_server: { dc_name: string, servers: {[key: number]: string} }[] = [
    {
        dc_name: "陆行鸟",
        servers: {
            1042: "拉诺西亚",
            1044: "幻影群岛",
            1060: "萌芽池",
            1081: "神意之地",
            1167: "红玉海",
            1173: "宇宙和音",
            1174: "沃仙曦染",
            1175: "晨曦王座"
        }
    },
    {
        dc_name: "莫古力",
        servers: {
            1076: "白金幻象",
            1113: "旅人栈桥",
            1121: "拂晓之间",
            1166: "龙巢神殿",
            1170: "潮风亭",
            1171: "神拳痕",
            1172: "白银乡",
            1176: "梦羽宝境"
        }
    },
    {
        dc_name: "猫小胖",
        servers: {
            1043: "紫水栈桥",
            1045: "摩杜纳",
            1106: "静语庄园",
            1169: "延夏",
            1177: "海猫茶屋",
            1178: "柔风海湾",
            1179: "琥珀原"
        }
    },
    {
        dc_name: "豆豆柴",
        servers: {
            1183: "银泪湖",
            1192: "水晶塔",
            1180: "太阳海岸",
            1186: "伊修加德",
            1201: "红茶川"
        }
    }
]

export const servers: Record<number, string> = (() => {
    const servers: Record<number, string> = {};
    dc_server.forEach(d => {
        for (const id in d.servers) servers[id] = d.servers[id];
    });
    return servers;
})();

export const serverList: string[] = (() => {
    const serverList: string[] = [];
    dc_server.forEach(d => {
        for (const server in d.servers) serverList.push(server);
    });
    return serverList;
})()

export async function getServerHouseList(server: number, timestamp: number): Promise<SaleHouseInfo[]> {
    const result = await axios.get<any, AxiosResponse<SaleHouseInfo[]>>("/sales", {
        params: { server, timestamp }
    });
    return result.data
}

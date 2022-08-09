import Axios, {AxiosResponse} from "axios";

/* 2022-08-09: Use Universalis API v2, Rate Limit 25req/min */

const axios = Axios.create({
    baseURL: "https://universalis.app/api/v2/"
});

export interface MarketBoardCurrentDataResponse {
    itemID: number
    // 查询对象信息 开始
    regionName?: string // 以地区为对象查询时，包含此项
    dcName?: string // 以大区为对象查询时，包含此项
    worldID?: number // 以服务器为对象查询时，包含此项
    worldName?: string // 以服务器为对象查询时，包含此项
    // 查询对象信息 结束
    lastUploadTime: number // 13位时间戳
    listings: {
        lastReviewTime: number
        pricePerUnit: number
        quantity: number
        stainID: number
        creatorName: string
        creatorID: string | null
        hq: boolean
        isCrafted: boolean
        listingID: string | null
        materia: {
            slotID: number
            materiaID: number
        }[]
        onMannequin: boolean
        retainerCity: number
        retainerID: string
        retainerName: string
        sellerID: string
        total: number
        worldID?: number
        worldName?: string
    }[]
    maxPrice: number
    maxPriceHQ: number
    maxPriceNQ: number
    minPrice: number
    minPriceHQ: number
    minPriceNQ: number
    nqSaleVelocity: number
    recentHistory: {
        hq: boolean
        pricePerUnit: number
        quantity: number
        timestamp: number
        worldName?: string
        worldID?: number
        buyerName: string
        total: number
    }[]
    regularSaleVelocity: number
    stackSizeHistogram: Record<number, number>
    stackSizeHistogramHQ: Record<number, number>
    stackSizeHistogramNQ: Record<number, number>
    worldUploadTimes?: Record<number, number>
}

export async function getMarketBoardCurrentData(worldDcRegion: string, itemIds: number, options: { listings?: string, entries?: number, noGst?: boolean, hq?: boolean | number, statsWithin?: number, entriesWithin?: number } = {}): Promise<MarketBoardCurrentDataResponse> {
    const result: AxiosResponse<MarketBoardCurrentDataResponse> = await axios({
        method: "GET",
        url: encodeURI(`/${worldDcRegion}/${itemIds}`),
        params: options
    });
    return result.data;
}

import Axios, {AxiosResponse} from "axios";

const axios = Axios.create({
    baseURL: "https://universalis.app/api/"
});

interface CurrentlyShownResponse {
    itemID: number
    worldID?: number
    worldName?: string
    dcName?: string
    lastUploadTime: number
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

export async function getMarketCurrentlyShown(server: string, id: number, options: { listings?: string, entries?: number, noGst?: boolean, hq?: boolean | number, statsWithin?: number, entriesWithin?: number } = {}): Promise<CurrentlyShownResponse> {
    const result: AxiosResponse<CurrentlyShownResponse> = await axios({
        method: "GET",
        url: encodeURI(`/${server}/${id}`),
        params: options
    });
    return result.data;
}

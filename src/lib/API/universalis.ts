import Axios, {AxiosPromise, AxiosResponse} from "axios";
const axios = Axios.create({});

export interface ItemBase {
    ID: number
    Icon: string
    ItemKind: {
        Name: string
    }
    ItemSearchCategory: {
        ID: number
        Name: string
    }
    LevelItem: number
    Name: string
    Rarity: number
}
export interface SearchItemResponse {
    Pagination: {
        Page: number
        PagePrev: number | null
        PageNext: number | null
        PageTotal: number
        Results: number
        ResultsPerPage: number,
        ResultsTotal: number
    }
    Results: ItemBase[]
}

export async function searchItem(item: string, options: { limit?: number, page?: number } = {}): Promise<SearchItemResponse> {
    const result: AxiosResponse<SearchItemResponse> = await axios({
        method: "GET",
        url: "https://cafemaker.wakingsands.com/search",
        params: {
            indexes: "item",
            filters: "ItemSearchCategory.ID>=1",
            columns: "ID,Icon,Name,LevelItem,Rarity,ItemSearchCategory.Name,ItemSearchCategory.ID,ItemKind.Name",
            string: item,
            limit: options.limit || 10,
            page: options.page || undefined,
            sort_field: "LevelItem",
            sort_order: "desc"
        }
    });
    return result.data;
}

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
        worldName?: number
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
        url: encodeURI(`https://universalis.app/api/${server}/${id}`),
        params: options
    });
    return result.data;
}

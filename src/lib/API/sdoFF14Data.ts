import Axios from "axios";
const axios = Axios.create({});

export interface SdoFF14DataResponse<T> {
    IsSuccess: boolean
    Data: T
    ErrorMsg: string
    Errorcode: number
    total: number
}

export interface ServerStatus {
    AreaName: string
    Group: {
        name: string
        runing: boolean
        isnew: boolean
        isint: boolean
        isout: boolean
        iscreate: boolean
    }[]
}

export async function getServers(options: { callback?: string } = {}): Promise<SdoFF14DataResponse<ServerStatus[]> | string> {
    const { callback } = options;
    const result = await axios.request({
        method: "GET",
        url: "https://act1.ff.sdo.com/FF14DataApi/Servers20200512/api/index.php",
        params: {
            act: "getServers",
            callback
        }
    });
    if (callback) return result.data as SdoFF14DataResponse<ServerStatus[]>
    else return result.data as string
}

import {prefixNum} from "./format";

export class EorzeaTime {
    private year: number;
    private month: number;
    private day: number;
    private hour: number;
    private minute: number;
    private second: number;

    constructor(time?: number | Date) {
        const timeNum = !time ? new Date().getTime() : (typeof time === "number") ? time : time.getTime();
        const eorzeaTimeNum = Math.floor(timeNum / 1000 * 3600 / 175);
        this.year = Math.floor(eorzeaTimeNum / TimeUnit.YEAR) + 1;
        this.month = Math.floor((eorzeaTimeNum / TimeUnit.MONTH) % 12) + 1;
        this.day = Math.floor((eorzeaTimeNum / TimeUnit.DAY) % 32) + 1;
        this.hour = Math.floor((eorzeaTimeNum / TimeUnit.HOUR) % 24);
        this.minute = Math.floor((eorzeaTimeNum / TimeUnit.MINUTE) % 60);
        this.second = Math.floor((eorzeaTimeNum / TimeUnit.SECOND) % 60);
    }

    public toTimeString(): string {
        return `${prefixNum(this.hour)}:${prefixNum(this.minute)}`;
    }
}

export enum TimeUnit {
    SECOND = 1,
    MINUTE = 60,
    HOUR = 3600,
    DAY = 86400,
    MONTH = 2764800,
    YEAR = 33177600
}

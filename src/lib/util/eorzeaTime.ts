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

    /**
     * 艾欧泽亚时间戳
     */
    public getTime(): number {
        return this.second * TimeUnit.SECOND +
            this.minute * TimeUnit.MINUTE +
            this.hour * TimeUnit.HOUR +
            (this.day - 1) * TimeUnit.DAY +
            (this.month - 1) * TimeUnit.MONTH +
            (this.year - 1) * TimeUnit.YEAR;
    }

    public setHour(hour: number) {
        this.hour = hour;
        return this;
    }

    public setMinute(minute: number) {
        this.minute = minute;
        return this;
    }

    /**
     * 计算距离当前艾欧泽亚时间最近的下一个地球时间。
     */
    public toNextEarthTime(): Date {
        const second = this.second;
        this.second = 0;
        const timeNum = this.getTime() * 175 / 3600 * 1000;
        this.second = second;
        const time = new Date(timeNum);
        const now = new Date();
        const DAY = 24 * 60 * 175 / 3600;
        while(time <= now) time.setMinutes(time.getMinutes() + DAY);
        return time;
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

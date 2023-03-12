export function prefixNum(num: number, length: number = 2): string {
    let str = num.toString();
    for (let i = str.length; i < length; i++) str = "0" + str;
    return str;
}

export function insertStr(source: string, start: number, newStr: string) {
    return source.slice(0, start) + newStr + source.slice(start);
}

export function toCurrentTimeDifference(time: Date, withSoonerOrLater?: boolean) {
    const nowNum = new Date().getTime();
    const timeNum = time.getTime();
    const timeDiff = Math.abs(timeNum - nowNum) / 1000;
    return ((Math.floor(timeDiff / (60 * 60 * 24)) > 0) ? `${Math.floor(timeDiff / (60 * 60 * 24))}天` : "") +
           ((Math.floor(timeDiff / (60 * 60)) > 0) ? `${Math.floor(timeDiff / (60 * 60)) % 24}时` : "") +
           ((Math.floor(timeDiff / 60) > 0) ? `${Math.floor(timeDiff / 60) % 60}分` : "") +
           `${Math.floor(timeDiff % 60)}秒` + (withSoonerOrLater ? ((timeNum > nowNum) ? "后" : "前") : "");
}

export function toReadableTime(time: number): string {
    // 单位是秒
    let result = "";
    if (time % 60) result = `${time % 60}秒` + result;
    if (Math.floor(time / 60) % 60) result = `${Math.floor(time / 60) % 60}分钟` + result;
    if (Math.floor(time / 3600) % 24) result = `${Math.floor(time / 3600) % 24}小时` + result;
    if (Math.floor(time / 86400)) result = `${Math.floor(time / 86400)}天` + result;
    return result;
}

export function toReadableNum(num: number, precision?: number, separator = ','): string {
    let parts;
    // 判断是否为数字
    if (isFinite(num)) {
        // 处理小数点位数
        let processNum = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString();
        // 分离数字的小数部分和整数部分
        parts = processNum.split('.');
        // 整数部分加[separator]分隔, 借用一个著名的正则表达式
        parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ','));

        return parts.join('.');
    }
    return '';
}
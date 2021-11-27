export function prefixNum(num: number, length: number = 2): string {
    let str = num.toString();
    for (let i = str.length; i < length; i++) str += "0";
    return str;
}

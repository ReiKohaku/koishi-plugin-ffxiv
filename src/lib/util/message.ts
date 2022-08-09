import {segment, Session} from "koishi";

function _wrapReply (messageId: string, content: string)
function _wrapReply (session: Session, content: string)
function _wrapReply (message: string | Session, content: string) {
    const r = (id: string) => segment("quote", { id }) + " " + content;
    if (typeof message === "string") return r(message)
    else if (message.platform === "onebot" && message.subtype === "group") {
        // 腾讯定制回复 解决缩略消息吞昵称的问题 真有你的腾讯
        return segment("quote", { id: message.messageId }) +
            segment("at", { id: message.userId }) +
            content;
    }
    else if (message.subtype === "private") return content;
    return r(message.messageId);
}
export const wrapReply = _wrapReply;

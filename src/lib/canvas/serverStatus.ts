import {ServerStatus} from "../API/sdoFF14Data";
import {Canvas,  loadImage} from "skia-canvas";
import "../util/canvas"
import path from "path";
import {__root_dir} from "../../index";
import {roundRect} from "../util/canvas";

export async function drawServerStatus(serverStatus: ServerStatus[]) {
    const top = 16, bottom = 16,
        left = 16, right = 16,
        duration = 8;

    const maxServerCount: number = Math.max(...serverStatus.map(i => i.Group.length)),
          areaCardWidth: number = 280,
          areaCardTitleHeight: number = 72,
          areaCardServerHeight: number = 56,
          mainAreaWidth: number = Math.max(areaCardWidth * serverStatus.length + duration * (serverStatus.length - 1), areaCardWidth),
          mainAreaHeight: number = areaCardTitleHeight + maxServerCount * areaCardServerHeight,
          titleHeight: number = 170,
          titleTextHeight: number = 120,
          announcementHeight: number = 120,
          iconHeight: number = 18;

    const drawAreaWidth = mainAreaWidth,
          drawAreaHeight = titleHeight + mainAreaHeight + announcementHeight;

    const canvas = new Canvas(left + mainAreaWidth + right, top + drawAreaHeight + bottom);
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.fillStyle = "#OFOF12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const icon_running = await loadImage(path.join(__root_dir, "/public/image/server/running.png"));
    const icon_closed = await loadImage(path.join(__root_dir, "/public/image/server/closed.png"));
    const icon_in = await loadImage(path.join(__root_dir, "/public/image/server/in.png"));
    const icon_out = await loadImage(path.join(__root_dir, "/public/image/server/out.png"));
    const icon_create = await loadImage(path.join(__root_dir, "/public/image/server/create.png"));
    const icon_no_create = await loadImage(path.join(__root_dir, "/public/image/server/no_create.png"));

    const image_left = await loadImage(path.join(__root_dir, "/public/image/server/left.png"));
    const image_right = await loadImage(path.join(__root_dir, "/public/image/server/right.png"));

    /* ?????? */
    ctx.save();
    const title = "????????????????????????"
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "55px simhei,Sans";
    ctx.fillText(title, canvas.width / 2, titleTextHeight / 2);

    const titleTextWidth = ctx.measureText(title).width;
    ctx.drawImage(image_left, (canvas.width - titleTextWidth) / 2, (titleTextHeight - image_left.height) / 2);
    ctx.drawImage(image_right, (canvas.width + titleTextWidth) / 2, (titleTextHeight - image_right.height) / 2);
    ctx.restore();

    const legends = [
        { image: icon_running, title: "?????????" },
        { image: icon_closed, title: "?????????" },
        { image: icon_in, title: "?????????" },
        { image: icon_out, title: "?????????" },
        { image: icon_create, title: "??????????????????" },
        { image: icon_no_create, title: "?????????????????????" },
    ]
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "18px simhei,Sans";
    legends.forEach((legend, index) => {
        const drawLeft = left + index * drawAreaWidth / legends.length;
        const drawTop = titleTextHeight;
        const drawHeight = titleHeight - titleTextHeight;
        const iconWidth = iconHeight / legend.image.height * legend.image.width;
        ctx.drawImage(legend.image,
            drawLeft, drawTop + (drawHeight - legend.image.height) / 2,
            iconWidth, iconHeight);
        ctx.fillText(legend.title, drawLeft + iconWidth + duration, drawTop + drawHeight / 2);
    })
    ctx.restore();

    /* ???????????? */
    serverStatus.forEach((area, index) => {
        const areaLeft = left + index * (duration + areaCardWidth);

        ctx.save();
        ctx.fillStyle = "#25262C";
        roundRect(ctx,
            areaLeft, titleHeight,
            areaCardWidth, areaCardTitleHeight + areaCardServerHeight * area.Group.length, 5);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#313239";
        roundRect(ctx,
            areaLeft, titleHeight,
            areaCardWidth, areaCardTitleHeight, 5);
        ctx.fill();
        ctx.fillRect(areaLeft,
            titleHeight + areaCardTitleHeight - 5, areaCardWidth, 5); // ????????????????????????
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#A2A5B4";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "36px simhei,Sans";
        ctx.fillText(area.AreaName, areaLeft + areaCardWidth / 2, titleHeight + areaCardTitleHeight / 2);
        ctx.restore();

        area.Group.forEach((group, gIndex) => {
            const sTop = titleHeight + areaCardTitleHeight + gIndex * areaCardServerHeight;
            const lineMiddle = sTop + areaCardServerHeight / 2;
            if (gIndex) {
                ctx.save();
                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.fillRect(areaLeft + duration, sTop, areaCardWidth - 2 * duration, 1);
                ctx.restore();
            }
            let drawLeft = areaLeft + duration;

            /* ??????????????? */
            const statusIcon = group.runing ? icon_running : icon_closed;
            const statusIconWidth = iconHeight / statusIcon.height * statusIcon.width;
            ctx.drawImage(statusIcon,
                drawLeft,
                lineMiddle - iconHeight / 2,
                statusIconWidth,
                iconHeight);
            drawLeft += statusIconWidth + duration;

            /* ???????????? */
            ctx.save();
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = "18px simhei,Sans";
            ctx.fillText(group.name, drawLeft, lineMiddle);
            ctx.restore();

            // ??????????????????????????????
            let drawRight = areaLeft + areaCardWidth - duration;

            /* ?????? */
            const createIcon = group.iscreate ? icon_create : icon_no_create;
            const createIconWidth = iconHeight / createIcon.height * createIcon.width;
            ctx.drawImage(createIcon,
                drawRight - createIconWidth,
                lineMiddle - iconHeight / 2,
                createIconWidth,
                iconHeight
            );
            drawRight -= createIconWidth + duration;

            /* ?????? */
            const outIconWidth = iconHeight / icon_out.height * icon_out.width;
            if (group.isout) ctx.drawImage(icon_out,
                drawRight - outIconWidth,
                lineMiddle - iconHeight / 2,
                outIconWidth,
                iconHeight
            );
            drawRight -= outIconWidth + duration;

            /* ?????? */
            const inIconWidth = iconHeight / icon_in.height * icon_in.width;
            if (group.isint) ctx.drawImage(icon_in,
                drawRight - inIconWidth,
                lineMiddle - iconHeight / 2,
                inIconWidth,
                iconHeight
            );
            drawRight -= inIconWidth + duration;

            /* ???????????? */
            ctx.save();
            ctx.fillStyle = "#F88407";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.font = "18px simhei,Sans";
            if (group.isnew) ctx.fillText("NEW", drawRight, lineMiddle);
            ctx.restore();
        })
    });

    /* ???????????? */
    ctx.save();
    const announcement =
        `???????????????${new Date().toLocaleString("zh-CN", { hour12: false })}?????????????????????????????????https://ff.web.sdo.com/???\n` +
        "????????????????????????koishi-plugin-ffxiv?????????????????????koishi v3?????????\n" +
        "??????????????????https://github.com/ReiKohaku/koishi-plugin-ffxiv???\n" +
        "?????????????????????????????????????????????????????????????????????\n" +
        "??????????????????????????????????????????????????????????????????????????????????????????????????????"
    ctx.fillStyle = "rgb(192, 192, 192)";
    ctx.font = "12px simhei,Sans";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.textWrap = true;
    const announcementTextHeight = ctx.measureText(announcement).lines.map(l => l.height).reduce((p, c) => p + c);
    const announcementTop = canvas.height - bottom - announcementTextHeight;
    ctx.fillText(announcement, left, announcementTop, drawAreaWidth);
    ctx.restore();

    return canvas.toBuffer("png");
}

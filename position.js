import { runer, each } from '@soei/tools';

let SCREEN = document.documentElement;

let list = [];
let
    r_MULTI_SEL = /(?:\,|\|{2})/;

const Px = 'px';
let SPACE = '', Nil;

var aPosition = ['s-left', 's-top', 's-right', 's-bottom'];
var iPMap = { left: 0, top: 1, right: 2, bottom: 3 };

export const resize = () => {
    runer(list)
}
export const observer = new ResizeObserver(resize);
observer.observe(SCREEN);

export function position(simply) {
    if (!simply.onresize) {
        list.push(() => {
            position(simply)
        });
        simply.onresize = true;
    }
    var screen = SCREEN;
    var screenHeight = screen.clientHeight;

    /* 偏移空间 */
    var offset = simply.offset || 15;
    var target = simply.target,
        room = simply.room,
        index = simply.index,
        local = simply.position;

    var tRect = target.getBoundingClientRect();
    var rHeight = room.offsetHeight + offset;
    var rWidth = room.offsetWidth + offset;

    /* default order [bottom,left,right,top]*/
    var order = '3,0,2,1'.split(r_MULTI_SEL), aList;
    /* ie低版本不含有 height, width */
    var tHeight = (tRect.height == Nil ? tRect.bottom - tRect.top : tRect.height) >> 0;
    var tWidth = (tRect.width == Nil ? tRect.right - tRect.left : tRect.width) >> 0;
    // 除去弹窗宽度所剩的空间
    var iShowWidth = screen.clientWidth - rWidth;
    var iShowHeight = screenHeight - rHeight;
    // 一维方位状态
    var iState = [
        /* left: 0 */
        tRect.left - rWidth/* 减去宽度剩余值 */,
        /* top: 1 */
        tRect.top - rHeight/* 减去高度剩余值 */,
        /* right: 2 */
        iShowWidth - tRect.right,
        /* bottom: 3 */
        iShowHeight - tRect.bottom
    ];
    // room.state = iState;
    if (local) {
        /* 多配置排序 */
        each(local.split(r_MULTI_SEL), function (i, v, map, list) {
            list.push(map[v]);
        }, iPMap, aList = []);
        order.unshift.apply(order, aList);
    }
    // Get index of local!
    index = each(order, function (i, v, map) {
        // 当自定义计算最适合显示的位置
        if (map[v] > 0) return v
    }, iState);// || 0;
    var
        left = 0, top = 0, mleft = 0;
    if (index == undefined) {
        // mStyle.display = 'none';
        /* 当自定义显示和默认位置都不适合显示时, 居中显示 */
        // iCenter(room, iPosition.CENTER, simply);
    } else {
        var isLR = index == 0 || index == 2,
            isTB = index == 3 || index == 1;
        left = isTB ? Math.min(tRect.left, iShowWidth) : index == 2 ? tRect.right + offset : iState[0]/* 除去宽度的位置 */;
        /* 当位置处于左右时,减去三角占位空间 */
        rHeight -= offset * +isLR;

        var iTargetTop = Math.max(tRect.top, 0)/* 目标元素的 top */;
        var iTargetBottom = Math.min(tRect.bottom, screenHeight)/* 目标元素的 bottom */
        // 计算显示区域 和 目标对象显示区域的交集的 一半显示
        var iViewHeight = (iTargetBottom - rHeight + Math.min(screenHeight - rHeight, iTargetTop)) / 2;
        top = Math.max(isLR ? iViewHeight : index == 3 ? tRect.top + tHeight + offset
            :
            Math.min(iViewHeight, iState[1]), 0);
        /* initialize value of the top */
        // mStyle.display = mleft = mStyle.top = SPACE;
        if (isLR) {
            // var imTop = 0;
            // 目标对象高度大于提示框高度 判断
            // mStyle.top = imTop + offset / 2;
        }
        if (isTB && tRect.left > iShowWidth)
            mleft = tRect.left - left - offset + tWidth / 2;
    }
    let clist = room.classList;
    let css = simply.css;

    clist.remove(...aPosition);
    clist.add(aPosition[index]);

    simply.index = index;
    css.left = left + Px;
    css.top = top + Px;
    css['--tips-position-top'] =
        isLR
            ?
            Math.max(
                offset,
                Math.min(
                    (
                        /* 底边距 */
                        Math.min(top + rHeight /* Tips bottom */, iTargetBottom)
                        + Math.max(top/* tips top */, iTargetTop)
                    ) / 2 - top/* 补足高度 */ + offset / 2,
                    /* 容器高度 - offset / 2 */
                    rHeight - 0.5 * offset
                )
            )
            + Px
            :
            SPACE
    css['--tips-position-left'] = mleft ? Math.min(mleft, rWidth - 3 * offset) + Px : SPACE;
}
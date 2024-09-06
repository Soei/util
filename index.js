/**
 * 引用工具类
 */
let {
    each,
    merge,
    runer,
    zoom,
    /* 判断是否为基本数据类型 string|number|boolean|null|undefined|Symbol */
    isSimplyType,
    isString,
    isArray,
    isEmpty,

    iSplit,
    /* 范围之内的数值 @see https://www.npmjs.com/package/@soei/tools */
    Between
} = require("@soei/tools");
/* 获取对象相应属性 */
let picker = require("@soei/picker");
/* 时间格式化 */
let time = require("@soei/time");
/**
 * 对象,数组字符串模版输出
 * format()
 */
let { format, StringMap, between } = require("@soei/format");

// 获取宿主
let host = typeof window === 'object' ? window : process;

let Nil;
let SPACE = '';
/* 时间模版字符串 */
let MODE = 'YYYY-MM-DD hh:mm:ss';
let T = new time(SPACE);

let tem = { fire: () => SPACE };
/* 存储正则匹配的名称 */
var CookieNameMap = {};
/**
 * 数组时间格式化输出
 * change({
 *  source: [new Date(), new Date()],
 *  pick: {},
 *  name: "0=>name,1=>value",
 *  m: "YYYY/MM-DD hh:mm:ss"
 * })
 * @param {JSON} args 
 * @returns 
 */
function change(args) {
    var pick = picker(args, 'source|key=>s,pick|source=>ret');
    var list;
    if (pick.s instanceof Array) {
        list = Array.apply(null, pick.s)
    } else {
        list = [pick.s];
    }
    let data = picker(list, args.name, true);
    T.remode(args.m || MODE);
    each(data, (name, date, data, t) => {
        if (date instanceof Date)
            t.setTime(date)
        else t = tem;
        data[name] = t.fire()
    }, pick.ret, T);
    return pick.ret;
}
let reset = function (data, ignore, _default) {
    let DEF = arguments.length <= 2 ? _default || SPACE : _default;
    each(data, (key, _, ignore) => {
        if (!(key in ignore)) data[key] = DEF;
    }, ignore);
}
/**
 * 数组转映射表
 * @param {Array} arr 
 * @param {String} kv 
 * @returns 
 */
let array2Json = (arr, kv = ':') => {
    var retJson = {};
    if (isString(arr)) {
        arr = iSplit(arr, /(?:\||,|;)/);
    } else if (!isArray(arr)) return retJson;
    var [key, val] = iSplit(kv, ':');
    var pick = /undefinded|\*/.test(val) ? (v) => v : (v) => /,|\|/.test(val) ? picker(v, val) : v[val];
    var sim = arr[0]
    if (!isSimplyType(sim) && key != Nil) {
        each(arr, (k, v) => {
            retJson[v[key]] = pick(v);
        })
    } else {
        each(arr, (k, v) => {
            retJson[v] = k;
        })
    }
    return retJson;
}
function Err(e) {
    console.log(format('[name] [message]', e));
}
/**
 * 比较两个对象的差异, 检查key是否存在于source对象之中
 * differ({...}, {...}, (key, isExist, ...) => {...})
 * @param {JSON} source 
 * @param {JSON} diff 
 * @param {Function} back (key, isExist, ...) => {}
 * @param {Object} context 
 */
function differ(source, diff, back, context) {
    var data = {};
    merge(data, source, diff, 'mix');
    each(data, function (k, _v, _, back, context) {
        runer(back, context, k, k in this, this[k], diff[k]);
    }, source, back, context)
}
/**
 * 获取存储的值
 * @param {String} name 存储的key
 * @param {Object} t 如果找不见对应的值,返回这个默认值
 * @returns 
 */
function get(name, t) {
    var R = CookieNameMap[name];
    if (R instanceof RegExp); else {
        R = CookieNameMap[name] = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    }
    try {
        var o = document.cookie.match(R);
        if (o == null) {
            o = t;
        } else {
            var o2 = decodeURI(o[2]);
            try {
                o = JSON.parse(o2);
            } catch (e) {
                o = o2;
            }
        }
        return o;
    } catch (e) {
        Err(e)
    }
    return SPACE;
}
/**
 * 设置cookie
 * @param {String} 要存储的key 
 * @param {String|Number|Object|Array} value 
 * @param {Number} expiredays 过期时间
 * @param {String} dz 域
 */
function set(name, value, expiredays, dz) {
    try {
        if (expiredays < 0) delete CookieNameMap[name];
        var cook = format('[name]=[value][exp,;expires=?,][dm,;domain=?,]', {
            name: name,
            value: encodeURI(isSimplyType(value) ? value : JSON.stringify(value)),
            t: expiredays,
            domain: dz,
            expires: function () {
                var exdate = new Date();
                exdate.setTime(+exdate + this.t * 24 * 60 * 60 * 1000);
                return exdate.toGMTString();
            },
            exp: function (a, b) {
                return this.t == undefined ? b : format(a, this);
            },
            dm: function (a, b) {
                return this.domain == undefined ? b : format(a, this);
            }
        })
        document.cookie = cook;
    } catch (e) {
        Err(e)
    }
}
var exports = {
    cookie: { set, get },
    isSimplyType,
    isEmpty, isString, isArray,
    array2Json,
    change,
    picker,
    reset,
    merge,
    runer,
    each,
    split: iSplit,
    time,
    format,
    /* 比较两个对象的差异 */
    differ,
    zoom,

    Between,
    /**
    * 格式化输出 
    * var NM = new StringMap('name,age,sex,height')
    * NM.data('jerry/13//130cm')
    * // { name: 'jerry', age: '13', sex: '', height: '130cm' }
    * 反向获取JSON 
    */
    StringMap,

    between
}
/* 本地存储 和 会话存储 */
each(picker(host, 'localStorage=>local,sessionStorage=>session'), function (k, v, exports, functions) {
    each(['set', 'get', 'remove'], function (k, v, e, funs, scope) {
        e[v] = funs[k].bind(scope);
    }, exports[k] = {}, functions, v)
}, exports, [
    /* set */
    function (key, value) {
        this.setItem(key, isSimplyType(value) ? value : JSON.stringify(value));
    },
    /* get */
    function (key) {
        var data = this.getItem(key);
        try {
            return JSON.parse(data)
        } catch (e) {
            return data
        }
    },
    /* remove */
    function (key) {
        this.removeItem(key);
    }
]
)
module.exports = exports;
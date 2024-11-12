/**
 * 引用工具类
 */
import { each, merge, isSimplyType, runer } from "@soei/tools";
import { format } from "@soei/format";

/* 获取对象相应属性 */
import picker from "@soei/picker";

let H = {
	form: {
		"Content-type": "application/x-www-form-urlencoded",
	},
	json: {
		"Content-type": "application/json",
	},
};
let D = {
	form(data) {
		let ret = [];
		each(data, (k, v, ret) => {
			ret.push(format('?=?', k, v))
		}, ret)
		return ret.join('&')
	},
	json(data) {
		return JSON.stringify(data)
	}
}
// 流式请求
export let Api = async (data = {}) => {
	let params = picker(data, 'data|body|params=>params').params;
	merge(data, {
		method: "post",
		process: () => { },
		host: format('//?', location.host),
		default: false
	});
	if (!isSimplyType(params)) {
		params = (D[data.type] || D.json)(params);
	}
	merge((data.headers = data.headers || {}), H[data.type], "mix");
	let Fx = picker(
		data,
		"onMessage|onmessage|message|process=>msg,onErr|onerr|err=>err"
	);
	// 处理get请求参数问题
	if (/get/i.test(data.method)) {
		data.url += (data.url.indexOf('?') >= 0 ? '&' : '?') + params;
		params = undefined;
	}
	let process = Fx.msg;
	let Err = Fx.err;
	// 创建打断控制器, 如果对话途中取消
	let controller = new AbortController();
	// 创建链接
	fetch(format("?/?", data.host, data.url), {
		signal: controller.signal,
		headers: data.headers,
		body: params,
		method: data.method,
		mode: "cors",
		credentials: "omit",
	}).then(async (res) => {
		res.abort = () => controller.abort();
		if (data.default) {
			return process(res, true);
		}
		let ctype = res.headers.get('content-type')
		if (/event-stream/.test(ctype)) {
			streamevent(res, process)
		} else {
			if (/application|image/.test(ctype)) {
				process(await res.blob(), true)
			} else {
				process(await res.json())
			}
		}
	}).catch((e) => {
		runer(Err, e, e)
	});
	return controller;
};
// 处理流式
let streamevent = async (res, back) => {
	let r = new TextDecoder();
	let result;
	let stream = res.body.getReader();
	let helfdata = [],
		length = 0;
	// 遍历流信息
	while (!(result = await stream.read()).done) {
		let data = r.decode(result.value);
		if (/\n$/.test(data)) {
			if (length) {
				length = 0;
				helfdata.push(data);
				data = helfdata.join("");
			}
			each(
				data.match(/\{[^\n]+\}(?=\n)/g), //.split(/\n*\w+:\s*(?:\w+\n*|)/g),
				(k, json) => {
					// if (json == "") return;
					try {
						json = new Function("return " + json)();
						back(json, res);
					} catch (e) {
						// return true;
					}
				}
			);
		} else {
			length = helfdata.push(data);
		}
	}
	if (length) {
		back(JSON.parse(helfdata.join("")), res)
	}
}
// 默认输出对象, 支持 Promise.then
export default (args) => {
	let { msg } = picker(
		args,
		"onMessage|onmessage|message|process=>msg"
	)
	return msg ? Api(args) : new Promise((resolve, reject) => {
		Api({
			onmessage: (json, source) => {
				resolve(
					!source && args.pick ? picker(json, args.pick) : json
				)
			},
			err: reject,
			...args
		})
	})
}

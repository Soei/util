![安装](https://img.shields.io/badge/安装-npm_i_@soei/util-ffc107?style=flat) [![Latest Version on NPM](https://img.shields.io/badge/✔-线上实例-ae8aff?style=flat)](https://alwbg.github.io)

# JavaScript 轻量工具类~ [![Latest Version on NPM](https://img.shields.io/npm/v/@soei/util?label=npm&style=flat-square)](https://npmjs.com/package/@soei/util) ![Software License](https://img.shields.io/badge/license-ISC-brightgreen?label=&style=flat-square) [![npm](https://img.shields.io/npm/dw/@soei/util?label=Downloads&style=flat-square)](https://www.npmjs.com/package/@soei/util) ![npm bundle size](https://img.shields.io/bundlephobia/min/%40soei%2Futil?label=Size&color=&style=flat-square)

## 更新日志

### 1.1.8

- ### Api.js

```javascript
  import request from "@soei/util/Api";
  let Api = request.Api;

  Api({
    onmessage: (json, res) => {
      ...
      res.abort(); // 取消请求
    }
  })
  // 或者
  async () => {
    let res = await Api({...})
    res.abort(); // 取消请求
  }
```

### 1.1.7

- ### Api.js

  #### - 新增 `写法` 和 属性 `default: true`

  ```javascript
  import request from "@soei/util/Api";
  let Api = request.Api;

  // 其他Api获取
  import { Api } from "@soei/util/Api";

  async () => {
    // 没有 Promise.then方法调用
    request({
      url: "...",
      onmessage(res) {},
    });
    // 等同于
    Api({
      url: "...",
      onmessage(res) {},
    });

    // 下面含有两个兼容性调用
    request({
      url: "...",
    }).then((res) => {});
    let res = await request({});

    // 新增 default 属性
    await Api({
      // - 新增 default: true
      default: true,
    });
    /* 返回原始对象
    {
      ...
      body: (..),
      ...
    }
    */
    // or
    Api({ default: true }).then((res) => {
      // res 原始对象
    });
  };
  ```

  #### - 优化

  如果请求返回文件(图片,请求头以 "application/...")

  - 返回 Blob 对象

  ```javascript
  import { Api } from "@soei/util/Api";
  async (data) => {
    await Api({
      host: "http://localhost/",
      method: "get",
      url: "/static/favicon.png",
      data,
    });
  };
  ```

### 1.1.6

- #### 问题修复 Api.js
  针对 Get 请求参数问题处理

### 1.1.5

- #### 新增 Api.js

  ```javascript
  // 引入方式
  const {Api} = require("@soei/util/Api");
  // 流模式请求(类似chatGPT,取决接口返回头信息内是否包含:text/event-stream;)
  Api({
      // 如果不存在,所在域名下 //xxx:000
      host: 'http://...',
      url: '/ai',
      headers: {
          authorization: 'Bearer ..........',
      },
      type: 'json|form',
      data: {}|'{}'|'a=b&...',

      onMessage|onmessage|message|process: (json) => {
        // 处理返回值
      },
      err() {

      },
      ...
  })
  ```

### 1.1.2

- #### 新增 position.js

### 1.1.0

- #### 优化

### 1.0.11

- #### 新增 differ

  ```javascript
  // 引入方式
  const soei = require("@soei/util");
  soei.differ(
    {
      name: "soei",
    },
    {
      age: 18,
    },
    (key, isExist) => {
      console.log(key, isExist);
    }
  );
  // name true
  // age false
  ```

### 1.0.10

- #### 新增 StringMap 处理字 [符串模版<=>对象] 互转

  ```javascript
  // 引入方式
  const soei = require("@soei/util");
  let StringMap = soei.StringMap;
  // 或
  import { StringMap } from "@soei/util";
  let NM = new StringMap("name,age,sex,height" /* , '|' // 默认'/' */);

  NM.toString({
    name: "Tom",
    age: 3,
  });
  // Tom/3//
  NM.toString({
    height: "120cm",
  });
  // Tom/3//120cm
  NM.data();
  // { name: 'Tom', age: '3', sex: '', height: '120cm' }
  NM.data("jerry/13//130cm");
  // { name: 'jerry', age: '13', sex: '', height: '120cm' }
  ```

- #### 优化 Map、Set 在使用 each 时的中断逻辑

  ```javascript
   let ret,
     map = new Map();

   map.set(10, 20);
   map.set('a', 2);
   ret = each(map, (k, v) = {
     if (v == 2) return k;
   });
   // ret: a
  ```

---

## 工具类

```javascript
const util = require("@soei/util");

// 或

import util from "@soei/util";
```

## **Between**

```javascript
// 区间取值
const util = require("@soei/util");
let Between = util.Between;
// 或
import { Between } from "@soei/util";

data = new Between({
  /* 是否含有小数输出, 默认为0, 整数 */
  // decimal: 3,
  max: 90,
  min: 20,
});
data.fire(20.01);
// 20
data.fire(2);
// 20
data.fire(2, true /* 是否正在输入, 当为true时不直接返回最大最小值 */);
// 2
data = new Between({
  decimal: 3,
  max: 1,
  min: 0,
});

data.fire(20);
// 1.000
data.fire("0.0");
// 0.000
data.fire("0.0", true);
// 0.0
data.fire(0.0, true);
// 0
```

# **change**

```javascript
let change = util.change;

let a = change({
  source: [new Date(), new Date()],
  pick: {},
  name: "0=>name,1=>value",
  m: "YYYY/MM-DD hh:mm:ss",
});

console.log(a);
// { name: '2016/10-22 14:54:27', value: '2016/10-22 14:54:27' }
let a = change({
  source: new Date(),
  pick: {},
  name: "0=>name,1=>value",
  m: "YYYY",
});
// 或
let a = {};
change({
  source: new Date(),
  pick: a,
  name: "0=>name,1=>value",
  m: "YYYY",
});

console.log(a);
// { name: '2016'}
change({
  source: [0, 0] /* 值为非 Date 返回都为 空字符串 */,
  pick: {},
  name: "0=>name,1=>value",
  m: "YYYY",
});
// { name: '', value: ''}
```

# **reset**

```javascript
/* 数据对象属性重置为[空字符串或者自定义] */
let reset = util.reset;
let _default = 0;
let data = {
  name: "balabal",
  age: 1,
};
reset(
  data,
  /* ignore 忽略的属性 */
  {
    age: null,
  },
  /* 默认 空字符串"" */
  _default
);
/* 
{
  name: "",
  age: 1,
}
*/
```

# **array2Json**

```javascript
/* 根据字符串配置,改变数组为映射表 */
let array2Json = util.array2Json;

let data = [
  {
    name: "balabal",
    age: 1,
  },
];
array2Json(data, "age:name");
/* 
{ '1': 'balabal' }
*/

// v1.0.5版本支持
console.log(array2Json(["A", "B", "C"]));
// { A: 0, B: 1, C: 2 }

console.log(array2Json("A,B,C,HJ"));
// { A: 0, B: 1, C: 2, HJ: 3 }

array2Json(
  [
    { a: 1, b: 2, c: 3 },
    { a: 11, d: 12 },
  ],
  "a:b,c,d"
);
// { '1': { b: 2, c: 3 }, '11': { d: 12 } }
```

// v1.0.6 版本支持

# **cookie**

```javascript
/* 获取cookie*/
let cookie = util.cookie;
cookie.set("name", { name: "小肥" }, 365 * 10 /* 天 */);
cookie.get("name");
// {name: "小肥"}
cookie.set("name", { name: "小肥" }, -1 /* 负值为删除 */);
// 删除cookie的name所指数据
cookie.get("name", { name: "default" });
// {name: "default"}
```

// v1.0.7 版本支持

# **local**

```javascript
/* 获取本地存储*/
let local = util.local;
local.set("name", { name: "小肥" });
local.get("name");
// {name: "小肥"}
local.remove("name");
```

# **session**

```javascript
/* 获取会话存储*/
let session = util.session;
session.set("name", { name: "小肥" });
session.get("name");
// {name: "小肥"}
session.remove("name");
```

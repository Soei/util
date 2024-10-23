const { isNil, isEmpty } = require('@soei/tools');
let { change, reset, array2Json, time, picker, cookie, Between, differ, runer } = require('./index')
let ap = require('./index')
let local = ap.local

let a = change({
    source: [new Date, new Date],
    pick: {},
    name: '0=>name,1=>value',
    m: 'YYYY/MM-DD hh:mm:ss'
})

console.log(a)

let data = {
    name: "balabal",
    age: 1,
};
reset(
    data,
    /* ignore 忽略的属性 */
    {
        age: null,
    }
);
console.log(data)


data = [{
    name: "balabal",
    age: 1,
}];
console.log(array2Json(data, 'age:name'))


console.log(isEmpty(0), change({
    source: [0, new Date()],
    pick: {},
    name: '0=>name,1=>value',
    m: 'YYYY/MM-DD hh:mm:ss'
}))

console.log(array2Json(['A', 'B', 'C']))
console.log(array2Json('A,B,C,HJ'))

let T = new time('YYYY-MM-DD')
let Y = T.dates(0)
let YEAR = T.fire({ year: Y.year + 1, month: 1, day: 1 });
console.log(YEAR < '2022-01-01')

a = {
    b: {
        c: {
            d: 1,
            e: 2
        }
    }
}
console.log(picker(a, 'b'))

console.log(array2Json(
    [
        { a: 1, b: 2, c: 3 },
        { a: 11, d: 12 },
    ],
    "a:b,c,d"
), picker({ a: 2, b: 5 }, 'b|c=>a', function (k, v) {
    console.log(k, v)
}))

console.log(cookie.set('name', 'apple', 10 /* 天 */))
console.log(cookie.get('name'))


// console.log(local?.get('name'))


data = new Between({
    // decimal: 3,
    max: 90,
    min: 20
})
console.log(data.fire(20.01))
// 20
console.log(data.fire(2))
console.log(data.fire(2, true))
data = new Between({
    decimal: 3,
    max: 1,
    min: 0
})
console.log(data.fire(20.01))
// 20
console.log(data.fire('0.0', true))
console.log(data.fire(0.0, true))
differ({
    name: "soei",
}, {
    age: 18,
    name: "soei1",
}, (key, isExist) => {
    console.log(key, isExist)
})


let fu =  () => {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            resolve(1)
        }, 1000)
    })
}

let 结果 = runer(fu);

console.log(结果.then(() => {
    console.log('ok')
}))

function 行为() {
    console.log('行为输出::')
}
function* 迭代() {
    yield new Promise((resolve) => {
        // resolve(1)
        setTimeout(() => {  
            resolve(100)
        }, 3000);
    })
    yield new Promise((resolve) => {
        resolve(2)
    })
    yield new Promise((resolve) => {
        resolve(3)
    })
}
行为();
let 临时 = 迭代();
结果 = 临时.next();
console.log(结果.value.then((res)=> {
    console.log(res, 'res');
}))
结果 = 临时.next();
console.log(结果.value.then((res)=> {
    console.log(res, 'res');
}))
结果 = 临时.next();
console.log(结果.value.then((res)=> {
    console.log(res, 'res');
}))
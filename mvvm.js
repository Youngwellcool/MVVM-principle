function Yww(options = {}){
    this.$options = options; // 将options挂载到实例的$options上
    var data = this._data = this.$options.data;
    observe(data);
    // new Observe(data);
        // this代理this._data中的数据
    for(let key in data){
        Object.defineProperty(this,key,{
            enumerable:true,
            get(){
                return this._data[key];
            },
            set(newVal){
                this._data[key] = newVal;
            }
        })
    }

    new Compile(options.el,this)
}


// function Observe(data){
//     observe(data)
// }

// function observe(data){
//     if(typeof data !== 'object'){
//         return;
//     }
//     // for(let key in data){   // 巨坑，这里循环不能用for in 否则添加了劫持的data中的所有属性的值都等于最后一个属性的值 [ 比如 data:{a:{d:12},b:56} => data:{a:56,b:56} ]
//     Object.keys(data).forEach(function(key){
//         var value = data[key];
//         Object.defineProperty(data,key,{
//             enumerable:true,
//             configurable:true,
//             get(){ // 当取值时调用的方法
//                 return value;
//             },
//             set(newValue){ // 当给data属性中设置值的适合 更改获取的属性的值
//                 if(newValue!=value){
//                     // 这里的this不是实例 
//                     observe(newValue);// 如果是设置的是对象继续劫持
//                     value = newValue;
//                 }
//             }
//         });
//         observe(value);
//     })
// }




function Observe(data){
    Object.keys(data).forEach(function(key){
        var value = data[key];
        // console.log(key)
       
        Object.defineProperty(data,key,{  // 给data对象中的每个属性添加get和set方法
            enumerable:true,  // 开启可枚举
            configurable:true,
            get(){
                return value;
            },
            set(newVal){
                if(newVal == value){
                    return
                }
                value = newVal;
                observe(newVal) // 设置新值时也调用observe，给新值加上get和set方法，实现深度响应
            }
        })

        observe(value); // 如果value也是对象，递归给value对象中的每个属性添加get和set方法
    })
    // console.log(data)
}

function observe(data){
    // console.log(data)
    if(typeof data !== 'object') {  // 如果data不是object，就不要继续递归了
        // console.log(data)
        return;
    }
    return new Observe(data);
}

/**
 * 编译模板语言{{}},将其替换为实例中对应的值
 * @param {*} el 表示编译的范围
 * @param {*} vm 表示当前的实例
 */
function Compile(el,vm){
    vm.$el = document.querySelector(el); // 将el挂载到实例的$el上
    var fragment = document.createDocumentFragment(); // 创建一个html碎片fragment， fragment存在内存中
    while(child = vm.$el.firstChild){  // 循环将el中的第一个子元素放入fragment中，直到将el中所有的元素全部放到fragment中，此时el中为空了
        fragment.appendChild(child);
    }
    // console.log(fragment)  // <p>a对象中d的值为：{{a.d}}</p> <p>b的值：{{b}}</p>  el中的子元素全部到fragment中了
    // console.log(vm.$el)  // <div id="app"></div>  el中没有子元素了
    replace(fragment)
    function replace(fragment){
        Array.from(fragment.childNodes).forEach(function(node){ // 获取到fragment中的子节点转为数组再循环
        // 循环参数node为当前循环的node节点
            var text = node.textContent; // 获取node节点的文本内容
            var reg = /\{\{(.*)\}\}/;
            if(node.nodeType === 3 && reg.test(text)){
                // console.log(text)
                // console.log(RegExp.$1) // a.d , b 取到{{}}中的值
                var arr = RegExp.$1.split('.'); // ['a','d'] , ['b']
                var val = vm;
                arr.forEach(function(k){  // 循环['a','d']和['b']，目的是取vm.a.d 和 vm.b
                    // console.log(k) // a , d , b
                    val = val[k]; // 关键点：(1)循环['a','d']，第一层循环将vm.a赋值给val,第二层循环将vm.a.d赋值给val，这样就拿到了vm.a.d; (2)循环['b']，将vm.b赋值给val,这样就拿到了vm.b
                    // console.log(val)
                })
                node.textContent = text.replace(/\{\{(.*)\}\}/,val)
            }
            if(node.childNodes){
                replace(node)
            }
        })
    }
    vm.$el.appendChild(fragment); // 将fragment放回到el中
    

}












/**发布--订阅模式 */
function Dep(){
    this.subs = []
}
    /**
     * 订阅 
     * subs是一个事件池，包含诸如[fn1,fn2,fn3]
     * 订阅就是往事件池subs里添加事件方法，每个事件方法都有update方法
     */
Dep.prototype.addSub = function(sub){
    this.subs.push(sub)
}
    /**
     * 发布 
     * 发布就是循环subs事件池中的事件(每个事件都有一个update方法)执行update方法
     */
Dep.prototype.notify = function(){
    this.subs.forEach(function(sub){
        sub.update()
    })
}

    /**
     * Watcher
     * 在Watcher的原型上添加update方法，通过Watcher类创建的实例都有update方法
     * @param {*} fn 实例化Watcher传入的函数 返回一个对象{fn:fn}
     */
function Watcher(fn){  
    this.fn = fn;
}
Watcher.prototype.update = function(){
    this.fn()
}

    /**测试发布订阅和Watcher */
var fn1 = function(){
    console.log(100)
}
var watcher = new Watcher(fn1); // 创建一个实例watcher:{fn:fn1}
watcher.update() // 执行实例watcher的update方法，也就是执行 fn1()
console.log(watcher)
var dep = new Dep(); // 创建一个发布订阅实例dep:{subs:[]}
console.log(dep)
dep.addSub(watcher) // 执行dep实例的addSub方法(也就是订阅)，并传入watcher实例 => 运行结果 dep:{subs:[watcher]}
dep.addSub(watcher) // 执行dep实例的addSub方法(也就是订阅)，并传入watcher实例 => 运行结果 dep:{subs:[watcher,watcher]}
dep.addSub(watcher) // 执行dep实例的addSub方法(也就是订阅)，并传入watcher实例 => 运行结果 dep:{subs:[watcher,watcher,watcher]}
console.log(dep)
dep.notify() // 执行实例的notify方法(也就是发布) => 运行结果 循环subs中的每一个watcher实例，并执行该实例的update方法，也就是执行 fn1() ,输出 1 , 1 , 1
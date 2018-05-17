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
                // console.log('Yww代理中的get') 
                return this._data[key];
            },
            set(newVal){
                // console.log('Yww代理中的set') 
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
    let dep = new Dep();
    // for(let key in data){   // 巨坑，这里循环data不能用for in 否则添加了劫持的data中的所有属性的值都等于最后一个属性的值 [ 比如 data:{a:{d:12},b:56} => data:{a:56,b:56} ],所以改用Object.keys(data)将data中所有的key存放在数组中再遍历数组
    Object.keys(data).forEach(function(key){  // 将data中所有的key存放在数组中再遍历数组
        var value = data[key];
        // console.log(key)
       
        Object.defineProperty(data,key,{  // 给data对象中的每个属性添加get和set方法
            enumerable:true,  // 开启可枚举
            configurable:true,
            get(){
                console.log('observe中的get')  
                Dep.target && dep.addSub(Dep.target) // 在Watcher构造函数中设置了Dep.target等于Watcher构造函数实例化后的对象watcher(即Dep.target=watcher)，此步就是把watcher对象添加到subs数组中，即订阅watcher对象
                return value;
            },
            set(newVal){
                if(newVal == value){
                    return
                }
                console.log('observe中的set') 
                value = newVal;
                observe(newVal) // 设置新值时也调用observe，给新值加上get和set方法，实现深度响应
                dep.notify()  // 让所有watcher的update方法执行
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
        fragment.appendChild(child); // appendChild方法具有移动元素的特性
    }
    // console.log(fragment)  // <p>a对象中d的值为：{{a.d}}</p> <p>b的值：{{b}}</p>  el中的子元素全部到fragment中了
    // console.log(vm.$el)  // <div id="app"></div>  el中没有子元素了
    replace(fragment)
    function replace(fragment){
        Array.from(fragment.childNodes).forEach(function(node){ // 获取到fragment中所有的子节点转为数组再循环
        // 循环参数node为当前循环的node节点
            var text = node.textContent; // 获取node节点的文本内容
            var reg = /\{\{(.*)\}\}/;  // 定义一个匹配 {{}} 的正则
            if(node.nodeType === 3 && reg.test(text)){  // 如果当前遍历的node是文本节点且能匹配正则，即找到了模板变量
                // console.log(text)
                // console.log(RegExp.$1) // a.d , b 取到{{}}中的值
                var arr = RegExp.$1.split('.'); // ['a','d'] , ['b']
                var val = vm;
                arr.forEach(function(k){  // 循环['a','d']和['b']，目的是取vm.a.d 和 vm.b
                    // console.log(k) // a , d , b
                    val = val[k]; // 关键点：(1)循环['a','d']，第一层循环将vm.a赋值给val,第二层循环将vm.a.d赋值给val，这样就拿到了vm.a.d; (2)循环['b']，将vm.b赋值给val,这样就拿到了vm.b
                    // console.log(val)
                })
                var watcher = new Watcher(vm,RegExp.$1,function(newVal){
                    node.textContent = text.replace(/\{\{(.*)\}\}/,newVal)  // 将更新数据同步到视图上的逻辑代码
                })
                console.log(watcher);
                node.textContent = text.replace(/\{\{(.*)\}\}/,val)
            }
            if(node.childNodes){ //  如果当前遍历的node中还有子节点，继续递归
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
     * subs是一个事件池，包含诸如[watcher1,watcher2,watcher3]
     * 订阅就是往事件池subs里添加watcher对象，每个对象都有update方法
     */
Dep.prototype.addSub = function(sub){
    this.subs.push(sub)
}
    /**
     * 发布 
     * 发布就是循环subs事件池中的watcher对象(每个对象都有一个update方法)执行update方法
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
function Watcher(vm,exp,fn){  
    this.vm = vm;
    this.exp = exp;
    this.fn = fn;
    Dep.target = this; // 将new出来的实例对象watcher(this)赋值给Dep的target属性,这样方便将watcher对象添加到订阅中(即添加到subs数组中)
    let val = vm;
    let arr = exp.split('.');
    arr.forEach(function(key){  // 取this.a.a，目的是取值会触发Observe的get方法
        val = val[key]
    })
    Dep.target = null;
}
Watcher.prototype.update = function(){
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach(function(key){
        val = val[key]  // val拿到的就是最新的值
    })
    this.fn(val)  
}

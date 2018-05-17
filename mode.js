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
function Watcher(fn){  
    this.fn = fn;
}
Watcher.prototype.update = function(){
    this.fn()
}


    //以下是测试发布订阅和Watcher 
var fn1 = function(){
    console.log(100)
}
var watcher = new Watcher(fn1); // 创建一个实例watcher:{fn:fn1}
watcher.update() // 执行实例watcher的update方法，也就是执行 fn1()
console.log(watcher)
var dep = new Dep(); // 创建一个发布订阅实例dep:{subs:[]}
console.log(dep)
dep.addSub(watcher) // 执行dep实例的addSub方法(也就是订阅)，并传入watcher实例对象 => 运行结果 dep:{subs:[watcher]}
dep.addSub(watcher) // 执行dep实例的addSub方法(也就是订阅)，并传入watcher实例对象 => 运行结果 dep:{subs:[watcher,watcher]}
dep.addSub(watcher) // 执行dep实例的addSub方法(也就是订阅)，并传入watcher实例对象 => 运行结果 dep:{subs:[watcher,watcher,watcher]}
console.log(dep)
dep.notify() // 执行实例的notify方法(也就是发布) => 运行结果 循环subs中的每一个watcher实例对象，并执行该实例对象的update方法，也就是执行 fn1() ,输出 1 , 1 , 1


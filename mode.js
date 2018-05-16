
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
     * 发布就是循环subs事件池中的事件，每个事件都有一个update方法，执行update方法
     */
Dep.prototype.notify = function(){
    this.subs.forEach(function(sub){
        sub.update()
    })
}


function Watcher(fn){
    this.fn = fn;
}
Watcher.prototype.update = function(){
    this.fn()
}

var watcher = new Watcher(function(){
    console.log(1)
})
console.log(watcher.fn)
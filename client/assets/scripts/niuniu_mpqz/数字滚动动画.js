cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.play(8000000);
        // this.play(30);
    },

    /**
     * 使数字滚动到指定的值
     * @param score
     */
    play:function(score){
        //如果动作正在进行中，则先暂停上一个动作并且清空动作列表
        if(this.temp){ 
            this.temp.stopAllActions();
            this.temp.destroy();
            delete this.curr;
            delete this.temp;
        }

        //现在的值
        let n = parseInt(this.node.getComponent(cc.Label).string);
        let nn = Math.abs(score - n); //获取差值
        if(score < n){
            nn *= -1;
        }
        //创建一个空节点，用来创建移动曲线
        var node = new cc.Node('test');
        node.parent = this.node;
        node.x = 0;
        let move = cc.moveBy(2, cc.p(nn, 0));
        move.easing(cc.easeInOut(2.5));
        this.temp = node;
        this.curr = n;
        node.runAction(cc.sequence(move, cc.callFunc(()=>{
            this.temp.destroy();
            delete this.curr;
            delete this.temp;
            //结束时强制设置
            this.node.getComponent(cc.Label).string = score;
        }, this)));
    },

    /**
     * 清空动作
     */
    clearAnimation: function(){
        if(this.temp){
            this.temp.stopAllActions();
            this.temp.destroy();
            delete this.curr;
            delete this.temp;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.temp){
            //曲线动作的值会是float,强制设置为向上舍入
            this.node.getComponent(cc.Label).string = Math.round(this.curr + this.temp.x);
        }
    },
});

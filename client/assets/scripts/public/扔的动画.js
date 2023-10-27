
let names = ["baoza", "zui", "bianbian", "bazhang"]; //动画文件名字
let dela = [0.8, 0.8, 0, 0];
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
        imgFrames:{
            default:[],
            type:cc.SpriteFrame
        }
    },

    // use this for initialization
    onLoad: function () {
        
    },

    /**
     * 开始扔动作
     * @param start 开始玩家位置 必须为世界坐标，否则位置 将不准确
     * @param id 动作id
     */
    play:function(start, id, remove){

        if(this.sp){
            this.sp.stopAllActions();
            this.sp.destroy();
            delete this.sp;
        }

        //把世界坐标转换成本地坐标
        console.log(start)
        start = this.node.parent.convertToNodeSpaceAR(start);
        this.sp = new cc.Node("Sprite");
        let ssp = this.sp.addComponent(cc.Sprite);
        ssp.spriteFrame = this.imgFrames[id];
        this.sp.parent = this.node.parent;
        this.sp.x = start.x;
        this.sp.y = start.y;

        console.log(start)
        let move = cc.moveTo(0.5, this.node.x, this.node.y);
        //动作完成回调
        let endCb = cc.callFunc(function () {
            this.sp.destroy();
            delete this.sp;

            let animate = this.node.children[0].getComponent(cc.Animation);
            animate.play(names[id]);
            this.node.active = true;
            //播放动画声音
            this.scheduleOnce(function(){
                cc.vv.audioMgr.playSFX("animate/" + names[id] + ".wav");
            }, dela[id]);
        }.bind(this));

        //开始动作
        this.sp.runAction(cc.sequence(move, endCb));
    },

    /**
     * 开始扔动作
     * @param start 开始玩家位置
     * @param id 动作id
     * @param end 结束的玩家位置
     */
    play_cmd:function(start, id,end){
        this.players_js = this.node.parent.parent.getChildByName('players').getComponent('psz_view_players');
        
        if(this.sp){
            this.sp.stopAllActions();
            this.sp.destroy();
            delete this.sp;
        }

        //把世界坐标转换成本地坐标
        console.log(this.players_js);
        var start_world = this.players_js.players_node[start].getChildByName("player_info").getChildByName("pic").getNodeToWorldTransformAR();
        var sVec = cc.p(start_world.tx, start_world.ty);
        var start_pos = this.node.parent.convertToNodeSpaceAR(sVec);
        
        var end_world = this.players_js.players_node[end].getChildByName("player_info").getChildByName("pic").getNodeToWorldTransformAR();
        var eVec = cc.p(end_world.tx, end_world.ty);
        var end_pos = this.node.parent.convertToNodeSpaceAR(eVec);

       
        this.sp = new cc.Node("Sprite");
        let ssp = this.sp.addComponent(cc.Sprite);
        ssp.spriteFrame = this.imgFrames[id];
        this.sp.parent = this.node.parent;
        this.sp.x = start_pos.x;
        this.sp.y = start_pos.y;        

        
        let move = cc.moveTo(0.5,end_pos.x,end_pos.y);
        //动作完成回调
        let endCb = cc.callFunc(function () {
            this.sp.destroy();
            delete this.sp;

            let animate = this.node.children[0].getComponent(cc.Animation);
            animate.play(names[id]);
            this.node.active = true;
            this.node.x = end_pos.x;
            this.node.y = end_pos.y;
            //播放动画声音
            this.scheduleOnce(function(){
                cc.vv.audioMgr.playSFX("animate/" + names[id] + ".wav");
            }, dela[id]);
        }.bind(this));

        //开始动作
        this.sp.runAction(cc.sequence(move, endCb));
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

/// <reference path="../../../creator.d.ts" />
let val = 0;
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

        this.isConnect = false;

        this.pokers = [];

        this.pokers.push(cc.find("Canvas/p1"));
        this.pokers.push(cc.find("Canvas/p2"));
        this.pokers.push(cc.find("Canvas/p3"));
        this.pokers.push(cc.find("Canvas/p4"));
        this.pokers.push(cc.find("Canvas/p5"));
        this.pokers.push(cc.find("Canvas/p6"));
        this.pokers[0].children[0].getComponent('poker').show(10);

        cc.find("front").getComponent("largerPoker").setValue(0);

        // this.scheduleOnce(function () {
        //     let script = cc.find("cuopai").getComponent("CuoPai");
        //
        //     let back = script.getNode(cc.find("back"));
        //     let front = script.getNode(cc.find("front"));
        //     script.initCfg(front, back, function () {
        //         cc.find("cuopai").active = false;
        //     });
        // }, 1);
    },

    onBgClick:function () {
        cc.find("cuopai").active = true;
        cc.find("front").getComponent("largerPoker").setValue(++val);
        let script = cc.find("cuopai").getComponent("CuoPai");
        let front = script.getNode(cc.find("front"));
        let back = script.getNode(cc.find("back"));
        script.initCfg(front, back, function () {
            cc.find("cuopai").active = false;
        });
    },

    发牌事件:function(){
        let arr = [[cc.p(-271,-263),cc.p(-146,-263),cc.p(-21, -263),cc.p(104, -263),cc.p(229, -263)],
            [cc.p(460,-15),cc.p(420, -15),cc.p(380, -15),cc.p(340, -15),cc.p(300, -15)],
            [cc.p(170,140),cc.p(210,140),cc.p(250,140),cc.p(290,140),cc.p(330,140)],
            [cc.p(-60,230),cc.p(-20,230),cc.p(20,230),cc.p(60,230),cc.p(100,230)],
            [cc.p(-290,140),cc.p(-250,140),cc.p(-210,140),cc.p(-170,140),cc.p(-130,140)],
            [cc.p(-470,-15),cc.p(-430,-15),cc.p(-390,-15),cc.p(-350,-15),cc.p(-310,-15)]];
            
        for(let i = 0; i < this.pokers.length; ++i){
            for(let j = 0; j < this.pokers[i].children.length; ++j){
                let js = this.pokers[i].children[j].getComponent("发牌动画");
                setTimeout(()=>{
                    if(i === 0){
                        js.播放整个动画(parseInt(Math.random()*52),arr[i][j], 1);
                    } else {
                        js.播放发牌(arr[i][j], 0.55);
                    }
                }, (i * 200) + j * 50);
            }
        }
    },

    onTextChanged:function (text) {
        if(text.length === 6){
            this.rid = text;
            this.getRoomInfo();
        }
    },

    getRooms:function () {
        this.getRoomInfo(this.rid);
    },


    getRoomInfo: function (text){

        let self = this;

        function gr() {
            window.pomelo.request('room.roomHandler.getRoomInfo', {
                rid:text,
                sign:""
            }, function (msg) {
                console.log(msg);
            });
        }


        if(!this.isConnect){
            window.pomelo.init({
                host: "192.168.0.103",
                port: "4010",
                log: true,
                reconnect: false,
            }, function () {
                self.isConnect = true;
                console.log("连接成功");
                gr();
                window.pomelo.on("disconnect", function () {
                    self.isConnect = false;
                });
            });
        } else {
            gr();
        }

    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },


});

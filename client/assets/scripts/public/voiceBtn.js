/// <reference path="../../../creator.d.ts" />

let checkTime = 0;
let lastTime = 0;

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
        // ..
        _enble: true,

        cancel:{
            default:null,
            type:cc.Node
        },
        normal:{
            default:null,
            type:cc.Node
        },
        vol:{
            default:null,
            type:cc.Sprite
        },
        time:{
            default:null,
            type:cc.Node
        },
        volTex:{
            default:[],
            type:cc.SpriteFrame,
            displayName:"语音大小图片"
        }
    },

    // use this for initialization
    onLoad: function () {
        this._timeW = this.time.width; //记录进度条的宽
        this.alreadySend = false;  //是否已经发送
        let touchY = 0;
        //注册按钮事件
        this.node.on(cc.Node.EventType.TOUCH_START,function(event){
            if (!this._enble) {
                return false;
            }
            //开始录制声音
            cc.vv && cc.vv.voiceMgr && cc.vv.voiceMgr.prepare("record.amr");
            this.node.children[0].active = true; //显示子类
            lastTime = Date.now(); //记录时间
            this.cancel.active = false;  //隐藏取消
            this.normal.active = true;   //显示录制
            this.time.width = this._timeW;  //重置进度条
            touchY = event.getLocation().y; //点击的位置
            this.alreadySend = false;
        }.bind(this));

        this.node.on(cc.Node.EventType.TOUCH_MOVE,function(event){
            if (!this._enble) {
                return;
            }

            if(this.alreadySend) return;
            //如果手指往上移动50,则显示取消发送
            if(event.getLocation().y - touchY > 50){
                if(!this.cancel.active){
                    this.cancel.active = true;
                    this.normal.active = false;
                }
            } else if(this.cancel.active){
                this.cancel.active = false;
                this.normal.active = true;
            }
        }.bind(this));
                    
        this.node.on(cc.Node.EventType.TOUCH_END,function(){
            if (!this._enble) {
                return;
            }

            if(this.alreadySend) return;

            let duration = Date.now() - lastTime;
            //发送取消
            if(this.cancel.active){
                cc.vv && cc.vv.voiceMgr && cc.vv.voiceMgr.cancel();
                return;
            }
            this.sendVoice();
        }.bind(this));
        
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,function(){
            if(this.alreadySend) return;

            cc.vv && cc.vv.voiceMgr && cc.vv.voiceMgr.cancel();
            this.node.children[0].active = false;
        }.bind(this));
    },

    /**
     * 发送语音
     */
    sendVoice:function(){
        cc.vv && cc.vv.voiceMgr && cc.vv.voiceMgr.release();
        let time = Date.now() - lastTime;
        let msg = cc.vv.voiceMgr.getVoiceData("record.amr");
        this.node.children[0].active = false;
        this.alreadySend = true;
        cc.connect.voice(msg, time);
    },

    setEnble (enble) {
        this._enble = enble;
        if (enble) {
            this.node.color = cc.Color.WHITE;
        } else {
            this.node.color = cc.Color.GRAY;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.node.children[0].active){
            let duration = Date.now() - lastTime; //语音录制时间
            let curr = duration / 15000; 
            this.time.width = this._timeW - this._timeW * curr;
            if(duration >= 15000){
                this.sendVoice();
            }

            if(Date.now() - checkTime > 300){
                checkTime = Date.now();
                let v = 1;
                //获取语音级别
                if(cc.sys.isNative){
                    v = cc.vv && cc.vv.voiceMgr && cc.vv.voiceMgr.getVoiceLevel(7);
                } else {
                    v = parseInt(Math.random() * 7) + 1;
                }
                this.vol.spriteFrame = this.volTex[v-1];
            }
        }
    },
});

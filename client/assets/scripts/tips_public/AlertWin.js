cc.Class({
    extends: cc.Component,

    properties: {

        ok:{
            default:null,
            type:cc.Node,
        },
        cancel:{
            default:null,
            type:cc.Node,
        },
        text:{
            default:null,
            type:cc.Label
        },
        text2:{
            default:null,
            type:cc.Label
        },
        closeBut:{
            default:null,
            type:cc.Node
        },
        loadingTips:{
            default:null,
            type:cc.Node
        },
        tips:cc.Node,
    },
    
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
    },

    onDisable:function(){
        //this.cancelCb = this.okCb = undefined;
    },

    /**
     * 显示文本
     */
    show:function(text, okCb, cancelCb){
        if (!!this.autoHideId) {
            clearTimeout(this.autoHideId);
        }

        if(!text){
            return;
        }

        this.unscheduleAllCallbacks();
        this.okCb = okCb;
        this.cancelCb = cancelCb;

        this.node.getChildByName('bg').active = true;
        this.node.getChildByName('layout').opacity = 200;
        this.isLoad = false;
        this.tips.active = true;
        this.loadingTips.active = false;
        this.closeBut.active = true;
        this.text.string = text;
        this.isLoad = true;
        if(okCb && cancelCb){
            this.ok.active = true;
            this.ok.x = 110;
            this.cancel.active = true;
            this.cancel.x = -110;
            this.okCb = okCb;
            this.cancelCb = cancelCb;
            this.closeBut.active = false;
            this.text.node.y = 50;
        } else if(okCb){
            this.ok.active = true;
            this.ok.x = 0;
            this.cancel.active = false;
            this.okCb = okCb;
            this.closeBut.active = false;
            this.text.node.y = 50;
        } else{
            this.ok.active = false;
            this.cancel.active = false;
            this.text.node.y = 20;
            this.isLoad = false;
        }
    },

    /**
     * 显示加载框
     */
    showLoading:function (text, isLogin) {
        this.cancelCb = this.okCb = undefined;
        this.ok.active = false;
        this.cancel.active = false;
        this.tips.active = false;
        this.loadingTips.active = true;
        this.closeBut.active = false;
        this.text2.string = text;
        this.isLoad = true;
        this.node.getChildByName('layout').opacity = 200;
        this.node.getChildByName('bg').active = true;
        if (!!this.autoHideId) {
            clearTimeout(this.autoHideId);
        }

        if (!isLogin) {
            this.autoHideId = setTimeout(()=> {
                this.show('网络连接失败，请稍后再试', ()=> {});
            }, 15000);
        }
    },

    close:function(){
        cc.vv.audioMgr.playButtonSound();
        if(this.isLoad){
            return;
        }
        this.node.active = false;
    },

    onOkClick:function(){
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
        this.okCb && this.okCb();
        this.cancelCb = this.okCb = undefined;
    },

    onCancelClick:function(){
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
        this.cancelCb && this.cancelCb();
        this.cancelCb = this.okCb = undefined;
    },

    onDestroy() {
        if (!!this.autoHideId) {
            clearTimeout(this.autoHideId);
        }
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        loadImg: {
            default: null,
            type: cc.Node,
            tooltip: "进度条的图片对象"
        },

        statusLab: {
            default: null,
            type: cc.Label
        },

        loadbg: {
            default: null,
            type: cc.Node
        },

        loadicon: {
            default: null,
            type: cc.Node
        },

        percentLab: {
            default: null,
            type: cc.Label
        },
    },

    // use this for initialization
    onLoad: function () {
        //警告模式，在控制台中只显示警告级别以上的（包含错误）日志。
        if (!cc.sys.isNative) {
            cc._initDebugSetting(cc.DebugMode.WARN);
        } else {
            cc._initDebugSetting(cc.DebugMode.ERROR);
        }

        this.initMgr();
        cc.utils.checkX(this.node);

        /** 热更相关 */
        this._hotSrc = this.getComponent('HotUpdate');
        this.loadbg.width = this.node.width;
        this.loadImg.width = 0;
        this.loadImg.x = -this.loadbg.width/2;
        this.loadicon.x = this.loadImg.x;
        this._stateStr = '';

    },

    start:function(){
        // setTimeout(() => {
        //     cc.director.loadScene('login');
        // }, 1000);
        this.checkResVersion();
    },

    onDestroy: function () {
        console.log("释放加载场景");
    },

    /**
     * 加载全局模块
     */
    initMgr:function(){
        cc.vv = {};
        cc.args = this.urlParse();
        cc.enum = require('../globle/Room_enum');
        /**
         * 语音工具类
         */
        let VoiceMgr = require("VoiceMgr");
        cc.vv.voiceMgr = new VoiceMgr();
        cc.vv.voiceMgr.init();
        /**
         * 音效工具类
         */
        let AudioMgr = require("AudioMgr");
        cc.vv.audioMgr = new AudioMgr();
        cc.vv.audioMgr.init();

        /**
         * 工具类，一些公共函数
         */
        cc.utils = require('../globle/Utils');
        /** 加密 **/
        cc.crypto = require('crypto');
        /**
         * 通讯层
         * @type {Con}
         */
        cc.connect = require('../network/Connect');
        // cc.connect.getSaferet();
        cc.dm = require('../network/DataModel');
    },

    /**
     * 获取URL地址栏参数
     * @returns {{}}
     */
    urlParse:function(){
        let params = {};
        if(window.location == null) {
            return params;
        }
        let name,value;
        let str=window.location.href; //取得整个地址栏
        let num=str.indexOf("?");
        str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

        let arr=str.split("&"); //各个参数放到数组里
        for(let i=0;i < arr.length;i++){
            num=arr[i].indexOf("=");
            if(num>0){
                name=arr[i].substring(0,num);
                value=arr[i].substr(num+1);
                params[name]=value;
            }
        }
        return params;
    },


    /**
     * 检查热更新版本号
     */
    checkResVersion:function () {
        this.setTips('正在连接', true);
        //检查版本
        this._hotSrc.checkResVer((percent)=> {
            this.loadImg.width = this.loadbg.width*percent;
            this.percentLab.string = Math.ceil(percent*100)+'%';
            this.loadicon.x = this.loadImg.width+this.loadImg.x;
        }, ()=> {
            this.skipLogin();
        }, (errmsg) => {
            this.setTips(errmsg);
            this.skipLogin();
        }, (stateStr, isLoad) => {
            this.setTips(stateStr, isLoad);
        });

        // this.skipLogin();
    },

    //跳到登录场景
    skipLogin: function () {
        if (this.isSkip) {
            return;
        }
        this.isSkip = true;
        this.setTips("准备登录");
        cc.director.loadScene("login");
    },

    /**
     * 设置显示字符串
     * @param str    字符串
     * @param isLoad 是否显示加载中的三个点
     */
    setTips:function (str, isLoad) {
        this._stateStr = str;
        this._isLoading = !!isLoad;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(!!this._stateStr){
            this.statusLab.string = this._stateStr + ' ';

            if (this._isLoading) {
                let t = Math.floor(Date.now() / 1000) % 4;
                for(let i = 0; i < t; ++ i) {
                    this.statusLab.string += '.';
                }
            }
        }
    },
});
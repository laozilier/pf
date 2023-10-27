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
        bgmVolume: 0.5,
        sfxVolume: 0.5,
        jinying: 0,
        bgmAudioID: -1,
        lastAudioUrl: "",
        tYY: null,
        tYX: null,
    },

    // use this for initialization
    init: function () {
        this.tYY = cc.sys.localStorage.getItem("bgmVolume");
        if (this.tYY != null) {
            this.bgmVolume = parseFloat(this.tYY);
        } else {
            cc.sys.localStorage.setItem("bgmVolume", 0.5);
        }
        this.tYX = cc.sys.localStorage.getItem("sfxVolume");
        if (this.tYX != null) {
            this.sfxVolume = parseFloat(this.tYX);
        } else {
            cc.sys.localStorage.setItem("sfxVolume", 0.5);
        }

        // var t = cc.sys.localStorage.getItem("jinying");
        // if(t != null){
        //     this.jinying = parseInt(t);
        // }

        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.audioEngine.resumeAll();
            // if(cc.director.getScene().name=="game"){
            //     cc.vv.Room.handBtns();
            //     if(cc.vv.Room&&cc.vv.Room.gameState!=10){
            //         cc.vv.net.disconnect();
            //     }
            // }
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    getUrl: function (url) {
        return "sounds/" + url.split(".")[0];
        // return cc.url.raw("resources/sounds/" + url);
    },

    /**
     * 播放按钮的音效
     */
    playButtonSound: function () {
        this.playSFX("bx_openBox.mp3");
    },

    playBGM(url) {
        var audioUrl = this.getUrl(url);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        this.lastAudioUrl = url;
        if (this.bgmVolume > 0) {
            cc.loader.loadRes(audioUrl, cc.AudioClip, (err, clip)=> {
                this.bgmAudioID = cc.audioEngine.play(clip, true, this.bgmVolume);
            });
            // this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
        }
    },

    playSFX(url) {
        var audioUrl = this.getUrl(url);
        if (this.sfxVolume > 0) {
            cc.loader.loadRes(audioUrl, cc.AudioClip, (err, clip)=> {
                cc.audioEngine.play(clip, false, this.sfxVolume);
            });
            // var audioId = cc.audioEngine.play(audioUrl,false,this.sfxVolume);
        }
    },

    setSFXVolume: function (v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    },

    setBGMVolume: function (v, force) {
        if (force == null) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        } else if (force == false) {
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            } else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        } else if (this.lastAudioUrl != "") {
            if (this.bgmVolume > 0) {
                this.playBGM(this.lastAudioUrl);
            }
        }
    },

    // setJinying:function(v){
    //     cc.sys.localStorage.setItem("jinying",v);
    //     this.jinying = v;
    //     if(this.bgmAudioID >= 0){
    //         if(v==0){
    //             this.setBGMVolume(0.5);
    //             this.setSFXVolume(0.5);
    //         }else{
    //             this.setBGMVolume(0);
    //             this.setSFXVolume(0);
    //         }
    //     }else if(this.lastAudioUrl!=""){
    //         if(this.bgmVolume>0){
    //             this.playBGM(this.lastAudioUrl);
    //         }
    //     }
    // },

    pauseAll: function () {
        cc.audioEngine.pauseAll();
    },

    resumeAll: function () {
        cc.audioEngine.resumeAll();
    },
});

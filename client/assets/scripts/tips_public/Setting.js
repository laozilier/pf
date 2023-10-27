

cc.Class({
    extends: cc.Component,

    properties: {
        bg: {
            default: null,
            type: cc.Node
        },

        setNode: {
            default: null,
            type: cc.Node
        },

        exitBtn: {
            default: null,
            type: cc.Node
        },

        musicNode: {
            default: null,
            type: cc.Node
        },

        effectNode: {
            default: null,
            type: cc.Node
        },

        musicBar: {
            default: null,
            type: cc.ProgressBar
        },

        effectBar: {
            default: null,
            type: cc.ProgressBar
        },

        musicFrames: {
            default: [],
            type: cc.SpriteFrame
        },

        exitLabels: {
            default: [],
            type: cc.Node
        },

        versionLab: {
            default: null,
            type: cc.Label
        },

        nnNode: {
            default: null,
            type: cc.Node
        },

        pdkNode: {
            default: null,
            type: cc.Node
        },

        sgNode: {
            default: null,
            type: cc.Node
        },

        pszNode: {
            default: null,
            type: cc.Node
        },

        ssNode: {
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
        this._maxNodex = 500;
        let self = this;
        let musicValue = cc.sys.localStorage.getItem("bgmVolume");
        if (musicValue == undefined) {
            musicValue = 0.5;
        } else {
            musicValue = parseFloat(musicValue);
        }

        let effectValue = cc.sys.localStorage.getItem("sfxVolume");
        if (effectValue == undefined) {
            effectValue = 0.5;
        } else {
            effectValue = parseFloat(effectValue);
        }

        if(musicValue > 0){
            self.musicNode.getComponent(cc.Sprite).spriteFrame = self.musicFrames[1];
        }else{
            self.musicNode.getComponent(cc.Sprite).spriteFrame = self.musicFrames[0];
        }

        if(effectValue > 0){
            self.effectNode.getComponent(cc.Sprite).spriteFrame = self.musicFrames[1];
        }else{
            self.effectNode.getComponent(cc.Sprite).spriteFrame = self.musicFrames[0];
        }

        this.musicBar.progress = this.checkValue(musicValue);
        let shaizi = this.musicBar.node.getChildByName('gold');
        if (shaizi) {
            let x = musicValue*this._maxNodex;
            shaizi.x = x;
        }
        this.effectBar.progress = this.checkValue(effectValue);
        shaizi = this.effectBar.node.getChildByName('gold');
        if (shaizi) {
            let x = effectValue*this._maxNodex;
            shaizi.x = x;
        }

        this.musicBar.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.checkBar(this.musicBar.node, event, 'bgmVolume');
        }.bind(this));

        this.musicBar.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.checkBar(this.musicBar.node, event, 'bgmVolume');
        }.bind(this));

        this.musicBar.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.saveSoundValue(this.musicBar.node, event, 'bgmVolume');
        }.bind(this));

        this.musicBar.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.saveSoundValue(this.musicBar.node, event, 'bgmVolume');
        }.bind(this));

        this.effectBar.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.checkBar(this.effectBar.node, event, 'sfxVolume');
        }.bind(this));

        this.effectBar.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.checkBar(this.effectBar.node, event, 'sfxVolume');
        }.bind(this));

        this.effectBar.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.saveSoundValue(this.effectBar.node, event, 'sfxVolume');
        }.bind(this));

        this.effectBar.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.saveSoundValue(this.effectBar.node, event, 'sfxVolume');
        }.bind(this));

        this.versionLab.node.active = false;
        if (cc.sys.isNative && !!cc.version) {
            this.versionLab.node.active = true;
            this.versionLab.string = '版本号：'+cc.version;
        }
    },

    checkValue (value) {
        if (value > 0.6) {
            return value;
        }

        if (value == 0) {
            return 0.05;
        }

        let a = value+Math.min(0.01/value, 0.05);
        return a;
    },

    checkBar (n, event, key) {
        let p = n.convertTouchToNodeSpace(event);
        let x = p.x;

        if (x > this._maxNodex) {
            x = this._maxNodex;
        }

        if (x < 0) {
            x = 0;
        }

        let shaizi = n.getChildByName('gold');
        if (shaizi) {
            shaizi.x = x;
        }

        let percent = x/this._maxNodex;//this.checkValue(x/this._maxNodex);
        n.getComponent(cc.ProgressBar).progress = percent;

        this.saveSoundValue(n, event, key);
    },

    saveSoundValue (n, event, key) {
        let p = n.convertTouchToNodeSpace(event);
        let x = p.x;

        if (x > this._maxNodex) {
            x = this._maxNodex;
        }

        if (x < -10) {
            x = -10;
        }

        let percent = x/this._maxNodex;
        if (key == 'sfxVolume') {
            cc.vv.audioMgr.setSFXVolume(percent);
            if(percent > 0){
                this.effectNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[1];
            } else {
                this.effectNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[0];
            }
        } else {
            cc.vv.audioMgr.setBGMVolume(percent);
            if(percent > 0){
                this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[1];
            } else {
                this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[0];
            }

        }
    },

    /**
     *
     * @param [gameName]  游戏名字
     * @param [exitCb]    退出回调
     */
    show (gameName, exitCb, changeCb) {
        this.node.active = true;
        this._exitCb = exitCb;
        this._changeCb = changeCb;
        if (!!this.nnNode) { this.nnNode.active = false }
        if (!!this.pdkNode) { this.pdkNode.active = false }
        if (!!this.sgNode) { this.sgNode.active = false }
        if (!!this.ssNode) { this.ssNode.active = false }
        if (!!this.pszNode) { this.pszNode.active = false }
        if (gameName) {
            this.exitLabels[0].active = false;
            this.exitLabels[1].active = true;
            let n = this.bg.getChildByName(gameName);
            if (!!n) {
                this.bg.height = 640;
                n.active = true;
                let bgidx = cc.sys.localStorage.getItem(gameName) || 0;
                n.children.forEach(function (t, idx) {
                    t.getComponent(cc.Toggle).isChecked = (idx == bgidx);
                });
            } else {
                this.bg.height = 500;
            }
        } else {
            this.exitLabels[0].active = true;
            this.exitLabels[1].active = false;
            this.bg.height = 500;
        }
    },

    onTogglePressed(event, idx) {
        cc.vv.audioMgr.playButtonSound();
        if (!!this._changeCb) {
            this._changeCb(idx);
        }
    },

    /**
     * 关闭当前窗口
     */
    close:function(){
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onBtnMusicPressed() {
        cc.vv.audioMgr.playButtonSound();

        let musicValue = cc.sys.localStorage.getItem("bgmVolume");
        if (!!musicValue) {
            if(musicValue > 0) {
                musicValue = 0;
                this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[0];
                let shaizi = this.musicBar.node.getChildByName('gold');
                if (shaizi) {
                    shaizi.x = 0;
                }

                this.musicBar.node.getComponent(cc.ProgressBar).progress = 0.05;
            } else {
                musicValue = 0.5;
                this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[1];

                let shaizi = this.musicBar.node.getChildByName('gold');
                if (shaizi) {
                    shaizi.x = 0.5*this._maxNodex;
                }
                this.musicBar.node.getComponent(cc.ProgressBar).progress = 0.5;
            }

            cc.vv.audioMgr.setBGMVolume(musicValue);
        }
    },

    onBtnEffectPressed() {
        cc.vv.audioMgr.playButtonSound();

        let effectValue = cc.sys.localStorage.getItem("sfxVolume");
        if (!!effectValue) {
            effectValue = parseFloat(effectValue);
            if (effectValue > 0) {
                effectValue = 0;
                this.effectNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[0];

                let shaizi = this.effectBar.node.getChildByName('gold');
                if (shaizi) {
                    shaizi.x = 0;
                }
                this.effectBar.node.getComponent(cc.ProgressBar).progress = 0.05;
            } else {
                effectValue = 0.5;
                this.effectNode.getComponent(cc.Sprite).spriteFrame = this.musicFrames[1];

                let shaizi = this.effectBar.node.getChildByName('gold');
                if (shaizi) {
                    shaizi.x = 0.5 * this._maxNodex;
                }
                this.effectBar.node.getComponent(cc.ProgressBar).progress = 0.5;
            }

            cc.vv.audioMgr.setSFXVolume(effectValue);
        }
    },

    changeUser:function () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
        if (!!this._exitCb) {
            this._exitCb();
        } else {
            cc.sys.localStorage.removeItem("x_wx_account");
            cc.sys.localStorage.removeItem("x_wx_sign");
            cc.sys.localStorage.removeItem("wx_account");
            cc.sys.localStorage.removeItem("wx_sign");
            cc.sys.localStorage.removeItem("login_sign");
            cc.game.restart(); //重新开始游戏
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

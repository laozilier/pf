cc.Class({
    extends: cc.Component,

    properties: {
        anteToggles:{
            default:null,
            type:cc.Node
        },

        anteLab: {
            default:null,
            type:cc.Label,
        },

        anteTips: {
            default:null,
            type:cc.Node,
        },

        btnAnte: {
            default: null,
            type: cc.Node
        },

        numbersToggles:{
            default:null,
            type:cc.Node
        },

        numbersLab: {
            default:null,
            type:cc.Label,
        },

        numbersTips: {
            default:null,
            type:cc.Node,
        },

        btnNumbers: {
            default: null,
            type: cc.Node
        },

        playerMaxToggles:{
            default:null,
            type:cc.Node
        },

        playerMaxLab: {
            default:null,
            type:cc.Label,
        },

        playerMaxTips: {
            default:null,
            type:cc.Node,
        },

        btnPlayerMax: {
            default: null,
            type: cc.Node
        },

        inningToggles: {
            default:null,
            type:cc.Node
        },

        inningLab: {
            default:null,
            type:cc.Label,
        },

        inningTips: {
            default:null,
            type:cc.Node,
        },

        btnInning: {
            default: null,
            type: cc.Node
        },

        zhaniaoToggles: {
            default:null,
            type:cc.Node
        },

        zhaniaoLab: {
            default:null,
            type:cc.Label,
        },

        zhaniaoTips: {
            default:null,
            type:cc.Node,
        },

        btnZhaniao: {
            default: null,
            type: cc.Node
        },

        gaojis: {
            default: [],
            type: [cc.Toggle]
        },

        gaojiLab: {
            default:null,
            type:cc.Label,
        },

        gaojiTips: {
            default: null,
            type: cc.Node
        },

        btnGaoji: {
            default: null,
            type: cc.Node
        },

        allGaojiToggle: {
            default: null,
            type: cc.Toggle
        },

        inCoinLab:{
            default:null,
            type:cc.Node,
            displayName:"入场金币"
        },

        leaveCoinLab:{
            default:null,
            type:cc.Node,
            displayName:"离场金币"
        },

        moreLessFrames: {
            default: [],
            type: cc.SpriteFrame
        }

    },

    // use this for initialization
    onLoad: function () {
        this._gameName = cc.enum.GameName.mj_hz;
        cc.utils.setNodeWinSize(this.node);

        this._min = 2*4*8;
        this._max = this._min*20;

        this._innings = [0, 3, 5, 8];
        this._zhaniaos = [0, 2, 4, 6];
    },

    showRecord: function () {
        //显示之前存储的
        let data = this._data;
        if (!data || data.gameName != this._gameName) {
            data = null;
            let jsonstr = cc.sys.localStorage.getItem("mj_zz_record");
            if (jsonstr) {
                data = JSON.parse(jsonstr);
            }
        }

        if (data) {
            let game_rule = data.game_rule || {};
            let room_rule = data.room_rule || {};
            this._anteValue = game_rule.ante == undefined ? 5000 : game_rule.ante;
            this._startNumberValue = room_rule.startNumber == undefined ? 3 : room_rule.startNumber;
            this._inningValue = room_rule.inningLimit == undefined ? 3 : room_rule.inningLimit;
            this._zhaniaoValue = room_rule.zhaniao == undefined ? 2 : room_rule.zhaniao;
            this._halfwayValue = room_rule.halfway == undefined ? true : room_rule.halfway;
            this._stopCheatingsValue = game_rule.stopCheatings == undefined ? false : game_rule.stopCheatings;
            this._playerMaxValue = room_rule.playerMax == undefined ? this._startNumberValue-1 : room_rule.playerMax;
        } else {
            this._anteValue = 20000;
            this._inningValue = 0;
            this._startNumberValue = 2;            //开局人数：2，3，4
            this._zhaniaoValue = 2;
            this._halfwayValue = true;             //中途加入0 1
            this._stopCheatingsValue = false;       //防作弊 0 1
            this._playerMaxValue = this._startNumberValue-2;
        }

        let self = this;
        this._anteValue = this._anteValue > 50000 ? 5000 : this._anteValue;
        //底注
        this.anteToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == self.getAnteIdx());
        });

        //人数 0、3人   1、2人
        this.numbersToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._startNumberValue-2));
        });

        //最大人数
        this.playerMaxToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._playerMaxValue));
        });

        //最少局数 0 3 5 8
        this.inningToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._innings.indexOf(self._inningValue)));
        });

        //扎鸟个数 0 2 4 5
        this.zhaniaoToggles.children.forEach(function (el, i) {
            el.getComponent(cc.Toggle).isChecked = (i == (self._zhaniaos.indexOf(self._zhaniaoValue)));
        });

        //房间开始后禁止加入    防作弊
        this.gaojis[0].getComponent(cc.Toggle).isChecked = this._halfwayValue;
        this.gaojis[1].getComponent(cc.Toggle).isChecked = this._stopCheatingsValue;

        this.checkAnteLab();
        this.checkNmbersLab();
        this.checkPlayerMaxLab();
        this.checkInningLab();
        this.checkZhaniaoLab();
        this.checkGaojiLab();
    },

    open (cid, cb, data) {
        this._cid = cid;
        this._cb = cb;
        this._data = data;
        this.resetAll();
        this.showRecord();
    },

    getAnteIdx () {
        let idx = 0;
        switch (this._anteValue) {
            case 1000:
                idx = 0;
                break;
            case 5000:
                idx = 1;
                break;
            case 10000:
                idx = 2;
                break;
            case 20000:
                idx = 3;
                break;
            case 50000:
                idx = 4;
                break;
            case 100000:
                idx = 5;
                break;
        }
        return idx;
    },

    checkScoreLab () {
        let score = this._anteValue*this._min;
        let instr = cc.utils.getScoreStr(score);
        let leavestr = '小于'+cc.utils.getScoreStr(score*0.2);
        this.inCoinLab.getComponent(cc.Label).string = instr;
        this.leaveCoinLab.getComponent(cc.Label).string = leavestr;
    },

    getCreateData () {
        /** 获取创建房间的信息 */
        let rule = {};

        rule.ante = this._anteValue;
        rule.stopCheatings = this._stopCheatingsValue;

        let data = {
            gameName: this._gameName,                   //游戏类型
            room_rule: {
                startNumber: this._startNumberValue,    //开局人数
                playerMax: this._playerMaxValue,    //最大人数
                halfway: this._halfwayValue,            //是否中途加入
                inningLimit: this._inningValue,         //限制局数
            },
            //游戏规则
            game_rule: {
                ante: this._anteValue,
                zhaniao: this._zhaniaoValue,
                stopCheatings: this._stopCheatingsValue
            }
        };

        console.log('转转麻将规则 = ', data);
        cc.sys.localStorage.setItem("mj_zz_record", JSON.stringify(data));

        return data;
    },

    onCreate: function () {
        cc.vv.audioMgr.playButtonSound();
        let data = this.getCreateData();

        if (this._cid) {
            this.node.active = false;
            if (this._cb) {
                this._cb(data);
            }
        } else {
            cc.connect.createRoom(data, function (code, msg) {
                if(code === 200){
                    cc.connect.joinRoom(msg.rid);
                } else {
                    cc.utils.openErrorTips(code);
                }
            });
        }
    },

    onDeletePressed: function () {
        cc.vv.audioMgr.playButtonSound();

        if (this._cid) {
            cc.utils.openLoading('删除中...');
            cc.connect.post('del_private_room', {uid: cc.dm.user.uid, cid: this._cid, gameName: this._gameName}, function (msg) {
                this.node.active = false;
                cc.utils.openTips('删除成功');
            }.bind(this), function (code) {
                cc.utils.openErrorTips(code);
            });
        }
    },

    onCancel () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    resetAll () {
        this.anteTips.active = false;
        this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.numbersTips.active = false;
        this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.playerMaxTips.active = false;
        this.btnPlayerMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.inningTips.active = false;
        this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.zhaniaoTips.active = false;
        this.btnZhaniao.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        this.gaojiTips.active = false;
    },

    onBtnAntePressed () {
        if (this.anteTips.active) {
            this.anteTips.active = false;
            this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.anteTips.active = true;
            this.btnAnte.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onAnteTogglesPressed (event, data) {
        this.resetAll();
        this._anteValue = parseInt(data);
        this.checkAnteLab();
    },

    checkAnteLab() {
        this.anteLab.string = cc.utils.getScoreStr(this._anteValue);
        this.checkScoreLab();
    },

    onbtnNumberssPressed () {
        if (this.numbersTips.active) {
            this.numbersTips.active = false;
            this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.numbersTips.active = true;
            this.btnNumbers.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onNumberTogglesPressed (event, data) {
        this.resetAll();
        this._startNumberValue = parseInt(data);
        this.checkNmbersLab();

    },

    checkNmbersLab() {
        this.numbersLab.string = this._startNumberValue+'人';
        let max = cc.enum.playerMax[this._gameName][this._playerMaxValue];
        if (max < this._startNumberValue) {
            while (max < this._startNumberValue) {
                this._playerMaxValue+=1;
                max = cc.enum.playerMax[this._gameName][this._playerMaxValue];
            }

            //最大人数
            this.playerMaxToggles.children.forEach( (el, i) => {
                el.getComponent(cc.Toggle).isChecked = (i == (this._playerMaxValue));
            });

            this.checkPlayerMaxLab();
        }
    },

    onbtnPlayerMaxPressed () {
        if (this.playerMaxTips.active) {
            this.playerMaxTips.active = false;
            this.btnPlayerMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.playerMaxTips.active = true;
            this.btnPlayerMax.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onPlayerMaxTogglesPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.resetAll();
        this._playerMaxValue = parseInt(data);
        this.checkPlayerMaxLab();

    },

    checkPlayerMaxLab() {
        let max = cc.enum.playerMax[this._gameName][this._playerMaxValue];
        this.playerMaxLab.string = max+'人';
        if (max < this._startNumberValue) {
            this._startNumberValue = max;
            //人数 0、3人   1、2人
            this.numbersToggles.children.forEach((el, i) => {
                el.getComponent(cc.Toggle).isChecked = (i == (this._startNumberValue-2));
            });
            this.checkNmbersLab();
        }
    },

    onBtnInningPressed () {
        if (this.inningTips.active) {
            this.inningTips.active = false;
            this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.inningTips.active = true;
            this.btnInning.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onInningTogglePressed (event, data) {
        this.resetAll();
        this._inningValue = parseInt(data);
        this.checkInningLab();
    },

    checkInningLab() {
        let str = '';
        switch (this._inningValue) {
            case 0:
                str = '不限';
                break;
            case 3:
                str = '3局';
                break;
            case 5:
                str = '5局';
                break;
            case 8:
                str = '8局';
                break;
            default:
                break;
        }

        this.inningLab.string = str;
    },

    onBtnZhaniaoPressed () {
        if (this.zhaniaoTips.active) {
            this.zhaniaoTips.active = false;
            this.btnZhaniao.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[0];
        } else {
            this.resetAll();
            this.zhaniaoTips.active = true;
            this.btnZhaniao.getComponent(cc.Sprite).spriteFrame = this.moreLessFrames[1];
        }
    },

    onZhaniaoTogglePressed (event, data) {
        this.resetAll();
        this._zhaniaoValue = parseInt(data);
        this.checkZhaniaoLab();
    },

    checkZhaniaoLab() {
        let str = '';
        switch (this._zhaniaoValue) {
            case 0:
                str = '不扎鸟';
                break;
            case 2:
                str = '扎2鸟';
                break;
            case 4:
                str = '扎4鸟';
                break;
            case 6:
                str = '扎6鸟';
                break;
            default:
                break;
        }

        this.zhaniaoLab.string = str;
    },

    onBtnGaojiPressed () {
        if (this.gaojiTips.active) {
            this.gaojiTips.active = false;
        } else {
            this.resetAll();
            this.gaojiTips.active = true;
        }
    },

    onGaojiTogglesPressed (event, data) {
        this.checkGaojiLab();
    },

    onGaojiAllTogglesPressed (event, data) {
        this.checkGaojiLab(this.allGaojiToggle.getComponent(cc.Toggle).isChecked);
    },

    checkGaojiLab (all) {
        if (all != undefined) {
            if (all) {
                this.gaojiLab.string = '房间开始后可以加入    防作弊';
            } else {
                this.gaojiLab.string = '无';
            }

            this._stopCheatingsValue = all;
            this._halfwayValue = all;

            this.gaojis.forEach(function (t) {
                t.getComponent(cc.Toggle).isChecked = all;
            });
        } else {
            all = true;
            let str = '';
            this.gaojis.forEach(function (t, i) {
                if (i == 0) {
                    this._halfwayValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._halfwayValue) {
                        str += '房间开始后可以加入    ';
                    } else {
                        all = false;
                    }
                }

                if (i == 1) {
                    this._stopCheatingsValue = t.getComponent(cc.Toggle).isChecked;
                    if (this._stopCheatingsValue) {
                        str += '防作弊';
                    } else {
                        all = false;
                    }
                }
            }.bind(this));

            str = str.length == 0 ? '无':str;
            this.gaojiLab.string = str;
            this.allGaojiToggle.getComponent(cc.Toggle).isChecked = all;
        }
    },

});

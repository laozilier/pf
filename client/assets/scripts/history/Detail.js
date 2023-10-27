// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },

        qipaiPrefab: {
            default: null,
            type: cc.Prefab
        },

        niuPrefab: {
            default: null,
            type: cc.Prefab
        },

        sgPrefab: {
            default: null,
            type: cc.Prefab
        },

        jhPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    show (data, gameName) {
        //斗牛 "{"100137": {"dec": true, "rob": 2, "holds": [12, 36, 11, 7, 37], "score": 60000, "value": 8}, "
        if (gameName.indexOf('niuniu') > -1) {
            this.showNiuniu(data);
        } else if (gameName.indexOf('sangong') > -1) {
            this.showSangong(data);
        }else if (gameName.indexOf('psz') > -1) {
            this.showPsz(data);
        } else if (gameName.indexOf('ttz') > -1) {
            this.showTTZ(data);
        }
    },

    showNiuniu(data) {
        let users = data.userinfos;
        let uids = data.uids;
        let playback = data.playback;
        let laizi = playback.laizi;
        for (let i = 0; i < uids.length; i++) {
            let uid = uids[i];
            let info = playback[uid];
            if (info == undefined) {
                continue;
            }

            let item = this.node.getChildByName('historyItem'+i);
            if (!item.getChildByName('poker0')) {
                for (let j = 0; j < 5; j++) {
                    let poker = cc.instantiate(this.pokerPrefab);
                    poker.scale = 0.3;
                    item.addChild(poker, 1, 'poker'+j);
                    poker.y = -20;
                    poker.x = (j-2)*32;
                }
            }

            let name = cc.utils.fromBase64(users[uid].name, 4);
            let nameLab = item.getChildByName('name');
            nameLab.getComponent(cc.Label).string = name;
            nameLab.getChildByName('Label').getComponent(cc.Label).string = name;
            let holds = info.holds;
            if (holds == undefined) {
                continue;
            }

            holds.forEach(function (value, i) {
                let poker = item.getChildByName('poker'+i);
                poker.getComponent('poker').show(value, laizi);
            });

            let dec = info.dec;
            item.getChildByName('zhuang').active = !!dec;

            let rob = info.rob;
            if (rob != undefined) {

            }

            let value = info.value;
            if (value != undefined) {
                let niuType = item.getChildByName('niuType');
                if (niuType == undefined) {
                    niuType = cc.instantiate(this.niuPrefab);
                    niuType.y = -45;
                    niuType.x = 0;
                    niuType.scale = 0.7;
                    item.addChild(niuType, 10, 'niuType');
                }

                niuType.getComponent('niuType').checkNiuType(value, playback.multipleRule, info.jinpai, false);
            }
        }
    },

    showSangong(data) {
        let users = data.userinfos;
        let uids = data.uids;
        let playback = data.playback;

        for (let i = 0; i < uids.length; i++) {
            let uid = uids[i];
            let info = playback[uid];
            if (info == undefined) {
                continue;
            }

            let item = this.node.getChildByName('historyItem'+i);
            if (!item.getChildByName('poker0')) {
                for (let j = 0; j < 3; j++) {
                    let poker = cc.instantiate(this.pokerPrefab);
                    poker.scale = 0.26;
                    item.addChild(poker, 1, 'poker'+j);
                    poker.y = -20;
                    poker.x = (j-1)*60;
                }
            }

            let name = cc.utils.fromBase64(users[uid].name, 4);
            let nameLab = item.getChildByName('name');
            nameLab.getComponent(cc.Label).string = name;

            nameLab.getChildByName('Label').getComponent(cc.Label).string = name;
            let holds = info.holds;
            if (holds == undefined) {
                continue;
            }

            holds.forEach(function (value, i) {
                let poker = item.getChildByName('poker'+i);
                poker.getComponent('poker').show(value);
            });

            let dec = info.dec;
            item.getChildByName('zhuang').active = !!dec;

            let rob = info.rob;
            if (rob != undefined) {

            }

            let value = info.value;
            if (value != undefined) {
                let sangongType = item.getChildByName('sangongType');
                if (sangongType == undefined) {
                    sangongType = cc.instantiate(this.sgPrefab);
                    sangongType.scale = 0.7;
                    sangongType.x = 0;
                    sangongType.y = -40;
                    item.addChild(sangongType, 10, 'sangongType');
                }

                if (value.length == 1) {
                    sangongType.getComponent('SangongType').checkSangongType(value, 0);
                } else if(value.length == 2){
                    sangongType.getComponent('SangongType').checkSangongType(value);
                }
            }
        }
    },
    showPsz(data) {
        let users = data.userinfos;
        let uids = data.uids;
        let playback = data.playback;

        for (let i = 0; i < uids.length; i++) {
            let uid = uids[i];
            let info = playback[uid];
            if (info == undefined) {
                continue;
            }

            let item = this.node.getChildByName('historyItem'+i);
            if (!item.getChildByName('poker0')) {
                for (let j = 0; j < 3; j++) {
                    let poker = cc.instantiate(this.pokerPrefab);
                    poker.scale = 0.26;
                    item.addChild(poker, 1, 'poker'+j);
                    poker.y = -20;
                    poker.x = (j-1)*60;
                }
            }

            let name = cc.utils.fromBase64(users[uid].name, 4);
            let nameLab = item.getChildByName('name');
            nameLab.getComponent(cc.Label).string = name;

            nameLab.getChildByName('Label').getComponent(cc.Label).string = name;
            let holds = info.holds;
            if (holds == undefined) {
                continue;
            }

            holds.forEach(function (value, i) {
                let poker = item.getChildByName('poker'+i);
                poker.getComponent('poker').show(value);
                if(info.isWaiver) {
                    poker.getChildByName('paimian').color = cc.color(180, 180, 180);
                } else {
                    poker.getChildByName('paimian').color = cc.Color.WHITE;
                }
            });

            let dec = info.dec;
            item.getChildByName('zhuang').active = !!dec;

            let qipai = item.getChildByName('qipai');
            if (!qipai) {
                qipai = cc.instantiate(this.qipaiPrefab);
                qipai.scale = 0.6;
                qipai.y = 12;
                qipai.x = 90;
                item.addChild(qipai, 1, 'qipai');
            }

            if(!info.isLoser && info.isWaiver) {
                qipai.active = true;
            } else {
                qipai.active = false;
            }

            let jhType = item.getChildByName('jhType');
            if (jhType == undefined) {
                jhType = cc.instantiate(this.jhPrefab);
                jhType.scale = 0.7;
                jhType.x = 0;
                jhType.y = -40;
                item.addChild(jhType, 10, 'jhType');
            }

            let types = [0, 1, 2, 3, 4, 3, 2, 2, 2, 4, 4, 4, 5];
            let type = types[info.value];
            jhType.getComponent('jhType').checkjhType(type, false, false, true);
        }
    }

    // update (dt) {},
});

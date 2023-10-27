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
        leftItem: {
            default: null,
            type: cc.Node
        },

        leftContent: {
            default: null,
            type: cc.Node
        },

        leftToggles: {
            default: null,
            type: cc.Node
        },

        leftNodataNode: {
            default: null,
            type: cc.Node
        },

        scoreLab: {
            default: null,
            type: cc.Node
        },

        searchInput: {
            default: null,
            type: cc.EditBox
        },

        giftInput: {
            default: null,
            type: cc.EditBox
        },

        userinfoNode: {
            default: null,
            type: cc.Node
        },

        nouserNode: {
            default: null,
            type: cc.Node
        },

        pListBtn: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        
        this._minScore = 10000;
        this._idx = -1;
        this._userInfo = undefined;
    },

    start () {

    },

    openGift(uid) {
        this.node.active = true;
        this.pListBtn.active = (!!cc.dm.user.permission && cc.dm.user.permission.dealer);
        // cc.sys.localStorage.removeItem('giftList_'+cc.dm.user.uid);
        let userliststr = cc.sys.localStorage.getItem('giftList_'+cc.dm.user.uid);
        if (!!userliststr) {
            this._userlist = JSON.parse(userliststr);
        } else {
            this._userlist = [];
        }

        this._uinfos = {};
        for (let i = 0; i < this._userlist.length; i++) {
            let uid = this._userlist[i];
            let uinfostr = cc.sys.localStorage.getItem('uinfo_'+uid);
            this._uinfos[uid] = JSON.parse(uinfostr);
        }

        this._parents = undefined;
        this._userInfo = undefined;
        this.resetData();
        this.checkLeftList();
        // if (this._idx < 0) {
        //     this.onSearchBtnPressed();
        // } else {
        //     if (this._idx < this._userlist.length) {
        //         this.onTogglePressed(null, this._idx);
        //     }
        // }

        if (!!uid) {
            this.searchInput.string = ''+uid;
            this.onSearchBtnPressed();
        }
    },

    resetData() {
        let scorestr = cc.utils.getScoreStr();
        this.scoreLab.getComponent(cc.Label).string = scorestr;
        this.scoreLab.getChildByName('Label').getComponent(cc.Label).string = scorestr;
        
        if (!!this._userInfo) {
            this.userinfoNode.active = true;
            this.nouserNode.active = false;

            let headNode = this.userinfoNode.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(this._userInfo.headimg);
            let namestr = cc.utils.fromBase64(this._userInfo.name, 6);
            let nameLab = this.userinfoNode.getChildByName('name');
            nameLab.getComponent(cc.Label).string = namestr;
            nameLab.getChildByName('Label').getComponent(cc.Label).string = namestr;

            let IDLab = this.userinfoNode.getChildByName('ID');
            IDLab.getComponent(cc.Label).string = 'ID: '+this._userInfo.uid;

            let PIDLab = this.userinfoNode.getChildByName('PID');
            PIDLab.getComponent(cc.Label).string = '上级ID:  '+this._userInfo.invite_code;

            let inningLab = this.userinfoNode.getChildByName('inning');
            inningLab.getComponent(cc.Label).string = '局   数：'+this._userInfo.total_inning+'局';

            let scorestr = cc.utils.getScoreStr(this._userInfo.score);
            let scoreLab = this.userinfoNode.getChildByName('scoreLab');
            scoreLab.getComponent(cc.Label).string = scorestr;
            scoreLab.getChildByName('Label').getComponent(cc.Label).string = scorestr;

            this._parents = typeof this._userInfo.parents == 'string' ? JSON.parse(this._userInfo.parents) : this._userInfo.parents;
        } else {
            this.searchInput.string = '';

            this.userinfoNode.active = false;
            this.nouserNode.active = true;

            this.nouserNode.getComponent(cc.Label).string = '请输入ID查询或选择一个玩家';
        }

        this.giftInput.string = '';
    },

    checkLeftList() {
        this.leftToggles.children.forEach((el) => { el.active = false; } );
        for (let i = 0; i < this._userlist.length; i++) {
            let item = this.leftToggles.getChildByName('item'+i);
            if (!item) {
                item = cc.instantiate(this.leftItem);
                this.leftToggles.addChild(item, i, 'item'+i);
                item.getComponent(cc.Toggle).checkEvents[0].customEventData = i;
            }

            item.active = true;
            item.getComponent(cc.Toggle).isChecked = false;//(i == this._idx);
            
            let uid = this._userlist[i];
            let uinfo = this._uinfos[uid];
            let headNode = item.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(uinfo.headimg);
            
            let nameLab = item.getChildByName('name');
            nameLab.getComponent(cc.Label).string = cc.utils.fromBase64(uinfo.name, 6);

            let IDstr = 'ID: '+uinfo.uid;
            let IDLab = item.getChildByName('ID');
            IDLab.getComponent(cc.Label).string = IDstr;
            IDLab.getChildByName('Label').getComponent(cc.Label).string = IDstr;
        }

        this.leftNodataNode.active = (this._userlist.length == 0);
    },

    // update (dt) {},

    onTogglePressed(event, idx) {
        if (this._idx < 0) {
            this._idx = 0;
            event.target.getComponent(cc.Toggle).isChecked = false;
            return;
        }

        if (!!event) {
            cc.vv.audioMgr.playButtonSound();
        }
        this._idx = typeof idx == 'number' ? idx : parseInt(idx);
        let uid = this._userlist[idx];
        this._userInfo = this._uinfos[uid];
        this.searchInput.string = uid.toString();
        this.onSearchBtnPressed();
    },

    onSearchTxtChanged() {
        this.onSearchBtnPressed();
    },

    onSearchBtnPressed(event) {
        if (event) {
            cc.vv.audioMgr.playButtonSound();
        }
        let uid = this.searchInput.string;
        if (!!uid && uid.length == 6) {
            uid = parseInt(uid);
            let idx = this._userlist.indexOf(uid);
            if (idx > -1) {
                let item = this.leftToggles.getChildByName('item'+idx);
                if (!!item) {
                    item.getComponent(cc.Toggle).isChecked = true;
                }
    
                this._idx = idx;
            } else {
                let item = this.leftToggles.getChildByName('item'+this._idx);
                if (!!item) {
                    item.getComponent(cc.Toggle).isChecked = false;
                }
    
                this._idx = -1;
            }

            this.searchUserNext(uid);
        } else {
            !!event && cc.utils.openTips('请输入玩家ID或选择一个玩家');
        }
    },

    searchUserNext(uid, cb) {
        cc.connect.searchUser(uid, (info)=> {
            this._userInfo = info;
            this.resetData();
            !!cb && cb();
        }, (errmsg) => {
            this.userinfoNode.active = false;
            this.nouserNode.active = true;
            this.nouserNode.getComponent(cc.Label).string = errmsg;
        });
    },

    onMaxBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let score = cc.dm.user.score;
        let maxScore = score-score%this._minScore;
        this.giftInput.string = maxScore/10000;
    },

    onOkBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let uid = this.searchInput.string;
        if (!!uid && uid.length == 6) {
            uid = parseInt(uid);
            if (uid == cc.dm.user.uid) {
                cc.utils.openTips('不能赠送给自己');
                return;
            }

            if (!this._userInfo || uid != this._userInfo.uid) {
                this.searchUserNext(uid, () => {
                    this.giveNext(uid);
                });
            } else {
                this.giveNext(uid);
            }
        } else {
            cc.utils.openTips('请输入玩家ID或选择一个玩家');
        }
    },

    giveNext(uid) {
        let str = this.giftInput.string;
        if (!!str) {
            let giftScore = parseInt(str)*10000;
            if (giftScore > cc.dm.user.score) {
                cc.utils.openTips('赠送金币数量不能大于拥有的金币数量');
                return;
            } else if (giftScore < this._minScore) {
                cc.utils.openTips('赠送金币数量不能少于'+cc.utils.getScoreStr(this._minScore));
                return;
            }

            cc.utils.openTips('确定赠送？',  ()=> {
                cc.connect.giveScore(uid, giftScore, cc.dm.clubInfo.cid, (msg) => {
                    cc.dm.user.score -= giftScore;
                    this._userInfo.score += giftScore;
                    this.giveSuc(uid);

                    if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                        cc.sceneSrc.scoreChanged();
                    }
                });
            });
        } else {
            cc.utils.openTips('请输入赠送金币数量');
        }
    },

    giveSuc(uid) {
        let idx = this._userlist.indexOf(uid);
        if (idx > -1) {
            this._userlist.splice(idx, 1);
        }

        this._userlist.unshift(uid);

        cc.sys.localStorage.setItem('giftList_'+cc.dm.user.uid, JSON.stringify(this._userlist));
        cc.sys.localStorage.setItem('uinfo_'+uid, JSON.stringify(this._userInfo));
        this._uinfos[uid] = JSON.parse(JSON.stringify(this._userInfo));

        this.resetData();
        this._idx = 0;
        this.checkLeftList();
    },

    onListBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (!this._parents) {
            cc.utils.openWeakTips('玩家上级列表为空');
            return;
        }

        if (this._parents.length == 0) {
            cc.utils.openWeakTips('玩家上级列表为空');
            return;
        }

        let bindList = this.node.getChildByName('bindList');
        if (bindList) {
            bindList.getComponent('BindList').openBindList(this._parents);
        } else {
            cc.utils.loadPrefabNode('tips_hall/bindList', function (bindList) {
                this.node.addChild(bindList, 1, 'bindList');
                bindList.getComponent('BindList').openBindList(this._parents);
            }.bind(this));
        }
    },

    onCloseBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }
});

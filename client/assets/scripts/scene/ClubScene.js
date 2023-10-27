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
        headNode: {
            default: null,
            type: cc.Node,
        },

        nameLab1: {
            default: null,
            type: cc.Label,
        },

        nameLab2: {
            default: null,
            type: cc.Label,
        },

        IDLab1: {
            default: null,
            type: cc.Label,
        },

        IDLab2: {
            default: null,
            type: cc.Label,
        },

        scoreLab1: {
            default: null,
            type: cc.Label,
        },

        scoreLab2: {
            default: null,
            type: cc.Label,
        },

        tableContents: {
            default: null,
            type: cc.Node
        },

        clubName: {
            default: null,
            type: cc.Node
        },

        clubID: {
            default: null,
            type: cc.Node
        },

        btnSet: {
            default: null,
            type: cc.Node
        },

        tableItems: {
            default: [],
            type: cc.Prefab
        },

        slideTips: {
            default: null,
            type: cc.Node
        },

        filtContent: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        cc.utils.checkX(this.node);

        cc.vv.audioMgr.playBGM("bg/club.mp3");

        this._itemidxs = [2,3,4,5,6,7,8];

        cc.sceneName = 'club';
        cc.connect.rid = undefined;
        
        this._ruleItems = {};
        this._tableItems = {};

        cc.sceneSrc = this;

        this._notFull = false;
        this._filtsStr = cc.sys.localStorage.getItem('clubFilt_'+cc.dm.user.uid);
        if (!!this._filtsStr) {} else {
            this._filtsStr = 'all';
        }

        this.filtContent.children.forEach((el) => {
            el.getComponent(cc.Toggle).isChecked = (el.name == this._filtsStr);
        });

        if (!!cc.connect.eventlist) {
            for (let key in cc.connect.eventlist) {
                cc.connect.off(key);
            }

			cc.connect.eventlist = undefined;
        }
        
        /*
        if (!!cc.noticeTips) {} else {
            cc.noticeTips = true;
            this.onNoticePressed();
        }
        */
    },

    getCanShow(gameName) {
        if (!!this._filtsStr) {
            if (this._filtsStr == 'all') {
                return true;
            }

            if (this._filtsStr != gameName) {
                return false;
            }
        }

        return true;
    },

    scoreChanged() {
        this.setScoreStr();
    },

    changeClubPRName(prid, name) {
        let ruleItem = this._ruleItems[prid];
        ruleItem.getComponent('ClubTable').setName(name);
        let tableItems = this._tableItems[prid];
        tableItems.forEach((tableItem) => {
            tableItem.getComponent('ClubTable').setName(name);
        });
    },

    delPrivateRoom() {
        this.freshData();
    },

    changeClubPrivateRoom(privateRoom) {
        let prid = privateRoom.prid;
        let rule = privateRoom.rule;
        let room_rule = rule.room_rule;
        let playerMax = room_rule.playerMax || 0;
        let gameName = rule.gameName;
        if (gameName == cc.enum.GameName.niuniu_wanren) {
            return;
        }
        let ruleItem = this._ruleItems[prid];
        let itemscr = ruleItem.getComponent('ClubTable');
        if (itemscr.gameName == gameName && itemscr.playerMax == playerMax) {
            ruleItem.getComponent('ClubTable').setInfo(privateRoom);
        } else {
            let max = cc.enum.playerMax[gameName][playerMax];
            let prefab = this.tableItems[max] || this.tableItems[9];
            let newRuleItem = cc.instantiate(prefab);
            this.tableContents.addChild(newRuleItem, ruleItem.zIndex);
            this._ruleItems[prid] = newRuleItem;
            cc.utils.addClickEvent(newRuleItem, this, 'ClubScene', 'createClubGameBtnPressed', prid);
            newRuleItem.active = true;
            newRuleItem.getComponent(cc.Button).clickEvents[0].customEventData = prid;
            newRuleItem.getComponent('ClubTable').setInfo(privateRoom);
            ruleItem.removeFromParent();
        }
    },

    createClubPrivateRoom() {
        this.freshData();
    },

    changeClubName(name) {
        let namestr = cc.utils.fromBase64(name);
        this.clubName.getComponent(cc.Label).string = namestr;
        this.clubName.getChildByName('Label').getComponent(cc.Label).string = namestr;
    },

    ctCreateRoom(i, privateRoom, table) {
        let prid = privateRoom.prid;
        let tables = cc.dm.clubInfo.tables.filter(function (el) {
            return el.prid == prid;
        });

        let rule = privateRoom.rule;
        rule = (typeof rule == 'string') ? JSON.parse(rule) : rule;
        let room_rule = rule.room_rule;
        let playerMax = room_rule.playerMax || 0;
        let gameName = rule.gameName;
        if (gameName == cc.enum.GameName.niuniu_wanren) {
            return;
        }

        let max = cc.enum.playerMax[gameName][playerMax];

        let idx = tables.length;
        let tableItem = this._tableItems[prid][idx];
        if (!tableItem) {
            let prefab = this.tableItems[max] || this.tableItems[9];
            tableItem = cc.instantiate(prefab);
            this.tableContents.addChild(tableItem);
            this._tableItems[prid].push(tableItem);
            cc.utils.addClickEvent(tableItem, this, 'ClubScene', 'joinClubGameBtnPressed', table.rid);
        }

        tableItem.rid = table.rid;
        tableItem.active = true;
        tableItem.getComponent('ClubTable').setInfo(privateRoom, table, idx);
        tableItem.setLocalZOrder(i*1000+idx);
        tableItem.getComponent(cc.Button).clickEvents[0].customEventData = table.rid;
        if (this._notFull) {
            tableItem.active = this.isNotFull(table.seats);
        }

        if (!this.getCanShow(gameName)) {
            tableItem.active = false;
        } 
    },

    ctDelRoom(data) {
        let cid = data.cid;
        if (cid != this._cid) {
            return;
        }

        let prid = data.prid;
        let rid = data.rid;
        let items = this._tableItems[prid];
        if (!items) {
            return;
        }

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.rid == rid) {
                items.splice(i, 1);
                item.removeFromParent();
                return;
            }
        }
    },

    ctSitDown(data, seats) {
        let cid = data.cid;
        if (cid != this._cid) {
            return;
        }

        let prid = data.prid;
        let rid = data.rid;
        let items = this._tableItems[prid];
            if (!items) {
                return;
            }
    
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item.rid == rid) {
                    item.getComponent('ClubTable').addUser(data.seatId, data.pic);
                    if (this._notFull) {
                        item.active = this.isNotFull(seats);
                    }
                    return;
                }
            }
    },

    ctDelPlayer(data) {
        let prid = data.prid;
        let rid = data.rid;
        let seatId = data.seatId;
        let items = this._tableItems[prid];
        if (!items) {
            return;
        }

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.rid == rid) {
                let itemscr = item.getComponent('ClubTable');
                let gameName = itemscr.gameName;
                item.active = this.getCanShow(gameName);
                itemscr.delUser(seatId);
                return;
            }
        }
    },

    changePROrder(data) {
        this.freshData();
    },

    onEnable () {
        this.updateInfo();
        this.checkUserClub();
    },

    onDisable () {
        if (this._checkClubTimeOut) {
            clearTimeout(this._checkClubTimeOut);
        }
    },

    checkUserClub () {
        if (this._checkClubTimeOut) {
            clearTimeout(this._checkClubTimeOut);
        }
        //获取亲友圈信息
        cc.connect.clubInfo(cc.dm.user.cid, () => {
            this.checkClubInfo();
        }, (errmsg) => {
            this._checkClubTimeOut = setTimeout(()=> {
                this.checkUserClub();
            }, 5000);
        });
    },

    freshData() {
        this.tableContents.children.forEach(function (el) {
            el.active = false;
        });

        for (let i = 0; i < cc.dm.clubInfo.privateRooms.length; i++) {
            let privateRoom = cc.dm.clubInfo.privateRooms[i];
            let prid = privateRoom.prid;
            let tables = cc.dm.clubInfo.tables.filter(function (el) {
                return el.prid == prid;
            });

            let rule = privateRoom.rule;
            rule = (typeof rule == 'string') ? JSON.parse(rule) : rule;
            let room_rule = rule.room_rule;
            let gameName = rule.gameName;
            if (gameName == cc.enum.GameName.niuniu_wanren) {
                continue;
            }
            if (!this._tableItems[prid]) {
                this._tableItems[prid] = [];
            }

            for (let j = 0; j < tables.length; j++) {
                let table = tables[j];
                let tableItem = this._tableItems[prid][j];
                if (!tableItem) {
                    let playerMax = room_rule.playerMax || 0;
                    let max = cc.enum.playerMax[gameName][playerMax];
                    let prefab = this.tableItems[max] || this.tableItems[9];
                    tableItem = cc.instantiate(prefab);
                    this.tableContents.addChild(tableItem);
                    this._tableItems[prid].push(tableItem);
                    cc.utils.addClickEvent(tableItem, this, 'ClubScene', 'joinClubGameBtnPressed', table.rid);
                }

                tableItem.active = true;
                tableItem.rid = table.rid;
                tableItem.getComponent('ClubTable').setInfo(privateRoom, table, j);
                tableItem.setLocalZOrder(i*1000+j);
                tableItem.getComponent(cc.Button).clickEvents[0].customEventData = table.rid;

                if (!this.getCanShow(gameName)) {
                    tableItem.active = false;
                }
            }

            let ruleItem = this._ruleItems[prid];
            if (!ruleItem) {
                let playerMax = room_rule.playerMax || 0;
                let max = cc.enum.playerMax[gameName][playerMax];
                let prefab = this.tableItems[max] || this.tableItems[9];
                ruleItem = cc.instantiate(prefab);
                this.tableContents.addChild(ruleItem);
                this._ruleItems[prid] = ruleItem;
                cc.utils.addClickEvent(ruleItem, this, 'ClubScene', 'createClubGameBtnPressed', prid);
            }

            ruleItem.active = true;
            ruleItem.getComponent(cc.Button).clickEvents[0].customEventData = prid;
            ruleItem.getComponent('ClubTable').setInfo(privateRoom);
            ruleItem.setLocalZOrder(i*1000+999);
            if (!this.getCanShow(gameName)) {
                ruleItem.active = false;
            }
        }

        if (!this._setPadding) {
            this._setPadding = true;
            this.tableContents.getComponent(cc.Layout).paddingTop = 36;
            let cvs = this.node.getComponent(cc.Canvas);
            let w = cvs.designResolution.width;
            this.tableContents.width = w;
            let margin = w-1334;
            this.tableContents.getComponent(cc.Layout).paddingLeft = 12+0.226*margin;
            this.tableContents.getComponent(cc.Layout).spacingX = 8+0.253*margin;
        }
    },

    createClubGameBtnPressed(event, prid) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.createClubGame(prid, this._cid);
    },

    joinClubGameBtnPressed(event, rid) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.joinRoom(rid);
    },

    /**
     * 更新用户信息
     */
    updateInfo () {
        //更新房卡数
        this.setScoreStr();
        cc.connect.syncInfo(() => {
            this.setScoreStr();
        });
        //更新uid
        this.IDLab1.string = 'ID:'+cc.dm.user.uid;
        this.IDLab2.string = 'ID:'+cc.dm.user.uid;
        //更新名字
        this.nameLab1.string = cc.dm.user.shortname;
        this.nameLab2.string = cc.dm.user.shortname;

        this.headNode.getComponent('HeadNode').updateData();

        this.checkClubInfo();
        this.freshData();
    },

    checkClubInfo() {
        if (!cc.dm.clubInfo) {
            return;
        }
        
        this._cid = cc.dm.clubInfo.cid;
        this._delayTime = 0;

        let namestr = cc.utils.fromBase64(cc.dm.clubInfo.name);
        this.clubName.getComponent(cc.Label).string = namestr;
        this.clubName.getChildByName('Label').getComponent(cc.Label).string = namestr;

        let idstr = '群ID: '+this._cid;
        this.clubID.getComponent(cc.Label).string = idstr;
        this.clubID.getChildByName('Label').getComponent(cc.Label).string = idstr;
    },

    /**
     * 更新分数
     */
    setScoreStr () {
        this.scoreLab1.string = cc.utils.getScoreStr();
        this.scoreLab2.string = cc.utils.getScoreStr();
    },

    /***
     * 点击用户图像
     */
    onUserInfoPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openMyInfo();
    },

    /***
     * 商城
     */
    onOpenStorePressed:function (){
        cc.vv.audioMgr.playButtonSound();
        cc.utils.showStore(function () {
            this.setScoreStr();
        }.bind(this));
    },

    onSettingPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        let clubSet = this.node.getChildByName('clubSet');
        if (clubSet) {
            clubSet.active = true;
            clubSet.getComponent('ClubSet').open();
        } else {
            cc.utils.loadPrefabNode('tips_club/clubSet', function (clubSet) {
                self.node.addChild(clubSet, 1, 'clubSet');
                clubSet.getComponent('ClubSet').open();
            });
        }
    },

    /***
     * 分享二维码
     */
    onQrcodePressed: function (event) {
        if (!!event) {
            cc.vv.audioMgr.playButtonSound();
        }

        cc.utils.openQCodeShare();
    },

    updateName() {
        let namestr = cc.dm.clubInfo.name;
        this.clubName.getComponent(cc.Label).string = namestr;
        this.clubName.getChildByName('Label').getComponent(cc.Label).string = namestr;
    },

    onHistoryPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        let history = this.node.getChildByName('history');
        if (history) {
            history.active = true;
            history.getComponent('History').openHistory();
        } else {
            cc.utils.loadPrefabNode('tips_club/history', function (history) {
                self.node.addChild(history, 1, 'history');
                history.getComponent('History').openHistory();
            });
        }
    },

    btnGiftPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        let gift = this.node.getChildByName('gift');
        if (gift) {
            gift.active = true;
            gift.getComponent('Gift').openGift();
        } else {
            cc.utils.loadPrefabNode('tips_club/gift', function (gift) {
                self.node.addChild(gift, 1, 'gift');
                gift.getComponent('Gift').openGift();
            });
        }
    },

    btnKefuPressed() {
        cc.vv.audioMgr.playButtonSound();
        // cc.connect.getKefuUrl((url)=> {
        //     if (!!url) {
        //         cc.sys.openURL(url);
        //     } else {
        //         cc.utils.openWeakTips('敬请期待');
        //     }
        // });

        let self = this;
        let kefuNode = this.node.getChildByName('kefuNode');
        if (kefuNode) {
            kefuNode.getComponent('KefuNode').openKefuNode();
        } else {
            cc.utils.loadPrefabNode('tips_club/kefuNode', function (kefuNode) {
                self.node.addChild(kefuNode, 1, 'kefuNode');
                kefuNode.getComponent('KefuNode').openKefuNode();
            });
        }
    },

    /**
     * 返回大厅
     */
    backBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        
    },

    /***
     * 业务通知
     */
    onNoticePressed() {
        let notice = this.node.getChildByName('notice');
        if (notice) {
            notice.active = true;
        } else {
            cc.utils.loadPrefabNode('tips_hall/notice', function (notice) {
                this.node.addChild(notice, 99, 'notice');
            }.bind(this));
        }
    },

    onDestroy() {
        cc.sceneSrc = null;
        console.log('释放亲友群场景');
    },

    onNotFullTogglePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        this._notFull = !this._notFull;
        for (let i = 0; i < cc.dm.clubInfo.privateRooms.length; i++) {
            let privateRoom = cc.dm.clubInfo.privateRooms[i];
            let prid = privateRoom.prid;
            let tables = cc.dm.clubInfo.tables.filter(function (el) {
                return el.prid == prid;
            });
            for (let j = 0; j < tables.length; j++) {
                let tableItem = this._tableItems[prid][j];
                if (!!tableItem) {
                    if (this._notFull) {
                        let table = tables[j];
                        let seats = table.seats;
                        tableItem.active = this.isNotFull(seats);
                    } else {
                        tableItem.active = true;
                    }
                }
            }
        }
    },

    isNotFull(seats) {
        for (let i = 0; i < seats.length; i++) {
            let el = seats[i];
            if (!!el) {
                continue;
            }

            return true;
        }

        return false;
    },

    onFiltGamePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        this._filtsStr = data;

        cc.sys.localStorage.setItem('clubFilt_'+cc.dm.user.uid, this._filtsStr);
        for (let i = 0; i < cc.dm.clubInfo.privateRooms.length; i++) {
            let privateRoom = cc.dm.clubInfo.privateRooms[i];
            let prid = privateRoom.prid;
            let ruleItem = this._ruleItems[prid];
            if (!!ruleItem) {
                let tables = cc.dm.clubInfo.tables.filter(function (el) {
                    return el.prid == prid;
                });
                if (this.getCanShow(ruleItem.getComponent('ClubTable').gameName)) {
                    ruleItem.active = true;
                    for (let j = 0; j < tables.length; j++) {
                        let tableItem = this._tableItems[prid][j];
                        if (!!tableItem) {
                            if (this._notFull) {
                                let table = tables[j];
                                let seats = table.seats;
                                tableItem.active = this.isNotFull(seats);
                            } else {
                                tableItem.active = true;
                            }
                        }
                    }
                } else {
                    ruleItem.active = false;
                    for (let j = 0; j < tables.length; j++) {
                        let tableItem = this._tableItems[prid][j];
                        if (!!tableItem) {
                            tableItem.active = false;
                        }
                    }
                }
            }
        }
    }
});

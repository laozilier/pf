cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: {
            default: null,
            type: cc.ScrollView
        },

        scrollContent: {
            default: null,
            type: cc.Node
        },

        loadingSprite: {
            default: null,
            type: cc.Sprite
        },

        nodataLab: {
            default: null,
            type: cc.Label
        },

        itemNode: {
            default: null,
            type: cc.Node
        },

        bottomNode: {
            default: null,
            type: cc.Node,
        },

        otherNode: {
            default: null,
            type: cc.Node,
        },

        searchNode: {
            default: null,
            type: cc.Node,
        },

        editNode: {
            default: null,
            type: cc.Node,
        },

        uidLab: {
            default: null,
            type: cc.Node,
        },


        clubNode: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
        if (this.node.getChildByName('bg')){
            cc.utils.setBgScale(this.node.getChildByName('bg'));
        }

        let y = 38;
        this._infoPoints = [[0, 0, 0], [0, 0, 0], [-380, 400, 0], [-420, 280, 0], [-450, 215, 0], [-420, 280, y],
            [-420, 280, y], [-450, 215, y], [-450, 215, y]];

        this._gameName = cc.enum.GameName.niuniu_mpqz;

        this.itemNode.active = false;
        this._items = [this.itemNode];
        this._headNodes = [];
        for (let i = 1; i < 5; i++) {
            let item = cc.instantiate(this.itemNode);
            this.scrollContent.addChild(item);
            this._items.push(item);
        }
    },

    onEnable () {

    },

    onDisable () {
        this.unschedule(this.checkHistorys);
    },

    openHistory () {
        this._cid = cc.dm.clubInfo.cid;
        this._pageIdx = 1;
        this._isCreator = (cc.dm.clubInfo.role == 2);
        this._isManager = (cc.dm.clubInfo.role == 1);

        this.otherNode.active = (this._isCreator || this._isManager);

        this.bottomNode.getComponent('Bottom').resetBottom();
        this.node.active = true;

        this._uid = cc.dm.user.uid;
        this.clubNode.getComponent(cc.Toggle).isChecked = false;
        this.searchNode.getComponent(cc.Toggle).isChecked = false;
        this.editNode.active = false;
        this._clubChecked = false;

        this.getData();
    },

    getData () {
        this._items.forEach((el) => { 
            let detailNode = el.getChildByName('detailNode');
            if (!!detailNode) {
                detailNode.active = false;
                detailNode.removeFromParent();
            }
            el.active = false; 
        });
        //回到顶部
        this.node.getChildByName("scrollView").getComponent(cc.ScrollView).scrollToTop(0.1);
        this.unscheduleAllCallbacks();
        this.loadingSprite.node.active = true;
        this.loadingSprite.node.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        this.nodataLab.node.active = false;
        let pagesize = cc.utils.ISIPAD() ? 5 : 4;
        cc.connect.clubUserHistory(this._gameName, this._cid, this._uid, this._pageIdx, pagesize, (historys) => {
            this.loadingSprite.node.stopAllActions();
            this.loadingSprite.node.active = false;
            if (!historys || historys.length === 0) {
                this.nodataTips();
                return;
            }

            let obj = historys[0];
            this.checkBottom(obj.totalPage);
            this._historys = historys;
            this.checkHistorys();
        }, (errmsg) => {
            this.loadingSprite.node.stopAllActions();
            this.loadingSprite.node.active = false;
            this.nodataLab.node.active = true;
            this.nodataLab.string = errmsg;
        });
    },

    getClubData() {
        this._items.forEach((el) => { 
            let detailNode = el.getChildByName('detailNode');
            if (!!detailNode) {
                detailNode.active = false;
                detailNode.removeFromParent();
            }
            el.active = false; 
        });
        //回到顶部
        this.node.getChildByName("scrollView").getComponent(cc.ScrollView).scrollToTop(0.1);
        this.unscheduleAllCallbacks();
        this.loadingSprite.node.active = true;
        this.loadingSprite.node.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        this.nodataLab.node.active = false;
        let pagesize = cc.utils.ISIPAD() ? 5 : 4;
        cc.connect.clubAllHistory(this._gameName, this._cid, this._pageIdx, pagesize, (historys) => {
            this.loadingSprite.node.stopAllActions();
            this.loadingSprite.node.active = false;
            if (!historys || historys.length === 0) {
                this.nodataTips();
                return;
            }

            let obj = historys[0];
            this.checkBottom(obj.totalPage);
            this._historys = historys;
            this.checkHistorys();
        }, (errmsg) => {
            this.loadingSprite.node.stopAllActions();
            this.loadingSprite.node.active = false;
            this.nodataLab.node.active = true;
            this.nodataLab.string = errmsg;
        });
    },

    nodataTips () {
        this.nodataLab.node.active = true;
        this.nodataLab.string = '您还没有战绩';
    },

    checkHistorys() {
        for (var i = 0; i < this._historys.length; i++) {
            let info = this._historys[i];
            this.checkBtn(info, i);
        }
    },

    checkBtn (info, idx) {
        let item = this._items[idx];
        if (item == null) {
            return;
        }
        item.active = true;

        let playback = (typeof info.playback == 'string') ? JSON.parse(info.playback) : info.playback;
        let infoNode = item.getChildByName('infoNode');
        let infoLeftNode = infoNode.getChildByName('infoLeftNode');
        let dateStr = info.create_time.split('.')[0]; //去掉毫秒
        let dateStrs = dateStr.split('T');
        let datestr1 = dateStrs[0].substr(5, 6);
        let datestr2 = dateStrs[1].substr(0, 5);
        let timeLab1 = infoLeftNode.getChildByName('timeLab1');
        timeLab1.getComponent(cc.Label).string = datestr1;
        let timeLab2 = infoLeftNode.getChildByName('timeLab2');
        timeLab2.getComponent(cc.Label).string = datestr2;

        let uids = (typeof info.uids == 'string') ? JSON.parse(info.uids) : info.uids;
        // let uids = [];
        // for (let i = 0; i < 5; i++) {
        //     uids.push(infouids[i%infouids.length]);
        // }

        let c = uids.length;
        let infoPoint = this._infoPoints[c];
        let x = infoPoint[0];
        let margin = infoPoint[1];
        let y = infoPoint[2];
        let a = 0;
        if (y > 0) {
            if (c%2 > 0) {
                a = (c-1)/2;
            } else {
                a = (c/2)-1;
            }
        }

        if (!!this._headNodes[idx]) {} else {
            let headNodeOri = infoNode.getChildByName('headNode');
            headNodeOri.active = false;
            let headNodes = [headNodeOri];
            for (let i = 1; i < 8; i++) {
                let headNode = cc.instantiate(headNodeOri);
                infoNode.addChild(headNode);
                headNodes.push(headNode);
            }

            this._headNodes[idx] = headNodes;
        }

        let headNodes = this._headNodes[idx];
        headNodes.forEach ((el) => { el.active = false; });
        let userinfos = (typeof info.userinfo == 'string') ? JSON.parse(info.userinfo) : info.userinfo;
        let actual_scores = (typeof info.actual_scores == 'string') ? JSON.parse(info.actual_scores) : info.actual_scores;
        let scores = (typeof info.scores == 'string') ? JSON.parse(info.scores) : info.scores;
        let game_rule = (typeof info.game_rule == 'string') ? JSON.parse(info.game_rule) : info.game_rule;
        let ssscores = {};
        let final_scores = (typeof info.final_scores == 'string') ? JSON.parse(info.final_scores) : info.final_scores;
        for (let i = 0; i < c; i++) {
            let uid = uids[i];
            let headNode = headNodes[i];
            headNode.active = true;
            headNode.x = x;
            headNode.y = y;
            x+=margin;
            if (a > 0 && i == a) {
                x = infoPoint[0];
                y = -y-4;
            }

            let userinfo = userinfos[uid];
            let pic = userinfo.headimg;
            headNode.getComponent('HeadNode').updateData(pic);
            let name = cc.utils.fromBase64(userinfo.name, 6);
            let nameLab = headNode.getChildByName('name');
            nameLab.getComponent(cc.Label).string = name;

            let score = actual_scores[uid];
            if (score == undefined) {
                score = scores[i];
            }

            if (score == undefined) {
                score = 0;
            }

            ssscores[uid] = score;
            let scoreLab1 = headNode.getChildByName('score1');
            let scoreLab2 = headNode.getChildByName('score2');
            scoreLab1.active = false;
            scoreLab2.active = false;
            if (score < 0) {
                scoreLab1.active = true;
                scoreLab1.getComponent(cc.Label).string = cc.utils.getScoreStr(score);
            } else {
                scoreLab2.active = true;
                scoreLab2.getComponent(cc.Label).string = '+'+cc.utils.getScoreStr(score);
            }

            let finalscoreLab = headNode.getChildByName('finalscore');
            finalscoreLab.getComponent(cc.Label).string = cc.utils.getScoreStr(final_scores[uid]);

            let zhuangSpr = headNode.getChildByName('zhuang');
            if (!!playback.banker) {
                zhuangSpr.active = (playback.banker == uid);
            } else {
                zhuangSpr.active = this.checkIsZhuang(playback, uid);
            }

            let friendSpr = headNode.getChildByName('friend');
            if (!!friendSpr) {
                friendSpr.active = (uid == playback.friendUid);
            }
        }

        let idLab = infoNode.getChildByName('idLab');
        idLab.getComponent(cc.Label).string = '战绩ID: '+info.id;

        let moreNode = infoNode.getChildByName('moreBtn');
        moreNode.active = false;
        let lessNode = infoNode.getChildByName('lessBtn');
        lessNode.active = false;
        let reNode = infoNode.getChildByName('reBtn');
        reNode.active = false;
        if (this._gameName.indexOf('niuniu') > -1
            || 
            this._gameName == cc.enum.GameName.sangong
            || 
            this._gameName == cc.enum.GameName.psz) {
                moreNode.active = true;
                moreNode.getComponent(cc.Button).clickEvents[0].customEventData = {rule: game_rule, userinfos: userinfos, playback: playback, uids: uids};
                moreNode.getComponent(cc.Button).clickEvents[0].handler = 'itemMoreBtnPressed';
        }  else if (this._gameName == cc.enum.GameName.sanshui) {
            moreNode.active = true;
            moreNode.getComponent(cc.Button).clickEvents[0].customEventData = {rule: game_rule, userinfos: userinfos, playback: playback, scores: ssscores};
            moreNode.getComponent(cc.Button).clickEvents[0].handler = 'itemSanshuiBtnPressed';
        } else {
            reNode.active = true;
            let room_rule = (typeof info.room_rule == 'string') ? JSON.parse(info.room_rule) : info.room_rule;
            reNode.getComponent(cc.Button).clickEvents[0].customEventData = {
                rid: info.rid,
                actual_scores: actual_scores,
                game_rule: game_rule, 
                room_rule: room_rule, 
                userinfos: userinfos, 
                playback: playback,
                uids: uids
            };
        }
    },

    checkIsZhuang (playback, uid) {
        let info = playback[uid];
        if (info == undefined) {
            let pb = playback.playback;
            if (pb == undefined) {
                return false;
            }

            let players = pb.players;
            if (players == undefined) {
                return false;
            }

            info = players[uid];
        }

        if (info == undefined) {
            return false;
        }

        let dec = info.dec;
        return !!dec;
    },

    onGameChoosedPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.bottomNode.getComponent('Bottom').resetBottom();
        this._pageIdx = 1;
        this._gameName = data;
        if ( this._clubChecked) {
            this.getClubData();
        } else {
            this.getData();
        }
    },

    checkSum (list) {
        for (let i = 0; i < list.length; i++) {
            let item = cc.instantiate(this.sumItemNode);
            if (item == null) {
                return;
            }

            let info = list[i];
            this.scrollContent.addChild(item);
            let infoNode = item.getChildByName('infoNode');
            let date = new Date();
            date.setTime(date.getTime()-i*24*60*60*1000);
            let datestr = date.Format('MM - dd');
            let timeLab = infoNode.getChildByName('timeLab');
            timeLab.getComponent(cc.Label).string = datestr;
            let sumNode = infoNode.getChildByName('sumNode');
            let tableLab = sumNode.getChildByName('tableLab');
            tableLab.getComponent(cc.Label).string = '开局 : '+info.totalInning;
            let inLab = sumNode.getChildByName('inLab');
            inLab.getComponent(cc.Label).string = '收益 : '+info.profit;
        }
    },

    itemMoreBtnPressed (event, data) {
    	//console.log("------------>",data,this._gameName);
        cc.vv.audioMgr.playButtonSound();
        let item = event.target.parent.parent;
        let infoNode = item.getChildByName('infoNode');
        let detailNode = item.getChildByName('detailNode');
        if (!!detailNode) {
            detailNode.active = true;
        } else {
            let c = data.uids.length;
            cc.utils.loadPrefabNode('history/detail'+c, function (detailNode) {
                infoNode.zIndex = 1;
                item.addChild(detailNode, 1, 'detailNode');
                detailNode.active = true;
                detailNode.getComponent('Detail').show(data, this._gameName);
            }.bind(this));
        }

        event.target.active = false;

        let lessNode = infoNode.getChildByName('lessBtn');
        lessNode.active = true;
    },

    itemLessBtnPressed (event, info) {
        cc.vv.audioMgr.playButtonSound();
        let item = event.target.parent.parent;
        let infoNode = item.getChildByName('infoNode');
        let detailNode = item.getChildByName('detailNode');
        detailNode.active = false;
        event.target.active = false;

        let moreNode = infoNode.getChildByName('moreBtn');
        moreNode.active = true;
    },

    itemSanshuiBtnPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let resultNode = this.node.getChildByName('resultNode');
        if (!!resultNode) {
            resultNode.active = true;
            resultNode.getComponent('HistorySanshui').show(data);
        } else {
            cc.utils.loadPrefabNode('sanshui/resultNode', function (resultNode) {
                this.node.addChild(resultNode, 0, 'detailNode');
                resultNode.getComponent('HistorySanshui').show(data);
            }.bind(this));
        }
    },

    /**
     * 回放按钮点击事件
     * @param event
     * @param data
     */
    itemReBtnPressed (event, data) {
        console.log("回放按钮点击事件---------->",this._gameName);
        console.log("回放按钮点击事件 data = ", data);
        cc.vv.audioMgr.playButtonSound();
        let replayNode = this.node.getChildByName('history_'+this._gameName);
        if (!!replayNode) {
            replayNode.active = true;
            replayNode.getComponent('History_'+this._gameName).init(data, this._gameName);
        } else {
            cc.utils.loadPrefabNode(this._gameName+'/history_'+this._gameName, function (replayNode) {
                this.node.addChild(replayNode, 1, 'history_'+this._gameName);
                replayNode.getComponent('History_'+this._gameName).init(data, this._gameName);
            }.bind(this));
        }
    },

    checkBottom(totalPage) {
        this.bottomNode.getComponent('Bottom').checkBottom(totalPage, (pageIdx) => {
            this._pageIdx = pageIdx;
            if (this._clubChecked) {
                this.getClubData();
            } else {
                this.getData();
            }
        });
    },

    onSearchNodePressed() {
        cc.vv.audioMgr.playButtonSound();
        let toggle = this.searchNode.getComponent(cc.Toggle);
        this.clubNode.getComponent(cc.Toggle).isChecked = false;
        if (toggle.isChecked) {
            this.editNode.active = true;
            this.onSearchBtnPressed();
        } else {
            this.editNode.active = false;
            if (!!this._clubChecked || this._uid != cc.dm.user.uid) {
                this._clubChecked = false;
                this._uid = cc.dm.user.uid;
                this.bottomNode.getComponent('Bottom').resetBottom();
                this._pageIdx = 1;
                this.getData();
            }
        }
    },

    onSearchBtnPressed() {
        let inputUserUid = this.node.getChildByName('inputUserUid');
        let self = this;
        if (!!inputUserUid) {
            inputUserUid.getComponent('InputUserUid').openInputUserUid((uid) => {
                self.nextSearch(uid);
            });
        } else {
            cc.utils.loadPrefabNode('tips_club/inputUserUid', (inputUserUid)=> {
                self.node.addChild(inputUserUid, 1, 'inputUserUid');
                inputUserUid.getComponent('InputUserUid').openInputUserUid((uid) => {
                    self.nextSearch(uid);
                });
            });
        }
    },

    nextSearch(uid) {
        if (!!uid && uid.length == 6) {
            this.uidLab.getComponent(cc.Label).string = uid;
            this._uid = parseInt(uid);
            this.bottomNode.getComponent('Bottom').resetBottom();
            this._pageIdx = 1;
            this.getData();
        } else {
            cc.utils.openWeakTips('请输入一个正确的用户ID');
        }
    },

    onClubNodePressed() {
        cc.vv.audioMgr.playButtonSound();
        let toggle = this.clubNode.getComponent(cc.Toggle);
        this.searchNode.getComponent(cc.Toggle).isChecked = false;
        this.editNode.active = false;
        this._uid = cc.dm.user.uid;
        this.bottomNode.getComponent('Bottom').resetBottom();
        this._pageIdx = 1;
        if (toggle.isChecked) {
            this._clubChecked = true;
            this.getClubData();
        } else {
            this._clubChecked = false;
            this.getData();
        }
    },

    // 关闭
    bntClose: function () {
        if (!!this._cb) {
            this._cb();
        }
        this.node.active = false;
        cc.vv.audioMgr.playButtonSound();
    },
});

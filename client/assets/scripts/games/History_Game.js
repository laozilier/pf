

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
		
	},

	// LIFE-CYCLE CALLBACKS:
	onLoad () {
		cc.utils.setNodeWinSize(this.node);

		let common = this.node.getChildByName('common');
		let ruleBtn = common.getChildByName('btnRule');
		cc.utils.addClickEvent(ruleBtn, this, 'History_Game', 'onRuleBtnPressed', '');
		let exitBtn = common.getChildByName('btnExit');
		cc.utils.addClickEvent(exitBtn, this, 'History_Game', 'onExitBtnPressed', '');
		this.pauseBtn = common.getChildByName('btnPause');
		cc.utils.addClickEvent(this.pauseBtn, this, 'History_Game', 'onPauseBtnPressed', '');
		this.resumeBtn = common.getChildByName('btnResume');
		cc.utils.addClickEvent(this.resumeBtn, this, 'History_Game', 'onResumeBtnPressed', '');
		this.replayBtn = common.getChildByName('btnReplay');
		cc.utils.addClickEvent(this.replayBtn, this, 'History_Game', 'onReplayBtnPressed', '');
        this.stepLab = common.getChildByName('stepLab');
		this.ridLab = common.getChildByName('ridLab');
		
        let playersNode = this.node.getChildByName('players');
        this.players = [];
        for (let i = 0; i < 4; i++) {
            let p = playersNode.getChildByName('player_'+i);
            if (!!p) {
                this.players.push(p);
            }
        }
	},

	init(data, name) {
		this.node.active = true;
        this._gameName = name;
        cc.gameName = name;
        this._room_rule = data.room_rule;
        this._game_rule = data.game_rule;
        this._uids = data.uids;
        //游戏算法
        try {
            let algorithm = require(this._gameName+'_algorithm');
            this._algorithm = algorithm;
            this.players.forEach(el=> {
                this.playerScript(el)._algorithm = this._algorithm;
            });
        } catch (e) {
            
        }
        
        //游戏枚举
		try {
			cc.game_enum = require(this._gameName+'_enum');
		} catch (e) {

        }
        
		cc.gameargs = {playersLen: this._uids.length};
        this._playback = data.playback;
        this._userinfos = data.userinfos;
        this._scores = data.actual_scores;
        this._steps = this._playback.foldsList;
		this._rid = data.rid;
		if (name.indexOf('zp') > -1 || name.indexOf('mj') > -1) {
			this.ridLab.getComponent(cc.Label).string = '房间号：'+this._rid;
		} else {
			this.ridLab.getComponent(cc.Label).string = this._rid;
		}
        
        this.prepareRecord();
	},
	
	sceneNodesReset() {
        this.players.forEach(p => {
            let scr_p = this.playerScript(p);
            scr_p.resetNodes();
            p.active = false;
		});

		this.pauseBtn.active = true;
        this.resumeBtn.active = false;
        this.replayBtn.active = false;
		this.unscheduleAllCallbacks();
        this._step = 0;
        this.stepLab.getComponent(cc.Label).string = '1 / '+this._steps.length;
	},

	prepareRecord() {
		this.pauseBtn.active = true;
		this.resumeBtn.active = false;
		this.replayBtn.active = false;

		this.sceneNodesReset();
	},
	
	playerScript(p) {
        return p.getComponent('History_'+this._gameName+'_player');
    },

    getPlayerByUid(uid) {
        for (let i = 0; i < 4; i++) {
            let p = this.players[i];
            let scr_p = this.playerScript(p);
            if (scr_p._uid == uid) {
                return p;
            }
        }
    },

	onExitBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        this.unscheduleAllCallbacks();
        this.node.active = false;
    },

    onPauseBtnPressed(event) {
        if (event) {
            cc.vv.audioMgr.playButtonSound();
        }

        this.unscheduleAllCallbacks();
        this.pauseBtn.active = false;
        this.resumeBtn.active = true;
    },

    onResumeBtnPressed() {
		cc.vv.audioMgr.playButtonSound();
        this.pauseBtn.active = true;
        this.resumeBtn.active = false;
        this.playRecored();
    },

    onReplayBtnPressed() {
		cc.vv.audioMgr.playButtonSound();
        this.prepareRecord();
    },

    onRuleBtnPressed() {
        this.onPauseBtnPressed();
        let rule = this._game_rule;
        rule.startNumber = this._room_rule.startNumber;
        rule.halfway = this._room_rule.halfway;
        rule.max = this._uids.length;
        cc.utils.showRule(this._gameName+'_rule', rule);
    },

});

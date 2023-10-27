

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
		_playerScriptStr: null,
		_gameName: null,
		_ruleName: null,
	},

	// LIFE-CYCLE CALLBACKS:
	onLoad () {
        cc.utils.checkX(this.node);
		cc.continue = undefined;

		cc.gameargs = {};
		cc.sceneName = 'gameScene';
		cc.sceneSrc = undefined;
		this._needKickCodes = [10035, 10046, 10060];
		this._gameName = cc.gameName;//cc.director.getScene().name;
		this._gameName = this._gameName.replace('1', '');

		let model = require(this._gameName+'_model');
		this._model = new model(this);
		let net = require(this._gameName+'_net');
		this._net = new net(this._model);

		//游戏算法
        try {
            let algorithm = require(this._gameName+'_algorithm');
            this._algorithm = algorithm;
        } catch (e) {
            
		}
		
		//游戏枚举
		try {
			cc.game_enum = require(this._gameName+'_enum');
		} catch (e) {

		}

		this._playerScriptStr = this._gameName+'_player';

		this._ruleName = this._gameName+'_rule';
		this._myReady = false;

        this._autoPlayCount = 0;
        this._autoPlay = false;

		this.bg = this.node.getChildByName('bg');
		cc.utils.addClickEvent(this.bg, this, 'Game_scene', 'onTables', '');
        let common = this.node.getChildByName('common');
        
		let btnRule = common.getChildByName('btnRule');
		cc.utils.addClickEvent(btnRule, this, 'Game_scene', 'onRuleBtnPressed', '');

		this.players = [];
		for (let i = 0; i < 10; i++) {
			let playerNode = this.node.getChildByName('players').getChildByName('player_'+i);
			if (!!playerNode) {
				let ps = this.playerScript(playerNode);
				if(!ps) {
					console.log('没有找到脚本')
				}
				ps.localSeat = i;
				ps._turn = false;
        		ps._zhuang = false;
        		ps._seatId = -100;
				ps._uid = -100;
				ps._algorithm = this._algorithm;
                this.players.push(playerNode);
			}
		}

		let closeNode1 = common.getChildByName('closeNode1');
        cc.utils.addClickEvent(closeNode1, this, 'Game_scene', 'onExit', '');

        let btnSetting = common.getChildByName('btnSetting');
        cc.utils.addClickEvent(btnSetting, this, 'Game_scene', 'onSettingBtnPressed', '');

        let tuoguan = common.getChildByName('tuoguan');
        cc.utils.addClickEvent(tuoguan, this, 'Game_scene', 'onTuoguan', '');

        let btnChat = common.getChildByName('btnChat');
        cc.utils.addClickEvent(btnChat, this, 'Game_scene', 'onChatBtnPressed', '');

        this.sitDownBtn = common.getChildByName('sitDownBtn');
        cc.utils.addClickEvent(this.sitDownBtn, this, 'Game_scene', 'onSitDownBtnPressed', '');

		let btnGps = common.getChildByName('btnGps');
		if (!!btnGps) {
			cc.utils.addClickEvent(btnGps, this, 'Game_scene', 'onGpsBtnPressed', '');
		}
        
        this.youkeNode = common.getChildByName('youkeNode');
        this.endNode = common.getChildByName('endNode');
        if (!!this.endNode) {
        	let continueGame = this.endNode.getChildByName('continueGame');
			cc.utils.addClickEvent(continueGame, this, 'Game_scene', 'onContinueBtnPressed', '');
			
			let backHall = this.endNode.getChildByName('backHall');
			if (!!backHall) {
				cc.utils.addClickEvent(backHall, this, 'Game_scene', 'onBackHallBtnPressed', ''); 
			}
		}
		this.rengNode = common.getChildByName('rengNode');
		this.waitingNode = common.getChildByName('loading');
		this.cancelNode = common.getChildByName('cancelNode');
		if (!!this.cancelNode) {
			let cancelBtn = this.cancelNode.getChildByName('cancelBtn');
            cc.utils.addClickEvent(cancelBtn, this, 'Game_scene', 'onTuoguan', '');
		}

		this.settlesNode = common.getChildByName('settlesNode');

		this.infoLab = this.node.getChildByName('infoLab');
		this.inningLab = this.node.getChildByName('inningLab');

		this.gameStartNode = common.getChildByName('gameStart');    //开始动画
		if (!!this.gameStartNode) {
			this.gameStartNode.active = false;
		}
	},

	/**
	 * 这里需要调用getRoomInfo
	 */
	start () {
		this.resetTimeout();

        // this.node.on(cc.Node.EventType.TOUCH_START, this.resetTimeout, this);
	},

    /**
	 * 重置自动离开房间时间
     */
	resetTimeout() {
		if (!this._gameName) {
			return;
		}

		this._autoOut = false;
		if (!!this._timeoutId) {
			clearTimeout(this._timeoutId);
		}

		let leavetime = 80000;
		if (this._gameName.indexOf('pdk') > -1) {
            leavetime = 180000;
		}

		if (this._gameName.indexOf('ddz') > -1) {
            leavetime = 180000;
		}

        if (this._gameName.indexOf('mj') > -1) {
            leavetime = 240000;
        }

        if (this._gameName.indexOf('dsq') > -1) {
            leavetime = 300000;
        }

        if (this._gameName.indexOf('psz') > -1) {
            leavetime = 240000;
        }

        if (this._gameName.indexOf('sanshui') > -1) {
            leavetime = 160000;
        }

        this._timeoutId = setTimeout(function () {
			this._autoOut = true;
		}.bind(this), leavetime);
	},

	/**
	 * 重置方法  会重置场景需要重置的节点 以及player的所有节点
	 */
	reset() {
		this._mySeatid = undefined;
		this._myReadySeatid = undefined;
		this.sitDownBtn.active = false;
		this.hideEndnode(true);
		this.youkeNode.active = true;
        this._autoPlay = false;
		this._gameStatus = -1;
		if (!!this.cancelNode) {
            this.cancelNode.active = false;
            this.cancelNode.getChildByName('tuoguanAnimation').getComponent(cc.Animation).stop();
		}
		this.unscheduleAllCallbacks();
		this.stopWating();
		this.checkAuto(false);
	},

	/**
	 * 获取player脚本
	 * @param p player节点
	 * @return {cc.Component | any}
	 */
	playerScript (p) {
		if (p) {
			let script = p.getComponent(this._playerScriptStr);
			return script;
		}
	},

	/**
	 * 通过本地编号获取player节点
	 * @param seat
	 * @return {*}
	 */
	getPlayerByLocalSeat (seat) {
		let p = undefined;
		for (let i = 0; i < this.players.length; i++) {
			if (seat == this.playerScript(this.players[i]).localSeat) {
				p = this.players[i];
				break;
			}
		}

		return p;
	},

	/**
	 * 通过座位号获取player节点
	 * @param seat
	 * @return {*}
	 */
	getPlayerBySeat (seat, playerDatas) {
		let datas = undefined;
		let playerCount = 0;
		if (!!playerDatas) {
            datas = playerDatas;
            for (let i = 0; i < datas.length; i++) {
            	let data = datas[i];
            	if (!!data) {
                    playerCount+=1;
				}
			}
		} else {
            datas = this._model._playerDatas;
            playerCount = this._model._playerCount;
		}

		if (this._mySeatid == seat) {
			return this.players[0];
		}

		let len = this.players.length;

		let p = undefined;
		for (let i = 0; i < len; i++) {
			if (seat == this.playerScript(this.players[i])._seatId) {
				p = this.players[i];
				return p;
			}
		}

		if (this.noSort()) {
			return this.getNoSortPlayer();
		}

		if (this._mySeatid != undefined) {
			if (len >= 5) {
                let idx = seat-this._mySeatid;
                if (idx < 0) {
                    idx+=len;
                }

                p = this.players[idx];
			} else if (len == 4) {
				if (playerCount == 2) {
					p = this.players[2];
				} else if (playerCount == 3) {
					let pdatas = [];
					for (let i = 0; i < datas.length; i++) {
						let data = datas[i];
						if (!!data) {
							let uid = data.uid;
							if (uid == cc.dm.user.uid) {
								continue;
							}

							let seatId = data.seatId;
							pdatas.push(seatId);
						}
					}

					if (pdatas[0] < this._mySeatid && pdatas[1] < this._mySeatid) {
						if (seat == pdatas[0]) {
							p = this.players[1];
						} else {
							p = this.players[3];
						}
					} else if (pdatas[0] < this._mySeatid) {
						if (seat == pdatas[0]) {
							p = this.players[3];
						} else {
							p = this.players[1];
						}
					} else {
						if (seat == pdatas[0]) {
							p = this.players[1];
						} else {
							p = this.players[3];
						}
					}
				} else {
					let idx = seat-this._mySeatid;
					if (idx < 0) {
						idx+=len;
					}

					p = this.players[idx];
				}
			} else if (len == 3) {
				if (playerCount == 2) {
					p = this.players[1];
				} else {
					let idx = seat-this._mySeatid;
					if (idx < 0) {
						idx+=len;
					}

					p = this.players[idx];
				}
			} else {
                p = this.players[1];
			}
		} else {
			if (this._myReadySeatid == undefined) {
                if (len >= 5) {
                    p = this.players[seat];
                } else if (len == 4) {
					if (datas.length == 2) {
						if (seat == 0) {
							p = this.players[seat];
						} else {
							p = this.players[2];
						}
					} else if (datas.length == 3) {
						if (seat == 2) {
							p = this.players[3];
						} else {
							p = this.players[seat];
						}
					} else {
						p = this.players[seat];
					}
				} else {
					p = this.players[seat];
				}
			} else {
				if (len >= 5) {
                    let idx = seat-this._myReadySeatid;
                    if (idx < 0) {
                        idx+=len;
                    }

                    p = this.players[idx];
				} else if (len == 4) {
					if (playerCount == 1) {
						p = this.players[2];
					} else if (playerCount == 2) {
						let pdatas = [];
						for (let i = 0; i < datas.length; i++) {
							let data = datas[i];
							if (!!data) {
								let uid = data.uid;
								if (uid == cc.dm.user.uid) {
									continue;
								}

								let seatId = data.seatId;
								pdatas.push(seatId);
							}
						}

						if (pdatas[0] < this._myReadySeatid && pdatas[1] < this._myReadySeatid) {
							if (seat == pdatas[0]) {
								p = this.players[1];
							} else {
								p = this.players[3];
							}
						} else if (pdatas[0] < this._myReadySeatid) {
							if (seat == pdatas[0]) {
								p = this.players[3];
							} else {
								p = this.players[1];
							}
						} else {
							if (seat == pdatas[0]) {
								p = this.players[1];
							} else {
								p = this.players[3];
							}
						}
					} else {
						let idx = seat-this._myReadySeatid;
						if (idx < 0) {
							idx+=len;
						}

						p = this.players[idx];
					}
				} else if (len == 3) {
					if (playerCount == 1) {
						p = this.players[1];
					} else {
						let idx = seat-this._myReadySeatid;
						if (idx < 0) {
							idx+=len;
						}

						p = this.players[idx];
					}
				} else {
                    p = this.players[1];
				}
			}
		}

		if (p == undefined) {
			console.log('getPlayerBySeat player = undefined, seat = ', seat);
		}

		return p;
	},

    /**
	 * 是否不需要轮转顺序
     * @returns {boolean}
     */
    noSort() {
        if (this._gameName.indexOf('niuniu') > -1
            || this._gameName.indexOf('sanshui') > -1
            || this._gameName.indexOf('sangong') > -1
            || this._gameName.indexOf('ttz') > -1) {
            return true;
        }

        return false;
    },

	/**
	 * 通过作为号获取牛牛的玩家位置
	 * @param isme
	 * @return {*}
	 */
	getNoSortPlayer(isme) {
		let p = undefined;
		/** 如果是我自己 那么先取第0个 **/
		if (!!isme) {
            let pnode = this.players[0];
            let script = this.playerScript(pnode);
            if (script._seatId < 0) {
                p = pnode;
                return p;
            }
		}

		for (let i = 1; i < this._model._playerDatas.length && i < this.players.length; i++) {
			let pnode = this.players[i];
			let script = this.playerScript(pnode);
			if (script._seatId < 0) {
				p = pnode;
				break;
			}
		}

		if (p == undefined) {
			let pnode = this.players[0];
			let script = this.playerScript(pnode);
			if (script._seatId < 0) {
				p = pnode;
			}
		}

		return p;
	},

	/**
	 * 通过uid获取player节点
	 * @param uid
	 * @return {*}
	 */
	getPlayerByUid (uid) {
		if (typeof uid == 'string') {
			uid = parseInt(uid);
		}
		for (let i = 0; i < this.players.length; i++) {
			let p = this.players[i];
			if (uid == this.playerScript(p)._uid) {
				return p;
			}
		}
	},

	/**
	 * 获取player节点的 下一个player节点
	 * @return {*}
	 */
	getNextPlayer (localSeat) {
		if (localSeat == undefined) {
			localSeat = 0;
		}

		for (let i = localSeat+1; i < this.players.length; i++) {
			let p = this.players[i];
			let script = this.playerScript(p);
			if (script._seatId > -1) {
				return p;
			}
		}

		for (let i = 0; i < localSeat; i++) {
			let p = this.players[i];
			let script = this.playerScript(p);
			if (script._seatId > -1) {
				return p;
			}
		}

		return null;
	},

	// update (dt) {},

	/**
	 * 得到房间信息 需要刷新界面
	 */
	onRoomInfo (need) {
		if (!this._model._game_rule) {
			return;
		}

		this._isleaved = false;
		this.reset();
		this._mineLeaved = false;
		this.showInfo();
		this.setInning();
		if (!!need) {
            this.setPlayers(true);
		}

        if (this._endTime > 1) {
            this.startEndnode(this._endTime);
		}
		
		if (!!this.settlesNode) {
			this.settlesNode.active = false;
		}

		if (!!this._algorithm) {
			this._algorithm.setRule(cc.gameargs.rule);
		}
	},

	/**
	 * 显示游戏底注
	 */
	showInfo () {
		let str = '';
		if (this._gameName.indexOf('niuniu_mpqz') > -1) {
            if (this._model._game_rule.multipleRule > 0) {
                str+='牛番';
            } else {
                str+='明牌';
            }

            if (this._model._game_rule.wh) {
                str+='无花';
            } else {
                str+='有花';
            }
		} else if (this._gameName.indexOf('niuniu_guodi') > -1) {
            str += '锅底';
            if (this._model._game_rule.multipleRule > 0) {
                str+='牛番';
            } else {
                str+='明牌';
            }

            if (this._model._game_rule.wh) {
                str+='无花';
            } else {
                str+='有花';
            }
		} else if (this._gameName.indexOf('pdk') > -1) {
			str += this._model._game_rule.model ? '15张' : '16张';
		} else {
			str += cc.enum.GameStr[this._gameName];
		} 

		if (this._model._inningLimit > 0 && this._model._inningLimit < 10) {
			if (this._gameName.indexOf('mj') > -1) {
				str += '\n最少'+this._model._inningLimit+'局';
			} else {
				str += '    最少'+this._model._inningLimit+'局';
			}
            
		}

		if (this._gameName.indexOf('mj') > -1) {
			str+='\n底注：';
		} else {
			str += '    底注： ';
		}
		
		str += cc.utils.getScoreStr(this._model._game_rule.ante);
		if (this._gameName.indexOf('mj') > -1) {
			str+='\n房号： '+this._model._rid;
		} else {
			str += '    房号： '+this._model._rid;
		}

		if (!!this.infoLab) {
            this.infoLab.active = true;
            this.infoLab.getComponent(cc.Label).string = str;
			this.infoLab.getChildByName('Label').getComponent(cc.Label).string = str;
			let infoLab2 = this.infoLab.getChildByName('Label2');
			if (!!infoLab2) {
				infoLab2.getComponent(cc.Label).string = str;
			}
		}
	},

	/**
	 * 设置玩家位置
	 */
	setPlayers (gameNoRunning) {
        this.players.forEach(function (p) {
            if(!!p){
                this.playerScript(p).reset();
            }
        }.bind(this));

		/** 将在玩的和没在玩的玩家分组 **/
        this._needFreshLocs = false;
        let playerDatas = [];
        let others = [];
        for (let i = 0; i < this._model._playerDatas.length; i++) {
            let data = this._model._playerDatas[i];
            if (!!data) {
                let uid = data.uid;
                if (this.isPlaying(uid) || !!gameNoRunning) {
                    playerDatas.push(data);
                } else {
                    others.push(data);
				}
            }
        }

        /** 先设置在玩的玩家位置 **/
		this._mySeatid = undefined;
		this._myReadySeatid = undefined;
		for (let i = 0; i < playerDatas.length; i++) {
			let data = playerDatas[i];
			if (!!data) {
				let uid = data.uid;
				if (uid == cc.dm.user.uid) {
					this._mySeatid = data.seatId;
					break;
				}
			}
		}

        for (let i = 0; i < others.length; i++) {
            let data = others[i];
            if (!!data) {
                let uid = data.uid;
                if (uid == cc.dm.user.uid) {
                    this._mySeatid = data.seatId;
                    break;
                }
            }
        }

		if (this._mySeatid == undefined) {
			for (let i = 0; i < this._model._playerDatas.length; i++) {
				let data = this._model._playerDatas[i];
				if (!data) {
					this._myReadySeatid = i;
					break;
				}
			}
		} else {
            let p0 = this.players[0];
            this.playerScript(p0).setUserInfo(this._model._playerDatas[this._mySeatid]);
		}

		for (let i = 0; i < playerDatas.length; i++) {
			let data = playerDatas[i];
			if (!!data) {
				let uid = data.uid;
				if (uid == cc.dm.user.uid) {
					continue;
				}

				let seatId = data.seatId;
				let p = this.getPlayerBySeat(seatId, playerDatas);
				if (!!p) {
					this.playerScript(p).setUserInfo(data);
				}
			}
		}

        /** 将没在玩的玩家找空位坐下即可  自己的永远在0号位置 **/
        if (others.length > 0) {
            others.forEach((info) => {
                if (info.uid == cc.dm.user.uid) {
                    let p0 = this.players[0];
                    this.playerScript(p0).setUserInfo(info);
                } else {
                    this.insertPlayer(info);
                }
            });
        }

        /** 设置自己游客状态 **/
		if (this._mySeatid == undefined) {
			if (this._myReadySeatid != undefined) {
				if (cc.continue) {
					cc.connect.sitDown();
				} else {
					this.sitDownBtn.active = true;
					this.stopWating();
				}
			} else {
				this.sitDownBtn.active = false;
				this.stopWating();
			}
		} else {
			this.sitDownBtn.active = false;
			let userInfo = this._model.getUserInfo(cc.dm.user.uid);
			if (!!userInfo) {
				let ready = userInfo.ready;
				this.endNode.active = !ready;
			}
		}

		this.youkeNode.active = (this._mySeatid == undefined);
	},

    /**
	 * 找空位坐下一个玩家
     * @param info
     * @param isme
     * @returns {*}
     */
	insertPlayer(info, isme) {
        let p = this.getNoSortPlayer(isme);
        if (!!p) {
            this.playerScript(p).setUserInfo(info);
        }

        /** 如果自己没坐下 但是坐满了 那么需要隐藏坐下按钮 **/
        if (this._mySeatid == undefined) {
            if (this._model._playerCount == this._model._playerDatas.length) {
                this.sitDownBtn.active = false;
            }
        }
	},

	/**
	 * 游戏开始
	 * @param {*} data 
	 */
	gameBegin(data) {
		if (this._needFreshLocs) {
            this.setPlayers();
		} else {
            let uids = data.uids;
            uids.forEach(uid => {
                let p = this.getPlayerByUid(uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.gameBegin();
                }
            });
		}
		
		this.gameStatus({status: cc.game_enum.status.BEGIN});
		this.unscheduleAllCallbacks();
        this.stopWating();
		this.hideEndnode();
		if (!!this.settlesNode) {
			this.settlesNode.children.forEach((el) => { el.active = false; });
			this.settlesNode.active = false;
		}

		//游戏开始动画
		if (!!this.gameStartNode) {
			this.gameStartNode.active = true;
        	this.gameStartNode.getComponent(cc.Animation).play();
		}
	},

    /**
	 * 显示等待提示
     */
	showWating() {
		if (!!this.waitingNode) {
			this.waitingNode.active = true;
			this.waitingNode.getComponent(cc.Animation).play('loadingAnimation');
		}
	},

    /**
	 * 停止等待提示
     */
	stopWating() {
		if (!!this.waitingNode) {
			this.waitingNode.active = false;
			this.waitingNode.getComponent(cc.Animation).stop();
		}
	},

	/**
	 * 游戏信息，断线重连后会收到
	 * @param data
	 */
	gameInfo (data) {
        this.setPlayers();
		this.gameStatus(data, true);

		let playerDatas = data.players;
		for (let uid in playerDatas) {
			let playerData = playerDatas[uid];
			if (typeof (uid) == 'string') {
				uid = parseInt(uid);
			}
			let p = this.getPlayerByUid(uid);
			if (!!p) {
				let scr_p = this.playerScript(p);
				scr_p.set(playerData);
			} else {
				console.log('gameInfo 有玩家没有了 uid = ', uid);
			}
		}

		this.stopWating();
		this.hideEndnode();
	},

	/**
	 * 直接解散房间
	 * @param info  坐下的玩家信息
	 */
	dismiss: function () {
		this.outRoom();
	},

	/**
	 * 离开房间
	 */
	leave (uid, need) {
		/** 自己离开 **/
		if (uid == cc.dm.user.uid) {
			this._isleaved = true;
            this._autoPlay = false;
			this._myReady = false;
			this._mySeatid = undefined;
			if (this._mineLeaved) {
				this.outRoom();
				return;
			} else {
				this.stopWating();
				this.hideEndnode();
				if (!!this.cancelNode) {
                    this.cancelNode.active = false;
				}
				
				this.youkeNode.active = true;
			}
		}

		/** 如果不是游客离开才会执行以下操作 **/
		if (!!need) {
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.reset();
            }
            /** 如果我没坐下 房间人数从满变为不满 则显示坐下按钮 **/
            if (this._mySeatid == undefined) {
                !this.sitDownBtn.active && (this.sitDownBtn.active = true);
            }

            /** 如果需要排序的 必须重新排位置 **/
            if (!this.noSort()) {
                this._needFreshLocs = true;
                return;
            }

            /** 如果不需要排序的 则看0号位置是不是有别人 如果有则重新排位置 否则不排 **/
            let p0 = this.getPlayerByLocalSeat(0);
            if (!!p0) {
                let script = this.playerScript(p0);
                if (script._uid != cc.dm.user.uid) {
                    this._needFreshLocs = true;
				}
			}
		}
	},

	/**
	 * 玩家坐下
	 * @param info  坐下的玩家信息
	 */
	sitDown (info) {
		/** 如果是自己坐下 **/
		if (info.uid == cc.dm.user.uid) {
			this.resetTimeout();
			this._myReady = true;
			cc.continue = undefined;
			this.endNode.active = false;
			this.sitDownBtn.active = false;
			this.youkeNode.active = false;
			this.showWating();
            this._mySeatid = info.seatId;
		}

        this.insertPlayer(info, info.uid == cc.dm.user.uid);
		/** 如果是需要排序的 必须要重新排位置 否则不需要排位置 **/
		if (!this.noSort()) {
            this._needFreshLocs = true;
		}
	},

	/**
	 * 玩家准备
	 * @param uid  准备玩家uid
	 */
	ready (uid) {
		if (uid == cc.dm.user.uid) {
			if (this._myReady) {
				return;
			}

			this._myReady = true;
			this.hideEndnode();
			if (!this._model._running || !this.isPlaying()) {
				this.showWating();
			}
		}

		if (this._running && this.isPlaying(uid)) {
			return;
		}

		let p = this.getPlayerByUid(uid);
		if (!!p) {
			this.playerScript(p).setReady(true);
		} else {
			// console.log('ready 有玩家不见了 uid = ', uid);
		}
	},

	/**
	 * 表情符号
	 * @param data
	 */
	emoji: function (data) {
		let uid = data[0];
		let id = data[1];
		if (typeof id == 'string') {
			id = parseInt(id);
		}

		let p = this.getPlayerByUid(uid);
		if (!!p) {
			this.playerScript(p).showEmoji(id);
		} else {
			// console.error('emoji 有玩家不见了 data = ', data);
		}
	},

	/***
	 *   常用语
	 * @param data
	 */
	cWord: function (data) {
		let uid = data[0];
		let idx = data[1];
		if (typeof idx == 'string') {
			idx = parseInt(idx);
		}

		let gameName = this._gameName;
		if (gameName.indexOf('niuniu') > -1) {
			gameName = 'niuniu_mpqz';
		}

		let arr = cc.enum.CWords[gameName];
		if (!!arr) {
			let str = '';
			if (idx < arr.length) {
				str = arr[idx];
			} else {
				let finalidx = idx-arr.length;
				let finalarr = cc.enum.CWords['diantuo_bao'];
				if (!!finalarr) {
					str = finalarr[finalidx];
					arr = arr.concat(finalarr);
				}
			}

			if (!!str) {
				let p = this.getPlayerByUid(uid);
				if (!!p) {
					this.playerScript(p).showCWord(arr, str, idx, 'cword/'+this.getSoundFile());
				} else {
					// console.error('cWord 有玩家不见了 data = ', data);
				}
			}
		}
	},

    /**
	 * 获取音效文件路径
     * @returns {string}
     */
	getSoundFile () {
		if (this._gameName.indexOf('pdk') > -1) {
			return 'pdk';
		}

		if (this._gameName.indexOf('diantuo') > -1) {
			return 'pdk';
		}

		if (this._gameName.indexOf('niuniu') > -1) {
			return 'x_niuniu';
		}

		if (this._gameName.indexOf('mj_tj') > -1) {
			return 'mj_tj';
		}

        if (this._gameName.indexOf('mj_hz') > -1) {
            return 'pdk';
        }

        if (this._gameName.indexOf('sanshui') > -1) {
            return 'pdk';
        }

        if (this._gameName.indexOf('psz') > -1) {
            return 'psz';
        }

		return 'pdk';
	},

	/***
	 *   聊天
	 * @param data
	 */
	chat: function (data) {

	},

	/***
	 *   语音
	 * @param data
	 */
	voice: function (data) {
		let uid = data[0];
		let content = data[1];
		let time = data[2];
		let voiceFile = "voicemsg.amr";
		//写入文件
		cc.vv.voiceMgr.writeVoice(voiceFile, content);
		let p = this.getPlayerByUid(uid);
		if (!!p) {
			let script = this.playerScript(p);
			script.showVoice(voiceFile, time);
		} else {
			// console.error('voice 有玩家不见了 data = ', data);
		}
	},

	/**
	 * 房间结束
	 * @param data
	 */
	roomEnd:function(data){

	},

	/**
	 * 玩家在线状态
	 * @param data
	 */
	isOnline:function(data) {
		let uid = data[0];
        let has = data[1];
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setOnline(has);
        }
	},

	/***
	 *   头像动画
	 * @param param
	 */
	animate: function (param) {
		let suid = param[0];
		let euid = param[1];
		let id = param[2];
		let sVec = undefined; //点节的世界坐标位置
		/**  找到起点的节点(的位置转化成世界坐标)<返回的是一个对象>  **/
		let p = this.getPlayerByUid(suid);
		if (!p) {
			// console.error('animate 有玩家不见了 suid = ', suid);
			return;
		}

		let spos = p.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
		sVec = cc.p(spos.tx, spos.ty);

		p = this.getPlayerByUid(euid);
		if (!p) {
			// console.error('animate 有玩家不见了 euid = ', euid);
			return;
		}

		//eid = this.pdkModelScript.getSeatIdByLocalId(this.pdkModelScript.getUidByPlayer(euid).seatId);
		let rnode = cc.instantiate(this.rengNode);
		let epos = p.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
		let endpos = this.node.convertToNodeSpaceAR(cc.p(epos.tx, epos.ty));
		rnode.x = endpos.x;
		rnode.y = endpos.y;
		this.node.addChild(rnode);
		let script = rnode.getComponent("扔的动画");
		script.play(sVec, id, true);
		rnode.runAction(cc.sequence(cc.delayTime(5), cc.removeSelf()));
	},

	/**
	 * 错误提示
	 */
	toast: function (data) {
		let self = this;
		if (typeof data == 'number') {
			if (this._needKickCodes.indexOf(data) < 0) {
				cc.utils.openWeakTips(cc.utils.getErrorTips(data));
			} else {
				this.rid = undefined;
				cc.utils.openTips(cc.utils.getErrorTips(data), function () {
					self.backHall();
				});
			}
		} else {
			cc.utils.openWeakTips(data);
		}
	},

	/**
	 * 房间不存在
	 */
	notExists (data) {
		if (!this.sitDownBtn) {
			return;
		}

		this.reset();
		this._isleaved = true;
		if (this.endNode.active) {
			this.sitDownBtn.active = false;
			this.endNode.active = true;
		} else {
			this.sitDownBtn.active = true;
			this.endNode.active = false;
		}
	},

	/**
	 * 最后实际分数
	 * @param data
	 */
	finalScores (data) {
		if (Array.isArray(data)) {
            data.forEach(obj=> {
				let uid = obj.uid;
				let score = obj.score;
				let p =  this.getPlayerByUid(uid);
				if(!!p) {
					let script = this.playerScript(p);
					script.setScore(score, true);
				}
			});
        } else if (typeof data == "object") {
            for (let uid in data) {
                let score = data[uid];
				let p =  this.getPlayerByUid(uid);
				if(!!p) {
					let script = this.playerScript(p);
					script.setScore(score, true);
				}
            }
        }
	},

    /**
     * 当前轮局数
     */
    setInning () {
		if (!!this.inningLab) {
			let str = '';
			if (this._model._inningLimit > 0) {
				let marginInning = this._model._currInning-this._model._lastInning;
				let inning = (marginInning+1)%this._model._inningLimit;
				if (inning == 0) {
					inning = this._model._inningLimit;
				}
                str = '局数：'+inning+' / '+this._model._inningLimit+'局';
			} else {
                str = '局数：不限';
			}

			this.inningLab.getComponent(cc.Label).string = str;
			this.inningLab.getChildByName('Label').getComponent(cc.Label).string = str;
		}
    },

	/**
     * 大结算
     * @param {*} data 
     */
    settleScores(data) {
        if (!!this.settlesNode) {
			this.settlesNode.active = true;

			let idx = 0;
			for (let uid in data) {
				let score = 0;
				let info = this._model._playerInfos[uid];
				if (!!info) {
					let scores = data[uid];
					for (let i = 0; i < scores.length; i++) {
						score += scores[i];
					}
				}

				let playerNode = this.settlesNode.getChildByName('player_'+idx);
				if (!!playerNode) {
					playerNode.active = true;
					let headNode = playerNode.getChildByName('headNode');
					headNode.getComponent('HeadNode').updateData(info.pic, info.sex);

					let nameNode = playerNode.getChildByName('name');
					let namestr = cc.utils.fromBase64(info.name);
					nameNode.getComponent(cc.Label).string = namestr;
					nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;

					let winNode = playerNode.getChildByName('win');
					let loseNode = playerNode.getChildByName('lose');
					let big_winner = playerNode.getChildByName('big_winner');
					if (score < 0) {
						big_winner.active = false;
						winNode.active = false;
						loseNode.active = true;
						loseNode.getComponent('scoreAni').showResNum(score, false);
					} else {
						big_winner.active = true;
						winNode.active = true;
						loseNode.active = false;
						winNode.getComponent('scoreAni').showResNum(score, false);
					}
				}  

				idx += 1;
			}
		}
	},

	gameResult (data) {
		
	},

    gameStatus(data, disconnect) {
		this._gameStatus = data.status;
		this.players.forEach(el=> {
			this.playerScript(el)._gameStatus = this._gameStatus;
		});
	},
	
	hideEndnode(not) {
        if (not === undefined) {
            this._endTime = 0;
        }

		this.stopEndNode();
		this.endNode.active = false;
	},

	stopEndNode () {
		this.unschedule(this.nextEndnode);
		this.endNode.getChildByName('startTime').active = false;
	},

	/**
	 * 开始倒计时
	 */
	startEndnode (endTime) {
		if (this.endNode.active) {
			return;
		}

		if (this._mySeatid == undefined) {
			return;
		}

		if (!!endTime) {
			this._endTime = endTime;
		} else {
			this._endTime = 5;
		}

        this._myReady = false;
		this.endNode.active = true;
		this.nextEndnode();
		this.schedule(this.nextEndnode, 1);
	},

	/**
	 * 结束倒计时
	 */
	nextEndnode() {
		this.endNode.getChildByName('startTime').active = true;
		if (this._endTime < 1) {
			this.stopEndNode();
			return;
		}
		this.endNode.getChildByName('startTime').getChildByName('Label').getComponent(cc.Label).string = this._endTime;
		this._endTime -= 1;
	},

	/** 主动托管 **/
	onTuoguan: function () {
		console.log(" 主动托管！！！ ");
		cc.vv.audioMgr.playButtonSound();
		cc.connect.tuoGuang();
	},

	/**
	 * 托管
	 */
	tuoGuang(data) {
		let uid = data[0];
        let has = data[1];
        if(uid === cc.dm.user.uid) {
            this.checkAuto(has);
        }
        let p = this.getPlayerByUid(uid);
        if(!!p) {
            let script = this.playerScript(p);
            script.setAuto(has);
        }
	},

	checkAuto(auto) {
		if (!!this.cancelNode) {
            if (auto) {
                this.cancelNode.active = true;
                this.cancelNode.getChildByName('tuoguanAnimation').getComponent(cc.Animation).play('tuoguanAnimationClip');
            } else {
                this.cancelNode.active = false;
                this.cancelNode.getChildByName('tuoguanAnimation').getComponent(cc.Animation).stop();
            }
        }
	},

	changeSeat(data) {
		if (data.indexOf(cc.dm.user.uid) < 0) {
			this.nextChangeSeat(data);
		} else {
			let pdata = this._model.getUserInfo(cc.dm.user.uid);
			let mySeatId = pdata.seatId;
			this.players.forEach((p) => {
				let scr = this.playerScript(p);
				if (scr.localSeat == 0) {
					scr._seatId = mySeatId;
				} else {
					let pdata = this._model._playerDatas[(mySeatId+scr.localSeat)%this.players.length];
					!!pdata && scr.setUserInfo(pdata);
				}
			});
		}
	},

	nextChangeSeat(data) {
		let uid1 = data[0];
		let uid2 = data[1];
		
		let pdata1 = this._model.getUserInfo(uid2);
		let pdata2 = this._model.getUserInfo(uid1);
		let p1 = this.getPlayerByUid(uid1);
		let p2 = this.getPlayerByUid(uid2);
		if (!!p1) {
			this.playerScript(p1).setUserInfo(pdata1);
		}

		if (!!p2) {
			this.playerScript(p2).setUserInfo(pdata2);
		}
	},

	/**
	 * 判断自己是否为游客
	 * @return {boolean} true=游客
	 */
	isTourist: function () {
		return !this.getPlayerByUid(cc.dm.user.uid);
	},

	/**
	 * 是否正在玩
	 * @return {boolean} true=正在玩； false=没玩
	 */
	isPlaying: function (uid) {
		if (uid == undefined) {
			uid = cc.dm.user.uid;
		}

		if (this._model._uids && this._model._uids.indexOf(uid) !== -1) {
			return true;
		}

		return false;
	},

	/**
	 * 点击设置按钮
	 */
	onSettingBtnPressed () {
		cc.vv.audioMgr.playButtonSound();
		let gameName = this._gameName;
		if (gameName.indexOf('niuniu') > -1) {
			gameName = 'niuniu_mpqz';
		}

		cc.utils.showSetting(gameName, function () {
			this.backHall();
		}.bind(this), function (idx) {
            
        }.bind(this));
	},

	onStoreBtnPressed() {
		cc.vv.audioMgr.playButtonSound();
		cc.utils.showStore();
	},

	/**
	 * 聊天按钮
	 */
	onChatBtnPressed () {
		cc.vv.audioMgr.playButtonSound();
		let gameName = this._gameName;
		if (gameName.indexOf('niuniu') > -1) {
			gameName = 'niuniu';
		}

		if (gameName.indexOf('mj') > -1) {
			gameName = 'mj';
		}

		cc.utils.showChat(gameName);
	},

	/**
	 * 切换房间按钮
	 */
	onChangeBtnPressed () {
		
	},

	/**
	 * gps按钮
	 */
	onGpsBtnPressed () {
		cc.vv.audioMgr.playButtonSound();
		cc.utils.showGps(this._model._playerDatas, true);
	},

	/**
	 * 房间规则按钮
	 */
	onRuleBtnPressed () {
		cc.vv.audioMgr.playButtonSound();
		let rule = this._model._game_rule;
		rule.startNumber = this._model._startNumber;
		rule.halfway = this._model._halfway;
		rule.max = this._model._playerDatas.length;
		rule.inning = this._model._inningLimit;
		let ruleName = this._ruleName;
		if (ruleName.indexOf('diantuo') > -1) {
			if (rule.model == 0) {
				ruleName = 'diantuo_tj_rule';
			}
		}

		cc.utils.showRule(ruleName, rule);
	},

	/**
	 * 用户信息按钮
	 * @param event
	 * @param data
	 */
	onGameUserInfoPressed (event, data) {
		cc.vv.audioMgr.playButtonSound();
		let localSeat = parseInt(data);
		let p = this.getPlayerByLocalSeat(localSeat);
		let uid = this.playerScript(p)._uid;
		let info = this._model.getUserInfo(uid);
		if (!!info) {
			cc.utils.showUserInfo(info, true);
		}
	},

	/**
	 * 坐下按钮点击
	 */
	onSitDownBtnPressed () {
		cc.vv.audioMgr.playButtonSound();
		cc.connect.sitDown();
	},

	/**
	 * 退出按钮点击
	 */
	onBackHallBtnPressed () {
		cc.vv.audioMgr.playButtonSound();
		this.backHall();
	},

	backHall() {
		if (this._isleaved) {
			this.outRoom();
		} else {
			this._mineLeaved = true;
			cc.connect.leave();
		}
	},

    /**
	 * 彻底离开房间
     */
	outRoom() {
		cc.utils.openLoading('正在离开房间...');
		cc.connect.rid = undefined;
        setTimeout(function () {
            cc.director.loadScene('club');
        }, 1000);
	},

	/**
	 * 继续按钮点击
	 */
	onContinueBtnPressed () {
		cc.vv.audioMgr.playButtonSound();
		this.resetTimeout();
		cc.connect.ready();
	},

	onExit() {
		cc.vv.audioMgr.playButtonSound();
		if (this.isTourist()) {
			this.backHall();
			return;
		}

		if (this.isPlaying() && this._model._running) {
			cc.utils.openWeakTips('游戏未结束，无法退出房间');
		} else {
			cc.utils.openTips('确定退出游戏?', function () {
				this.backHall();
			}.bind(this), function () {

			});
		}
	},

	/**  桌面点击事件 **/
    onTables() {
		if (!this.isPlaying()) {
			return;
		}

        let p = this.players[0];
        let time = Date.now();
        if (!!this._onTableTime) {
            if(time - this._onTableTime < 800){
                this._onTableNum+=1;
            } else {
                this._onTableNum = 0;
                this._onTableTime = 0;
            }
        } else {
            this._onTableTime = time;
            this._onTableNum = 1;
        }

        if (!!p && this._onTableNum === 2) {
            this.playerScript(p).onTable();
            this._onTableNum = 0;
            this._onTableTime = 0;
        }

        this.resetTimeout();
	},
	
	onDestroy:function () {
		// cc.connect.off('rg');
		if (!!cc.connect.eventlist) {
            for (let key in cc.connect.eventlist) {
                cc.connect.off(key);
            }

			cc.connect.eventlist = undefined;
        }
		cc.gameName = undefined;
        console.log("释放游戏界面");
    },

});

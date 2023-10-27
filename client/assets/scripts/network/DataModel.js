/**
 *  创建者： THB
 *  日期：2020/4/2
 */

class DataModel{
    constructor() {
        this.score = 0;
        this.user = {};
        this.clubInfo = {};
        this.player_num = 0;
        this.dealer_num = 0;
    }

    removeEvents() {
        if (!!this.eventlist) {
            for (let event in this.eventlist) {
                cc.connect.off(event);
            }
        }
    }

    initEvent() {
        if (!!this.eventlist) {
            return;
        }

        this.eventlist = {
            'changeScore': this.changeScore,        /**分数改变 */
            'changeProfit': this.changeProfit,      /**分润改变 */
            'ctCreateRoom': this.ctCreateRoom,      /**亲友群中创建房间*/
            'ctDelRoom': this.ctDelRoom,            /**亲友群中删除房间*/
            'ctSitDown': this.ctSitDown,            /**亲友群中房间有玩家坐下*/
            'ctDelPlayer': this.ctDelPlayer,        /**亲友群中房间有玩家离开（不包含旁观玩家）*/
            'delPrivateRoom': this.delPrivateRoom,  /**删除包间规则*/
            'changeClubPrivateRoom': this.changeClubPrivateRoom,    /**改变包间规则*/
            'changeClubName': this.changeClubName,  /**改变亲友群名字*/
            'createClubPrivateRoom': this.createClubPrivateRoom,    /**创建包间规则*/  
            'changeClubPRName': this.changeClubPRName,  /**修改包间名字*/
            'changePROrder': this.changePROrder,        /**修改包间排序*/
        };
        
        //this.removeEvents();
        
        for (let event in this.eventlist) {
            cc.connect.on(event, (data) => {
                let func = this.eventlist[event];
                if (!!func) {
                    if (!cc.sys.isNative) {
                        console.log('event = ', event, 'data = ', data);
                    }
                    func.call(this, data);
                } else {
                    console.error('没有找到监听方法 event = ', event, 'data = ', data);
                }
            });
        }
    }

    checkWechat() {
        if (cc.dm.user.weChat && (!!cc.dm.user.weChat.headimg || !!cc.dm.user.weChat.realname || !!cc.dm.user.weChat.nickname)) {
            return true;
        }

        return false;
    }

    updateUser(info) {
        this.score = 0;
        this.user = info;
        let name = this.user.name;
        let toName = cc.utils.fromBase64(name || '');
        this.user.name = toName;
        let shortname = this.user.name;
        if (shortname && shortname.length >= 6) {
            shortname = shortname.substr(0, 4);
            shortname+='...';
        }    

        this.user.shortname = shortname;
        this.user.paymentUrl = info.payment.paymentUrl;
        this.user.paymentName = cc.utils.fromBase64(info.payment.paymentName);
        if (this.checkWechat()) {
            cc.dm.user.weChat.realname = cc.utils.fromBase64(cc.dm.user.weChat.realname);
            cc.dm.user.weChat.nickname = cc.utils.fromBase64(cc.dm.user.weChat.nickname);
        }
    }

    updateUserKey(key, value) {
        this.user[key] = value;
    }

    changeScore(data) {
        if (cc.sceneName == 'club' && !!cc.sceneSrc) {
            cc.dm.user.score = data.finalScore;
            cc.sceneSrc.scoreChanged();
            if (data.changeScore < 0) {
                cc.utils.openTips('你已被管理员扣除'+cc.utils.getScoreStr(Math.abs(data.changeScore))+'分');
            } else {
                cc.utils.openBuySuc(data.changeScore);
            }
        } else {
            cc.dm.score += data.changeScore;
            if (data.changeScore > 0) {
                cc.utils.openWeakTips('充值'+cc.utils.getScoreStr(data.changeScore)+'分已到账，请退出房间查看');
            } 
        }
    }

    changeProfit(data) {
        this.user.profitRatio = data.profitRatio;
    }

    changeClubPRName(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        let prid = data.prid;
        for (let i = 0; i < this.clubInfo.privateRooms.length; i++) {
            let privateRoom = this.clubInfo.privateRooms[i];
            if (prid == privateRoom.prid) {
                privateRoom.name = data.name;
                if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                    cc.sceneSrc.changeClubPRName(prid, data.name);
                }
                return;
            }
        }
    }

    delPrivateRoom(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        let prid = data.prid;
        for (let i = 0; i < this.clubInfo.privateRooms.length; i++) {
            let privateRoom = this.clubInfo.privateRooms[i];
            if (prid == privateRoom.prid) {
                this.clubInfo.privateRooms.splice(i, 1);
                if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                    cc.sceneSrc.delPrivateRoom();
                }
                return;
            }
        }
    }

    changeClubPrivateRoom(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        let prid = data.prid;
        for (let i = 0; i < this.clubInfo.privateRooms.length; i++) {
            let privateRoom = this.clubInfo.privateRooms[i];
            if (prid == privateRoom.prid) {
                let rule = data.rule;
                privateRoom.rule = rule;
                if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                    cc.sceneSrc.changeClubPrivateRoom(privateRoom);
                }
                return;
            }
        }
    }

    changePRMax(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        let prid = data.prid;
        for (let i = 0; i < this.clubInfo.privateRooms.length; i++) {
            let privateRoom = this.clubInfo.privateRooms[i];
            if (prid == privateRoom.prid) {
                let max = data.max;
                privateRoom.max = max;
                return;
            }
        }
    }

    createClubPrivateRoom(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        this.clubInfo.privateRooms.push(data);
        if (cc.sceneName == 'club' && !!cc.sceneSrc) {
            cc.sceneSrc.createClubPrivateRoom();
        }
    }

    changeClubName(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        let name = data.name;
        cc.dm.clubInfo.name = name;
        if (cc.sceneName == 'club' && !!cc.sceneSrc) {
            cc.sceneSrc.changeClubName(name);
        }
    }

    ctCreateRoom(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }
        
        let prid = data.prid;
        for (let i = 0; i < this.clubInfo.privateRooms.length; i++) {
            let privateRoom = this.clubInfo.privateRooms[i];
            if (prid == privateRoom.prid) {
                let table = data;
                let rule = privateRoom.rule;
                rule = (typeof rule == 'string') ? JSON.parse(rule) : rule;
                let room_rule = rule.room_rule;
                let playerMax = room_rule.playerMax || 0;
                let gameName = rule.gameName;
                let max = cc.enum.playerMax[gameName][playerMax];
                table.seats = new Array(max);
                this.clubInfo.tables.push(table);

                if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                    cc.sceneSrc.ctCreateRoom(i, privateRoom, table);
                }
                return;
            }
        }   
    }

    ctDelRoom(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        let rid = data.rid;
        this.clubInfo.tables = this.clubInfo.tables.filter(function (el) {
            return el.rid != rid;
        });

        if (cc.sceneName == 'club' && !!cc.sceneSrc) {
            cc.sceneSrc.ctDelRoom(data);
        }
    }

    ctSitDown(data) {
        let cid = data.cid;
        if (cid != this.user.cid) {
            return;
        }

        let rid = data.rid;
        let tables = this.clubInfo.tables.filter(function (el) {
            return el.rid == rid;
        });

        if (!!tables && !!tables[0]) {
            let table = tables[0];
            let seatId = data.seatId;
            seatId = typeof seatId == 'string' ? parseInt(seatId) : seatId;
            table.seats[seatId] = {pic: data.pic};

            if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                cc.sceneSrc.ctSitDown(data, table.seats);
            }
        }
    }

    ctDelPlayer(data) {
        let rid = data.rid;
        let tables = this.clubInfo.tables.filter(function (el) {
            return el.rid == rid;
        });

        if (!!tables && !!tables[0]) {
            let table = tables[0];
            let seatId = data.seatId;
            seatId = typeof seatId == 'string' ? parseInt(seatId) : seatId;
            table.seats[seatId] = null;

            if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                cc.sceneSrc.ctDelPlayer(data);
            }
        }
    }

    changePROrder(data) {
        let cid = data[0];
        if (cid != this.user.cid) {
            return;
        }
        
        let prid1 = data[1];
        let weight1 = data[2];

        let prid2 = data[3];
        let weight2 = data[4];

        let idx1 = -1;
        let idx2 = -1;
        for (let i = 0; i < this.clubInfo.privateRooms.length; i++) {
            let privateRoom = this.clubInfo.privateRooms[i];
            if (prid1 == privateRoom.prid) {
                privateRoom.weight = weight1;
                idx1 = i;
            }

            if (prid2 == privateRoom.prid) {
                privateRoom.weight = weight2;
                idx2 = i;
            }
        }

        this.clubInfo.privateRooms = this.swapArray(this.clubInfo.privateRooms, idx1, idx2);
        if (cc.sceneName == 'club' && !!cc.sceneSrc) {
            cc.sceneSrc.changePROrder(data);
        }
    }

    swapArray(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    }
}

module.exports = new DataModel();
/**
 *  创建者： THB
 *  日期：2020/4/14
 */

class ClubItem {
    constructor(app, data, admins) {
        this.app = app;
        this.cid = data.id;
        this.update(data);
        this.privateRooms = null; //俱乐部房间
        this.tables = {};         //已创建的桌子
        this.admins = {};
        admins.forEach(el => {
            this.admins[el.uid] = el.type;
        });

        /**频道服务器*/
        this.cs = this.app.get('channelService');
        /**获取频道，如果指定的频道不存在，则创建频道*/
        this.channel = this.cs.getChannel(this.cid, true);
    }


    addChannel(uid, sid) {
        let member = this.channel.getMember(uid);
        if(member){
            member.sid = sid;
        } else {
            this.channel.add(uid, sid);
        }
    }

    kickChannel(uid) {
        let member = this.channel.getMember(uid);
        if(member){
            this.channel.leave(uid, member.sid);
        }
    }

    sendAll(event, msg) {
        this.channel && this.channel.pushMessage(event, msg || 1);
    }

    //发送给管理员
    sendAllAdmin(event, msg){
		console.log('sendAllAdmin event = ', event, ' msg = ', msg, ' this.admins = ', this.admins);
        let uids = [];
        for(let uid in this.admins){
            let records = this.channel.getMember(uid);
            if(records){
                uids.push({uid: uid, sid: records.sid})
            }
        }
        if(uids.length > 0){
            this.cs.pushMessageByUids(event, msg, uids);
        }
    }

    update(data) {
        this.name = data.clubName;//.fromBase64();
        this.creator = data.creator;
        this.create_time = data.create_time;
        this.status = data.status;
        this.mcount = data.mcount;
        this.creatorName = data.userName;//.fromBase64();
        this.creatorPic = data.headimg;
        this.creatorSex = data.sex;
    }

    info(uid) {
        return {
            cid: this.cid,
            name: this.name,
            creator: this.creator,
            userName: this.creatorName,
            sex: this.creatorSex,
            headimg: this.creatorPic,
            role: this.admins[uid]   // 在俱乐部中的角色，0=正常玩家，1=管理员，2=群主
        }
    }

    setAdmin(uid){
        if(this.admins[uid] > 0){
            delete this.admins[uid];
        } else {
            this.admins[uid] = 1;
        }
    }

    updatePrivateRooms(list) {
        this.privateRooms = {};
        list.forEach(el => {
            this.privateRooms[el.id] = {
                prid: el.id,
                name: el.name,
                rule: el.content,
                weight: el.weight,
                max: el.max
            }
        });
    }

    setName(name){
        this.name = name.toBase64();
        this.sendAll("changeClubName", {cid: this.cid, name:this.name});
    }

    /**
     * 俱乐部包间
     * @param {undefined|string} prid 俱乐部包间
     * @returns {getPrivateRooms|[]}
     */
    getPrivateRooms(prid) {
        if(prid){
            return this.privateRooms[prid];
        }
        let list = [];
        for(let key in this.privateRooms){
            list.push(this.privateRooms[key]);
        }
        //降序
        list.sort((a, b) => {
            return a.weight - b.weight;
        });
        return list;
    }

    //修改包间规则
    async changePrivateRoom(uid, prid, rule) {
        let rule_json = JSON.stringify(rule);
        let res = await DBTOOLS.changeClubPrivateRoom(prid, uid, rule_json);
        if (res.code === STATE_CODE.OK) {
            if(!this.privateRooms || !this.privateRooms[prid]){
                return {code: STATE_CODE.privateRoomsNotExists};
            }
            this.privateRooms[prid].rule = rule_json;
            this.sendAll('changeClubPrivateRoom', {cid: this.cid, prid, rule});
        }
        return res;
    }

    //修改包间名字
    async changePRName(uid, prid, name){
        let res = await DBTOOLS.changePRName(uid, prid, name);
        if(res.code === STATE_CODE.OK){
            if(!this.privateRooms || !this.privateRooms[prid]){
                return {code: STATE_CODE.privateRoomsNotExists};
            }
            this.privateRooms[prid].name = name;
            this.sendAll('changeClubPRName', {cid: this.cid, prid, name});
        }
        return res;
    }

    //修改包间开桌数
    async changePRMax(prid, max){
        let res = await DBTOOLS.changePRMax(prid, max);
        if(res){
            if(!this.privateRooms || !this.privateRooms[prid]){
                return {code: STATE_CODE.privateRoomsNotExists};
            }
            this.privateRooms[prid].max = max;
            this.sendAll('PRMax', {cid: this.cid, prid, max});
        }
        return res;
    }

    //修改包间排序
    async changePROrder(prid, moveUp){
        let prooms = [];
        for(let key in this.privateRooms){
            prooms.push(this.privateRooms[key]);
        }
        prooms.sort((a, b) => {
            return a.weight - b.weight;
        });
        for(let i = 0; i < prooms.length; ++i){
            if(prooms[i].prid !== prid){
                continue;
            }
            if(moveUp){
                if(i > 0){
                    let code = await DBTOOLS.privateRoomOrder(prooms[i].prid, prooms[i - 1].prid);
                    if(code === STATE_CODE.OK){
                        let weight = prooms[i].weight;
                        prooms[i].weight = prooms[i-1].weight;
                        prooms[i-1].weight = weight;
                        let data = {};
                        data[prooms[i].prid] = prooms[i].weight;
                        data[prooms[i-1].prid] = prooms[i-1].weight;
                        this.sendAll("changePROrder", [
                            this.cid,
                            prooms[i].prid,
                            prooms[i].weight,
                            prooms[i-1].prid,
                            prooms[i-1].weight,
                            true
                        ]);
                        return true;
                    }
                }
            } else if(i < prooms.length - 1){
                let code = await DBTOOLS.privateRoomOrder(prooms[i].prid, prooms[i + 1].prid);
                if(code === STATE_CODE.OK) {
                    let weight = prooms[i].weight;
                    prooms[i].weight = prooms[i + 1].weight;
                    prooms[i + 1].weight = weight;
                    this.sendAll("changePROrder", [
                        this.cid,
                        prooms[i].prid,
                        prooms[i].weight,
                        prooms[i+1].prid,
                        prooms[i+1].weight,
                        false
                    ]);
                    return true;
                }
            }
            return false;
        }
    }

    //创建包间
    async createPrivateRoom(uid, name = "", rule) {
        let res = await DBTOOLS.createClubPrivateRoom(this.cid, uid, name, rule);
        if(res.code === STATE_CODE.OK){
            if(this.privateRooms){
                let weight = Math.floor(Date.now() / 1000);
                this.privateRooms[res.insertId] = {
                    prid: res.insertId,
                    name: name,
                    rule: JSON.stringify(rule),
                    weight: weight
                };
                this.sendAll('createClubPrivateRoom', {cid:this.cid, prid: res.insertId, name: name, rule: rule, weight: weight});
            }
        }
        return res;
    }

    //删除包间
    async deletePrivateRoom(prid, uid) {
        let res = await DBTOOLS.deleteClubPrivateRoom(prid, uid);
        if (res.code === STATE_CODE.OK) {
            if (this.privateRooms){
                delete this.privateRooms[prid];
                this.sendAll('delPrivateRoom', {cid: this.cid, prid});
            }

        }
        return res;
    }
}

class Clubs {
    constructor() {
        /**
         *
         * @type {{ClubItem}}
         */
        this.clubMap = {};
        this.app = null;
    }

    isExists(cid) {
        return !!this.clubMap[cid];
    }

    addClub(app, cid, data, admins) {
        if (!this.app && !!app) this.app = app;
        if (this.clubMap[cid]) {
            let club = this.clubMap[cid];
            club.update(data);
        } else {
            this.clubMap[cid] = new ClubItem(app, data, admins);
        }
        APP_LOG.log("俱乐部数量：" + Object.keys(this.clubMap).length);
        return this.clubMap[cid];
    }

    /**
     * 如果俱乐部不存在，则从数据库加载
     * @param app
     * @param cid
     * @returns {ClubItem}
     */
    async getClubSync(app, cid){
        if (!this.app && !!app) this.app = app;
        if(!cid) return null;
        if(!this.clubMap[cid]){
            let data = await DBTOOLS.clubInfo(cid);
            let admins = await DBTOOLS.clubAdmins(cid);
            let privateRooms = await DBTOOLS.clubPrivateRooms(cid);
            if (data) {
                this.addClub(app, cid, data, admins);
                this.clubMap[cid].updatePrivateRooms(privateRooms);
            }
        }
        return this.clubMap[cid];
    }

    /**
     *
     * @param app
     * @param cid
     * @returns {ClubItem}
     */
    getClub(app, cid) {
        if (!this.app && !!app) this.app = app;
        return this.clubMap[cid];
    }
}

/**
 *
 * @type {Clubs}
 */
module.exports = new Clubs();
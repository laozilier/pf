/**
 *
 * 房间的会话管理，与客户端的通信，session与channel的维护
 *
 *  创建者： THB
 *  日期：2019/12/31
 */

class Session {
    constructor(app, channelName) {
        this.app = app;
        this.channelName = channelName;
        /**频道服务器*/
        this.cs = this.app.get('channelService');
        /**获取频道，如果指定的频道不存在，则创建频道*/
        this.channel = this.cs.getChannel(this.channelName, true);
    }

    /**
     * 给指定uid发送数据
     * @param uid    接收uid
     * @param event  事件名
     * @param msg    消息体
     */
    send(uid, event, msg) {
        if (!event) {
            console.error("消息没有事件名，请传入事件名");
            return;
        }
        let records = this.channel.getMember(uid);
        if (records && records.sid) {
            // this.cs.pushMessageByUids('rg', [event, msg], [{
            //     uid: uid,
            //     sid: records.sid
            // }]);

            this.cs.pushMessageByUids(event, msg == undefined ? [] : msg, [{
                uid: uid,
                sid: records.sid
            }]);
        }
    }

    /**
     * 把消息发送给房间中的所有玩家
     * @param event  事件名
     * @param msg    消息
     */
    sendAll(event, msg) {
        //this.channel && this.channel.pushMessage('rg', [event, msg]);
        this.channel && this.channel.pushMessage(event, msg == undefined ? [] : msg);
    }

    /**
     * 释放频道
     * kick频道内所有玩家
     */
    destroyChannel() {
        this.cs.destroyChannel(this.channelName); //释放频道
        this.channel = null;
    }

    /**
     * 将玩家踢出频道
     * @param uid
     */
    kickChannel(uid) {
        if (this.channel) {
            let member = this.channel.getMember(uid);
            if(member){
                this.channel.leave(uid, member.sid);
            }
        }
    }

    /**
     * 往频道增加
     * @param uid
     * @param sid
     */
    addChannel(uid, sid){
        this.kickChannel(uid);
        this.channel.add(uid, sid);
    }

}

module.exports = Session;
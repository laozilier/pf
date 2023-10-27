cc.Class({
    extends: cc.Component,

    properties: {
        mapNode: {
            default: null,
            type: cc.Node
        },

        listNode: {
            default: null,
            type: cc.Node
        },

        listScrollView: {
            default: null,
            type: cc.Node
        },

        listContent: {
            default: null,
            type: cc.Node
        },

        listItem: {
            default: null,
            type: cc.Node
        },
    },

    toRad (d) {
        return d * Math.PI / 180;
    },
    /**
     *
     * @param lat1
     * @param lng1
     * @param lat2
     * @param lng2
     * @return {number}
     */
    getDisance(lat1, lng1, lat2, lng2) { //lat为纬度, lng为经度, 一定不要弄错
        let dis = 0;
        let radLat1 = this.toRad(lat1);
        let radLat2 = this.toRad(lat2);
        let deltaLat = radLat1 - radLat2;
        let deltaLng = this.toRad(lng1) - this.toRad(lng2);
        dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
        dis = dis * 6378137;
        let str = '';
        if (dis > 1000) {
            str = Math.floor(dis/1000)+'千米';
        } else {
            str = Math.floor(dis)+'米';
        }

        return str;
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
    },
    
    onCloseClick:function(){
        this.node.active = false;
        cc.vv.audioMgr.playButtonSound();
    },

    show (data, need) {
        this.mapNode.active = false;
        this.listNode.active = false;
        let players = [];
        for (let i = 0; i < data.length; i++) {
            let p = data[i];
            if (!!p) {
                players.push(p);
            }
        }

        this.check(players, need);
    },

    check (players, need) {
        /*
        {"uid":100150,"name":"5ri45a6iNTg2MA==","location":{},"isTrusteeship":true,"ip":"192.168.50.103","sex":0,"seatId":0,"isOwner":true,
            "isAdmin":false,"isOnline":false,"ready":false,"score":100139919,"isDeclarer":false,
            "createTime":"2018-07-26","start":true},{"uid":809634,"name":"5ri45a6iNDMzOQ==","location":{},
            "isTrusteeship":true,"ip":"192.168.50.103","sex":0,"seatId":1,"isOwner":false,"isAdmin":false,
                "isOnline":false,"ready":false,"score":871779,"isDeclarer":false,"createTime":"2018-08-01","start":true}
                */

        if (players.length < 3) {
            return;
        }

        if (players.length > 4) {
            this.listNode.active = true;
            this.listContent.removeAllChildren();
            let max = players.length;
            for (let i = 0; i < max; i++) {
                let player = players[i];
                let item = cc.instantiate(this.listItem);
                this.listContent.addChild(item);
                let nameLab = item.getChildByName('name');
                if (nameLab) {
                    let str = player.name;
                    if (need) {
                        str = cc.utils.fromBase64(player.name, 6);
                    }
                    nameLab.getComponent(cc.Label).string = str;
                }

                let locLab = item.getChildByName('loc');
                if (locLab) {
                    let location = player.location;
                    if (location && location.province) {
                        locLab.getComponent(cc.Label).string = location.province+location.city+location.district+location.street;
                    } else {
                        locLab.getComponent(cc.Label).string = '未知位置';
                    }
                }
            }
        } else {
            this.mapNode.active = true;
            let locNode = null;
            if (players.length == 4) {
                locNode = this.mapNode.getChildByName('four');
                locNode.active = true;
                this.mapNode.getChildByName('three').active = false;
            } else {
                locNode = this.mapNode.getChildByName('three');
                locNode.active = true;
                this.mapNode.getChildByName('four').active = false;
            }

            let max = players.length;
            for (let i = 0; i < max; i++) {
                let player = players[i];
                let head = locNode.getChildByName('head'+i);
                if (head) {
                    let headNode = head.getChildByName('headNode');
                    if (headNode) {
                        let headSpr = headNode.getChildByName('head');
                        if (headSpr) {
                            headSpr.getComponent('superSprite').loadUrl(player.pic);
                        }
                    }

                    let nameLab = head.getChildByName('name');
                    if (nameLab) {
                        let str = player.name;
                        if (need) {
                            str = cc.utils.fromBase64(player.name, 6);
                        }
                        nameLab.getComponent(cc.Label).string = str;
                    }
                }

                let location = player.location;

                for (let j = (i+1); j < players.length; j++) {
                    let distanceLab = locNode.getChildByName('distance'+i+j);
                    if (!distanceLab) {
                        continue;
                    }

                    let toPlayer = players[j];
                    let toLocation = toPlayer.location;

                    if (!location || !toLocation || !location.latitude || !location.longitude || !toLocation.latitude || !toLocation.longitude) {
                        distanceLab.getComponent(cc.Label).string = '未知距离';
                    } else {
                        let distanceStr = this.getDisance(location.latitude, location.longitude, toLocation.latitude, toLocation.longitude);
                        distanceLab.getComponent(cc.Label).string = distanceStr;
                    }
                }

            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

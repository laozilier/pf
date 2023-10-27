let c = {
    extends:cc.Component,
    properties:{
        背景:{
            default:null,
            type:cc.Node
        },

        infoNode:{
            default:null,
            type:cc.Node
        },

        头像:{
            default:null,
            type:cc.Node
        },

        姓名:{
            default:null,
            type:cc.Label
        },
        位置:{
            default:null,
            type:cc.Label
        },
        局数:{
            default:null,
            type:cc.Label
        },
        ID:{
            default:null,
            type:cc.Label
        },
        IP:{
            default:null,
            type:cc.Label
        },
        创建时间:{
            default:null,
            type:cc.Label
        },

        动画:{
            default:null,
            type:cc.Node
        }
    }
};

c.onLoad = function(){
    cc.utils.setNodeWinSize(this.node);
};

c.onAnimateClick = function(event, id) {
    if (!!this._now) {
        if (Date.now()-this._now < 5000) {
            cc.utils.openWeakTips('你的动作太快了，先坐下喝杯茶吧');
            return;
        }
    }

    this._now = Date.now();

    id = isNaN(id) ? 0 : parseInt(id);
    console.log("cc.dm.user.id = ",cc.dm.user.uid, "  this.id = ",this.uid,"  id = ",id);
    cc.connect.animate(cc.dm.user.uid, this.uid, id);
    this.node.active = false;
};

/**
 * 显示用户信息
 * @param info 用户信息
 * <ul>
 *     <li> sex 性别
 *     <li> name 名字
 *     <li> address 位置
 *     <li> inning  局数
 *     <li> uid    uid
 *     <li> ip
 *     <li> createTime
 * @param isGame 是否显示表情
 */
c.show = function(info, need){
    //y = 150 w = 250
    this.uid = info.uid;
    let address = "未知位置";
    let location = info.location;
    if (location && location.province) {
        address = location.province+location.city;
    }

    if(this.uid != cc.dm.user.uid){
        this.动画.active = true;
        // this.背景.height = 520;
        this.infoNode.y = 8;
    } else {
        this.动画.active = false;
        // this.背景.height = 440;
        this.infoNode.y = -60;
    }

    let sex = info.sex;
    let headurl = info.pic;
    this.头像.getComponent('HeadNode').updateData(headurl, sex);
    let namestr = info.name;
    if (need) {
        namestr = cc.utils.fromBase64(namestr, 8);
    }
    this.姓名.getComponent("superLabel").setString(namestr);
    this.位置.string = address;
    this.局数.string = info.totalInning;
    this.ID.string = info.uid;
    this.IP.string = info.ip;
    if (!!info.createTime) {
        this.创建时间.string = info.createTime.substr(0,10);
    }
    
    //显示
    this.node.active = true;
};

c.onClose = function(){
    this.node.active = false;
};

cc.Class(c);
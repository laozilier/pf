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
        zpPrefab: {
            default: null,
            type: cc.Prefab
        },

        resFrames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._htStrs = ['', '点炮', '自摸', '王钓', '王钓王', '王闯', '王闯王', '王炸', '王炸王'];
        this._htMulStrs = ['x0', 'x1', 'x2', 'x4', 'x8', 'x8', 'x16', 'x16', 'x32'];
        this._mtStrs = ['', '平胡', '红胡', '点菊', '全黑'];
        this._mtMulStrs = ['x0', 'x1', 'x2', 'x3', 'x4'];
        this._xingStrs = ['下\n醒', '本\n醒', '上\n醒', '跟\n醒'];
        this._typeStrs = ['', '吃', '碰', '开交', '啸', '倾', '', '坎', '龙', '王炸', '王闯', '王钓'];
        let infoNode = this.node.getChildByName('infoNode');
        let insNode = infoNode.getChildByName('insNode');
        insNode.children.forEach((el) => {
            for (let i = 0; i < 4; i++) {
                let card = cc.instantiate(this.zpPrefab);
                el.addChild(card, i, 'zp'+i);
                card.x = 0;
                card.y = -55-i*98;
                card.active = false;
            }
        });

        let huNode = infoNode.getChildByName('huNode');
        let huSpr = cc.instantiate(this.zpPrefab);
        huNode.addChild(huSpr, 1, 'huSpr');

        let xingNode = infoNode.getChildByName('xingNode');
        let xingCardSpr = cc.instantiate(this.zpPrefab);
        xingCardSpr.x = -95;
        xingNode.addChild(xingCardSpr, 0, 'xingCardSpr');
        let xingSpr = cc.instantiate(this.zpPrefab);
        xingSpr.x = 95;
        xingNode.addChild(xingSpr, 1, 'xingSpr');

        let bottomNode = this.node.getChildByName('bottomNode');
        for (let i = 0; i < 23; i++) {
            let card = cc.instantiate(this.zpPrefab);
            bottomNode.addChild(card, i, 'zp'+i);
        }
        let leftNode = this.node.getChildByName('leftNode');
        for (let i = 0; i < 20; i++) {
            let card = cc.instantiate(this.zpPrefab);
            leftNode.addChild(card, i, 'zp'+i);
        }
    },

    start () {

    },

    openRelustNode(data, userInfos, bottomCards, leftCards, xingType) {
        this.node.active = true;
        let infoNode = this.node.getChildByName('infoNode');
        let liujuNode = this.node.getChildByName('liujuNode');
        if (!!data) {
            infoNode.active = true;
            liujuNode.active = false;
            this._idx = 0;
            let group = data.group;
            let huCard = data.huCard;
            let insNode = infoNode.getChildByName('insNode');
            let huCardNode = undefined;
            for (let i = 0; i < group.length; i++) {
                let obj = group[i];
                let vs = obj.vs;
                let inPoker = insNode.getChildByName('inPoker'+i);
                inPoker.active = true;
                for (let i = 0; i < 4; i++) {
                    let card = inPoker.getChildByName('zp'+i);
                    let v = vs[i];
                    if (isNaN(v)) {
                        card.active = false;
                    } else {
                        card.active = true;
                        card.getComponent('Zipai').showZPValue(v);
                        if (obj.end == 1 && !huCardNode && v == huCard) {
                            huCardNode = card;
                        }
                    }
                }

                let hu = obj.hu;
                let huziLab = inPoker.getChildByName('huziLab');
                if (hu > 0) {
                    huziLab.active = true;
                    huziLab.getComponent(cc.Label).string = '+'+hu;
                } else {
                    huziLab.active = false;
                }
    
                let card0 = inPoker.getChildByName('zp0');
                if (!!obj.dis) {
                    card0.getChildByName('paimian').color = cc.color(200,200,200,255);
                } else {
                    card0.getChildByName('paimian').color = cc.Color.WHITE;
                }

                let v = obj.v;
                let t = obj.t;
                let typeLab = inPoker.getChildByName('typeLab');
                if (t == cc.zp_chz_enum.inPokerType.chi) {
                    if (v > 0) {
                        typeLab.active = true;
                        if (!!obj.xh) {
                            typeLab.getComponent(cc.Label).string = '下火';
                        } else {
                            typeLab.getComponent(cc.Label).string = this._typeStrs[t];
                        }
                    } else {
                        typeLab.active = false;
                    }
                } else {
                    typeLab.active = true;
                    if (t == cc.zp_chz_enum.inPokerType.xiao && !!obj.g) {
                        typeLab.getComponent(cc.Label).string = '过啸';
                    } else if (t == cc.zp_chz_enum.inPokerType.jiao && !!obj.c) {
                        typeLab.getComponent(cc.Label).string = '重交';
                    } else {
                        typeLab.getComponent(cc.Label).string = this._typeStrs[t];
                    }
                }
                inPoker.cardValue = obj.v;
                inPoker.cardType = obj.t;
                this._idx+=1;
            }

            if (!!huCardNode) {
                huCardNode.getChildByName('paimian').color = cc.color(255,170,170,255);
            }

            let huLab = infoNode.getChildByName('huLab');
            huLab.getComponent(cc.Label).string = data.huzi+'胡';
            let huFanLab = infoNode.getChildByName('huFanLab');
            huFanLab.getComponent(cc.Label).string = '+'+data.fan;

            let huNode = infoNode.getChildByName('huNode');
            let huSpr = huNode.getChildByName('huSpr');
            huSpr.getComponent('Zipai').showZPValue(huCard);

            let xingFanLab = infoNode.getChildByName('xingFanLab');
            xingFanLab.getComponent(cc.Label).string = '+'+data.xingFan;

            let xingNode = infoNode.getChildByName('xingNode');
            let xingCardSpr = xingNode.getChildByName('xingCardSpr');
            xingCardSpr.getComponent('Zipai').showZPValue(data.xingCard);
            let xingLab = xingNode.getChildByName('xingLab');
            xingLab.getComponent(cc.Label).string = this._xingStrs[xingType];
            let xingSpr = xingNode.getChildByName('xingSpr');
            xingSpr.getComponent('Zipai').showZPValue(data.xing);

            let htLab = infoNode.getChildByName('htLab');
            htLab.getComponent(cc.Label).string = this._htStrs[data.huType];
            let htMulLab = infoNode.getChildByName('htMulLab');
            htMulLab.getComponent(cc.Label).string = this._htMulStrs[data.huType];

            let mtLab = infoNode.getChildByName('mtLab');
            mtLab.getComponent(cc.Label).string = this._mtStrs[data.mtType];
            let mtMulLab = infoNode.getChildByName('mtMulLab');
            mtMulLab.getComponent(cc.Label).string = this._mtMulStrs[data.mtType];

            let totalLab = infoNode.getChildByName('totalLab');
            totalLab.getComponent(cc.Label).string = '总计\n'+data.total+'倍底注';
        } else {
            infoNode.active = false;
            liujuNode.active = true;
        }
        
        for (let i = 0; i < 3; i++) {
            let obj = userInfos[i];
            let playerNode = this.node.getChildByName('player_'+i);
            if (!!obj) {
                playerNode.active = true;
                let namestr = cc.utils.fromBase64(obj.name, 8);
                let nameNode = playerNode.getChildByName('name');
                nameNode.getComponent(cc.Label).string = namestr;
                nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;
                let headNode = playerNode.getChildByName('headNode');
                headNode.getComponent('HeadNode').updateData(obj.pic, obj.sex);

                let resScoreNode = playerNode.getChildByName('resScore');
                resScoreNode.getComponent('resScore').showScore(obj.score);

                let bankNode = playerNode.getChildByName('bank');
                bankNode.active = !!obj.isBanker;

                let resSpr = playerNode.getChildByName('resSpr');
                resSpr.getComponent(cc.Sprite).spriteFrame = this.resFrames[(obj.score > 0 ? 0 : 1)];

                let piaofenNode = playerNode.getChildByName('piaofen');
                let piaofenLab = piaofenNode.getChildByName('piaofenLab');
                let piaofenScore = obj.piaofenScore || 0;
                let piaofenStr = cc.utils.getScoreStr(piaofenScore);
                piaofenStr = piaofenStr.replace('万', 'B');
                piaofenLab.getComponent(cc.Label).string = piaofenStr;
            } else {
                playerNode.active = false;
            }
        }

        let bottomNode = this.node.getChildByName('bottomNode');
        for (let i = 0; i < 23; i++) {
            let card = bottomNode.getChildByName('zp'+i);
            if (!card) {
                return;
            }
            let v = bottomCards[i];
            if (isNaN(v)) {
                card.active = false;
            } else {
                card.active = true;
                card.getComponent('Zipai').showZPValue(v);
            }
        }

        let leftNode = this.node.getChildByName('leftNode');
        for (let i = 0; i < 20; i++) {
            let card = leftNode.getChildByName('zp'+i);
            if (!card) {
                return;
            }
            let v = leftCards[i];
            if (isNaN(v)) {
                card.active = false;
            } else {
                card.active = true;
                card.getComponent('Zipai').showZPValue(v);
            }
        }
    }

    // update (dt) {},
});

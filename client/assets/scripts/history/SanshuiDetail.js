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

    // onLoad () {},

    start () {

    },

    show(uid, userinfo, score, lastHold, bank) {
        this.node.active = true;
        let userNode = this.node.getChildByName('user');
        userNode.getChildByName('name').getComponent(cc.Label).string = cc.utils.fromBase64(userinfo.name);
        userNode.getChildByName('id').getComponent(cc.Label).string = uid;
        userNode.getChildByName('headNode').getComponent('HeadNode').updateData(userinfo.pic);
        userNode.getChildByName('bank').active = bank;

        this.node.getChildByName('teshu').active = false;
        this.node.getChildByName('teshuValue').active = false;
        let outs = this.node.getChildByName('outs');
        outs.children.forEach((el)=> { el.active = false; })
        outs.active = false;
        this.showCard(lastHold);
        this.showScore(score);
        console.log("牌数据：",lastHold);
    },

    /**
     * 显示分数
     * @param score
     */
    showScore(score) {
        let str = cc.utils.getScoreStr(score);
        str = str.replace('万', 'B');
        if (score >= 0) {
            this.node.getChildByName('win').getComponent(cc.Label).string = "+" + str;
            this.node.getChildByName('win').active = true;
            this.node.getChildByName('lose').active = false;
        } else {
            this.node.getChildByName('lose').getComponent(cc.Label).string = str;
            this.node.getChildByName('lose').active = true;
            this.node.getChildByName('win').active = false;
        }
    },

    /**
     * 显示牌
     */
    showCard(res) {
        //牌显示
        if(res.length == 1) {
            let info = res[0];
            let cards = info.cards;
            let getScore = info.getScore;
            let teshuNode = this.node.getChildByName('teshu');
            teshuNode.active = true;
            let teshuValue = this.node.getChildByName('teshuValue');
            teshuValue.active = true;
            for(let i = 0; i < cards.length; ++i) {
                let poker = teshuNode.children[i];
                if (!!poker) {
                    poker.getComponent('poker').show(cards[i]);
                }
            }

            let win = teshuValue.getChildByName('win');
            let lose = teshuValue.getChildByName('lose');
            if (getScore < 0) {
                win.active = false;
                lose.active = true;
                lose.getComponent(cc.Label).string = getScore;
            } else {
                win.active = true;
                lose.active = false;
                win.getComponent(cc.Label).string = '+'+getScore;
            }
        } else {
            let outs = this.node.getChildByName('outs');
            outs.active = true;
            for (let i = 0; i < res.length; i++) {
                let info = res[i];
                let cards = info.cards;
                let getScore = info.getScore;
                let out = outs.getChildByName('outs'+i);
                out.active = true;
                for (let j = 0; j < cards.length; j++) {
                    let poker = out.children[j];
                    if (!!poker) {
                        poker.getComponent('poker').show(cards[j]);
                    }
                }

                if (getScore < 0) {
                    let lose = outs.getChildByName('lose'+i);
                    lose.active = true;
                    lose.getComponent(cc.Label).string = getScore;
                } else {
                    let win = outs.getChildByName('win'+i);
                    win.active = true;
                    win.getComponent(cc.Label).string = '+'+getScore;
                }
            }
        }
    }
});

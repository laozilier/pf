cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._ruleWins = {};
    },

    start () {

    },

    /**
     * 显示规则界面
     * @param {String} prefabName 游戏名字,必传
     * @param [rule]     规则数据
     */
    show (gameName, rule) {
        if(!gameName){
            console.error("预制资源名字为空，无法显示规则界面");
            return;
        }

        for (let name in this._ruleWins) {
            this._ruleWins[name].active = false;
        }

        let node = this._ruleWins[gameName];
        if (!!node) {
            node.active = true;
            this.ruleScript = node.getComponent(gameName);
            if(!this.ruleScript.init){
                console.error("游戏规则界面，脚本没有init参数");
            }
            this.ruleScript.init(rule);
        } else {
            cc.utils.loadPrefabNode("tips_game/" + gameName, (node) => {
                this.ruleScript = node.getComponent(gameName);
                if(!this.ruleScript.init){
                    console.error("游戏规则界面，脚本没有init参数");
                }
                this._ruleWins[gameName] = node;
                this.ruleScript.init(rule);
                this.node.addChild(node);
            });
        }
    },

    onClosePressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }

    // update (dt) {},
});

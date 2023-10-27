cc.Class({
    extends: cc.Component,

    properties: {
        manifestUrl: {
            default: null,
            type: cc.Asset
        },
    },

    //检查版本是否需要热更新
    checkCb: function (event) {
        // console.log('Code: ' + event.getEventCode());
        // console.log(jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST);
        // console.log(jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST);
        // console.log(jsb.EventAssetsManager.ERROR_PARSE_MANIFEST);
        // console.log(jsb.EventAssetsManager.ALREADY_UP_TO_DATE);
        // console.log(jsb.EventAssetsManager.NEW_VERSION_FOUND);
        // console.log(jsb.EventAssetsManager.UPDATE_PROGRESSION);
        // console.log(jsb.EventAssetsManager.ALREADY_UP_TO_DATE);
        // console.log(jsb.EventAssetsManager.UPDATE_FINISHED);
        // console.log(jsb.EventAssetsManager.ERROR_UPDATING);
        // console.log(jsb.EventAssetsManager.ERROR_DECOMPRESS);
        let errTips = "";
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:  //未找到本地的manifest文件，跳过热更新
                errTips = "未找到本地的manifest文件，跳过热更新";
                cc.eventManager.removeListener(this._checkListener);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:     //无法下载manifest文件，跳过热更新
                errTips = "无法下载manifest文件，跳过热更新";
                cc.eventManager.removeListener(this._checkListener);
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:  //已经是最新版本
                errTips = "已经是最新版本。";
                cc.eventManager.removeListener(this._checkListener);
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND: //找到新版本, 开始下载文件
                this._needUpdate = true;
                cc.eventManager.removeListener(this._checkListener);
                this.hotUpdate();
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION: //更新进度
                break;
            default:
                break;
        }

        if (!!errTips) {
            // cc.utils.openTips(errTips);
            !!this._errcb && this._errcb();
        }
    },

    //下载文件
    updateCb: function (event) {
        let needRestart = false;
        let failed = false;
        let errTips = "";
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE: //已经是最新版
                failed = true;
                errTips = "已经是最新版";
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION: //更新进度
                let percent = event.getPercent(); //字节级进度信息
                //let percentByFile = event.getPercentByFile(); //文件级进度信息
                //let msg = event.getMessage(); //更新信息
                if (!isNaN(percent)) {
                    !!this._progresscb && this._progresscb(percent);
                }
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:  //更新完成
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED: //更新失败
                errTips = event.getMessage();
                this._failCount++;
                if (this._failCount < 5) { //重新更新
                    !!this._statecb && this._statecb('更新失败，正在重试', true);
                    this._am.downloadFailedAssets();
                } else {
                    this._failCount = 0;
                    failed = true;
                }
                break;
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST: //未找到版本文件
                failed = true;
                errTips = "未找到版本文件";
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:  //下载版本文件失败
                failed = true;
                errTips = "下载版本文件失败";
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                failed = true;
                errTips = event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                failed = true;
                errTips = event.getMessage();
                break;
            default:
                break;
        }

        if (!!errTips) {
            // cc.utils.openTips(errTips);
        }

        if (failed) {
            cc.eventManager.removeListener(this._updateListener);
            !!this._completcb && this._completcb();
        }

        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            // 获取这个manifest的搜索路径
            //let searchPaths = jsb.fileUtils.getSearchPaths();
            let newPaths = this._am.getLocalManifest().getSearchPaths();
            //Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(newPaths));
            jsb.fileUtils.setSearchPaths(newPaths);
            cc.game.restart(); //重新开始游戏
        }
    },

    //开始热更新
    hotUpdate: function () {
        if (this._am && this._needUpdate) {
            !!this._statecb && this._statecb('正在更新资源，请稍等', true);
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            this._failCount = 0;
            this._am.update();
        }
    },

    /**
     * 检查热更版本 如果热更服务器不能访问则跳过热更新
     */
    checkResVer(progresscb, completcb, errcb, statecb) {
        this._progresscb = progresscb;
        this._completcb = completcb;
        this._errcb = errcb;
        this._statecb = statecb;
        if (cc.sys.isNative && (cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID) && cc.sys.isMobile) {
            // if (cc.sys.isMobile) {
                /** 首先检查强制更新 */
                // this.checkNativeUpdate();
                this.testHotUpdate();
            // }
        } else {
            !!this._completcb && this._completcb();
        }
    },

    checkNativeUpdate() {
        let sysos = '';
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            sysos = 'Android';
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            sysos = 'IOS'
        }

        // let osVersion = nativeApi.getVersion();
        // let build = osVersion.build || 10001;
        // cc.connect.checkVersion(sysos, build, (msg)=> {
        //     if (!!msg && !!msg.downloadUrl) {
        //         cc.utils.openTips('发现新版本，请更新', ()=> {
        //             cc.sys.openURL(msg.downloadUrl);
        //         });
        //     } else {
        //         this.testHotUpdate();
        //     }
        // }, ()=> {
        //     this.testHotUpdate();
        // });

        this.testHotUpdate();
    },

    testHotUpdate() {
        cc.connect.httpTest('http://120.78.163.134/hot/game/version.manifest', 'GET', {}, () => {
            console.log(`热更服务器可以访问`);
            this.nextCheckResVer();
        }, () => {
            cc.utils.openTips(`热更失败，热更服务器无法访问`);
            !!this._completcb && this._completcb();
        });
    },

    /**
     * 继续检查热更版本
     */
    nextCheckResVer: function () {
        !!this._statecb && this._statecb('检查版本，请稍等', true);
        let storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'chess-asset');
        let url = this.manifestUrl.nativeUrl;
        this._am = new jsb.AssetsManager(url, storagePath);
        this._am.retain();

        cc.version = this._am.getLocalManifest().getVersion();

        this._needUpdate = false;
        if (this._am.getLocalManifest().isLoaded()) { //有更新
            this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
            cc.eventManager.addListener(this._checkListener, 1);
            this._am.checkUpdate();
        } else {
            cc.utils.openTips(`热更失败，无法加载本地文件${url}`);
            console.log(`热更失败，无法加载本地文件${url}`)
            !!this._completcb && this._completcb();
        }
    },



    // use this for initialization
    onLoad: function () {
        // Hot update is only available in Native build

    },

    onDestroy: function () {
        this._am && this._am.release();
    },
});

/**
 *  创建者： THB
 *  日期：2020/5/6
 *  计算分润
 */
function ProfitRemote(app){
    this.app = app;
    this.clubRatio = 0.05;
    this.claspSum = 0;
}
let handler = ProfitRemote.prototype;

function calculateSingle(cid, uid, parents, tax, profitResult, parentRatio, clubCreator, clubRatio){
    let totalRatio = 0;
    let totalTax = tax;
    //父级抽水
    for(let i = 0; i < parents.length; ++i){
        let el = parents[i];
        let pid = el[0];
        let ratio = i > 0 ? parentRatio[i - 1] : el[1];

        //找不到上级，则跳过
        if(ratio === undefined){
            break;
        }

        //代理最多拿0.8;
        totalRatio += ratio;
        if(totalRatio > 0.8)
            break;
        let profit = ratio * tax;
        totalTax -= profit;
        if(!profitResult.hasOwnProperty(pid)){
            profitResult[pid] = 0;
        }
        profitResult[pid] += profit;
    }

    let creatorProfit = 0;
    //俱乐部群主抽水0.5
    if(clubCreator > 0){
        let profit = clubRatio * tax;
        totalTax -= profit;
        if(!profitResult.hasOwnProperty(clubCreator)){
            profitResult[clubCreator] = 0;
        }
        profitResult[clubCreator] += profit;
        creatorProfit += profit;
    }

    //剩余利润放到俱乐部中
    // if(totalTax > 0){
    //     let pid = rootNode[0];
    //     if(!profitResult.hasOwnProperty(pid)){
    //         profitResult[pid] = 0
    //     }
    //     profitResult[pid] += totalTax;
    // }
    return {totalTax: totalTax, creatorProfit: creatorProfit};
}

handler.calculate = async function (cid, uids, tax, cb) {
    let now = Date.now();
    let profitResult = {};
    let clubInfo = CLUBS.getClub(null, cid);
    let clubCreator = 0;
    if(clubInfo){
        clubCreator = clubInfo.creator;
    }
    let clubProfit = 0;
    let parentList = await DBTOOLS.getParents(JSON.stringify(uids));
    if(!parentList){
        APP_LOG.error(JSON.stringify(uids), ":", tax);
        cb();
        return;
    }

    let clubTax = 0;
    uids.forEach(uid => {
        clubTax += tax;
        let parents = parentList[uid];
        if(this.claspSum % CLASP === 0){
            clubProfit += tax;
            DBTOOLS.subInning(uid);
        } else {
            let calRes = calculateSingle(cid, uid, parents, tax, profitResult, PARENTRATIO, clubCreator, this.clubRatio);
            clubProfit += calRes.totalTax;
            let creatorProfit = calRes.creatorProfit;
            if (creatorProfit > 0) {
                DBTOOLS.writeCreatorProfit(creatorProfit, cid);
            }
            //clubProfit += calculateSingle(cid, uid, parents, tax, profitResult, PARENTRATIO, clubCreator, this.clubRatio);
        }
    });

    let sqlParam = [];
    if(this.claspSum % CLASP > 0){
        for (let uid in profitResult) {
            let score = profitResult[uid];
            sqlParam.push({uid: parseInt(uid), score: score});
        }
    }

    let res = await DBTOOLS.writeProfit(JSON.stringify(sqlParam), cid, clubProfit, clubTax).catch(err => {
        APP_LOG.error(err);
    });
    if(res.code == 200){
        APP_LOG.info("俱乐部利润：", clubProfit);
        APP_LOG.info('计算分润成功', Date.now() - now);
        APP_LOG.info(sqlParam);
    } else {
        APP_LOG.info('计算分润失败', Date.now() - now);
        APP_LOG.error(res);
    }

    this.claspSum ++;
    cb();
};


module.exports = function (app) {
    return new ProfitRemote(app);
};
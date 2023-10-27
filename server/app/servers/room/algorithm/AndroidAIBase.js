/**
 * 机器人智能
 */

let alg = require("./mahjonghn");
let mj_utils = require("./mjutils");

class AndroidAIBase {
    constructor(){
        this.m_byCardData = new Array(alg.MAX_COUNT);				    //原始牌
        this.m_byCardCount = 0;							                //原始牌数

        this.m_bSelect = new Array(alg.MAX_COUNT);					    //牌是否被选择

        this.m_byThreeCard = new Array(alg.MAX_COUNT);				    //三张牌组合
        this.m_byThreeCount = 0;							            //三张牌组合数
        this.m_byGoodThreeCard = new Array(alg.MAX_COUNT);		    	//最佳三张牌组合
        this.m_byGoodThreeCount = 0;				            		//最佳三张牌组合数

        this.m_byTwoCard = new Array(alg.MAX_COUNT);					//两只牌组合
        this.m_byTwoCount = 0;              							//两只牌组合数
        this.m_byGoodTwoCard = new Array(alg.MAX_COUNT);				//最佳两只牌组合
        this.m_byGoodTwoCount = 0;              						//最佳两只牌组合数

        this.m_byRemainThree = new Array(alg.MAX_COUNT);				//移去最佳三只组合后的牌
        this.m_byRemainThreeCount = 0;					//移去最佳三只组合后的牌数

        this.m_byRemainTwo = new Array(alg.MAX_COUNT);				//移去最佳三只组合及两只组合后的牌
        this.m_byRemainTwoCount = 0;						//移去最佳三只组合及两只组合后的牌数

        this.m_nMaxScoreThree = 0;						//最佳三只牌组合分数
        this.m_nMaxScoreTwo  = 0;							//最佳两只牌组合分数
        this.m_nActionScore = 0;							//模拟操作得分

        this.m_nScoreThree = 0;							//临时三只牌组合分数
        this.m_nScoreTwo = 0;							//临时两只牌组合分数

        this.m_bHaveJiang = false;					//是否有将

        this.m_byBadlyCard = 0;				    	//最差牌

        //胡牌限制条this.件
       this.m_cbColorCount = 0;							//花色数目
       this.m_cbColor = [0, 0, 0, 0];							//花色数目
       this.m_cbMinColorCount = 0;						//最少花色

       this.init_data();
    };

    /**
     * 初始化成员数据
     */
    init_data(){
        for (let i = 0; i < alg.MAX_COUNT; ++i)
        {
            this.m_byCardData[i] = 0;
            this.m_bSelect[i]    = false;
            this.m_byThreeCard[i] = 0;		                    		    //三张牌组合
            this.m_byGoodThreeCard[i] = 0;                  		    	//最佳三张牌组合

            this.m_byTwoCard[i] = 0;	                    				//两只牌组合
            this.m_byGoodTwoCard[i] = 0;				                    //最佳两只牌组合

            this.m_byRemainThree[i] = 0;                    				//移去最佳三只组合后的牌

            this.m_byRemainTwo[i] = 0;				                        //移去最佳三只组合及两只组合后的牌
        };

        this.m_cbColor = [0, 0, 0, 0];
        this.m_byCardCount = 0;							                //原始牌数
        this.m_byThreeCount = 0;							            //三张牌组合数
        this.m_byGoodThreeCount = 0;				            		//最佳三张牌组合数
        this.m_byTwoCount = 0;              							//两只牌组合数
        this.m_byGoodTwoCount = 0;              						//最佳两只牌组合数
        this.m_byRemainThreeCount = 0;					//移去最佳三只组合后的牌数
    };

    /**
     * 设置玩家数据
     * @param cbCardData
     * @param byCardCount
     * @param weave
     * @constructor
     */
    SetCardData(cbCardData, byCardCount, weave)
    {
        this.init_data();

        this.m_byCardData = cbCardData.slice(0);
        for (let i = 0; i < byCardCount; i++)
        {
            if (this.m_byCardData[i] > 0)
            {
                this.m_cbColor[mj_utils.card_type(this.m_byCardData[i])]++;
            }
        }

        for (let i = 0; i < weave.length; i++)
        {
            let card = weave[i].cbCenterCard;
            this.m_cbColor[mj_utils.card_type(card)]++;
        }

        for( let i = 0; i < 3; i++ )
        {
            if( this.m_cbColor[i] > 0 )
                this.m_cbColorCount++;

            if( this.m_cbColor[i] < this.m_cbMinColorCount )
                this.m_cbMinColorCount = this.m_cbColor[i];
        }

    }

    /**
     * 获得最差的牌
     * @returns {number}
     * @constructor
     */
    GetBadlyCard(){
        return this.m_byBadlyCard;
    }

    /**
     * 获得最大分
     * @returns {number}
     * @constructor
     */
    GetMaxScore()
    {
        return (this.m_nActionScore+ this.m_nMaxScoreThree+ this.m_nMaxScoreTwo);
    }

    /**
     * 边界牌判断
     * @param byCard1
     * @param byCard2
     * @returns {boolean}
     * @constructor
     */
    IsEdge( byCard1,byCard2 )
    {
        let card1 = mj_utils.card_val(byCard1);
        let card2 = mj_utils.card_val(byCard2);
        if (card1 ===1 || card2 === 9)
        {
            return true;
        }

        return false;
    }

    /**
     * 搜索牌位置
     * @param byCardData
     * @param byStart
     * @returns {*}
     * @constructor
     */
    FindIndex( byCardData,byStart = 0 )
    {
        for( let i = byStart; i < this.m_byCardCount; i++ )
        {
            if( byCardData === this.m_byCardData[i] && !this.m_bSelect[i] )
                return i;
        }
        return -1;
    }

    /**
     * 在移除最佳三只后搜索牌
     * @param byCardData
     * @param byStart
     * @returns {*}
     * @constructor
     */
    FindIndexRemain( byCardData, byStart = 0 )
    {
        for( let i = byStart; i < this.m_byRemainThreeCount; i++ )
        {
            if( byCardData === this.m_byRemainThree[i] && !this.m_bSelect[i] )
                return i;
        }
        return -1;
    }


    /**
     * 搜索相同的牌
     * @param byCardData
     * @returns {{}}
     * @constructor
     */
    SearchSameCard( byCardData )
    {
        //
        let ret = {};
        ret.byIndex1 = -1;
        ret.byIndex2 = -1;

        ret.byIndex1 = this.FindIndex(byCardData);
        if( ret.byIndex1 === -1 ) return ret;
        ret.byIndex2 = this.FindIndex(byCardData, ret.byIndex1+1);
         return ret;
    }

    /**
     * 搜索连牌
     * @param byCardData
     * @returns {{}}
     * @constructor
     */
    SearchLinkCard(byCardData)
    {
        let ret = {};
        ret.byIndex1 = -1;
        ret.byIndex2 = -1;

        if( byCardData >= 29 ) return ret;

        //第二,三只
        let byCard1 = byCardData+1;
        let byCard2 = byCardData+2;
        let byType = mj_utils.card_type(byCardData);
        if( byCard1 >= 29 || byCard2 >= 29 || byType !== mj_utils.card_type(byCard1) || byType !== mj_utils.card_type(byCard2) ) {
            return ret;
        }

        //寻找
        ret.byIndex1 = this.FindIndex(byCard1);
        if( ret.byIndex1 === -1 ) return ret;
        ret.byIndex2 = this.FindIndex(byCard1);

        return ret;
    }

    /**
     * 搜索两只同牌
     * @param byCardData
     * @param byStart
     * @returns {*}
     * @constructor
     */
    SearchSameCardRemain(byCardData, byStart = 0)
    {
        return this.FindIndexRemain(byCardData,byStart);
    }

    /**
     * 搜索有卡连牌
     * @param byCardData
     * @param byLinkType
     * @param byStart
     * @returns {*}
     * @constructor
     */
    SearchLinkCardRemain(byCardData, byLinkType, byStart = 0)
    {
        //验证
        if( byCardData >= 29 ) return -1;
        //判断类型
        let byCard1 = 0;
        if( 0 === byLinkType )			//紧连
            byCard1 = byCardData+1;
        else if( 1 === byLinkType )		//有卡
            byCard1 = byCardData+2;
        //过滤
        if( byCard1 >= 29 || mj_utils.card_val(byCardData) !== mj_utils.card_val(byCard1) ) return -1;
        return this.FindIndexRemain(byCard1,byStart);
    }

    /**
     * 删除指定位置的牌
     * @param index
     * @returns {boolean}
     */
    remove_card(index){
        if (this.m_byCardCount < 1)
        {
            return false;
        }

        if (index < 0 || index > alg.MAX_INDEX )
        {
            return false;
        }

        //删除
        let byCount = this.m_byCardCount;
        this.m_byCardCount = 0;
        let bFound = false;
        for( let i = 0; i < byCount; i++ )
        {
            if( i === index )
            {
                bFound = true;
                continue;
            }
            this.m_byCardData[this.m_byCardCount++] = this.m_byCardData[i];
        }

        if( bFound )
            this.m_byCardData[byCount-1] = 0;

        return bFound;
    }

    /**
     * 删除一张指定的牌
     * @param card
     * @returns {boolean}
     */
    remove_card_data(card){
        if (this.m_byCardCount < 1)
        {
            return false;
        }

        if (card < 1 || card > alg.MAX_INDEX )
        {
            return false;
        }

        //删除
        let byCount = this.m_byCardCount;
        this.m_byCardCount = 0;
        let bFound = false;
        for( let i = 0; i < byCount; i++ )
        {
            if( ! bFound && this.m_byCardData[i] === card )
            {
                bFound = true;
                continue;
            }
            this.m_byCardData[this.m_byCardCount++] = this.m_byCardData[i];
        }

        if( bFound )
            this.m_byCardData[byCount-1] = 0;

        return bFound;
    }

}

module.exports = AndroidAIBase;
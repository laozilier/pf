/*
* 麻将算法
* */

export default class MJAlgorithm
{
    private static _instance: MJAlgorithm;

    static instance() : MJAlgorithm
    {
        if(this._instance == null)
        {
            this._instance = new MJAlgorithm();
        }
        return this._instance;
    }


    /**
     * 获取一整副洗好的麻将
     */
    getCards()
    {
        return null;
    }

    /*
    * 是否能碰
    * @param cardArr: 手上的牌
    */
    isCanPeng(cardArr)
    {
        return true;
    }

    /*
    * 是否能吃
    * @param cardArr: 手上的牌
    */
    isCanEat(cardArr)
    {
        return true;
    }


    /*
    * 是否能杠
    * @param cardArr: 手上的牌
    */
    isCanGang(cardArr)
    {
        return true;
    }

    /*
    * 是否能胡
    * @param cardArr: 手上的牌
    * @param waterArr : 下水牌(已经碰了 或者 杠了的牌)
    */
    isWinning(cardArr, waterArr)
    {
        return true;
    }

    onDestory()
    {
        MJAlgorithm._instance = null;
    }



} // end class


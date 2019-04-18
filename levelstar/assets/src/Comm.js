
var TipPrefab = require("./prefab/TipPrefab.js");
var ConfirmDialogPrefab = require("./prefab/ConfirmDialogPrefab.js");
module.exports={
    // 网格大小
    gridSize:10,

    // 计算消除得分
    calcClearScore: function (count){
        return count * count * 5;
    },
    // 计算剩余星星所能得的分
    calcLastScore: function(count){
        return Math.max(0, 2000 - count*count*20)
    },
    // 显示一个tip
    tip: function(tipStr){
        console.log("tip")
        // 加载 Prefab
        cc.loader.loadRes("prefab/TipPrefab", function (err, prefab) {
            if (err) {
                console.log(err);
                return;
            }
            var newNode = cc.instantiate(prefab);
            cc.director.getScene().addChild(newNode);
            newNode.getComponent(TipPrefab).show(tipStr);
        });
    },
    // 弹出一个确认框
    confirm: function(title, content, btn1Str, btn1Cb, btn2Str, btn2Cb){
        console.log("confirm")
        // 加载 Prefab
        cc.loader.loadRes("prefab/ConfirmDialogPrefab", function (err, prefab) {
            if (err) {
                console.log(err);
                return;
            }
            var newNode = cc.instantiate(prefab);
            cc.director.getScene().addChild(newNode);
            newNode.getComponent(ConfirmDialogPrefab).show(title, content, btn1Str, btn1Cb, btn2Str, btn2Cb);
        });
    },
    // 读取所有关卡的分数
    readLevelScores:function() {
        var strScores = cc.sys.localStorage.getItem("LEVEL_SCORES");
        if (strScores) {
            this.levelScores = JSON.parse(strScores);
        }else{
            this.levelScores = {};
        }

        // cc.sys.localStorage.setItem("LEVEL_SCORES", null);
    },
    // 保存所有关卡的分数
    saveLevelScores:function() {
        var strScores = JSON.stringify(this.levelScores);
        cc.sys.localStorage.setItem("LEVEL_SCORES", strScores);
    },
    // 计算分数逻辑，总分，最低分关卡，下一关解锁信息等
    calcScoreLogic:function() {
        // 总分
        this.totalScore = 0;
        // 最低分关卡
        this.minScoreLevel = 0;
        // 倒数第二分关卡
        this.min2ScoreLevel = 0;

        // 总分
        for(var i in this.levelScores) {
            var score = this.levelScores[i];
            this.totalScore += score; // 总分
        }

        // 最大关卡
        var maxLevel = 0;
        console.log(this.totalScore, this.calcTargetScore(maxLevel));
        while(this.totalScore >= this.calcTargetScore(maxLevel)) {
            maxLevel++;
        }
        this.maxLevel = maxLevel;

        // 最低分关卡的得分
        var minScore = Number.POSITIVE_INFINITY;
        // 倒数第二分关卡的得分
        var min2Score = Number.POSITIVE_INFINITY;
        for(var i = 1; i <= this.maxLevel; i++){
            var score = this.levelScores[i.toString()];
            if (!score){score=0;}
            if (score < minScore || (score == minScore && this.minScoreLevel > i)) {
                minScore = score;
                this.min2ScoreLevel = this.minScoreLevel;
                this.minScoreLevel = i;
            } else if (score < min2Score || (score == min2Score && this.min2ScoreLevel > i)) {
                min2Score = score;
                this.min2ScoreLevel = i;
            }
        }
    },
    // 计算关卡目标分数
    calcTargetScore: function(level) {
        if (!this.levelCfg){this.levelCfg = {}}
        if (this.levelCfg[level.toString()]){return this.levelCfg[level.toString()]}
        var r = 1000;
        if (level > 1) {
            r = this.calcTargetScore(level-1);
            r = r + (0 == r % 2 ? 2000 : 3000);
            r = r + Math.floor(level / 10) * 300;
        }else if(level == 0){
            r = 0;
        }
        this.levelCfg[level.toString()] = r;
        return r;
    },
    // 设置某一关的分数
    setLevelScore: function(level, score) {
        console.log("setLevelScore", level, score);
        this.levelScores[level.toString()] = score;
    },
    // 计算目标分的字符串
    calcTargetStr: function() {
        this.targetStrTab = {};
        // 超过倒数第二关的目标分
        var target1Score = 0;
        if (this.min2ScoreLevel && this.min2ScoreLevel != 0){
            target1Score = this.levelScores[this.min2ScoreLevel];
            if (target1Score) {
                target1Score ++; // 要超过倒数第二，所以得加一分，要不然不能算超过
            } else {
                target1Score = 0;
            }
        }
        var target2Score = 0;
        if (this.maxLevel){
            // 目标分=解锁分-(总分-当前关分)
            var curScore = this.levelScores[this.currentLevel];
            if (! curScore) {
                curScore = 0;
            }

            target2Score = this.calcTargetScore(this.maxLevel)-(this.totalScore-curScore);
        }
        if (target1Score > target2Score) {
            if (target2Score > 0){
                this.targetStrTab.littleTarget = target2Score;
                this.targetStrTab.littleTargetStr = "(解锁第" + (this.maxLevel+1) + "关)\n";
                this.targetStrTab.bigTarget = target1Score;
                this.targetStrTab.bigTargetStr = "(超过第" + this.min2ScoreLevel + "关)";
            } else {
                this.targetStrTab.oneTarget = target1Score;
                this.targetStrTab.oneTargetStr = "(超过第" + this.min2ScoreLevel + "关)";
            }
        } else {
            if (target1Score > 0){
                this.targetStrTab.littleTarget = target1Score;
                this.targetStrTab.littleTargetStr = "(超过第" + this.min2ScoreLevel + "关)";
                this.targetStrTab.bigTarget = target2Score;
                this.targetStrTab.bigTargetStr = "(解锁第" + (this.maxLevel+1) + "关)\n";
            } else {
                this.targetStrTab.oneTarget = target2Score;
                this.targetStrTab.oneTargetStr = "(解锁第" + (this.maxLevel+1) + "关)\n";
            }
        }
    },
};





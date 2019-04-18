var StarPrefab = require("../prefab/StarPrefab.js");
var Comm = require("../Comm.js");
cc.Class({
    extends: cc.Component,

    properties: {
        starPrefab:cc.Prefab,
        starGrid:cc.Node,
        scoreLabel:cc.Label,
        scorePreLabel:cc.Label,
        targetLabel:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        this.starGame();
        this.starGrid.on(cc.Node.EventType.TOUCH_START, function(e){
            var pos = self.starGrid.convertToNodeSpace(e.touch.getLocation());
            self.touchStar(parseInt(pos.x / (self.starGrid.width/10)),parseInt(pos.y / (self.starGrid.height/10)));
        });

        // 适配屏幕
        var size = cc.director.getWinSize();
        this.scoreLabel.node.y = size.height/2 - (size.height-size.width)/2/2;
        this.targetLabel.node.y = size.height/2 - 50;
    },
    // 开始游戏
    starGame: function () {
        this.initStatus();
        this.initGrid();
        Comm.calcTargetStr()
        this.targetButtonClick();
        this.updateTargetLabel();
    },
    // 初始化状态变量
    initStatus: function () {
        // 存放状态变量的对象
        this.stVar = {};
        // 是否在选中状态
        this.stVar.selected = false;
        // 总分
        this.totalScore = 0;
    },
    // 生成网格
    initGrid: function () {
        // 清空原来的
        if (this.gridStarUi) {
            for (var x = 0; x < Comm.gridSize; x++) {
                for (var y = 0; y < Comm.gridSize; y++) {
                    if (this.gridStarUi[x][y]) {
                        this.gridStarUi[x][y].destroy();
                    }
                }
            }
        }
        // 网格数据
        var gridData = [];
        // 网格星星ui
        var gridStarUi = [];
        for (var i = 0; i < Comm.gridSize; i++) {
            gridData[i] = [];
            gridStarUi[i] = [];
            for (var j = 0; j < Comm.gridSize; j++) {
                var star = cc.instantiate(this.starPrefab);
                var starClass = star.getComponent(StarPrefab);
                star.parent = this.starGrid;
                starClass.setGridXY(i,j);
                var rnd = parseInt(Math.random()*5 + 1);
                starClass.setType(rnd);
                gridData[i][j] = rnd;
                gridStarUi[i][j] = star;
            }
        }
        this.gridData = gridData;
        this.gridStarUi = gridStarUi;
    },
    // 更新目标分label
    updateTargetLabel: function () {
        if (Comm.targetStrTab.oneTarget) {
            if (this.totalScore >= Comm.targetStrTab.oneTarget) {
                this.targetLabel.string = "目标:" + Comm.targetStrTab.oneTarget + "分(已完成)";
            } else {
                this.targetLabel.string = "目标:" + Comm.targetStrTab.oneTarget + "分";
            }
        }else{
            if (this.totalScore < Comm.targetStrTab.littleTarget) {
                this.targetLabel.string = "小目标:" + Comm.targetStrTab.littleTarget + "分";
            } else if(this.totalScore < Comm.targetStrTab.bigTarget){
                this.targetLabel.string = "大目标:" + Comm.targetStrTab.bigTarget + "分";
            } else {
                this.targetLabel.string = "大目标:" + Comm.targetStrTab.bigTarget + "分(已完成)";
            }
        }
    },
    // 点击了一个星星，xy为数据坐标
    touchStar: function (x,y) {
        if (this.stVar.selected) {
            if (this.connectContain(x,y)) {
                // 如果点击了已被选中的星星
                this.cleanOnce(x, y);
                this.stVar.selected = false;
            } else {
                // 如果点击了未被选中的星星
                this.setConnectStarSelect(false);
                this.scorePreLabel.node.active = false;
                this.touchStar(x,y);
            }
        } else {
            if (this.gridData[x][y] == 0) {return;}
            // 相连的星星
            this.stVar.connectStars = [[x, y]];
            this.checkStar(x, y);
            if (this.stVar.connectStars.length >= 2) {
                this.setConnectStarSelect(true);
                this.scorePreLabel.string = Comm.calcClearScore(this.stVar.connectStars.length);
                this.scorePreLabel.node.stopAllActions();
                this.scorePreLabel.node.setPosition(this.gridStarUi[x][y].position);
                this.scorePreLabel.node.opacity = 255;
                this.scorePreLabel.fontSize = 32;
                this.scorePreLabel.node.active = true;
            }
        }
    },
    // 递归查找相连的星星
    checkStar: function (x, y) {
        var starType = this.gridData[x][y];
        // 要扫描的4个星星（上下左右）
        var scanStar = [[x+1, y],[x-1, y],[x, y-1],[x, y+1]];
        for (var i = scanStar.length - 1; i >= 0; i--) {
            scanStar[i]
            var scanX = scanStar[i][0];
            var scanY = scanStar[i][1];
            if (this.inGrid(scanX, scanY)
                && this.gridData[scanX][scanY] == starType
                && (! this.connectContain(scanX, scanY))
                ) {
                this.stVar.connectStars[this.stVar.connectStars.length] = [scanX, scanY];
                this.checkStar(scanX, scanY);
            }
        }
    },
    // 是否在网格范围内
    inGrid: function (x,y) {
        return x >= 0 && x < Comm.gridSize && y >= 0 && y < Comm.gridSize
    },
    // 相连数组里是否有该坐标
    connectContain: function(x, y){
        for (var i = this.stVar.connectStars.length - 1; i >= 0; i--) {
            var star = this.stVar.connectStars[i];
            if (star[0] == x && star[1] == y) {
                return true;
            }
        }
        return false;
    },
    // 选中或取消选中，相连的星星
    setConnectStarSelect: function (selected) {
        for (var i = this.stVar.connectStars.length - 1; i >= 0; i--) {
            var star = this.stVar.connectStars[i];
            this.gridStarUi[star[0]][star[1]].getComponent(StarPrefab).setSelected(selected);
        }
        this.stVar.selected = selected;
    },
    // 做一次消除操作
    cleanOnce: function () {
        var self = this;
        // 计算得分
        this.scorePreLabel.fontSize = 64;
        this.scorePreLabel.node.runAction(cc.sequence(
            cc.moveBy(0.2, cc.p(0, 20)),
            cc.delayTime(0.8),
            cc.spawn(cc.moveBy(0.2,cc.p(0, 10)), cc.fadeOut(0.2))
            ));
        this.totalScore += parseInt(this.scorePreLabel.string);
        this.scoreLabel.string = this.totalScore;
        this.updateTargetLabel();
        // 清除星星
        this.clearConnectStar();
        // 让星星下落
        this.fallDownStar();
        // 让星星往左靠
        this.fallLeftStar();
        // 检测本关是否结束
        if (this.checkOver()){
            console.log("不能再消除了");
            var lastCount = this.checkCount();
            var lastCountScore = Comm.calcLastScore(lastCount);
            this.totalScore += lastCountScore;
            this.scoreLabel.string = this.totalScore;
            console.log("计算剩余星星分");
            console.log("最终得分", this.totalScore);

            // 目标完成情况
            var dlgStr = "";
            if (Comm.targetStrTab.oneTarget) {
                var isOk = "已完成";
                if (this.totalScore < Comm.targetStrTab.oneTarget) {isOk="未完成";}
                dlgStr = "目标:" + Comm.targetStrTab.oneTarget + "分" + Comm.targetStrTab.oneTargetStr + isOk;
            } else {
                var isOk1 = "已完成";
                if (this.totalScore < Comm.targetStrTab.littleTarget) {isOk1="未完成";}
                var isOk2 = "已完成";
                if (this.totalScore < Comm.targetStrTab.bigTarget) {isOk2="未完成";}
                dlgStr = "小目标:" + Comm.targetStrTab.littleTarget + "分" + Comm.targetStrTab.littleTargetStr + isOk1 +"\n"
                + "大目标:" + Comm.targetStrTab.bigTarget + "分" + Comm.targetStrTab.bigTargetStr + isOk2;
            }

            // 历史最高分
            var lastScore = Comm.levelScores[Comm.currentLevel.toString()]
            if (!lastScore || this.totalScore > lastScore) {
                console.log("破记录了");
                Comm.setLevelScore(Comm.currentLevel, this.totalScore);
                // Comm.levelScores[Comm.currentLevel.toString()] = this.totalScore;
                Comm.saveLevelScores();
                Comm.calcScoreLogic();
            }
            Comm.confirm(
                "不能再消除了",
                "您的得分:" + this.totalScore + "(其中剩余星星"+ lastCount + "附加分:" + lastCountScore + ")",
                "确定",function(){
                    Comm.confirm(
                        "目标",
                        dlgStr,
                        "回主菜单",function(){
                            cc.director.loadScene("MainScene");
                        });
                });
        }
    },
    // 清除相连数组里的星星
    clearConnectStar: function () {
        for (var i = this.stVar.connectStars.length - 1; i >= 0; i--) {
            var star = this.stVar.connectStars[i];
            this.gridData[star[0]][star[1]] = 0;
            this.gridStarUi[star[0]][star[1]].destroy();
        }
    },
    // 让星星下落
    fallDownStar: function () {
        // 遍历每一列
        for (var x=0; x < Comm.gridSize; x++) {
            // 下落的距离
            var fallDistance = 0;
            // 从下往上，遍历每一个星星
            for (var y = 0; y < Comm.gridSize; y++){
                // 如果是空，则增加一个下落距离
                if (this.gridData[x][y] == 0){
                    fallDistance++;
                }
                // 如果需要下落且当前不是空，就记录到下落数组里
                if (fallDistance > 0 && this.gridData[x][y] > 0){
                    this.gridData[x][y - fallDistance] = this.gridData[x][y];
                    this.gridData[x][y] = 0;
                    this.gridStarUi[x][y].getComponent(StarPrefab).goTo(x,y - fallDistance, 0);
                    this.gridStarUi[x][y - fallDistance] = this.gridStarUi[x][y];
                    this.gridStarUi[x][y] = null;
                }
            }
        }
    },
    // 让星星左靠
    fallLeftStar: function () {
        // 左靠距离
        var fallLeftDistance = 0;
        for (var x = 0; x < Comm.gridSize; x++) {
            // 如果最底下的星星是空，则整列都是空，就加一个距离
            if (this.gridData[x][0] == 0) {
                fallLeftDistance++;
            }
            // 如果该列有星星，并且需要左靠
            if (this.gridData[x][0] != 0 && fallLeftDistance != 0) {
                // 执行左靠
                for (var y = 0; y < Comm.gridSize; y++) {
                    if (this.gridData[x][y] > 0) {
                        this.gridData[x - fallLeftDistance][y] = this.gridData[x][y];
                        this.gridData[x][y] = 0;
                        this.gridStarUi[x][y].getComponent(StarPrefab).goTo(x - fallLeftDistance, y, 0.1);
                        this.gridStarUi[x - fallLeftDistance][y] = this.gridStarUi[x][y];
                        this.gridStarUi[x][y] = null;
                    } else {
                        break;
                    }
                }
            }
        }
    },
    checkOver: function() {

        // 先遍历列，效率高一些，因为如果一个星星为空，那上面一定没有星星了
        for (var x=0; x < Comm.gridSize; x++){
            for (var y=0; y < Comm.gridSize; y++){
                var starType = this.gridData[x][y];
                if (starType == 0){
                    break;
                }
                // 要扫描的4个星星（上下左右）
                var scanStar = [[x+1, y],[x-1, y],[x, y-1],[x, y+1]];
                for (var i = 0; i < scanStar.length; i++) {
                    // 如果被扫描的4个中有相连的，就直接返回false
                    var tmpX = scanStar[i][0];
                    var tmpY = scanStar[i][1];
                    if (this.inGrid(tmpX, tmpY) && this.gridData[tmpX][tmpY] == starType){
                        return false
                    }
                }
            }
        }
        return true
    },
    // 检测剩余多少个星星
    checkCount: function() {
        var count = 0;
        for (var x=0; x < Comm.gridSize; x++){
            for (var y=0; y < Comm.gridSize; y++){
                var starType = this.gridData[x][y];
                if (starType > 0){
                    count ++;
                }
            }
        }
        return count;
    },
    // 点击目标分
    targetButtonClick:function () {
        var dlgStr = "";
        if (Comm.targetStrTab.oneTarget) {
            dlgStr = "目标:" + Comm.targetStrTab.oneTarget + "分" + Comm.targetStrTab.oneTargetStr;
        } else {
            dlgStr = "小目标:" + Comm.targetStrTab.littleTarget + "分" + Comm.targetStrTab.littleTargetStr + "\n"
            + "大目标:" + Comm.targetStrTab.bigTarget + "分" + Comm.targetStrTab.bigTargetStr;
        }
        console.log(dlgStr);
        Comm.confirm(
            "目标",
            dlgStr,
            "确定",
            function(){},
        );
    }
});

// グローバル変数
var UNIT = 500;

var men = 1;

var curX = UNIT / 2;
var curY = UNIT / 2;
var CURSPEED = 10;

var pointX = UNIT / 2;
var pointY = UNIT / 2;

var isDrag = false;

var myMAX = 30;
var myMissile = new Array(myMAX);
var myCt = 0;
var myBaseCt = new Array(3); // [3]
var myBaseMAX = 10;
var MYSPEED = 5;

var eMAX = 0x20;
var eMissile = new Array(eMAX);
var eCount = 0;
var ESPEED = 2.5;

var Gtime = 0;

/**
* @return {null}
*/
window.onload = function() {

    // FPS計算 ---------------------------------------------

    var FPS = function(target) {
        this.target = target; // 目標FPS
//        this.interval = 1000 / target; // setTimeoutに与えるインターバル
        this.interval = 2000 / target; // setTimeoutに与えるインターバル
        this.checkpoint = new Date();
        this.fps = 0;
    };
    FPS.prototype = {
        // checkからcheckまでの時間を元にFPSを計算
        check: function() {
            var now = new Date();
            this.fps = 1000 / (now - this.checkpoint);
            this.checkpoint = new Date();
        },
        // 現在のFPSを取得
        getFPS: function() {
            return this.fps.toFixed(2);
        },
        // 次回処理までのインターバルを取得
        getInterval: function() {
            var elapsed = new Date() - this.checkpoint;
            return this.interval - elapsed > 10 ? this.interval - elapsed : 10;
        }
    };

    // メイン処理 ------------------------------------------

    canvas = document.getElementById('id_canvas1');
    if (!canvas || !canvas.getContext) {
        alert('HTML5対応ブラウザで見てちょうだい!');
        return false;
    }
    cc = canvas.getContext('2d');

    // 20FPSでアニメーション
    var fps = new FPS(20);

    // スクリーンサイズ初期化 // 仮想スクリーンサイズは 256 x 256
    screen_unitX = canvas.width;
    screen_unitY = canvas.height;
    if (canvas.width > canvas.height) {
        screen_unit = canvas.height;
    }
    else {
        screen_unit = canvas.width;
    }

    // データいろいろ初期化
    initData();

    fireEnemy(); // 敵機発射

    canvas.addEventListener('mousedown', mousedownfunc, true);
    canvas.addEventListener('touchstart', touchstartfunc, true);
    canvas.addEventListener('mousemove', mousemovefunc, false);
    canvas.addEventListener('touchmove', touchmovefunc, false);
    canvas.addEventListener('mouseup', mouseupfunc, true);
    canvas.addEventListener('mouseout', mouseupfunc, false);
    canvas.addEventListener('touchend', touchendfunc, false);

    // ループ処理ぐるぐる!
    var loop = function() {
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;

        if (canvas.width > canvas.height) {
            screen_unit = canvas.height;
            screen_unitX = canvas.height;
            screen_unitY = canvas.height;
            adjX = (canvas.width - canvas.height) / 2;
            adjY = 0;
        }
        else {
            screen_unit = canvas.width;
            screen_unitX = canvas.width;
            screen_unitY = canvas.width;
            adjX = 0;
            adjY = (canvas.height - canvas.width) / 2;
        }

        fps.check();
        cc.save();

        cc.fillStyle = '#404040';
        cc.fillRect(0, 0, canvas.width, canvas.height);
        cc.fillStyle = '#000000';
        cc.fillRect(calcUnitX(0), calcUnitY(0),
                    calcUnit(UNIT), calcUnit(UNIT));

        if (isDrag) {
            curMove();
        }

        // 自ミサイル
        for (let i = 0; i < myCt; i++) {
                if (myMissile[i].fired) {
                    if (!myMissile[i].bomb) {
                        drawCross(myMissile[i], '#ff8000'); // 十字描画
                        drawTail(myMissile[i], '#808020'); // しっぽ描画
                        drawDantou(myMissile[i], '#ffff80'); // 弾頭描画
                    }
                    //myMissile[i][j].calcPos(Gtime); // 座標計算
                }
        }
        // 敵ミサイル
        for (let i = 0; i < eCount; i++) {
            if (eMissile[i].fired) {
                if (!eMissile[i].bomb) {
                    drawTail(eMissile[i], '#802080'); // しっぽ描画
                    drawDantou(eMissile[i], '#ff80ff'); // 弾頭描画
                }
                //eMissile[i].calcPos(Gtime); // 座標計算
            }
        }
        // 自ミサイル (爆炎を最後に描画(しっぽ/軌跡を上書き))
        for (let i = 0; i < myCt; i++) {
            if (myMissile[i].fired && myMissile[i].bomb) {
                drawBomb(myMissile[i]); // 爆炎描画
                // 当たり判定
                for (let k = 0; k < eCount; k++) {
                    if (eMissile[k].fired && !eMissile[k].bomb) {
                        checkHit(myMissile[i], eMissile[k]);
                    }
                }
            }
            myMissile[i].calcPos(Gtime); // 座標計算
        }
        // 敵ミサイル
        for (let i = 0; i < eCount; i++) {
            if (eMissile[i].fired) {
                if (eMissile[i].bomb) {
                    drawBomb(eMissile[i]); // 爆炎描画
                }
                eMissile[i].calcPos(Gtime); // 座標計算
            }
        }

        // カーソル描画
        cc.strokeStyle = '#ff8000';
        cc.lineWidth = calcUnit(1);
        cc.beginPath();
        var curLen = calcUnit(5);
        cc.moveTo(calcUnitX(curX), calcUnitY(curY) - curLen);
        cc.lineTo(calcUnitX(curX), calcUnitY(curY) + curLen);
        cc.stroke();
        cc.beginPath();
        cc.moveTo(calcUnitX(curX) - curLen, calcUnitY(curY));
        cc.lineTo(calcUnitX(curX) + curLen, calcUnitY(curY));
        cc.stroke();

        cc.restore();
        setTimeout(loop, fps.getInterval());
        Gtime++;
    };

    loop();
};

function checkHit(m, e) {
    let x = m.goalX - e.cX;
    let y = m.goalY - e.cY;

    if ((x * x) + (y * y) - (m.r * m.r) <= 0) {
        e.goalX = e.cX;
        e.goalY = e.cY;
        e.bomb = true;
        e.startTime = Gtime;
        e.totalTime = 0;
    }
}

function drawBomb(m) {
    cc.fillStyle = 'rgb(' +
        (~~(256 * Math.random())) + ', ' +
        (~~(256 * Math.random())) + ', ' +
        (~~(256 * Math.random())) + ')';
    cc.beginPath();
    cc.arc(calcUnitX(m.goalX), calcUnitY(m.goalY),
           calcUnit(m.r), 0,
           Math.PI * 2, false);
    cc.fill();
}

function drawCross(missile, color) {
    cc.strokeStyle = color;
    cc.lineWidth = calcUnit(1);
    cc.beginPath();
    let curLen = calcUnit(5);
    let x = calcUnitX(missile.goalX);
    let y = calcUnitY(missile.goalY);
    cc.moveTo(x - curLen, y - curLen);
    cc.lineTo(x + curLen, y + curLen);
    cc.stroke();
    cc.beginPath();
    cc.moveTo(x + curLen, y - curLen);
    cc.lineTo(x - curLen, y + curLen);
    cc.stroke();
}
function drawTail(missile, color) {
    cc.strokeStyle = color;
    cc.lineWidth = calcUnit(1);
    cc.beginPath();
    cc.moveTo(calcUnitX(missile.startX),
              calcUnitY(missile.startY));
    cc.lineTo(calcUnitX(missile.cX),
              calcUnitY(missile.cY));
    cc.stroke();
}
function drawDantou(missile, color) {
    cc.fillStyle = '#ffff80';
    let x = calcUnitX(missile.cX);
    let y = calcUnitY(missile.cY);
    cc.beginPath();
    cc.moveTo(x - 1, y - 1);
    cc.lineTo(x + 1, y - 1);
    cc.lineTo(x + 1, y + 1);
    cc.closePath();
    cc.fill();
}
function initData() {
    myBaseCt[0] = 0;
    myBaseCt[1] = 0;
    myBaseCt[2] = 0;
    for (let i = 0; i < myMAX; i++) {
        myMissile[i] = new Missile();
        //myMissile[i].init((UNIT / 6) * ((i * 2) + 1), UNIT * 0.95);
    }
    for (i = 0; i < eMAX; i++) {
        eMissile[i] = new Missile();
        eMissile[i].init(0, 0);
    }
}

function fireEnemy() {
    //let mNum = men;//men + 1; // ToDo
    let mNum = 4; 
    if (mNum > 4) {
        mNum = 4;
    }
    for (let i = 0; i < mNum; i++) {
        eMissile[eCount].init(Math.random() * UNIT, 0);
        eMissile[eCount].fire(Math.random() * UNIT, UNIT * 0.95, ESPEED, Gtime);
        eCount++;
    }
/*
    mNum = (men + 1) / 2;
    if (mNum > 2) {
        mNum = 2;
    }
    for (i = mNum; i > 0; i--) {
        eMissile[eCount++].fire(MathFP.toFP((rand.nextInt() >>> 1) % 100), 0
                                , baseXf[(rand.nextInt() >>> 1) % 3]
                                , baseYfc
                                , e_Speed);
        eCount &= 0x1f;
    }
    menStart = true;
*/
}

function curMove() {
    curX += Math.cos(Math.atan2(pointY - curY, pointX - curX)) * CURSPEED;
    curY += Math.sin(Math.atan2(pointY - curY, pointX - curX)) * CURSPEED;
    if (curX > UNIT) {
        curX = UNIT;
    }
    else if (curX < 0) {
        curX = 0;
    }
    if (curY > UNIT) {
        curY = UNIT;
    }
    else if (curY < 0) {
        curY = 0;
    }
}

// マウスダウン
function mousedownfunc(event) {
    let rect = event.target.getBoundingClientRect();
    pointX = acalcUnitX(event.clientX - rect.left);
    pointY = acalcUnitY(event.clientY - rect.top);
    isDrag = true;
}

// タッチスタート
function touchstartfunc(event) {
    event.preventDefault();
    let rect = event.target.getBoundingClientRect();
    pointX = acalcUnitX(event.touches[0].clientX - rect.left);
    pointY = acalcUnitY(event.touches[0].clientY - rect.top);
    isDrag = true;
}

// マウスムーブ
function mousemovefunc(event) {
    let rect = event.target.getBoundingClientRect();
    pointX = acalcUnitX(event.clientX - rect.left);
    pointY = acalcUnitY(event.clientY - rect.top);
}

// タッチムーブ
function touchmovefunc(event) {
    event.preventDefault();
    let rect = event.target.getBoundingClientRect();
    pointX = acalcUnitX(event.touches[0].clientX - rect.left);
    pointY = acalcUnitY(event.touches[0].clientY - rect.top);
}

// マウスアップ
function mouseupfunc(event) {
    //let rect = event.target.getBoundingClientRect();
    //let x = acalcUnitX(event.clientX - rect.left);
    //let y = acalcUnitY(event.clientY - rect.top);

    isDrag = false;
    fire(curX, curY);
}

// タッチエンド
function touchendfunc(event) {
    isDrag = false;
    fire(curX, curY);
}

function fire(x, y) {
    if (x > UNIT / 3 && x <= UNIT * 2 / 3) { // 真ん中
        if (myBaseCt[1] != myBaseMAX) {
            setPoint(1, x, y);
        }
        else if (x <= UNIT / 2) {
            if (myBaseCt[0] != myBaseMAX) {
                setPoint(0, x, y);
            }
            else if (myBaseCt[2] != myBaseMAX) {
                setPoint(2, x, y);
            }
        }
        else {
            if (myBaseCt[2] != myBaseMAX) {
                setPoint(2, x, y);
            }
            else if (myBaseCt[0] != myBaseMAX) {
                setPoint(0, x, y);
            }
        }
    }
    else if (x <= UNIT / 3) {
        if (myBaseCt[0] != myBaseMAX) {
            setPoint(0, x, y);
        }
        else if (myBaseCt[1] != myBaseMAX) {
            setPoint(1, x, y);
        }
        else if (myBaseCt[2] != myBaseMAX) {
            setPoint(2, x, y);
        }
    }
    else if (x > UNIT * 2 / 3) {
        if (myBaseCt[2] != myBaseMAX) {
            setPoint(2, x, y);
        }
        else if (myBaseCt[1] != myBaseMAX) {
            setPoint(1, x, y);
        }
        else if (myBaseCt[0] != myBaseMAX) {
            setPoint(0, x, y);
        }
    }
}

function setPoint(base, x, y) {
    myMissile[myCt].init((UNIT / 6) * ((base * 2) + 1), UNIT * 0.95);
    myMissile[myCt].fire(x, y, MYSPEED, Gtime);
    myCt++;
    myBaseCt[base]++;
}

function calcUnit(n) {
    return Math.floor((screen_unit * n) / UNIT);
}
function calcUnitX(n) {
    return Math.floor(adjX + (screen_unitX * n) / UNIT);
}
function calcUnitY(n) {
    return Math.floor(adjY + (screen_unitY * n) / UNIT);
}

function acalcUnit(n) {
    return (n * UNIT) / screen_unit;
}
function acalcUnitX(n) {
    return ((n - adjX) * UNIT) / screen_unitX;
}
function acalcUnitY(n) {
    return ((n - adjY)  * UNIT) / screen_unitY;
}

// グローバル変数
var UNIT = 500;

var curX = UNIT / 2;
var curY = UNIT / 2;
var CURSPEED = 10;

var pointX = UNIT / 2;
var pointY = UNIT / 2;

var isDrag = false;

var myMAX = 10;
var myMissile = new Array(3); // [3][10] の配列にする
var myCount = new Array(3); // [3]
var MYSPEED = 5;

var Gtime = 0;

var Pos = function(x, dx, y, dy) {
    this.x = x;
    this.dx = dx;
    this.y = y;
    this.dy = dy;
    this.time = 0;
    this.move = function() {
        this.x += this.dx;
        this.y += this.dy;
        this.time++;
    };
};


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

    canvas.addEventListener('mouseup', mouseupfunc, true);
    canvas.addEventListener('mouseout', mouseupfunc, false);
    canvas.addEventListener('mousedown', mousedownfunc, true);
    canvas.addEventListener('mousemove', mousemovefunc, false);

    // ループ処理ぐるぐる!
    var loop = function() {
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        screen_unitX = canvas.width;
        screen_unitY = canvas.height;
        if (canvas.width > canvas.height) {
            screen_unit = canvas.height;
        }
        else {
            screen_unit = canvas.width;
        }

        fps.check();
        cc.save();

        cc.fillStyle = '#000000';
        cc.fillRect(0, 0, canvas.width, canvas.height);

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

        if (isDrag) {
            curMove();
        }

        for(let i = 0; i < 3; i++) {
            for (let j = 0; j < 10; j++) {
                if (myMissile[i][j].fired) {
                    if (myMissile[i][j].bomb) {
                        cc.fillStyle = 'rgb(' +
                            (~~(256 * Math.random())) + ', ' +
                            (~~(256 * Math.random())) + ', ' +
                            (~~(256 * Math.random())) + ')';
                        cc.beginPath();
                        cc.arc(calcUnitX(myMissile[i][j].goalX),
                               calcUnitY(myMissile[i][j].goalY),
                               calcUnit(myMissile[i][j].r), 0, Math.PI * 2, false);
                        cc.fill();
                    }
                    else {
                        // ゴール
                        cc.strokeStyle = '#ff8000';
                        cc.lineWidth = calcUnit(1);
                        cc.beginPath();
                        let curLen = calcUnit(5);
                        let x = calcUnitX(myMissile[i][j].goalX);
                        let y = calcUnitY(myMissile[i][j].goalY);
                        cc.moveTo(x - curLen, y - curLen);
                        cc.lineTo(x + curLen, y + curLen);
                        cc.stroke();
                        cc.beginPath();
                        cc.moveTo(x + curLen, y - curLen);
                        cc.lineTo(x - curLen, y + curLen);
                        cc.stroke();

                        // しっぽ
                        cc.strokeStyle = '#808020';
                        cc.lineWidth = calcUnit(1);
                        cc.beginPath();
                        cc.moveTo(calcUnitX(myMissile[i][j].startX),
                                  calcUnitY(myMissile[i][j].startY));
                        cc.lineTo(calcUnitX(myMissile[i][j].cX),
                                  calcUnitY(myMissile[i][j].cY));
                        cc.stroke();

                        // 弾頭
                        cc.fillStyle = '#ffff80';
                        x = calcUnitX(myMissile[i][j].cX);
                        y = calcUnitY(myMissile[i][j].cY);
                        cc.beginPath();
                        cc.moveTo(x-1, y-1);
                        cc.lineTo(x+1, y-1);
                        cc.lineTo(x+1, y+1);
                        cc.closePath();
                        cc.fill();
                    }
                    myMissile[i][j].calcPos(Gtime); // 座標計算

                }
            }
        }

        cc.restore();
        setTimeout(loop, fps.getInterval());
        Gtime++;
    };

    loop();
};

function initData() {
    for(let i = 0; i < 3; i++) {
        myMissile[i] = new Array(myMAX);
        myCount[i] = 0;
        for (let j = 0; j < myMAX; j++) {
            myMissile[i][j] = new Missile();
            myMissile[i][j].init((UNIT / 6 ) * ((i * 2) + 1), UNIT * 0.95);
        }
    }
}

function curMove() {
    curX += Math.cos(Math.atan2(pointY - curY, pointX - curX)) * CURSPEED;
    curY += Math.sin(Math.atan2(pointY - curY, pointX - curX)) * CURSPEED;
}

// マウスダウン
function mousedownfunc(event) {
    let rect = event.target.getBoundingClientRect();
    pointX = acalcUnitX(event.clientX - rect.left);
    pointY = acalcUnitY(event.clientY - rect.top);
    isDrag = true;
}

// マウスムーブ
function mousemovefunc(event) {
    let rect = event.target.getBoundingClientRect();
    pointX = acalcUnitX(event.clientX - rect.left);
    pointY = acalcUnitY(event.clientY - rect.top);
}

// マウスアップ
function mouseupfunc(event) {
    let rect = event.target.getBoundingClientRect();
    //let x = acalcUnitX(event.clientX - rect.left);
    //let y = acalcUnitY(event.clientY - rect.top);

    isDrag = false;
    fire(curX, curY);
}

function fire(x, y) {
    if (x < UNIT / 3) {
        if (myCount[0] != myMAX -1) {
            setPoint(0, x, y);
        }
        else if (myCount[1] != myMAX -1) {
            setPoint(1, x, y);
        }
        else if (myCount[2] != myMAX -1) {
            setPoint(2, x, y);
        }
    }
    else if (x > UNIT * 2 / 3) {
        if (myCount[2] != myMAX -1) {
            setPoint(2, x, y);
        }
        else if (myCount[1] != myMAX -1) {
            setPoint(1, x, y);
        }
        else if (myCount[0] != myMAX -1) {
            setPoint(0, x, y);
        }
    }
    else {
        if (myCount[1] != myMAX -1) {
            setPoint(1, x, y);
        }
        else if (myCount[0] != myMAX -1) {
            setPoint(0, x, y);
        }
        else if (myCount[2] != myMAX -1) {
            setPoint(2, x, y);
        }
    }
}

function setPoint(base, x, y) {
    myMissile[base][myCount[base]].fire(x, y, MYSPEED, Gtime);
    myCount[base]++;
}

function calcUnit(n) {
    return Math.floor((screen_unit * n) / UNIT);
}
function calcUnitX(n) {
    return Math.floor((screen_unitX * n) / UNIT);
}
function calcUnitY(n) {
    return Math.floor((screen_unitY * n) / UNIT);
}

function acalcUnit(n) {
    return (n * UNIT) / screen_unit;
}
function acalcUnitX(n) {
    return (n * UNIT) / screen_unitX;
}
function acalcUnitY(n) {
    return (n * UNIT) / screen_unitY;
}

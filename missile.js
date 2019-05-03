var Missile = function() {
    var BOMSIZE;
    var bomb;
    var fired;

    var startX;
    var startY;
    var goalX;
    var goalY;
    var startTime;
    var totalTime;
    var length;

    var dX;
    var dY;
    var cX;
    var cY;
    var bomb;
    var r;

    this.init = function(x, y) {
        this.BOMSIZE = 100;
        this.fired = false;
        this.bomb = false;
        this.startX = x;
        this.startY = y;
        this.goalX = 0;
        this.goalY = 0;
    };

    this.fire = function(x, y, speed, time) {
        this.goalX = x;
        this.goalY = y;
        this.fired = true;

        this.startTime = time;
        this.speed = speed;

        this.dX = this.goalX - this.startX;
        this.dY = this.goalY - this.startY;
        this.length = Math.sqrt((this.dX * this.dX) + (this.dY * this.dY));
        if (this.length > 0) {
            this.totalTime = this.length / this.speed;
        }
        else {
            this.totalTime = 0;
        }
    };

    this.calcPos = function(Gtime) {
        let time = Math.floor((Gtime - this.startTime));
        if (time < this.totalTime) {
            this.cX = this.startX + ((time * this.dX) / this.totalTime);
            this.cY = this.startY + ((time * this.dY) / this.totalTime);
        }
        else {
            this.r = time - this.totalTime;
            if(this.r < this.BOMSIZE) {
                this.bomb = true;
                this.r = this.r / 2.0;
            }
            else {
                this.fired = false;
                this.bomb = false;
            }
        }
    };

    /*
    var cXf;
    var cYf;
    var bomb;
    var rf;
    var time;

    var speedF;
    var startTime;
    var totalTimeF;

    var lengthF;
    var dXf, dYf;
    */

    /*
    this.fire = function(int sx, int sy, int gx, int gy, int speed) {
        startTime = (new Date()).getTime();
        startXf = sx;
        startYf = sy;
        goalXf = gx;
        goalYf = gy;
        //speedF = MathFP.toFP(speed);
        speedF = speed;

        fired = true;
        dXf = goalXf - startXf;
        dYf = goalYf - startYf;
        lengthF = MathFP.sqrt(MathFP.mul(dXf, dXf) + MathFP.mul(dYf, dYf));
        if (lengthF > 0) {
            totalTimeF = MathFP.div(lengthF, speedF);
        }
        else {
            totalTimeF = 0;
        }
    }

    public void calcPos() {
        time = (int)(wc.time - startTime);
        if(time < totalTimeF >> 12) {
            cXf = startXf + MathFP.mul(MathFP.div(time<<12, totalTimeF)
                                       , dXf);
            cYf = startYf + MathFP.mul(MathFP.div(time<<12, totalTimeF)
                                       , dYf);
        }
        else {
            int r = time - (totalTimeF >> 12);
            if(r < 30) {
                bomb = true;
                rf = MathFP.toFP(r >> 1);
            }
            else {
                bomb = false;
                fired = false;
            }
        }
    }
*/
}

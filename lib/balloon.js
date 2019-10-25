export default class Balloon {
    constructor (targetEl) {
        this.targetEl = targetEl;

        this.hidden = true;
        this.setup();
        this.WORD_SPEAK_TIME = 200;
        this.CLOSE_BALLOON_DELAY = 2000;
        this.BALLOON_MARGIN = 15;
    }

    setup () {
        this.balloon = document.createElement('div').classList.add('clippy-balloon')
        this.balloon.appendChild(document.createElement('div').classList.add('clippy-tip'))
        this.balloon.appendChild(document.createElement('div').classList.add('clippy-content'))
        this.balloon.style.display = 'none';
        this.content = this.balloon.getElementsByClassName('clippy-content');
        document.body.append(this.balloon);
    }

    reposition () {
        let sides = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

        for (let i = 0; i < sides.length; i++) {
            let s = sides[i];
            this.position(s);
            if (!this.isOut()) break;
        }
    }

    /***
     *
     * @param side
     * @private
     */
    position (side) {
        let oTop = this.targetEl.offsetTop;
        let oLeft = this.targetEl.offsetLeft;
        let h = this.targetEl.clientHeight;
        let w = this.targetEl.clientWidth;
        oTop -= window.scrollY;
        oLeft -= window.scrollX;

        let bH = this.balloon.offsetHeight;
        let bW = this.balloon.offsetWidth;

        this.balloon.classList.remove('clippy-top-left');
        this.balloon.classList.remove('clippy-top-right');
        this.balloon.classList.remove('clippy-bottom-right');
        this.balloon.classList.remove('clippy-bottom-left');

        let left, top;
        switch (side) {
            case 'top-left':
                // right side of the balloon next to the right side of the agent
                left = oLeft + w - bW;
                top = oTop - bH - this.BALLOON_MARGIN;
                break;
            case 'top-right':
                // left side of the balloon next to the left side of the agent
                left = oLeft;
                top = oTop - bH - this.BALLOON_MARGIN;
                break;
            case 'bottom-right':
                // right side of the balloon next to the right side of the agent
                left = oLeft;
                top = oTop + h + this.BALLOON_MARGIN;
                break;
            case 'bottom-left':
                // left side of the balloon next to the left side of the agent
                left = oLeft + w - bW;
                top = oTop + h + this.BALLOON_MARGIN;
                break;
        }

        this.balloon.style.top = top;
        this.balloon.style.left = left;
        this.balloon.classList.add('clippy-' + side);
    }

    isOut () {
        let oTop = this.balloon.offsetTop;
        let oLeft = this.balloon.offsetLeft;
        let bH = this.balloon.clientHeight;
        let bW = this.balloon.clientWidth;

        let wW = window.innerWidth;
        let wH = window.innerHeight;
        let sT = document.scrollY;
        let sL = document.scrollX;

        let top = oTop - sT;
        let left = oLeft - sL;
        let m = 5;
        if (top - m < 0 || left - m < 0) return true;
        return (top + bH + m) > wH || (left + bW + m) > wW;
    }

    speak (complete, text, hold) {
        this.hidden = false;
        this.show();
        let c = this.content;
        // set height to auto
        c.style.height = 'auto';
        c.style.width = 'auto';
        // add the text
        c.textContent = text;
        // set height
        c.style.height = c.clientHeight;
        c.style.width = c.clientWidth;
        c.textContent = '';
        this.reposition();

        this.complete = complete;
        this.sayWords(text, hold, complete);
    }

    show () {
        if (this.hidden) return;
        this.balloon.style.display = 'block';
    }

    hide (fast) {
        if (fast) {
            this.balloon.style.display = 'none';
            return;
        }

        this.hiding = window.setTimeout(this.finishHideBalloon.bind(this), this.CLOSE_BALLOON_DELAY);
    }

    finishHideBalloon () {
        if (this.active) return;
        this.balloon.style.display = 'none';
        this.hidden = true;
        this.hiding = null;
    }

    sayWords (text, hold, complete) {
        this.active = true;
        this.hold = hold;
        let words = text.split(/[^\S-]/);
        let time = this.WORD_SPEAK_TIME;
        let el = this.content;
        let idx = 1;


        this.addWord = (function () {
            if (!this.active) return;
            if (idx > words.length) {
                delete this.addWord;
                this.active = false;
                if (!this.hold) {
                    complete();
                    this.hide();
                }
            } else {
                el.textContent = words.slice(0, idx).join(' ');
                idx++;
                this.loop = window.setTimeout(this.addWord.bind(this), time);
            }
        }).bind(this);

        this.addWord();

    }

    close () {
        if (this.active) {
            this.hold = false;
        } else if (this.hold) {
            this.complete();
        }
    }

    pause () {
        window.clearTimeout(this.loop);
        if (this.hiding) {
            window.clearTimeout(this.hiding);
            this.hiding = null;
        }
    }

    resume () {
        if (this.addWord) {
            this.addWord();
        } else if (!this.hold && !this.hidden) {
            this.hiding = window.setTimeout(this.finishHideBalloon.bind(this), this.CLOSE_BALLOON_DELAY);
        }
    }
}



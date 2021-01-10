/* eslint-disable no-restricted-globals */
/* eslint-disable class-methods-use-this */
import { LitElement, html } from "lit-element";
import { wcNameStyles } from "./animation-fireworks-style";

/**
 * `animation-fireworks`
 * AnimationFireworks
 *
 * @customElement animation-fireworks
 * @litElement
 * @demo demo/index.html
 */

export class AnimationFireworks extends LitElement {
  static get is() {
    return "animation-fireworks";
  }

  static get properties() {
    return {
      /**
       * Fireworks explosion intensity
       * @property
       * @type { Number }
       */
      explosionIntensity: { type: Number, attribute:'explosion-intensity' },
      /**
       * Fireworks duration
       * @property
       * @type { Number }
       */
      fireworksDuration: { type: Number, attribute:'fireworks-duration' },
      /**
       * Fireworks color list
       * @property
       * @type { Array }
       */
      colours: {
        type: Array,
        converter: {
          toAttribute(value) {
            return value.join(',');
          },
          fromAttribute(value) {
            return value.split(',');
          }
        }
      }
    };
  }

  static get styles() {
    return [wcNameStyles];
  }

  constructor() {
    super();

    this.explosionIntensity = 15;
    this.fireworksDuration = 15; // SECONDS
    this.colours = ["#FF8000", "#5FB404", "#084B8A", "#DF0101", "#FF0080"];
    
    this.maxNumberSparks = 400;
    this.dx = null;
    this.dy = null;
    this.xpos = null;
    this.ypos = null;
    this.bandHeight = null;
    this.Xpos = [];
    this.Ypos = [];
    this.dX = [];
    this.dY = [];
    this.decay = [];
    this.colour = 0;
    this.fireworksWide = 1000;
    this.fireworksHigh = 800;
    this.explodeIdTime = undefined;
    this.stop = true;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('animation-fireworks-init-fireworks', this.initFireworksEvent.bind(this));
    document.addEventListener('animation-fireworks-stop-fireworks', this.stopFireworksEvent.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('animation-fireworks-init-fireworks', this.initFireworksEvent.bind(this));
    document.removeEventListener('animation-fireworks-stop-fireworks', this.stopFireworksEvent.bind(this));
  }

  firstUpdated() {
    this.fireworksBody = this.shadowRoot.getElementById("fireworks-body");
  }

  initFireworksEvent(ev) {
    const {id} = ev.detail;
    if (this.id === id && this.stop) {
      this.initFireworks();
    }
  }

  stopFireworksEvent(ev) {
    const {id} = ev.detail;
    if (this.id === id) {
      this.stopFireworks();
    }
  }

  initFireworks() {
    this.stop = false;
    window.onscroll = this.setScroll.bind(this);
    window.onresize = this.setWith.bind(this);
    this.setWith();
    this.setFireworksBody();
    this.launchFireworks();
    this.fireworksAnimationId = requestAnimationFrame(this.stepthrough.bind(this));
    if (this.fireworksDuration > 0) {
      setTimeout(() => this.stopFireworks(), this.fireworksDuration * 1000);
    }
  }

  stopFireworks() {
    this.stop = true;
    cancelAnimationFrame(this.fireworksAnimationId);
    cancelAnimationFrame(this.explodeIdTime);
    this.shadowRoot.querySelector("#fireworks-body").textContent = '';
  }
  
  setFireworksBody() {
    this.fireworksBody.style.position = "absolute";
    this.setScroll();
    this.setWith();
    this.fireworksBody.appendChild(this.createDiv("lg", 3, 4));
    this.fireworksBody.appendChild(this.createDiv("tg", 2, 3));
    for (let i = 0; i < this.maxNumberSparks; i += 1) {
      this.fireworksBody.appendChild(this.createDiv(`bg${i}`, 1, 1));
    }
  }
  
  createDiv(id, w, h) {
    const divElement = document.createElement("div");
    divElement.style.position = "absolute";
    divElement.style.overflow = "hidden";
    divElement.style.width = `${w}px`;
    divElement.style.height = `${h}px`;
    divElement.setAttribute("id", id);
    return (divElement);
  }
  
  explode() {
    let sparksCounter = 0;
    for (let spark = 0; spark < this.maxNumberSparks; spark += 1) {
      const X = Math.round(this.Xpos[spark]);
      const Y = Math.round(this.Ypos[spark]);
      if (this.shadowRoot.getElementById(`bg${spark}`)) {
        const sparkStyle = this.shadowRoot.getElementById(`bg${spark}`).style;
        if ((X >= 0) && (X < this.fireworksWide) && (Y >= 0) && (Y < this.fireworksHigh)) {
          sparkStyle.left = `${X}px`;
          sparkStyle.top = `${Y}px`;
        }
        this.decay[spark] -= 1;
        if (this.decay > 14) {
          sparkStyle.width = "3px";
          sparkStyle.height = "3px";
        } else if (this.decay[spark] > 7) {
          sparkStyle.width = "2px";
          sparkStyle.height = "2px";
        } else if (this.decay[spark] > 3) {
          sparkStyle.width = "1px";
          sparkStyle.height = "1px";
        } else {
          sparksCounter += 1;
          sparkStyle.visibility = "hidden";
        }
        this.Xpos[spark] += this.dX[spark];
        this.dY[spark] += 1.25 / this.explosionIntensity;
        this.Ypos[spark] += this.dY[spark];
      }
    }

    if (sparksCounter !== this.maxNumberSparks) {
      this.explodeIdTime = requestAnimationFrame(this.explode.bind(this));
    }
  }
  
  stepthrough() {
    const oldx = this.xpos;
    const oldy = this.ypos;
    this.xpos += this.dx;
    this.ypos -= 4;
    if (this.ypos < this.bandHeight || this.xpos < 0 || this.xpos >= this.fireworksWide || this.ypos >= this.fireworksHigh) {
      for (let i = 0; i < this.maxNumberSparks; i += 1) {
        this.Xpos[i] = this.xpos;
        this.Ypos[i] = this.ypos;
        this.dY[i] = (Math.random() - 0.5) * this.explosionIntensity;
        this.dX[i] = (Math.random() - 0.5) * (this.explosionIntensity - Math.abs(this.dY[i])) * 1.25;
        this.decay[i] = Math.floor((Math.random() * 16) + 50);
        this.shadowRoot.getElementById(`bg${i}`).style.backgroundColor = this.colours[this.colour];
        this.shadowRoot.getElementById(`bg${i}`).style.visibility = "visible";
      }
      this.explodeAFId = requestAnimationFrame(this.explode.bind(this));
      this.launchFireworks();
    }
    this.shadowRoot.getElementById("lg").style.left = `${this.xpos}px`;
    this.shadowRoot.getElementById("lg").style.top = `${this.ypos}px`;
    this.shadowRoot.getElementById("tg").style.left = `${oldx}px`;
    this.shadowRoot.getElementById("tg").style.top = `${oldy}px`;
    this.fireworksAnimationId = requestAnimationFrame(this.stepthrough.bind(this));
  }
  
  launchFireworks() {
    this.colour = Math.floor(Math.random() * this.colours.length);
    this.xpos = Math.round((0.5 + Math.random()) * this.fireworksWide * 0.5);
    this.ypos = this.fireworksHigh - 5;
    this.dx = (Math.random() - 0.5) * 4;
    this.bandHeight = Math.round((0.5 + Math.random()) * this.fireworksHigh * 0.4);
    this.shadowRoot.getElementById("lg").style.backgroundColor = this.colours[this.colour];
    this.shadowRoot.getElementById("tg").style.backgroundColor = this.colours[this.colour];
  }
  
  setScroll() {
    let leftPosition;
    let downPosition;
    if (typeof(self.pageYOffset) === "number") {
      downPosition = self.pageYOffset;
      leftPosition = self.pageXOffset;
    } else if (document.body.scrollTop || document.body.scrollLeft) {
      downPosition = document.body.scrollTop;
      leftPosition = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
      leftPosition = document.documentElement.scrollLeft;
      downPosition = document.documentElement.scrollTop;
    } else {
      downPosition = 0;
      leftPosition = 0;
    }
    this.shadowRoot.getElementById("fireworks-body").style.top = `${downPosition}px`;
    this.shadowRoot.getElementById("fireworks-body").style.left = `${leftPosition}px`;
  }
  
  setWith() {
    if (typeof(self.innerWidth) === "number") {
      this.fireworksWide = self.innerWidth;
      this.fireworksHigh = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientWidth) {
      this.fireworksWide = document.documentElement.clientWidth;
      this.fireworksHigh = document.documentElement.clientHeight;
    } else if (document.body.clientWidth) {
      this.fireworksWide = document.body.clientWidth;
      this.fireworksHigh = document.body.clientHeight;
    }
  }

  render() {
    return html`
      <div id="wrapper-fireworks">
        <div id="fireworks-body"></div>
      </div>`;
  }
}
class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosition: 0, starX: 0, movement: 0 };
    this.activeClass = "active";
    this.changeEvent = new Event("changeEvent");
  }

  transition(active) {
    this.slide.style.transition = active ? 'transform .3s' : '';
  }

  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  onStart(event) {
    let movetype;
    if (event.type === 'mousedown') {
      event.preventDefault();
      this.dist.startX = event.clientX;
      movetype = 'mousemove';
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = 'touchmove';
    }
    this.wrapper.addEventListener(movetype, this.onMove);
    this.transition(false);
  }

  onMove(event) {
    const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const movetype = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
    this.wrapper.removeEventListener(movetype, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  // Slides config

  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { position, element };
    });
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    }
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeSlideActiveclass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  changeSlideActiveclass() {
    this.slideArray.forEach((item) => {
      item.element.classList.remove(this.activeClass);
    });
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  activeNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 400);
  }

  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onResize = this.onResize.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
  }

  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this;
  }
}

class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper);
    this.bindControlEvents();
  }

  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener('click', this.activePrevSlide);
    this.nextElement.addEventListener('click', this.activeNextSlide);
  }

  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`;
    });
    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });
    this.wrapper.addEventListener('changeEvent', this.activeControlItem);
  }

  activeControlItem() {
    this.controlArray.forEach(item => item.classList.remove(this.activeClass));
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];

    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}

const site = `<style>
.slide img{
  margin: 0 auto;
  display: table;
  max-width: 100%;
  width: 50%;
}

li{
  list-style: none;
}

.slide-wrapper{
  overflow: hidden;
}

.slide{
  display: flex;
}

.slide:hover{
  will-change: trasform;
}

.slide li{
  display: flex;
  flex-shrink: 0;
  width: 80vw;
  max-width: 800px;
  margin: 0 20px;
  list-style: none;
  opacity: .8;
  transform: scale(.8);
  transition: .4s;
  border-radius: 4px;
  overflow: hidden;
 /* box-shadow: 0 2px 4px rgba(0, 0, 0, .4);*/
}

.slide li.active {
opacity: 1;
transform: scale(1);
}

[data-control="slide"] {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

[data-control="slide"] li a {
  display: block;
  width: 12px;
  height: 12px;
  background: #3E69A2;
  border-radius: 50%;
  overflow: hidden;
  text-indent: -999px;
  margin: 5px;
}

[data-control="slide"] li.active a, [data-control="slide"] li a:hover {
  background: #1a1a1a;
}

.custom-controls img{
  display: block;
  max-width: 100%;
}

.custom-controls{
  display: flex;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.custom-controls li {
  opacity: .8;
  transform: scale(.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin: 2px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, .5);
  transition: 300ms;
}

.custom-controls li.active{
  opacity: 1;
  transform: scale(1);
}

.arrow-nav {
  display: flex;
  justify-content: space-between;
  margin: -355px 0px;
  z-index:9999;
  position: relative;
}

.arrow-nav button{
  cursor: pointer;
  border: none;
  border-radius: 4px;
  color: #fff;
  background: #3E69A2 url("https://image.flaticon.com/icons/png/128/254/254434.png") center center no-repeat;
  background-size: 20px !important;
  width: 35px;
  height: 35px;
}

.arrow-nav button.prev{
  transform: rotatey(-180deg);
}

@media (max-width: 500px) {
  .slide img{
    margin: 0 auto;
    display: table;
    max-width: 100%;
    width: 100%;
  }
}

  </style>

  <!--Se quiser nav com imagens em vez de bolinhas descomente isso-->
  <!--
  <ul class="custom-controls">
    <li><img src="img/foto1-thumb.jpg" alt=""></li>
    <li><img src="img/foto2-thumb.jpg" alt=""></li>
    <li><img src="img/foto3-thumb.jpg" alt=""></li>
    <li><img src="img/foto4-thumb.jpg" alt=""></li>
    <li><img src="img/foto5-thumb.jpg" alt=""></li>
    <li><img src="img/foto6-thumb.jpg" alt=""></li>
  </ul>
-->

  <div class="slide-wrapper">
    <ul class="slide">
      <li><img src="https://nutrividabrasil.com.br/embelleze/img/whats1.png" alt=""></li>
      <li><img src="https://nutrividabrasil.com.br/embelleze/img/whats2.png" alt=""></li>
      <li><img src="https://nutrividabrasil.com.br/embelleze/img/whats3.png" alt=""></li>
      <li><img src="https://nutrividabrasil.com.br/embelleze/img/whats4.png" alt=""></li>
    </ul>
  </div>

  <div class="arrow-nav">
    <button class="prev"></button>
    <button class="next"></button>
</div>`;

document.write(site);

const slide = new SlideNav(".slide", ".slide-wrapper");
slide.init();
slide.addArrow(".prev", ".next"); //se não quiser as Arrows apaguei essa linha ou comente
slide.addControl('.custom-controls');
























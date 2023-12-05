<template>
  <div class="bk">   
      <div class="button background">
          <div class="day">
              <div class="star" :class="`${dayNight?.active}`" @click="slide()">
                  <div class="lunar-crater">
                      <span v-for="stars of 3" :title="String(stars)" :key='stars'></span>
                  </div>
              
              </div>
              <div class="day-background" :class="`${dayNight?.daytime}`">
                  <span v-for="background of 3" :title="String(background)" :key='background'></span>
              </div>
              <div class="back-cloud" :class="`${dayNight?.backTime}`">
                  <span v-for="cloud of 6" :title="String(cloud)" :key='cloud'></span>
              </div>
              <div class="white-background" :class="`${dayNight?.whiteTime}`">
                  <span v-for="white of 6" :title="String(white)" :key='white'></span>
              </div>
              <div class="stars" :class="`${dayNight?.starsActie}`">
                  <icon iconfont="icon-xingxing3" v-for="star of 6" :title="star" :key='star'/>
              </div>
          </div>
      </div>  
  </div>
  
</template>

<script lang='ts' setup>
import { ref } from 'vue';
import icon from '@/components/icon.vue';


interface DayNight {
  active?: string,
  daytime?: string,
  starsActie?: string,
  backTime?: string,
  whiteTime?: string,
  timeNumber?: string,
}

let dayNights: Array<DayNight> = [{
  active: 'moon',
  daytime: 'day-background-night',
  starsActie: 'stars-night',
  backTime: 'back-cloud-night',
  whiteTime: 'white-background-night',
  timeNumber: 'time-night',
},
{
  active: 'sun',
  daytime: 'day-background-daytime',
  starsActie: 'stars-daytime',
  backTime: 'back-cloud-daytime',
  whiteTime: 'white-background-daytime',
  timeNumber: 'time-daytime',
}
]

let dayNight = ref(dayNights[1]);


const slide = () => {
  if (dayNight.value.active === 'sun') {
      dayNight.value = dayNights[0];
  } else {
      dayNight.value = dayNights[1];
  }
}
</script>

<style scoped lang="scss">
  .bk{
      height: 100vh;
      background-color: #4C86BD;
      padding-top: 250px;
  }
div.button {
  margin-left: calc(50% - 285px);
  display: inline-block;
  position: relative;
  height: 235px;
  width: 590px;
  border-radius: 120px;
  box-sizing: border-box;

  .kapiTime {
      position: absolute;
      top: calc(50% - 50px);
      z-index: 19;
      transition-property: left;
      transition-duration: 1.5s;
  }

  .time-daytime {
      left: calc(65% - 100px);
  }

  .time-night {
      left: calc(35% - 100px);
  }

  .day::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      border-radius: 120px;
      box-shadow: inset 0px 10px 10px 6px rgba(0, 0, 0, .2),
          inset 0px 5px 5px 3px rgba(0, 0, 0, .2),
          inset 0px 5px 5px 5px rgba(0, 0, 0, .2),
          0px 5px 5px 3px rgba(255, 255, 255, .2),
          0px 5px 5px 3px rgba(255, 255, 255, .2);
      pointer-events: none;
      z-index: 13;
  }

  .day {
      position: absolute;
      display: inline-block;
      width: 100%;
      height: 100%;
      border-radius: 120px;
      z-index: 19;
      box-shadow: inset 0 2px 15px rgba(0, 0, 0, .2),
          inset 0 2px 2px rgba(0, 0, 0, .2),
          inset 0 -2px 2px rgba(0, 0, 0, .2);

      .star {
          display: inline-block;
          position: absolute;
          top: 10%;
          width: 33%;
          height: 80%;
          border-radius: 100px;
          transition-property: left, background-color;
          transition-duration: 1.5s;
          cursor: grab;

          & div {
              display: inline-block;
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
          }

          .lunar-crater {
              span {
                  transition-property: opacity;
                  transition-duration: 1.5s;
                  border-radius: 50%;
                  position: absolute;
              }
          }

          .clock {
              user-select: none;

              .clock-needle {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;

                  .needle {
                      display: inline-block;
                      box-sizing: border-box;
                      position: absolute;
                      bottom: 50%;
                      right: 50%;
                      transform-origin: right bottom;
                      text-shadow: rgba(0, 0, 0, .6) 1px 2px 3px;
                      box-shadow: 1px 1px 13px 1px rgba(0, 0, 0, .6);
                      transition-property: border;
                      transition-duration: 1.5s;
                  }

                  .needle:nth-child(1) {
                      // 小时
                      height: 20%;
                  }

                  .needle:nth-child(2) {
                      // 分钟
                      height: 25%;
                  }

                  .needle:nth-child(3) {
                      // 秒
                      height: 32%;
                  }
              }

              .clock-needle::after {
                  content: '';
                  position: absolute;
                  left: calc(50% - 8px);
                  top: calc(50% - 8px);
                  box-sizing: border-box;
                  width: 15px;
                  height: 15px;
                  border-radius: 8px;
                  z-index: 19;
                  box-shadow:
                      inset 0px 2px 3px 2px rgba(255, 255, 255, .3),
                      inset -1px 5px 3px 2px rgba(255, 255, 255, .2),
                      inset -1px -1px 3px 2px rgba(0, 0, 0, .5),
                      5px 5px 7px 0px rgba(0, 0, 0, .5);
                  transform: var(--transform, 0deg);
                  transition-property: background-color;
                  transition-duration: 1.5s;
              }

              .scale {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  box-sizing: border-box;

                  li {
                      box-sizing: border-box;
                      position: absolute;
                      width: 2rem;
                      height: 92%;
                      font-size: 1.2rem;
                      left: 80px;
                      top: 6px;
                      text-shadow: rgba(0, 0, 0, .6) 1px 2px 3px;
                      transition-property: color;
                      transition-duration: 1.5s;

                      i {
                          width: 100%;
                          text-align: center;
                          display: inline-block;
                          box-sizing: border-box;
                          padding-top: 3px;
                          position: absolute;
                      }

                      i:nth-child(6) {
                          padding-bottom: 3px;
                          padding-top: 0px;
                      }
                  }
              }
          }

          span:nth-child(1) {
              width: 35%;
              height: 35%;
              top: 43%;
              left: 10%;
              background-color: #949EB2;
              box-shadow: inset -5px -5px 10px 0px rgba(0, 0, 0, .5);
          }

          span:nth-child(2) {
              width: 22%;
              height: 22%;
              top: 17%;
              left: 40%;
              background-color: #949EB2;
              box-shadow: inset -1px -2px 5px 0px rgba(0, 0, 0, .5);
          }

          span:nth-child(3) {
              width: 23%;
              height: 23%;
              top: 53%;
              left: 60%;
              background-color: #949EB2;
              box-shadow: inset -1px -2px 5px 0px rgba(0, 0, 0, .5);
          }
      }

      .sun {
          left: 5%;
          background-color: #FEC428;
          box-shadow:
              inset 0px 2px 5px 6px rgba(255, 255, 255, .3),
              inset -1px 5px 5px 3px rgba(255, 255, 255, .2),
              inset -5px -5px 10px 0px rgba(0, 0, 0, .5),
              8px 8px 10px 0px rgba(0, 0, 0, .5);
          z-index: 10;

          .lunar-crater {
              span {
                  opacity: 0;
              }
          }

          .clock {
              .clock-needle {
                  .needle {
                      border-left: 2px solid #eed045;
                  }
              }

              .scale {
                  li {
                      color: #eed045;
                  }
              }

              .clock-needle::after {
                  background-color: #eed045;
              }
          }
      }

      .moon {
          left: 62%;
          background-color: #C3C9D1;
          box-shadow:
              inset 0px 2px 5px 6px rgba(255, 255, 255, .3),
              inset -1px 5px 5px 3px rgba(255, 255, 255, .2),
              inset -5px -5px 10px 0px rgba(0, 0, 0, .5),
              8px 8px 10px 0px rgba(0, 0, 0, .5);
          z-index: 10;

          .lunar-crater {
              span {
                  opacity: 1;
              }
          }

          .clock {
              .scale {
                  li {
                      color: #6C8395;
                  }
              }

              .clock-needle {
                  .needle {
                      border-left: 2px solid #6C8395;
                  }
              }

              .clock-needle::after {
                  background-color: #6C8395;
              }
          }
      }

      .day-background {
          position: absolute;
          display: inline-block;
          width: 100%;
          height: 100%;
          border-radius: 120px;
          z-index: 1;
          overflow: hidden;

          span {
              transition-property: all;
              transition-duration: 1.5s;
          }

          span:nth-child(1) {
              height: 100%;
              position: absolute;
              display: inline-block;
              width: 85%;
              border-radius: 100px;
              z-index: 2;
          }

          span:nth-child(2) {
              height: 100%;
              position: absolute;
              display: inline-block;
              width: 70%;
              border-radius: 100px;
              z-index: 3;
          }

          span:nth-child(3) {
              height: 100%;
              position: absolute;
              display: inline-block;
              width: 55%;
              border-radius: 60px;
              z-index: 4;
          }
      }

      .day-background-daytime {
          background-color: #2D6DA2;

          span:nth-child(1) {
              left: 0%;
              background-color: #4C86BD;
              border-top-left-radius: 120px;
              border-bottom-left-radius: 120px;
          }

          span:nth-child(2) {
              left: 0%;
              background-color: #5992C2;
              border-top-left-radius: 120px;
              border-bottom-left-radius: 120px;
          }

          span:nth-child(3) {
              left: 0%;
              background-color: #689DCA;
              border-top-right-radius: 120px;
              border-bottom-right-radius: 120px;
          }
      }

      .day-background-night {
          background-color: #1C1F2C;

          span:nth-child(1) {
              left: 15%;
              background-color: #2D333D;
              border-top-right-radius: 120px;
              border-bottom-right-radius: 120px;
          }

          span:nth-child(2) {
              left: 30%;
              background-color: #404350;
              border-top-right-radius: 120px;
              border-bottom-right-radius: 120px;
          }

          span:nth-child(3) {
              left: 45%;
              background-color: #50545E;
              border-top-left-radius: 120px;
              border-bottom-left-radius: 120px;
          }
      }

      .back-cloud {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 6;
          border-radius: 120px;
          overflow: hidden;

          span {
              position: absolute;
              display: inline-block;
              z-index: 6;
              border-radius: 120px;
              transition-property: background-color;
              transition-duration: 2.5s;
              box-shadow:
                  inset 0px 2px 5px 2px rgba(255, 255, 255, .3),
                  inset -1px 5px 5px 2px rgba(255, 255, 255, .2),
                  inset -5px -5px 5px 2px rgba(0, 0, 0, .5),
                  8px 8px 5px 0px rgba(0, 0, 0, .5);
          }

          span:nth-child(1) {
              width: 50%;
              height: 100%;
              top: -9%;
              right: -35%;
              transform: rotate(30deg);
          }

          span:nth-child(2) {
              width: 30%;
              height: 60%;
              top: 30%;
              right: -5%;
              transform: rotate(40deg);
          }

          span:nth-child(3) {
              width: 50%;
              height: 90%;
              top: 50%;
              right: -5%;
              transform: rotate(60deg);
          }

          span:nth-child(4) {
              width: 20%;
              height: 50%;
              top: 60%;
              right: 30%;
              transform: rotate(60deg);
          }

          span:nth-child(5) {
              width: 60%;
              height: 80%;
              top: 90%;
              right: 15%;
              transform: rotate(60deg);
          }

          span:nth-child(6) {
              width: 60%;
              height: 100%;
              top: 85%;
              left: -10%;
              transform: rotate(90deg);
          }
      }

      .back-cloud-daytime {
          span {
              background-color: #A3C5E0;
          }

      }

      .back-cloud-night {
          span {
              background-color: #6C8395;
          }
      }

      .white-background {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 7;
          border-radius: 120px;
          overflow: hidden;

          span {
              position: absolute;
              display: inline-block;
              border-radius: 120px;
              box-shadow:
                  inset 0px 2px 3px 1px rgba(255, 255, 255, .3),
                  inset -1px 5px 3px 1px rgba(255, 255, 255, .2),
                  inset -5px -5px 3px 1px rgba(0, 0, 0, .5),
                  8px 8px 3px 0px rgba(0, 0, 0, .5);
              transition-property: background-color;
              transition-duration: 2s;
          }

          span:nth-child(1) {
              width: 70%;
              height: 100%;
              top: 30%;
              right: -55%;
              transform: rotate(30deg);
          }

          span:nth-child(2) {
              width: 60%;
              height: 100%;
              top: 60%;
              right: -35%;
              transform: rotate(30deg);
          }

          span:nth-child(3) {
              width: 25%;
              height: 100%;
              top: 75%;
              right: 15%;
          }

          span:nth-child(4) {
              width: 15%;
              height: 100%;
              top: 80%;
              right: 35%;
              box-shadow:
                  inset 0px 2px 3px 1px rgba(255, 255, 255, .3),
                  inset -1px 5px 3px 1px rgba(255, 255, 255, .2),
                  inset -5px -5px 3px 1px rgba(0, 0, 0, .5),
                  5px 5px 3px 0px rgba(0, 0, 0, .5);
          }

          span:nth-child(5) {
              width: 30%;
              height: 100%;
              top: 78%;
              right: 42%;
          }

          span:nth-child(6) {
              width: 50%;
              height: 90%;
              top: 95%;
              right: 58%;
              transform: rotate(90deg);
          }
      }

      .white-background-daytime {
          span {
              background-color: #F1FAFC;
          }

      }

      .white-background-night {
          span {
              background-color: #C6C6C6;
          }
      }

      .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 120px;
          z-index: 8;
          position: absolute;
          transition-property: top, opacity;
          transition-duration: 1.5s;

          .iconfont {
              color: #FFF;
              position: absolute;
          }

          .iconfont:nth-child(1) {
              font-size: 3rem;
              top: 20%;
              left: 3%;
          }

          .iconfont:nth-child(2) {
              font-size: 1.5rem;
              top: 12%;
              left: 6%;
          }

          .iconfont:nth-child(3) {
              font-size: 3rem;
              top: 35%;
              left: 9%;
          }

          .iconfont:nth-child(4) {
              font-size: 3rem;
              top: 16%;
              left: 20%;
          }

          .iconfont:nth-child(5) {
              font-size: 2.5rem;
              top: 56%;
              left: 25%;
          }

          .iconfont:nth-child(6) {
              font-size: 4rem;
              top: 30%;
              left: 41%;
          }
      }

      .stars-daytime {
          top: 100%;
          opacity: 0;
      }

      .stars-night {
          top: 0%;
          opacity: 1;
      }
  }
}</style>
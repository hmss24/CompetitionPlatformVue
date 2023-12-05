<template>
  <div class="login-box">
    <div class="form">
      <n-icon
        :component="CloseCircleOutline"
        size="3em"
        @click="handleCloseClick"
        style="margin-left: 100% margin-top:0%"
      />
      <div class="header" v-if="status">register</div>
      <div class="header" v-else>login</div>
      <div class="main">
        <div class="inpbox">
          <input type="text" placeholder="username" v-model="usern" />
        </div>
        <div class="inpbox">
          <input type="password" placeholder="password" v-model="userp" />
        </div>
        <div class="inpbox" v-if="status">
          <input type="password" placeholder="repeat password" v-model="ruserp" v-if="status" />
        </div>
      </div>
      <div class="action">
        <div class="btn" @click="handleLoginClick">Login</div>
        <div class="btn" @click="handleRegisterClick">Register</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiUserLogin, apiUserSignup } from '@/api/user'
import { useMessage, NIcon } from 'naive-ui'
import { APIError } from '@/api/request'
import router from '@/router'
import { defineComponent, ref } from 'vue'
import { CloseCircleOutline } from '@vicons/ionicons5'
import {} from 'naive-ui'

const userp = ref('')
const usern = ref('')
const ruserp = ref('')
const $msg = useMessage()

const close = ref('closeicon')

let status = ref(false)

const handleCloseClick = async () => {
  router.back()
}

const handleRegisterClick = async () => {
  if (!status.value) {
    status.value = true
  } else {
    try {
      if (ruserp.value != userp.value) {
        throw new APIError({ code: -99, msg: '密码不一致' })
      }
      if (ruserp.value == '' || userp.value == '' || usern.value == '') {
        throw new APIError({ code: -99, msg: '不能为空' })
      }
      const x = await apiUserSignup({
        nickname: usern.value,
        username: usern.value,
        password: userp.value
      })
      $msg.info('注册成功')
      status.value = false
    } catch (error: any) {
      if (error instanceof APIError) $msg.error(error.msg)
    }
  }
}
const handleLoginClick = async () => {
  if (!status.value) {
    try {
      if (userp.value == '' || usern.value == '') {
        throw new APIError({ code: -99, msg: '不能为空' })
      }
      const x = await apiUserLogin({ username: usern.value, password: userp.value })
      localStorage.setItem('nickname', x.nickname)
      localStorage.setItem('userid', x.userid)
      localStorage.setItem('token', x.token)
      localStorage.setItem('username', x.username)
      router.back()
    } catch (error: any) {
      if (error instanceof APIError) $msg.error(error.msg)
    }
  } else {
    status.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.login-box {
  width: 100%;
  height: 100%;
  background-attachment: fixed;
  text-align: center;
  background-image: url('@/assets/img/500549039.jpg');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  .form {
    /*弹性布局 让子元素称为弹性项目*/
    display: flex;
    /*让弹性项目垂直排列  原理是改变弹性盒子的主轴方向  
      父元素就是弹性盒子  现在改变后的主轴方向是向下了*/
    flex-direction: column;
    /*让弹性项目在交叉轴方向水平居中  现在主轴的方向是向下  
    交叉轴的方向是与主轴垂直 交叉轴的方向是向右*/
    width: 450px;
    background-color: rgb(74, 75, 76);
    color: #fff;
    border-radius: 2px;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.4);
    opacity: 0.9;

    .n-icon {
      color: #fff;
      position: relative;
      cursor: pointer;
    }
    .n-icon:hover {
      color: #03a9f4;
    }
  }

  .main {
    position: relative;

    .inpbox {
      background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
      background-size: 400%;
      width: 100%;
      height: 50px;
      margin-bottom: 20px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 1s;
    }

    .inpbox input {
      height: calc(100% - 4px);
      width: calc(100% - 6px);
      border-radius: 30px;
    }

    .inpbox:has(input:focus) {
      animation: animate 5s linear infinite;
      transform: scale(1.1);
    }
  }
}

.header {
  text-align: center;
  font-size: 35px;
  text-transform: uppercase;
  line-height: 100px;
}

.main > .inpbox input {
  position: relative;
  background-color: rgb(74, 75, 76);
  border: 0;
  width: 40%;
  text-align: center;
  font-size: 15px;
  color: #fff;
  outline: none;
}

@keyframes animate {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 400% 0;
  }
}

.action {
  display: flex;
  justify-content: center;
}

.action > .btn {
  width: 50%;
  margin: 10px;
  text-transform: uppercase;
  border: 2px solid #0e92b3;
  text-align: center;
  line-height: 50px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 1s;
}

.action > .btn:hover {
  transform: scale(1.2);
  background-color: #0e92b3;
}
.action > .btn:active {
  transform: scale(1.2);
}
</style>

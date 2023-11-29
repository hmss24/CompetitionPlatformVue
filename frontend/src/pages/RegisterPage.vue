<template>
<div class="login-bg c-center">
  <div class="form">
    <div class="header">register</div>
    <div class="main">
      <div class="inpbox">
        <input type="text" placeholder="username" v-model="usern" />
      </div>
      <div class="inpbox">
        <input type="password" placeholder="password" v-model="userp" />
      </div>
      <div class="inpbox">
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
import { apiUserLogin } from '@/api/user';
import { useMessage } from 'naive-ui';
import { APIError } from '@/api/request';
import router from '@/router';

const userp = "";
const usern = "";
const handleRegisterClick = () => {
    
}
const handleLoginClick = async () => {
    try {
        router.back();
    } catch (error:any) {
        if(error instanceof APIError) useMessage().error(error.msg);
        
    }
};

</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
}

.login-bg {
  width: 100vw;
  height: 100vh;
  background-image: url("@/assets/img/6CE1C14B1530CC53A70EC811E4D49709.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
}

.form {
    width: 30vw;
    height: auto;
    margin:auto;
    margin-top: 10%;
    background-color: rgb(41, 45, 62);
    color: #fff;
    border-radius: 2px;
    padding: 50px 80px 80px;
    border-radius: 15px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.4);
    opacity: 0.9;
}

.header {
    text-align: center;
    font-size: 35px;
    text-transform: uppercase;
    line-height: 100px;
}

.main .inpbox input {
    background-color: rgb(41, 45, 62);
    border: 0;
    width: 40%;
    text-align: center;
    font-size: 15px;
    color: #fff;
    outline: none;
}

.main .inpbox {
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

.main .inpbox input {
    height: calc(100% - 4px);
    width: calc(100% - 6px);
    border-radius: 30px;
}

.main .inpbox:has(input:focus) {
    animation: animate 5s linear infinite;
    transform: scale(1.1);
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

.action .btn {
    width: 50%;
    margin:10px;
    text-transform: uppercase;
    border: 2px solid #0e92b3;
    text-align: center;
    line-height: 50px;
    border-radius: 30px;
    cursor: pointer;
    transition: all 1s;
}

.action .btn:hover {
    transform: scale(1.2);
    background-color: #0e92b3;
}
.action .btn:active{
    transform: scale(1.2);
}
</style>
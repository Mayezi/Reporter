<style scoped>
.login {
  width: 100%;
  height: 100%;
  /*background-image: url('https://file.iviewui.com/iview-admin/login_bg.jpg');*/
  background-image: url('../img/login_bg.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}
.layout-copy{
  position: fixed;
  bottom: 20px;
  left: 48%;
  color: #9ea7b4;
}
.login-form{
    position: absolute;
    right: 160px;
    top: 50%;
    transform: translateY(-60%);
    width: 300px;
}
.card-title{
  text-align: center;
  font-size: 18px;
}
.card{
  opacity:0.9;
}
</style>
<template>
  <div class="login">
    <div class="login-form">
    <Card :bordered="false" :padding=25 class='card'>
      <p slot="title" class="card-title">日报填写工具-大数据组</p>
        <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" label-position="right" >
        <Form-item prop="username" >
          <i-input v-model="formCustom.username" placeholder="请输入您的真实中文姓名">
            <span slot="prepend">
              <Icon :size="16" type="android-person"></Icon>
            </span>
          </i-input>
        </Form-item>
        <Form-item prop="password" >
          <Input v-model="formCustom.password" type='password' @on-enter="handleSubmit('formCustom')">
            <span slot="prepend">
              <Icon :size="16" type="locked"></Icon>
            </span>
          </Input>
        </Form-item>
        <Form-item>
          <Button type="ghost" long @click="handleSubmit('formCustom')">登录</Button>
          <br/>
          <Button type="ghost" long @click="handleRegist('formCustom')">注册</Button>
        </Form-item>
        </Form>
    </Card>
    </div>
        <div class="layout-copy">
            Since 2017.9 V1.1
        </div>
  </div>
</template>
<script>
  import axios from 'axios'
  import md5 from 'js-md5'
  // qs用于封装传输的json对象
  import qs from 'qs'

  export default {
    data () {
      const validateUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'))
        } else {
          callback()
        }
      }
      const validatePassword = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      }
      return {
        formCustom: {
          username: '',
          password: ''
        },
        ruleCustom: {
          username: [{
            validator: validateUsername, trigger: 'blur'
          }],
          password: [{
            validator: validatePassword, trigger: 'blur'
          }]
        },
        user: null
      }
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            axios.post('/user/login', qs.stringify({
              username: this.formCustom.username,
              password: md5(this.formCustom.password)
            }))
            .then(response => {
              // 根据返回信息判断是否登录成功
              if (response.data.status === 'success') {
                window.localStorage.setItem('user', JSON.stringify(response.data.user))
                window.localStorage.removeItem('activename')
                this.$router.push('/')
              } else {
                this.$Message.error(response.data.msg)
              }
            })
            .catch(error => {
              this.$Message.error('服务器端异常！请稍后登录或联系维护人员')
              console.log('异常信息:' + error)
            })
          } else {
            this.$Message.error('请输入用户名和密码')
          }
        })
      },
      handleRegist (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            axios.post('/user/regist', qs.stringify({
              username: this.formCustom.username,
              password: md5(this.formCustom.password)
            }))
            .then(response => {
              if (response.data.status === 'success') {
                this.formCustom.username = response.data.username
                this.$Message.success('注册成功,请登录吧')
              } else {
                this.$Message.error(response.data.msg)
              }
            })
            .catch(error => {
              this.$Message.error('网络异常！请稍后再试')
              console.log('异常信息:' + error)
            })
          } else {
            this.$Message.error('表单输入不合法，无法注册')
          }
        })
      }
    }
  }
</script>

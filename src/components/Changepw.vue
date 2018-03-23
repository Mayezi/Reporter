<style>
.index{
  position: fixed;
  left: 42%;
  width: 200px;
  margin: 150px auto;
}
</style>
<template>
<div class="index">
<Row>
  <Col>
      <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" >
      <Form-item prop="oldpw" required>
          <Input v-model="formCustom.oldpw" type='password' placeholder="请输入原密码" ></Input>
      </Form-item>
      <Form-item prop="newpw" required>
          <Input v-model="formCustom.newpw" type='password' placeholder='请输入新密码'@on-enter="handleSubmit('formCustom')"></Input>
      </Form-item>
      <Form-item>
        <Button type="ghost" long @click="handleSubmit('formCustom')">更改密码</Button>
        <p style="height: 105px;"></p>
      </Form-item>
  </Form>
  </Col>
</Row>
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
          callback(new Error('请输入原密码'))
        } else {
          callback()
        }
      }
      const validatePassword = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入新密码'))
        } else {
          callback()
        }
      }
      return {
        formCustom: {
          oldpw: '',
          newpw: ''
        },
        ruleCustom: {
          oldpw: [{
            validator: validateUsername, trigger: 'blur'
          }],
          newpw: [{
            validator: validatePassword, trigger: 'blur'
          }]
        },
        user: JSON.parse(localStorage.user)
      }
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            axios.post('/user/changepw/', qs.stringify({
              username: this.user.userName,
              oldpw: md5(this.formCustom.oldpw),
              newpw: md5(this.formCustom.newpw)
            }))
            .then(response => {
              // 根据返回信息判断是否登录成功
              if (response.data.status === 'success') {
                window.localStorage.removeItem('user')
                this.$Message.success('密码更改成功，两秒后跳转登陆页面')
                this.$router.push('/login')
              } else {
                this.$Message.error(response.data.msg)
              }
            })
            .catch(error => {
              this.$Message.error('网络异常！请稍后再试')
              console.log('异常信息:' + error)
            })
          }
        })
      }
    }
  }
</script>

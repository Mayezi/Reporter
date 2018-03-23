<style scoped>
html,body{height:100%;margin:0;padding:0;}
.layout{
    height: 100%;
    /*border: 1px solid #d7dde4;*/
    background: #f5f7f9;
}
.layout-nav{
    width: 360px;
    margin: 0 auto;
    height: inherit;
}
.layout-content{
    min-height: 84%;
    margin: 5px 5px 10px 5px;
    padding-bottom: 20px;
    overflow: hidden;
    background: #fff;
}
.layout-copy{
  height: 40px;
  padding-top: 10px;
    text-align: center;
    color: #9ea7b4;
}
.show-plan-switch {
    position: absolute;
    right: 0px;
    display: inline-block;
}
.item-index {
    left: 0;
    top:5px;
    transform: translateY(0);
    transition: all 1s;
}
.hide {
    display: none;
}
.app{
  padding:0 5px;
}
li{
  list-style: none;
}
</style>
<template>
    <div class="layout">
        <Menu mode="horizontal" theme="light" @on-select="menu">
            <div class="layout-nav">
                <Menu-item name="1">
                    <Icon type="ios-home"></Icon>
                    主页
                </Menu-item>
                <Submenu name="2">
                    <template slot="title">
                        <Icon type="person"></Icon>{{user.username}}-{{user.role === 0 ? '管理员' : '普通用户'}}
                    </template>
                <MenuItem name="2-2"><Icon type="edit"></Icon>修改密码</MenuItem>
                <MenuItem name="2-1"><Icon type="log-out"></Icon>退出登录</MenuItem>
                </Submenu>
                <Menu-item name="3">
                    <Icon type="ios-lightbulb-outline"></Icon>
                    关于
                </Menu-item>
            </div>
        </Menu>
            <Row class-name="layout-content" >
              <Col span=4>
              <div class="sidebar">
                 <Menu width='auto' :open-names="['1','2']" @on-select="sub" :active-name='activename' >
                        <Submenu name="1">
                            <template slot="title">
                                <Icon type="ios-navigate"></Icon>
                                个人报告
                            </template>
                            <MenuItem name="1-1">每日报告</MenuItem>
                            <MenuItem name="1-2" exact>每周报告</MenuItem>
                            <MenuItem name="1-3" exact>每月报告</MenuItem>
                        </Submenu>
                        <Submenu name="2" v-if="user.role == 0 ">
                            <template slot="title">
                                <Icon type="ios-keypad"></Icon>
                                小组动态
                            </template>
                            <MenuItem name="2-1">每日报告</MenuItem>
                        </Submenu>
                  </Menu>
                  <Card>
                    <p slot="title">昨日计划 {{yesterday | dateFormat}}<i-switch class="show-plan-switch"  v-model="switch1" ></i-switch></p>
                    <div :class="{hide: !switch1}">
                      <ul>
                      <li v-for="(item, index) in yesterdayplans" >
                        <label class="item-index">{{index+1}}.</label>
                        <label>{{item.content}}</label>
                      </li>
                      </ul>
                    </div>
                  </Card>
              </div>
              </Col>
              <Col span=20>
              <div class="app"> <router-view :params="servermsg" @notifyadmin='sendmessage'></router-view></div>
              </Col>
            </Row>
        <div class="layout-copy">
            Since 2017.9 V1.1
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import qs from 'qs'
import {formatDate} from '../date.js'

export default {
  data () {
    return {
      user: JSON.parse(localStorage.user||'{}'),
      yesterdayplans: [{'content':'暂无数据'}],
      switch1: true,
      yesterday: new Date().setDate(new Date().getDate() - 1),
      websocket: null,
      activename: '1-1',
      websocketdata: '',
      servermsg: '',
      activeObject:{
      'dailyreport':'1-1',
      'weekreport':'1-2',
      'monthreport':'1-3',
      'teamdailyreport':'2-1',
      'admin':'2-2',}
    }
  },
  created: function () {
    if (this.user) {
      this.query()
      this.socket()
    }
   
  },
  updated: function (){
     this.activename = this.activeObject[this.$route.name]
   },
  methods: {
    sendmessage (data) {
      this.websocket.send(JSON.stringify(data))
    },
    // websocket相关操作
    socket () {
      this.websocket = new WebSocket('ws://'+window.location.host+'/websocket/'+this.user.groupId)
      this.websocket.onmessage = (event) => {
        this.servermsg = JSON.parse(event.data)
      }
      this.websocket.onerror = () => {
        this.$router.push('/500')
      }
    },
    // 顶部导航栏
    menu (name) {
      if (name === '2-1') {
        this.websocket.close()
        window.localStorage.removeItem('user')
        this.$router.push('/login')
      } else if (name === '1') {
        this.$router.push('/')
        this.activename = '1-1'
      } else if (name === '3') {
        this.$router.push('/about')
      } else if (name === '2-2') {
        this.$router.push('/changepw')
      }
    },
    // 左侧导航栏
    sub (name) {
      this.activename = name
      if (name === '1-1') {
        this.$router.push('/dailyreport')
      } else if (name === '1-2') {
        this.$router.push('/weekreport')
      } else if (name === '1-3') {
        this.$router.push('/monthreport')
      } else if (name === '2-1') {
        this.$router.push('/teamdailyreport')
      } else if (name === '2-2') {
        this.$router.push('/admin')
      } else {
        this.$router.push('/')
      }
    },
    query () {
      axios.post('/api/report/user', qs.stringify({
        userid: this.user.id,
        date: formatDate(this.yesterday,'yyyyMMdd')
      }))
      .then(response => {
        // 当查询到了数据的时候对相关数据进行绑定
        if (response.data.status=='success') {
          this.yesterdayplans = response.data.planlist
        }
      })
    }
  },
  filters: {
    dateFormat (time) {
      var date = new Date(time)
      return formatDate(date, 'MM月dd日')
    }
  }
}
</script>
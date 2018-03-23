<template>
  <div class="userdailyreport">
    <Row type="flex" class-name='daily-status' justify="space-between" align="middle" v-if='params'>
      <Col span="3">
      <Card :padding=10 :bordered="false">
        <Row type='flex' justify="center" align="middle">
          <Col span=8 class-name='tr'><Icon size=40 type="social-octocat" color='#2196F3'></Icon></Col>
          <Col span=16><p :class="['report-status',reportStatusColor]">{{reportStatusText}}</p><p class="daily-status-des">日报状态</p></Col>
        </Row> 
      </Card>
      </Col>
      <Col span="3">
      <Card :padding=10 :bordered="false">
        <Row type='flex' align="middle" justify="center">
          <Col span=8 class-name='tr'><Icon size=40 type="monitor" color='#2196F3'></Icon></Col>
          <Col span=16><p class="daily-status-num">{{params.online?params.online:'-'}}</p><p class="daily-status-des">在线人数</p></Col>
        </Row> 
      </Card>
      </Col>
      <Col span="6" v-if='params.done==params.sum'>
      <Card :padding=10 :bordered="false">
        <Row type='flex' align="middle" justify="center">
          <Col span=8 class-name='tr'><Icon size=40 type="happy-outline" color='#2196F3'></Icon></Col>
          <Col span=16><p class="daily-status-success">小组日报完成！</p></Col>
        </Row> 
      </Card>
      </Col>
      <Col span="3" v-else>
      <Card :padding=10 :bordered="false">
        <Row type='flex' align="middle" justify="center">
          <Col span=8 class-name='tr'><Icon size=40 type="clipboard" color='#2196F3'></Icon></Col>
          <Col span=16><p class="daily-status-num">{{params.done+'/'+params.sum}}</p><p class="daily-status-des">通过/总数</p></Col>
        </Row> 
      </Card>
      </Col>
      <Col span="3" v-if='params.undo!=0'>
      <Card :padding=10 :bordered="false">
        <Row type='flex' align="middle" justify="center">
          <Col span=8 class-name='tr'><Icon size=40 type="edit" color='#95aeb1'></Icon></Col>
          <Col span=16><p class="daily-status-num">{{params.undo}}</p><p class="daily-status-des">未 填 写</p></Col>
        </Row> 
      </Card>
      </Col>
      <Col span="3" v-if='params.check!=0'>
      <Card :padding=10 :bordered="false">
        <Row type='flex' align="middle" justify="center">
          <Col span=8 class-name='tr'><Icon size=40 type="ios-search-strong" color='#ff9352'></Icon></Col>
          <Col span=16><p class="daily-status-num">{{params.check}}</p><p class="daily-status-des">审 核 中</p></Col>
        </Row> 
      </Card>
      </Col>

      <Col span="3" v-if='params.reject!=0'>
      <Card :padding=10 :bordered="false">
        <Row type='flex' align="middle" justify="center">
          <Col span=8 class-name='tr'><Icon size=40 type="sad-outline" color='#ff0200'></Icon></Col>
          <Col span=16><p class="daily-status-num">{{params.reject}}</p><p class="daily-status-des">审核驳回</p></Col>
        </Row> 
      </Card>
      </Col>
      <Col span="3" :bordered="false" class-name='tr'>
      <Date-picker type="date"  v-model="datepickervalue" @on-ok="querycheck" format="yyyy年MM月dd日" placeholder="查看其他日期" confirm placement="bottom-end"></Date-picker>
    </Col>
    </Row>
    <Row class-name='daily-status-offline' v-else>
      <Col>
          <Spin fix>
            <Icon type="load-c" size=20 class="spin-icon-load"></Icon>
            <div style="font-size:larger">如果您看见此界面，表示您的网络连接出现错误，未连接上WebSocket，请稍后再试</div>
          </Spin>
      </Col>
    </Row>
    <div :class="{hide: hideStatus}">
    <Row type="flex" justify="space-between" :gutter=16>
      <Col span="12">
        <Card>
          <p slot="title">昨日总结（{{yesterday | formatDate}}）</p>
          <ul>
          <li v-for="(item, index) in summarys" >
            <label class="item-index">{{index+1}}.</label>
            <label>{{item.content}}</label>
          </li>
          </ul>
        </Card>
      </Col>
      <Col span="12">
        <Card>
          <p slot="title">今日计划（{{datepickervalue | formatDate}}）</p>
          <ul>
          <li v-for="(item, index) in plans" >
            <label class="item-index">{{index+1}}.</label>
            <label>{{item.content}}</label>
          </li>
          </ul>
        </Card>
      </Col>
    </Row>
    </div>
    <div :class="{hide: !hideStatus}">
    <Row type="flex" justify="space-between" :gutter=16>
      <Col span="12">
        <Card>
          <p slot="title">昨日总结（{{yesterday | formatDate}}）<label class="deleteall" @click="deleteall('summary')">清空全部</label></p>
         <i-input v-model.trim="summaryinputvalue" type="textarea" :autosize="{minRows: 4,maxRows: 5}" placeholder="请分条直接填写,enter键保存输入下一条,自动添加序号" @on-enter="add(summaryinputvalue,'summary')" @on-keypress="keypress">
        </i-input>
          <transition-group name="list" tag="ul">
          <li v-for="(item, index) in summarys" :key="item">
            <div class="view" @dblclick="editItem(item)">
              <label class="item-index">{{index+1}}.</label>
              <label :class="{hide: item==edit}" >{{item.content}}</label>
              <i-input type="textarea" :class="{hide: item!=edit}" v-model.trim="item.content" @on-blur="doneEdit(item,index,'summary')" @on-enter="doneEdit(item,index,'summary')" @on-keypress="keypress"></i-input>
              <span @click="del(index, 'summary')" class="delIcon"><Icon type="android-delete"></Icon></span>
            </div>
          </li>
          </transition-group>
        </Card>
      </Col>
      <Col span="12">
        <Card>
          <p slot="title">今日计划（{{datepickervalue | formatDate}}）<label class="deleteall" @click="deleteall('plan')">清空全部</label></p>
        <i-input v-model.trim="planinputvalue" type="textarea" :autosize="{minRows: 4,maxRows: 5}" placeholder="请分条直接填写,enter键保存输入下一条,自动添加序号" @on-enter="add(planinputvalue,'plan')" @on-keypress="keypress">
        </i-input>
          <transition-group name="list" tag="ul">
          <li v-for="(item, index) in plans" :key="item">
            <div class="view" @dblclick="editItem(item)">
              <label class="item-index">{{index+1}}.</label>
              <label :class="{hide: item==edit}" >{{item.content}}</label>
              <i-input type="textarea" :class="{hide: item!=edit}" v-model.trim="item.content" @on-blur="doneEdit(item,index,'plan')" @on-enter="doneEdit(item,index,'plan')" @on-keypress="keypress"></i-input>
              <span @click="del(index, 'plan')" class="delIcon"><Icon type="android-delete"></Icon></span>
            </div>
          </li>
          </transition-group>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col span="10" push=7 style="margin-top:30px;">
       <i-button type="success" long :disabled="disablesubmit" @click="showmodal()" title='总结和计划均填写才能提交' :loading='submit_loading'>提交审核</i-button>
      </Col>
    </Row>
  </div>
    <Modal
        v-model="modal"
        title="是否提交?"
        @on-ok="ok"
        @on-cancel="cancel">
        <p slot="header" style="text-align:center;font-size:large;color:#2db7f5;">
            <Icon type="information-circled"></Icon>
            <span>确认提交日报</span>
        </p>
        <p style="text-align:center;font-size:14px;">提交后如需修改请在每周或每月报告中撤回</p>
        <p style="text-align:center;font-size:14px;">领导同意后将不能修改计划和总结</p>
        <div slot="footer">
          <Checkbox style="float:left;" v-model="checkboxval" @on-change="saveInfo()">不再显示此对话框</Checkbox>
          <Button type='ghost' @click='cancelsubmit()'>取消</Button>
          <Button type='info' :loading="submit_loading" @click='submit()'>提交</Button>
        </div>
    </Modal>
    <Modal
        v-model="modal1"
        title="您尚未提交日报，该操作会导致当前填写的数据丢失，确定继续？"
        ok-text='继续'
        cancel-text='取消'
        @on-ok="queryreport"
        @on-cancel="cancel">
        <p align="center">PS.如果您此时浏览其他日期的数据，您正在填写的数据会被覆盖</p>
        <p align="center">建议您先提交当前填写的数据</p>
    </Modal>
  </div>
</template>
<script>
import {formatDate} from '../date.js'
import axios from 'axios'
import qs from 'qs'

export default {
  props: ['params'],
  data () {
    return {
      planinputvalue: '',
      summaryinputvalue: '',
      edit: null,
      plans: JSON.parse(localStorage.plans||'[]'),
      summarys: JSON.parse(localStorage.summarys||'[]'),
      disablesubmit: true,
      datepickervalue: new Date(),
      yesterday: new Date().setDate(new Date().getDate() - 1),
      reportStatus: 0,
      user: JSON.parse(localStorage.user),
      modal: false,
      notice: localStorage.notice||'true',
      checkboxval: false,
      modal1: false,
      hideStatus: false,
      submit_loading:false
    }
  },
  created: function () {
    if (this.$route.query.date) {
      var pattern = /(\d{4})(\d{2})(\d{2})/
      var querydate = this.$route.query.date.replace(pattern, '$1/$2/$3')
      this.datepickervalue = new Date(querydate)
    }
    this.queryreport()
  },
  methods: {
    broadcast () {
      this.$emit('notifyadmin', {tag: 'reportAction',groupId:this.user.groupId})
    },
    cancelsubmit(){
      this.modal=false
    },
    saveInfo () {
      this.notice=this.checkboxval?'false':'true'
      localStorage.setItem('notice',this.notice)
    },
    showmodal () {
      if(this.notice=='false'){
        this.modal=false
        this.submit()
      }else{
        this.modal=true
      }
    },
    keypress (event) {
      if (event.keyCode === 13) {
        event.preventDefault()
      }
    },
    querycheck () {
      if (this.hideStatus) {
        if (this.plans.length > 0 || this.summarys.length > 0) {
          this.modal1 = true
        } else {
          this.queryreport()
        }
      } else {
        this.queryreport()
      }
    },
    queryreport () {
      axios.post('/api/report/user', qs.stringify({
        userid: this.user.id,
        date: formatDate(this.datepickervalue, 'yyyyMMdd')
      }),{
        timeout:30000
      })
      .then(response => {
        if (response.data.status=='success') {
          // 根据查询的结果绑定进度条状态，总结和计划的状态是同步的，取一个即可
          this.reportStatus = response.data.planlist[0].status
          if(this.reportStatus==0){
            this.hideStatus = true
          }else if(this.reportStatus==2){
            this.hideStatus = true
            this.$Notice.warning({
              title: '(⊙o⊙),日报被驳回啦！重新修改一下吧',
              duration: 5
            })
          }else{
            this.hideStatus = false
          }
          this.summarys = response.data.summarylist
          this.plans = response.data.planlist
        } else {
          if(formatDate(this.datepickervalue,'yyyyMMdd')!=formatDate(new Date(),'yyyyMMdd')){
            this.$Notice.info({
              title: '当日尚未填写日报，如有需要可直接填写'
            })
          }else if(this.datepickervalue.getHours()>8){
            this.$Notice.warning({
              title: '温馨提示:超过9点请尽快填写日报'
            })
          }
          this.hideStatus = true
          this.plans=[]
          this.summarys=[]
          this.reportStatus = 0
        }
      })
      .catch(error => {
        this.hideStatus = false
        this.reportStatus = 0
        this.plans=[]
        this.summarys=[]
      })
    },
    add (inputvalue,type) {
      if (inputvalue) {
        var itemarray = inputvalue.trim().replace('\r\n', '').split('\n')
        for (var item in itemarray) {
          if(type=='plan'){
            this.plans.push({
              'content': itemarray[item].trim()
            })
            this.planinputvalue=null
          }else{
            this.summarys.push({
              'content': itemarray[item].trim()
            })
            this.summaryinputvalue=null
          }
        }
      }
    },
    del (index, typename) {
      if (typename === 'plan') {
        this.plans.splice(index, 1)
      } else {
        this.summarys.splice(index, 1)
      }
    },
    editItem(item){
      this.edit = item
    },
    doneEdit (item,index,typename) {
      if (!this.edit) {
        return
      }
      if(!this.edit.content){
        console.log(typename)
        if(typename=='plan'){
          this.plans.splice(index,1)
        }else if (typename=='summary') {
          this.summarys.splice(index,1)
        }
      }
      this.edit = null
    },
    submit () {
      this.submit_loading=true
      // 提交日报
      axios.post('/report/', qs.stringify({
        plans: JSON.stringify(this.plans),
        summaries: JSON.stringify(this.summarys),
        userid: this.user.id,
        date: formatDate(this.datepickervalue, 'yyyyMMdd HHmmss')
      }))
      .then(response => {
        if (response.data.status=='success') {
          this.broadcast()
          this.submit_loading=false
          this.modal=false
          this.reportStatus = 1
          this.hideStatus=false
          this.$Notice.success({
            title: '提交成功！请耐心等待管理员审核'
          }) 
        }
      })
      .catch(error=> {
        if (error.response) {
          this.$Notice.error({
            title: '提交失败！http返回码['+error.response.status+']'
          })
        }
      })
    },
    ok () {
      this.submit()
    },
    cancel () {
      this.datepickervalue = new Date()
    },
    deleteall (type) {
      type=='plan'?this.plans = []:type=='summary'?this.summarys = []:null
    }
  },
  filters: {
    formatDate (time) {
      var date = new Date(time)
      return formatDate(date, 'yyyy年M月d日')
    }
  },
  watch: {
    params: function(){
    // 日报状态发生改变则刷新
      if (this.params.tag=='reportAction') {
        if(this.reportStatus==1){
          this.queryreport() 
        }
      }
    },
    reportStatus: function () {
      if (this.reportStatus == 0 || this.reportStatus == 2) {
        this.disablesubmit = false
      } else {
        this.disablesubmit = true
      }
    },
    datepickervalue: function () {
      if (!this.datepickervalue) {
        this.datepickervalue = new Date()
      }
      this.yesterday = new Date().setDate(this.datepickervalue.getDate() - 1)
    }
    ,
    plans: {
      handler: function () {
        localStorage.setItem('plans', JSON.stringify(this.plans)||'[]')
        if (this.plans.length>0&&this.summarys.length>0) {
          this.disablesubmit=false
        }else{
          this.disablesubmit=true
        }
      },
      deep: true
    },
    summarys: {
      handler: function () {
        localStorage.setItem('summarys', JSON.stringify(this.summarys)||'[]')
        if (this.plans.length>0&&this.summarys.length>0) {
          this.disablesubmit=false
        }else{
          this.disablesubmit=true
        }
      },
      deep: true
    }
  },
  directives: {
    'item-focus': function (el, binding) {
      if (binding.value) {
        el.focus()
      }
    }
  },
  computed: {
    reportStatusColor: function(){
      return this.reportStatus==1?'color1':this.reportStatus==2?'color2':this.reportStatus==3?'color3':'color0'
    },
    reportStatusText: function(){
      return this.reportStatus==1?'审核中':this.reportStatus==2?'已驳回':this.reportStatus==3?'已同意':'未填写'
    }
  }
}
</script>
<style scoped>
.userdailyreport li {
    padding: 5px 15px;
    font-size: 16px;
    margin-top: 5px;
    width: 100%;
    background: hsla(0, 0%, 97%, 0.23);
    border-radius: 2px;
    word-wrap: break-word;
    overflow: hidden;
    position: relative;
}
.delIcon {
    position: absolute;
    top:5px;
    right: 0;
    transform: translateY(0);
    display: none;
    transition: all 1s;
}
.item-index {
    position: absolute;
    left: 0;
    top:5px;
    transform: translateY(0);
    transition: all 1s;
}
.deleteall {
    position: absolute;
    right: 20px;
    transform: translateY(0);
    /*display: none;*/
    transition: all 1s;
}
.delIcon:hover {
  cursor: pointer;
  color: red;
}
.deleteall:hover {
  color: red;
}
p:hover .deleteall {
  display: inline-block;
}
li:hover .delIcon {
  display: inline-block;
}
li .edit {
  display: none;
}
.hide {
  display: none;
}
.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}
.list-enter, .list-leave-to{
  opacity: 0;
  transform: translateX(500px);
}
.spin-icon-load{
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}
.daily-status{
  margin: 10px 0 30px;
}
.daily-status-offline{
  padding: 40px 0;
}
.daily-status-num{
  padding-left: 25px;
  padding-top: 5px;
  font-size: 20px;
  font-weight: 700;
}
.daily-status-success{
  text-align: center;
  padding-top: 5px;
  font-size: 20px;
  font-weight: 700;
}
.daily-status-des{
  padding-left: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #c8c8c8;
}
.tr{
  text-align: right;
}
.color0{
  color: #9e9e9e;
}
.color1{
  color: #ff9352;
}
.color2{
  color: #f31302;
}
.color3{
  color: #2196f3;
}
.report-status{
  padding-left:5px;
  padding-top:5px;
  font-size:20px;
  font-weight:600;
}
</style>
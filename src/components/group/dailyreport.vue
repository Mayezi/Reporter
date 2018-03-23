<template>
  <div>
    <Row style='padding:10px 0 10px;'>
      <Col span="16">
      <Button type="info" title='此操作只对审核中的日报有效' @click="agreeseleted">同意</Button>
      <Button type="warning" title='此操作只对审核中的日报有效' @click="rejectselected">驳回</Button>
      <Button type="success" title='导出晨报' @click="download" :disabled="disabledornot">导出</Button>
      <Button title='点击可直接复制未填写人员名单' @click='notifythem' v-if="params">小组共{{params.sum}}人，{{params.done}}人已同意，{{params.undo}}人未填写，{{params.check}}人需审核 {{params.reject==0?'':params.reject+'人已驳回'}}</Button>
      <Button title='点击可直接复制未填写人员名单' @click='notifythem' loading v-else>数据加载中...</Button>
      <input type="text" id='notify' v-model='undostr' style="position:absolute;opacity:0;"></Col>
      </Col>
      <Col span="8" style='text-align:right'><Date-picker type="date"  v-model="datepickervalue" @on-ok="queryreport()" format="yyyy年MM月dd日" placeholder="查看其他日期" placement="bottom-end" confirm></Date-picker>
      </Col>
    </Row>
    <i-table :loading="loading" @on-selection-change="selected" @on-select-all="selectall" border stripe :columns="tablecolumns" :data="tabledata" ></i-table>
  </div>
</template>
<script>
import {formatDate} from '../../date.js'
import axios from 'axios'
import qs from 'qs'
export default {
  props: ['params'],
  data () {
    return {
      loading: false,
      datepickervalue: new Date(),
      user: JSON.parse(localStorage.user),
      userids: '',
      disabledornot: false,
      undostr: '',
      checknum: 0,
      tablecolumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '姓名',
          key: 'name',
          align: 'center',
          width: 90
        },
        {
          title: '日期',
          key: 'date',
          align: 'center',
          width: 120
        },
        {
          title: '总结',
          key: 'summary',
          type: 'html'
        },
        {
          title: '计划',
          key: 'plan',
          type: 'html'
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          sortable: true,
          filters: [
            {
              label: '未填写',
              value: 4
            },
            {
              label: '待审核',
              value: 1
            },
            {
              label: '已同意',
              value: 3
            },
            {
              label: '已驳回',
              value: 2
            }
          ],
          filterMultiple: false,
          filterMethod (value, row) {
            if (value === 3) {
              return row.status === 3
            } else if (value === 1) {
              return row.status === 1
            } else if (value === 2) {
              return row.status === 2
            } else {
              return row.status === 4
            }
          },
          width: 130,
          render: (h, params) => {
            const row = params.row
            const color = row.status === 0 ? 'green' : row.status === 1 || row.status === 3 ? 'blue' : row.status === 2 ? 'red' : null
            const text = row.status === 0 ? '填写中' : row.status === 1 ? '待审核' : row.status === 3 ? '已同意' : row.status === 2 ? '已驳回' : '未填写'
            return h('Tag', {
              props: {
                type: 'dot',
                color: color
              }
            }, text)
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 130,
          align: 'center',
          render: (h, params) => {
            const row = params.row
            // 处于审核中的日报才能同意或者驳回
            var agreeButton = !(row.status === 1)
            var rejectButton = !(row.status === 1)
            // var editButton
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  disabled: agreeButton
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.approvalaction(params.index, 3)
                  }
                }
              }, '同意'),
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small',
                  disabled: rejectButton
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.approvalaction(params.index, 2)
                  }
                }
              }, '驳回')
            ])
          }
        }
      ],
      tabledata: []
    }
  },
  mounted: function () {
    this.queryreport()
  },
  methods: {
    notifyadmin () {
      this.$emit('notifyadmin', {tag:'reportAction',groupId:this.user.groupId})
    },
    // 复制未填写人员名单 @XXX
    notifythem () {
      var lazyman = document.getElementById('notify')
      lazyman.select()
      document.execCommand('copy')
      this.$Message.success('复制成功')
    },
    approvalaction (index, status) {
      axios.post('/report/approval', qs.stringify({
        userids: this.tabledata[index].userId,
        status: status,
        date: formatDate(this.datepickervalue, 'yyyyMMdd')
      }))
      .then(response => {
        // 当查询到了数据的时候对相关数据进行绑定
        if (response.data === 'success') {
          this.notifyadmin()
          this.tabledata[index].status = status
        } else {
          this.$Notice.error({
            title: '操作失败，请重试'
          })
        }
      })
      .catch(error => {
        this.$Notice.error({
          title: 'http请求出错，请在控制台查看详细信息'
        })
        console.log('请求url【' + error.config.url + '】 错误信息【' + error.message + '】')
      })
    },
    queryreport () {
      this.loading = true
      console.log(this.user.groupId+'dad')
    // 这里做时间控件的调整
      axios.post('/api/report/groupday', qs.stringify({
        groupid: this.user.groupId,
        date: formatDate(this.datepickervalue, 'yyyyMMdd')        
      }))
      .then(response => {
        // 当查询到了数据的时候对相关数据进行绑定
        if (response.data.length > 0) {
          this.tabledata = response.data
          this.loading = false
        }
      })
      .catch(error => {
        this.$Notice.error({
          title: '查询出错，请在控制台查看详细信息'
        })
        console.log('请求url【'+error.config.url+'】 错误信息【'+error.message+'】')
      })
    },
    // 同意选中项
    agreeseleted () {
      axios.post('/report/approval', qs.stringify({
        userids: this.userids,
        status: 3,
        date: formatDate(this.datepickervalue, 'yyyyMMdd')
      }))
      .then(response => {
        // 当查询到了数据的时候对相关数据进行绑定
        if (response.data === 'success') {
          this.notifyadmin()
          this.queryreport() 
        }
      })
      .catch(error => {
        this.$Notice.error({
          title: 'http请求出错，请在控制台查看详细信息'
        })
        console.log('请求url【'+error.config.url+'】 错误信息【'+error.message+'】')
      })
    },
    // 驳回所选项
    rejectselected () {
      axios.post('/report/approval', qs.stringify({
        userids: this.userids,
        status: 2,
        date: formatDate(this.datepickervalue, 'yyyyMMdd')
      }))
      .then(response => {
        // 当查询到了数据的时候对相关数据进行绑定
        if (response.data === 'success') {
          this.notifyadmin()
          this.queryreport()
        }
      })
      .catch(error => {
        this.$Notice.error({
          title: 'http请求出错，请在控制台查看详细信息'
        })
        console.log('请求url【'+error.config.url+'】 错误信息【'+error.message+'】')
      })
    },
    // 全选时设置userids
    selectall (selection) {
      this.userids = ''
      for (var i = 0; i < selection.length; i++) {
        if(selection[i].status==1){
          this.userids += selection[i].userId + ','
        }
      }
    },
    // 选部分数据时设置userids
    selected (selection) {
      this.userids = ''
      for (var i = 0; i < selection.length; i++) {
        if(selection[i].status==1){
          this.userids += selection[i].userId + ','
        }
      }
    },
    // 导出当日晨报
    download () {
      window.open('/report/download?date=' + this.tabledata[0].initDate+'&groupid='+this.user.groupId)
    }
  },
  // 这里检测每天的用户表数据
  watch: {
    tabledata: {
      handler: function () {
        this.undostr = ''
        for (var i = 0; i < this.tabledata.length; i++) {
          if (this.tabledata[i].status ==0){
            // 把未填写人的姓名加入@列表
            this.undostr += ' @' + this.tabledata[i].name
          }
        }
      },
      deep: true
      // 全部同意才能导出
      // if (this.done === this.tabledata.length) {
      //   this.disabledornot = false
      // }
    },
    // 这里检测服务器是否有数据更新,一旦有数据更新的话更新表格
    params: function () {
      if(this.params.tag=='reportAction'){
        this.datepickervalue = new Date()
        this.queryreport()
      }
    }
  }
}
</script>
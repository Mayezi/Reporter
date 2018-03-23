<template>
  <div>
    <Row justify="end" style='padding: 10px 0 10px;'>
      <Col style='text-align:right'><Date-picker type="date"  v-model="datepickervalue" @on-ok="queryreport()" format="yyyy年MM月dd日" placeholder="查看其他日期" placement="bottom-end" confirm></Date-picker>
      </Col>
    </Row>
    <i-table :loading='loading'   :border='true' :stripe='true' :columns="monthreports" :data="tabledata" ></i-table>
  </div>
</template>
<script>
import {formatDate} from '../date.js'
import axios from 'axios'
import qs from 'qs'
export default {
  data () {
    return {
      loading: true,
      datepickervalue: new Date(),
      user: JSON.parse(localStorage.user),
      monthreports: [
        {
          title: '日期',
          key: 'date',
          align: 'center',
          width: 115
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
          filters: [
            {
              label: '未提交',
              value: 0
            },
            {
              label: '需审核',
              value: 1
            },
            {
              label: '已驳回',
              value: 2
            },
            {
              label: '已同意',
              value: 3
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
              return row.status === 0
            }
          },
          width: 130,
          render: (h, params) => {
            const row = params.row
            const color = row.status === 0 ? 'green' : row.status === 1 || row.status === 3 ? 'blue' : row.status === 2 ? 'red' : null
            const text = row.status === 3 ? '已同意' : row.status === 1 ? '审核中' : row.status === 2 ? '已驳回' : row.status === 0 ? '填写中' : '未填写'
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
          // 0填写中 1审核中 2同意 3驳回
          // 填写中和驳回才能编辑
            var editButton = !(row.status === 0 || row.status === 2)
          // 审核中才能撤回
            var undoButton = !(row.status === 1)
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  disabled: editButton
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.edit(params.index)
                  }
                }
              }, '编辑'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  disabled: undoButton
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.undo(params.index)
                  }
                }
              }, '撤回')
            ])
          }
        }
      ],
      tabledata: []
    }
  },
  created: function () {
    this.queryreport()
  },
  methods: {
    undo (index) {
      axios.post('/report/approval', qs.stringify({
        userids: this.user.id,
        status: 0,
        date: this.tabledata[index].time
      }))
      .then(response => {
        // 当查询到了数据的时候对相关数据进行绑定
        if (response.data === 'success') {
          this.$emit('notifyadmin', {tag: 'reportAction'})
          this.tabledata[index].status = 0
        }
      })
    },
    // 编辑 跳转到填写界面
    edit (index) {
      this.$router.push({path: '/dailyreport', query: {date: this.tabledata[index].time}})
    },
    queryreport () {
      this.loading = true
    // // 这里做时间控件的调整
      axios.post('/api/report/month', qs.stringify({
        userid: this.user.id,
        username: this.user.username,
        date: formatDate(this.datepickervalue, 'yyyyMMdd')
      }))
      .then(response => {
        this.tabledata = response.data
        this.loading = false
      })
      .catch(error => {
        this.$Notice.error({
          title: 'http请求出错，请在控制台查看详细信息'
        })
        console.log('请求url【' + error.config.url + '】 错误信息【' + error.message + '】')
      })
    }
  }
}
</script>
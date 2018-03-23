export function formatDate(date, fmt) {
  var date = new Date(date)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

// 时间格式化
export function dateFormat(date, format) {
  if (!date) {
    return '-'
  }
  if (date instanceof Date) {
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
  }
  date = date || ''
  date = date.replace(/[-\\./:Tt ]/g, '')
  try {
    var y = date.length >= 4 ? parseInt(date.substring(0, 4), 10) : '',
      M = date.length >= 6 ? parseInt(date.substring(4, 6), 10) : '-',
      d = date.length >= 8 ? parseInt(date.substring(6, 8), 10) : '-',
      h = date.length >= 10 ? parseInt(date.substring(8, 10), 10) : '-',
      m = date.length >= 12 ? parseInt(date.substring(10, 12), 10) : '-',
      s = date.length >= 14 ? parseInt(date.substring(12, 14), 10) : '-'
  } catch (e) {
    window.console && console.error(e)
  }
  var o = {
    "M+": M, //month
    "d+": d, //day
    "h+": h, //hour
    "m+": m, //minute
    "s+": s //second
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (y + "").substr(4 - RegExp.$1.length))
  }

  for (let k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
    }
  }
  return format
}

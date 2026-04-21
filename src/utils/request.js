import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Request interceptor
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  response => {
    const res = response.data
    // If the custom code is not 200, it is judged as an error.
    if (res.code !== 200) {
      ElMessage.error(res.message || 'Error API response')
      return Promise.reject(new Error(res.message || 'Error API response'))
    } else {
      return res
    }
  },
  error => {
    ElMessage.error(error.message || '网络异常，请稍后再试')
    return Promise.reject(error)
  }
)

export default request

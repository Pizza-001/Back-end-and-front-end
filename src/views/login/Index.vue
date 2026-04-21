<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-img">
        <div class="fashion-bg">
          <h2>宠爱之城</h2>
          <p>专业的宠物健康护航者</p>
        </div>
      </div>
      <div class="login-form-wrapper">
        <div class="login-header">
          <h2>宠爱之城 HIS</h2>
          <p>宠物医院后台管理系统</p>
        </div>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入管理员账号"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item prop="code" class="captcha-item">
            <div class="captcha-wrapper">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                @keyup.enter="handleLogin"
                style="flex: 1;"
              />
              <div class="captcha-img" @click="getCaptcha" title="点击刷新验证码">
                <img v-if="captchaImg" :src="captchaImg" alt="验证码">
                <div v-else class="captcha-placeholder">加载中...</div>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              class="login-btn"
              @click="handleLogin"
            >
              登录系统
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

const loginRules = {
  username: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '验证码不能为空', trigger: 'blur' }]
}

const loading = ref(false)
const captchaImg = ref('')

const getCaptcha = async () => {
  try {
    const res = await request.get('/admin/captcha/image')
    if (res.code === 200) {
      // Local backend already provides the 'data:image/jpeg;base64,' prefix
      captchaImg.value = res.data.img.startsWith('data:') 
        ? res.data.img 
        : 'data:image/gif;base64,' + res.data.img
      loginForm.uuid = res.data.uuid || ''
    }
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

const handleLogin = () => {
  if (!loginFormRef.value) return
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await request.post('/auth/login', loginForm)
        if (res.code === 200) {
          ElMessage.success('登录成功')
          localStorage.setItem('token', res.data.token || res.data)
          router.push('/home')
        }
      } catch (error) {
        // Automatically refresh captcha on login error
        getCaptcha()
        loginForm.code = ''
        console.error('登录失败', error)
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1f2c41, #334460);
}

.login-box {
  display: flex;
  width: 900px;
  height: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: fadeIn 0.8s ease;
}

.login-img {
  width: 50%;
  height: 100%;
}

.fashion-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fashion-bg h2 {
  font-size: 36px;
  margin-bottom: 20px;
  letter-spacing: 4px;
}

.fashion-bg p {
  font-size: 18px;
  letter-spacing: 2px;
}

.login-form-wrapper {
  width: 50%;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.login-header p {
  color: #999;
  font-size: 14px;
}

.captcha-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 15px;
}

.captcha-img {
  width: 120px;
  height: 40px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  display: block;
}

.captcha-placeholder {
  color: #999;
  font-size: 12px;
}

.login-btn {
  width: 100%;
  border-radius: 6px;
  font-size: 16px;
  letter-spacing: 2px;
  margin-top: 15px;
  height: 44px;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

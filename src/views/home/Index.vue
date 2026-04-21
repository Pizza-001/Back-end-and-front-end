<template>
  <div>
    <!-- 欢迎卡片 -->
    <div class="welcome-box">
      <h2 class="welcome-title">上午好，管理员！准备好开始今天的工作了吗？</h2>
      <p class="welcome-desc">系统已平稳运行 124 天，今天有 14 个新的在线预约挂号请求待处理。</p>
    </div>

    <!-- 数据统计卡片区 -->
    <div class="data-cards">
      <div class="stat-card" style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8B 100%);">
        <div class="stat-info">
          <span class="stat-title">总营收 (元)</span>
          <span class="stat-value">{{ stats.totalIncome || 0 }}</span>
          <span class="stat-trend trend-up">本地后端实时统计</span>
        </div>
        <div class="stat-icon">💰</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #4A90E2 0%, #63A4FF 100%);">
        <div class="stat-info">
          <span class="stat-title">全院宠物档案</span>
          <span class="stat-value">{{ stats.totalPets || 0 }}</span>
          <span class="stat-trend trend-up">系统累计建档</span>
        </div>
        <div class="stat-icon">🐾</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #50C9C3 0%, #96DEDA 100%);">
        <div class="stat-info">
          <span class="stat-title">今日预约总数</span>
          <span class="stat-value">{{ stats.todayAppointments || 0 }}</span>
          <span class="stat-trend trend-down">待处理申请</span>
        </div>
        <div class="stat-icon">🩺</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #FAD961 0%, #F76B1C 100%);">
        <div class="stat-info">
          <span class="stat-title">在编医生总数</span>
          <span class="stat-value">{{ stats.totalDoctors || 0 }}</span>
          <span class="stat-trend">医疗专家团队</span>
        </div>
        <div class="stat-icon">💉</div>
      </div>
    </div>

    <!-- 详细概览区 -->
    <div class="dashboard-body">
      <!-- 快捷操作区 -->
      <div class="dashboard-left">
        <el-card class="glass-card module-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷业务办理</span>
            </div>
          </template>
          <div class="shortcut-grid">
            <div class="shortcut-item" @click="$router.push('/biz/pet')">
              <el-icon class="shortcut-icon" style="color: #409EFF"><Plus /></el-icon>
              <span>新建电子档案</span>
            </div>
            <div class="shortcut-item" @click="$router.push('/biz/appointment')">
              <el-icon class="shortcut-icon" style="color: #67C23A"><Calendar /></el-icon>
              <span>处理预约单</span>
            </div>
            <div class="shortcut-item" @click="$router.push('/biz/article')">
              <el-icon class="shortcut-icon" style="color: #E6A23C"><Tickets /></el-icon>
              <span>发布科普文章</span>
            </div>
            <div class="shortcut-item" @click="$router.push('/biz/banner')">
              <el-icon class="shortcut-icon" style="color: #F56C6C"><Monitor /></el-icon>
              <span>前台轮播管理</span>
            </div>
          </div>
        </el-card>

        <!-- 简单的可视化模拟条 -->
        <el-card class="glass-card module-card mt-20" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>各科室就诊负载指标</span>
            </div>
          </template>
          <div class="progress-container">
            <div class="progress-item">
              <span>内科</span>
              <el-progress :percentage="85" status="exception" />
            </div>
            <div class="progress-item">
              <span>外科</span>
              <el-progress :percentage="60" status="warning" />
            </div>
            <div class="progress-item">
              <span>疫苗与绝育科</span>
              <el-progress :percentage="40" status="success" />
            </div>
            <div class="progress-item">
              <span>美容与洗浴中心</span>
              <el-progress :percentage="95" :color="customColors" />
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 系统动态区 -->
      <div class="dashboard-right">
        <el-card class="glass-card module-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最新系统动态</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="10分钟前" placement="top" type="primary">
              <el-card class="timeline-card">
                <h4>挂号成功</h4>
                <p>用户「张先生」为金毛犬「旺财」预约了刘医生的外科号。</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="1小时前" placement="top" type="success">
              <el-card class="timeline-card">
                <h4>疫苗接种</h4>
                <p>布偶猫「雪球」完成了狂犬疫苗第二针注射记录录入。</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2小时前" placement="top" type="warning">
              <el-card class="timeline-card">
                <h4>系统告警</h4>
                <p>后端图像验证码接口异常，正在启用前端兜底放行策略。</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="昨天 16:30" placement="top">
              <el-card class="timeline-card">
                <h4>新文章发布</h4>
                <p>袁医生发布了春季防寄生虫最新科普专栏。</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Plus, Calendar, Tickets, Monitor
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const stats = ref({
  totalRevenue: 0,
  petCount: 0,
  appointmentCount: 0,
  vaccineCount: 0
})

const fetchStats = async () => {
  try {
    const res = await request.get('/admin/biz/dashboard/stats')
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (err) {
    console.error('获取统计数据失败', err)
  }
}

onMounted(() => {
  fetchStats()
})

const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]
</script>

<style scoped>
.welcome-box {
  margin-bottom: 24px;
  animation: slideFadeIn 0.8s ease;
}

.welcome-title {
  font-size: 24px;
  color: #1e293b;
  margin-bottom: 8px;
}

.welcome-desc {
  color: #64748b;
  font-size: 14px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  height: 120px;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  animation: slideFadeInUp 0.8s ease backwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.15);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.stat-trend {
  font-size: 12px;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.stat-icon {
  font-size: 48px;
  opacity: 0.6;
}

.dashboard-body {
  display: flex;
  gap: 24px;
}

.dashboard-left {
  flex: 2;
  display: flex;
  flex-direction: column;
}

.dashboard-right {
  flex: 1;
}

.glass-card {
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s;
}

.glass-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #334155;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  background-color: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.shortcut-item:hover {
  background-color: #f1f5f9;
  transform: scale(1.05);
}

.shortcut-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.shortcut-item span {
  font-size: 14px;
  color: #475569;
}

.mt-20 {
  margin-top: 24px;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item span {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #475569;
}

.timeline-card {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: none;
}

.timeline-card h4 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 15px;
}

.timeline-card p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

@keyframes slideFadeIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideFadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<template>
  <el-container class="layout-container">
    <!-- 侧边导航栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <el-icon v-if="isCollapse" class="logo-icon"><Platform /></el-icon>
        <span v-else class="logo-text">宠爱之城 HIS</span>
      </div>
      
      <el-menu
        :default-active="activePath"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#1e293b"
        text-color="#94a3b8"
        active-text-color="#38bdf8"
        :collapse-transition="false"
        unique-opened
        router
      >
        <el-menu-item index="/home">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-sub-menu index="business">
          <template #title>
            <el-icon><FirstAidKit /></el-icon>
            <span>医院业务管理</span>
          </template>
          <el-menu-item index="/biz/banner">轮播图管理</el-menu-item>
          <el-menu-item index="/biz/doctor">医生管理</el-menu-item>
          <el-menu-item index="/biz/vaccine">疫苗记录管理</el-menu-item>
          <el-menu-item index="/biz/article">养宠知识管理</el-menu-item>
          <el-menu-item index="/biz/appointment">预约挂号处理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/biz/pet">
          <el-icon><HelpFilled /></el-icon>
          <template #title>宠物档案管理</template>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/sys/user">用户管理</el-menu-item>
          <el-menu-item index="/sys/role">角色管理</el-menu-item>
          <el-menu-item index="/sys/menu">菜单管理</el-menu-item>
          <el-menu-item index="/sys/dept">部门管理</el-menu-item>
          <el-menu-item index="/sys/dict">字典管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主体区域 -->
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/" style="margin-left: 15px;">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <div class="action-icons">
            <el-tooltip content="全屏" placement="bottom">
              <el-icon><FullScreen /></el-icon>
            </el-tooltip>
            <el-tooltip content="消息通知" placement="bottom">
              <el-badge :value="3" class="badge-item">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </el-tooltip>
          </div>
          <el-dropdown trigger="click">
            <span class="user-dropdown">
              <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" class="user-avatar" />
              <span class="user-name">Admin</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <!-- 路由占位符：渲染各个子页面 -->
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu, User, Fold, Expand, Bell, ArrowDown,
  DataBoard, FirstAidKit, Setting, HelpFilled, Platform, FullScreen
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const activePath = ref('/home')

watch(() => route.path, (newPath) => {
  activePath.value = newPath
}, { immediate: true })

const currentRouteName = computed(() => {
  return route.meta.title || '工作台'
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
  background-color: #f1f5f9;
}

/* Sidebar */
.aside {
  background-color: #1e293b;
  box-shadow: 4px 0 10px rgba(0,0,0,0.05);
  transition: width 0.3s ease;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  background-color: #0f172a;
}

.el-menu-vertical {
  border-right: none;
}

/* Header */
.header {
  background-color: #fff;
  height: 64px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 22px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #38bdf8;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-icons {
  display: flex;
  gap: 16px;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid #e2e8f0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* Main Content */
.main-content {
  padding: 24px;
  overflow-y: auto;
  position: relative;
}

/* Route transition */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.4s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

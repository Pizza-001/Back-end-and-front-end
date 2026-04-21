<template>
  <div class="table-container">
    <el-card class="box-card" shadow="never">
      <!-- 状态筛选 -->
      <div class="toolbar">
        <el-radio-group v-model="activeStatus" @change="fetchList" class="status-group">
          <el-radio-button label="all">全部申请</el-radio-button>
          <el-radio-button label="0">待处理</el-radio-button>
          <el-radio-button label="1">已确认</el-radio-button>
          <el-radio-button label="2">已完成</el-radio-button>
          <el-radio-button label="3">已取消</el-radio-button>
        </el-radio-group>
        
        <div class="search-box">
          <el-input v-model="searchQuery" placeholder="搜索宠物名或主任名" style="width: 250px" clearable>
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column prop="appointmentNo" label="预约流水号" width="160" />
        <el-table-column label="预约基本信息" min-width="250">
          <template #default="scope">
            <div class="appointment-info">
              <span class="pet-tag">{{ scope.row.petName }}</span>
              <span class="owner-info">主人：{{ scope.row.ownerName }} ({{ scope.row.phone }})</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="serviceType" label="服务类型" width="120">
          <template #default="scope">
            <el-tag effect="plain">{{ scope.row.serviceType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="appointmentTime" label="预约就诊时间" width="180" align="center" />
        <el-table-column prop="doctorName" label="指定专家" width="120" />
        <el-table-column prop="status" label="当前状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.status === 0">
              <el-button size="small" type="success" :icon="Check" @click="handleAction(scope.row, 1)">确认申请</el-button>
              <el-button size="small" type="danger" :icon="Close" @click="handleAction(scope.row, 3)">拒绝</el-button>
            </template>
            <template v-else-if="scope.row.status === 1">
              <el-button size="small" type="primary" :icon="Finished" @click="handleAction(scope.row, 2)">标记就诊完成</el-button>
            </template>
            <el-button v-else size="small" type="info" link @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="预约明细详情" size="400px">
      <div v-if="selectedRow" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="详细诉求描述">{{ selectedRow.request || '常规体检' }}</el-descriptions-item>
          <el-descriptions-item label="宠物病史">{{ selectedRow.history || '无' }}</el-descriptions-item>
          <el-descriptions-item label="支付状态"><el-tag type="success">已支付预约金 (¥20.00)</el-tag></el-descriptions-item>
          <el-descriptions-item label="提交时间">2025-04-18 10:30:12</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Check, Close, Finished } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const activeStatus = ref('all')
const total = ref(0)
const pageParams = reactive({ pageNum: 1, pageSize: 10 })
const tableData = ref([])
const drawerVisible = ref(false)
const selectedRow = ref(null)

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { 0: '待处理', 1: '已确认', 2: '已完成', 3: '已取消' }
  return map[status] || '未知'
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = { ...pageParams }
    if (activeStatus.value !== 'all') {
      params.status = activeStatus.value
    }
    const res = await request.get('/admin/biz/appointment/list', { params })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (err) {
    console.error('获取预约列表失败', err)
  } finally {
    loading.value = false
  }
}

const handleAction = (row, nextStatus) => {
  const actionText = nextStatus === 1 ? '确认' : (nextStatus === 2 ? '完成' : '取消')
  ElMessageBox.confirm(`确定要将预约单 #${row.id} 标记为 ${actionText} 吗？`, '操作提示').then(async () => {
    try {
      const res = await request.put(`/admin/biz/appointment/${row.id}/status?status=${nextStatus}`)
      if (res.code === 200) {
        ElMessage.success('状态变更成功')
        fetchList()
      }
    } catch (err) {
      console.error('更新状态失败', err)
    }
  })
}

const viewDetail = (row) => {
  selectedRow.value = row
  drawerVisible.value = true
}

onMounted(() => fetchList())
</script>

<style scoped>
.table-container { animation: fadeIn 0.5s; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: #fff; padding: 15px; border-radius: 8px; }
.appointment-info { display: flex; flex-direction: column; gap: 6px; }
.pet-tag { font-weight: bold; color: #1e293b; font-size: 15px; }
.owner-info { color: #64748b; font-size: 13px; }
.detail-content { padding: 20px; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

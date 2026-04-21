<template>
  <div class="table-container">
    <el-card class="box-card" shadow="never">
      <!-- 搜索栏 -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="宠物姓名">
            <el-input v-model="searchForm.name" placeholder="请输入宠物名" clearable />
          </el-form-item>
          <el-form-item label="宠物品种">
            <el-input v-model="searchForm.breed" placeholder="品种搜索" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="主人电话">
            <el-input v-model="searchForm.phone" placeholder="手机号" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="fetchList">查询档案</el-button>
            <el-button type="primary" plain :icon="Plus" @click="openDialog('add')">办理登记</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格内容 -->
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="档案号" width="100" align="center" fixed="left" />
        <el-table-column label="宠物信息" min-width="200">
          <template #default="scope">
            <div class="pet-cell">
              <el-avatar :size="40" :src="scope.row.avatar" />
              <div class="pet-meta">
                <span class="pet-name">{{ scope.row.name }}</span>
                <span class="pet-tag-row">
                  <el-tag size="small" :type="scope.row.type === '猫' ? 'primary' : 'success'">{{ scope.row.type }}</el-tag>
                  <span class="pet-breed">{{ scope.row.breed }}</span>
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别/年龄" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.gender }} / {{ scope.row.age }}岁</span>
          </template>
        </el-table-column>
        <el-table-column prop="ownerName" label="主人姓名" width="120" align="center" />
        <el-table-column prop="ownerPhone" label="联系方式" width="150" align="center" />
        <el-table-column prop="lastVisit" label="上次就诊" width="160" align="center" />
        <el-table-column prop="balance" label="账户余额" width="120" align="center">
          <template #default="scope">
            <span class="balance-text">¥{{ scope.row.balance.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="openDialog('edit', scope.row)">修改资料</el-button>
            <el-button size="small" type="success" link @click="viewHistory(scope.row)">就诊史</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">注销</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination background layout="total, prev, pager, next" :total="total" />
      </div>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '宠物入馆登记' : '修改核心档案'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="pet-form">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宠物姓名" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宠物种类">
              <el-radio-group v-model="formData.type">
                <el-radio label="猫">猫</el-radio>
                <el-radio label="狗">狗</el-radio>
                <el-radio label="其他">其他</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品种" prop="breed">
              <el-input v-model="formData.breed" placeholder="如：布偶、柴犬" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input-number v-model="formData.age" :min="0" :max="30" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">主理人信息</el-divider>
        <el-form-item label="主人姓名" prop="ownerName">
          <el-input v-model="formData.ownerName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="ownerPhone">
          <el-input v-model="formData.ownerPhone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存档案</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const searchForm = reactive({ name: '', breed: '', phone: '' })
const pageParams = reactive({ pageNum: 1, pageSize: 10 })
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

const formData = reactive({
  id: null,
  name: '',
  type: '猫',
  breed: '',
  age: 1,
  ownerName: '',
  ownerPhone: '',
  avatar: ''
})

const formRules = {
  name: [{ required: true, message: '宠物名必填', trigger: 'blur' }],
  ownerPhone: [{ required: true, message: '联系电话必填', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/biz/pets', { params: searchForm })
    if (res.code === 200) {
      // API returned a list, we calculate total client-side or use response total if paged
      tableData.value = res.data || []
      total.value = res.data.length
    }
  } catch (error) {
    console.error('获取宠物列表失败', error)
  } finally {
    loading.value = false
  }
}

const openDialog = (type, row = null) => {
  dialogType.value = type
  dialogVisible.value = true
  if (type === 'edit' && row) {
    Object.assign(formData, row)
  } else {
    Object.assign(formData, { id: null, name: '', type: '猫', breed: '', age: 1, ownerName: '', ownerPhone: '', avatar: '' })
    if (formRef.value) formRef.value.resetFields()
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const method = dialogType.value === 'add' ? 'post' : 'put'
        const res = await request[method]('/biz/pet', formData)
        if (res.code === 200) {
          ElMessage.success('宠物健康档案已保存')
          dialogVisible.value = false
          fetchList()
        }
      } catch (err) {
        console.error('业务操作失败', err)
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`注销宠物 ${row.name} 的档案是不可逆的，确认吗？`, '危险注销', { type: 'warning' }).then(async () => {
    try {
      const res = await request.delete(`/biz/pet/${row.id}`)
      if (res.code === 200) {
        ElMessage.success('档案已成功注销')
        fetchList()
      }
    } catch (err) {
      console.error('操作失败', err)
    }
  })
}

const viewHistory = (row) => {
  ElMessage.info(`正在调取 ${row.name} 的历史全病历明细...`)
}

onMounted(() => fetchList())
</script>

<style scoped>
.table-container { animation: fadeIn 0.5s; }
.pet-cell { display: flex; align-items: center; gap: 12px; }
.pet-meta { display: flex; flex-direction: column; gap: 4px; }
.pet-name { font-weight: bold; color: #334155; }
.pet-tag-row { display: flex; align-items: center; gap: 6px; }
.pet-breed { font-size: 12px; color: #64748b; }
.balance-text { color: #f56c6c; font-weight: bold; font-family: 'Consolas', monospace; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 20px; }
.pet-form :deep(.el-divider__text) { color: #409eff; font-weight: bold; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

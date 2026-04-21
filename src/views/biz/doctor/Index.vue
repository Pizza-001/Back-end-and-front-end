<template>
  <div class="table-container">
    <el-card class="box-card" shadow="never">
      <!-- 顶部搜索工具栏 -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="医生姓名">
            <el-input v-model="searchForm.name" placeholder="请输入医生姓名" clearable />
          </el-form-item>
          <el-form-item label="所属科室">
            <el-select v-model="searchForm.department" placeholder="请选择科室" clearable style="width: 150px;">
              <el-option label="综合内科" value="综合内科" />
              <el-option label="外科手术区" value="外科手术区" />
              <el-option label="医学影像科" value="医学影像科" />
              <el-option label="美容洗浴" value="美容洗浴" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div class="action-bar">
          <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增医生</el-button>
          <el-button type="danger" :icon="Delete" :disabled="selection.length === 0">批量删除</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        stripe
        border
        @selection-change="handleSelectionChange"
        header-row-class-name="custom-header"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="工号ID" width="100" align="center" />
        <el-table-column prop="name" label="医生姓名" width="120" align="center">
          <template #default="scope">
            <span style="font-weight: bold; color: #303133;">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="所属科室" width="150" align="center">
          <template #default="scope">
            <el-tag
              :type="getDeptTagType(scope.row.department)"
              effect="light"
            >
              {{ scope.row.department }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="120" align="center" />
        <el-table-column prop="specialty" label="擅长领域" min-width="200" show-overflow-tooltip />
        <el-table-column label="入职时间" width="180" align="center">
          <template #default="scope">
            <span>{{ scope.row.createTime?.split('T')[0] || '2025-01-01' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link :icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button size="small" type="danger" link :icon="Delete" @click="handleDelete(scope.row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.pageNum"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增医生档案' : '编辑医生档案'"
      width="550px"
      destroy-on-close
      center
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="custom-dialog-form">
        <el-form-item label="医生姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入真实姓名" />
        </el-form-item>
        
        <el-form-item label="所属科室" prop="department">
          <el-select v-model="formData.department" placeholder="请选择科室" style="width: 100%">
            <el-option label="综合内科" value="综合内科" />
            <el-option label="外科手术区" value="外科手术区" />
            <el-option label="医学影像科" value="医学影像科" />
            <el-option label="美容洗浴" value="美容洗浴" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="医生职称" prop="title">
          <el-input v-model="formData.title" placeholder="如：主治医师 / 实习医生" />
        </el-form-item>
        
        <el-form-item label="专长描述" prop="specialty">
          <el-input v-model="formData.specialty" type="textarea" :rows="3" placeholder="填写该医生所擅长的病理领域..." />
        </el-form-item>

        <el-form-item label="详细介绍">
          <el-input v-model="formData.introduction" type="textarea" :rows="4" placeholder="补充详细的履历介绍..." />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Delete, Edit, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// ---- 搜索与分页相关 ----
const searchForm = reactive({ name: '', department: '' })
const pageParams = reactive({ pageNum: 1, pageSize: 10 })
const total = ref(0)
const loading = ref(false)
const selection = ref([])
const tableData = ref([])

const getDeptTagType = (dept) => {
  const map = {
    '综合内科': 'primary',
    '外科手术区': 'danger',
    '医学影像科': 'warning',
    '美容洗浴': 'success'
  }
  return map[dept] || 'info'
}

// 获取真实数据
const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/biz/doctors', { params: searchForm })
    if (res.code === 200) {
      tableData.value = res.data || []
      total.value = res.data.length
    }
  } catch (error) {
    console.error('获取医生列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageParams.pageNum = 1
  fetchList()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.department = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  pageParams.pageSize = val
  fetchList()
}

const handleCurrentChange = (val) => {
  pageParams.pageNum = val
  fetchList()
}

const handleSelectionChange = (val) => {
  selection.value = val
}

// ---- 表单与弹窗 ----
const dialogVisible = ref(false)
const dialogType = ref('add') // add or edit
const formRef = ref(null)

const formData = reactive({
  id: null,
  name: '',
  department: '',
  title: '',
  specialty: '',
  introduction: ''
})

const formRules = {
  name: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择所属科室', trigger: 'change' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }]
}

const openDialog = (type, row = null) => {
  dialogType.value = type
  dialogVisible.value = true
  
  if (type === 'edit' && row) {
    Object.assign(formData, row)
  } else {
    Object.assign(formData, {
      id: null, name: '', department: '', title: '', specialty: '', introduction: ''
    })
    if (formRef.value) formRef.value.resetFields()
  }
}

const submitForm = () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const method = dialogType.value === 'add' ? 'post' : 'put'
        const res = await request[method]('/biz/doctor', formData)
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
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
  ElMessageBox.confirm(
    `确定要永久移除 ${row.name} 医生的建制档案吗？`,
    '高危操作警告',
    { confirmButtonText: '确定移除', cancelButtonText: '取消', type: 'error' }
  ).then(async () => {
    try {
      const res = await request.delete(`/biz/doctor/${row.id}`)
      if (res.code === 200) {
        ElMessage.success('移除成功')
        fetchList()
      }
    } catch (err) {
      console.error('删除失败', err)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.table-container {
  animation: fadeIn 0.5s ease;
}

.box-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-form {
  margin-bottom: -18px; /* 补偿 form-item 的底边距 */
}

.action-bar {
  display: flex;
  gap: 10px;
}

:deep(.custom-header th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.custom-dialog-form :deep(.el-input__wrapper),
.custom-dialog-form :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  background-color: #f8fafc;
}

.custom-dialog-form :deep(.el-input__wrapper):hover,
.custom-dialog-form :deep(.el-textarea__inner):hover {
  box-shadow: 0 0 0 1px #94a3b8 inset;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

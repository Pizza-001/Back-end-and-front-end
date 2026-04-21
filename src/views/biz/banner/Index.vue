<template>
  <div class="table-container">
    <el-card class="box-card" shadow="never">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="left-actions">
          <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增轮播图</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        stripe
        border
        header-row-class-name="custom-header"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="轮播图预览" width="200" align="center">
          <template #default="scope">
            <el-image
              class="banner-preview"
              :src="scope.row.imgUrl"
              :preview-src-list="[scope.row.imgUrl]"
              fit="cover"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题描述" min-width="200" />
        <el-table-column prop="sort" label="排序权重" width="100" align="center">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.sort }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="启用状态" width="120" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link :icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button size="small" type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增轮播图' : '编辑轮播图'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题内容" />
        </el-form-item>
        <el-form-item label="跳转链接" prop="linkUrl">
          <el-input v-model="formData.linkUrl" placeholder="请输入跳转链接 (可选)" />
        </el-form-item>
        <el-form-item label="轮播图片">
          <div class="upload-placeholder">
            <el-icon><Upload /></el-icon>
            <div class="el-upload__text">
              点击或拖拽上传图片
            </div>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Edit, Delete, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageParams = reactive({ pageNum: 1, pageSize: 10 })
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

const formData = reactive({
  id: null,
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortNo: 1,
  isActive: 1
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/biz/banner/list', { params: pageParams })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取轮播图失败', error)
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
    Object.assign(formData, { id: null, title: '', imageUrl: '', linkUrl: '', sortNo: 1, isActive: 1 })
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const method = dialogType.value === 'add' ? 'post' : 'put'
        const res = await request[method]('/admin/biz/banner', formData)
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
          dialogVisible.value = false
          fetchList()
        }
      } catch (err) {
        console.error('保存失败', err)
      }
    }
  })
}

const handleStatusChange = async (row) => {
  try {
    const res = await request.put('/admin/biz/banner', row)
    if (res.code === 200) {
      ElMessage.success(`${row.title} 的状态已更新`)
    }
  } catch (err) {
    row.isActive = row.isActive === 1 ? 0 : 1 // 失败回滚
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这张轮播图吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      const res = await request.delete(`/admin/biz/banner/${row.id}`)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      }
    } catch (err) {
       console.error('删除失败', err)
    }
  })
}

onMounted(() => fetchList())
</script>

<style scoped>
.table-container {
  animation: fadeIn 0.5s ease;
}

.box-card {
  border-radius: 8px;
  border: none;
}

.toolbar {
  margin-bottom: 20px;
}

.banner-preview {
  width: 120px;
  height: 60px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
}

.upload-placeholder {
  width: 100%;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  background-color: #f8fafc;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #409eff;
}

.upload-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

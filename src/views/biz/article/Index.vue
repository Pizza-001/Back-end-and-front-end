<template>
  <div class="table-container">
    <el-card class="box-card" shadow="never">
      <!-- 搜索工具栏 -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="文章标题">
            <el-input v-model="searchForm.title" placeholder="模糊搜索标题" clearable />
          </el-form-item>
          <el-form-item label="发布状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
              <el-option label="已发布" :value="1" />
              <el-option label="草稿" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button type="primary" plain :icon="Plus" @click="openDialog('add')">撰写科普文章</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格内容 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe border header-row-class-name="custom-header">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="封面" width="120" align="center">
          <template #default="scope">
            <el-image :src="scope.row.cover" class="article-cover" fit="cover" :preview-src-list="[scope.row.cover]" preview-teleported />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="文章标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" align="center" />
        <el-table-column prop="viewCount" label="阅读量" width="100" align="center">
          <template #default="scope">
            <span class="view-tag"><el-icon><View /></el-icon> {{ scope.row.viewCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布日期" width="160" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link :icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button size="small" type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination background layout="total, prev, pager, next" :total="total" />
      </div>
    </el-card>

    <!-- 文章编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '发布新知' : '编辑文章'" width="700px" center>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="formData.title" placeholder="给文章起一个吸引人的标题吧..." />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择文章分类" style="width: 100%">
                <el-option label="健康科普" value="health" />
                <el-option label="养育心得" value="experience" />
                <el-option label="疫苗相关" value="vaccine" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="formData.author" placeholder="作者署名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="文章内容摘要">
          <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="简短地介绍一下文章的主要内容..." />
        </el-form-item>
        <el-form-item label="封面图片">
          <div class="cover-uploader">
            <el-icon class="uploader-icon"><Plus /></el-icon>
            <div class="uploader-text">上传封面</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">存为草稿</el-button>
        <el-button type="primary" @click="submitForm">立即发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Edit, Delete, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const total = ref(0)
const pageParams = reactive({ pageNum: 1, pageSize: 10 })
const tableData = ref([])
const searchForm = reactive({ title: '', status: null })
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

const formData = reactive({
  id: null,
  title: '',
  category: '',
  author: 'Admin',
  summary: '',
  coverImage: '',
  content: '',
  status: 1
})

const formRules = {
  title: [{ required: true, message: '请填写文章标题', trigger: 'blur' }],
  author: [{ required: true, message: '请填写作者', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/biz/article/list', {
      params: { ...pageParams, ...searchForm }
    })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取文章失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageParams.pageNum = 1
  fetchList()
}

const openDialog = (type, row = null) => {
  dialogType.value = type
  dialogVisible.value = true
  if (type === 'edit' && row) {
    Object.assign(formData, row)
  } else {
    Object.assign(formData, { id: null, title: '', category: '', author: 'Admin', summary: '', coverImage: '', content: '', status: 1 })
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const method = dialogType.value === 'add' ? 'post' : 'put'
        const res = await request[method]('/admin/biz/article', formData)
        if (res.code === 200) {
          ElMessage.success('操作成功')
          dialogVisible.value = false
          fetchList()
        }
      } catch (err) {
        console.error('保存失败', err)
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要彻底删除这篇文章吗？', '下架提示', { type: 'error' }).then(async () => {
    try {
      const res = await request.delete(`/admin/biz/article/${row.id}`)
      if (res.code === 200) {
        ElMessage.success('下架成功')
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
  animation: slideFadeIn 0.5s ease;
}

.box-card {
  border-radius: 8px;
  border: none;
}

.article-cover {
  width: 80px;
  height: 50px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.view-tag {
  color: #64748b;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.cover-uploader {
  width: 160px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s;
}

.cover-uploader:hover {
  border-color: #409eff;
  background: #f1f5f9;
}

.uploader-icon {
  font-size: 24px;
  color: #8c939d;
  margin-bottom: 4px;
}

.uploader-text {
  font-size: 12px;
  color: #64748b;
}

@keyframes slideFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

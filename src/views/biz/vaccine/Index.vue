<template>
  <div class="table-container">
    <el-card class="box-card" shadow="never">
      <!-- 搜索工具栏 -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="宠物姓名">
            <el-input v-model="searchForm.petName" placeholder="搜索宠物名" clearable />
          </el-form-item>
          <el-form-item label="疫苗种类">
            <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 150px;">
              <el-option label="狂犬疫苗" value="狂犬疫苗" />
              <el-option label="猫三联 / 犬四联" value="联合疫苗" />
              <el-option label="驱虫(体内)" value="驱虫(体内)" />
              <el-option label="驱虫(体外)" value="驱虫(体外)" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="fetchList">搜索记录</el-button>
            <el-button type="success" :icon="Plus" @click="openDialog('add')">新增接种记录</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" border stripe header-row-class-name="custom-header">
        <el-table-column prop="id" label="记录ID" width="90" align="center" />
        <el-table-column prop="petName" label="宠物姓名" width="120" align="center" />
        <el-table-column prop="vaccineName" label="疫苗/药物名称" min-width="180" />
        <el-table-column prop="inoculationTime" label="本次接种时间" width="160" align="center" />
        <el-table-column prop="nextTime" label="下期强化提醒" width="160" align="center">
          <template #default="scope">
            <span :class="{ 'warning-text': isDateClose(scope.row.nextTime) }">
              {{ scope.row.nextTime }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="executor" label="经确认人" width="120" align="center" />
        <el-table-column label="备注" prop="remark" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link :icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link :icon="Delete" @click="handleDelete(scope.row)">作废</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination background layout="total, prev, pager, next" :total="total" />
      </div>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '录入接种信息' : '修改接种记录'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="宠物姓名" prop="petName">
          <el-input v-model="formData.petName" placeholder="请输入接种宠物的名字" />
        </el-form-item>
        <el-form-item label="疫苗名称" prop="vaccineName">
          <el-select v-model="formData.vaccineName" style="width: 100%">
            <el-option label="狂犬病灭活疫苗" value="狂犬病灭活疫苗" />
            <el-option label="妙三多 (猫三联)" value="妙三多 (猫三联)" />
            <el-option label="贝卫多 (体外驱虫)" value="贝卫多 (体外驱虫)" />
            <el-option label="拜宠清 (体内驱虫)" value="拜宠清 (体内驱虫)" />
          </el-select>
        </el-form-item>
        <el-form-item label="接种日期" prop="inoculationTime">
          <el-date-picker v-model="formData.inoculationTime" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="formData.remark" type="textarea" placeholder="填写接种后的反应或注意事项..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认录入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const pageParams = reactive({ pageNum: 1, pageSize: 10 })
const searchForm = reactive({ petName: '', type: '' })
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

const formData = reactive({
  id: null,
  petId: '',
  vaccineName: '',
  injectTime: '',
  nextInjectTime: '',
  remarks: ''
})

const formRules = {
  petId: [{ required: true, message: '宠物ID不能为空', trigger: 'blur' }],
  vaccineName: [{ required: true, message: '请填写疫苗名称', trigger: 'blur' }],
  injectTime: [{ required: true, message: '请选择时间', trigger: 'change' }]
}

const isDateClose = (dateStr) => {
  if (!dateStr) return false
  const diff = new Date(dateStr) - new Date()
  return diff < 1000 * 60 * 60 * 24 * 30 // 一个月内提醒
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/biz/vaccine/list', { params: pageParams })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取疫苗记录失败', error)
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
    Object.assign(formData, { id: null, petId: '', vaccineName: '', injectTime: '', nextInjectTime: '', remarks: '' })
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const method = dialogType.value === 'add' ? 'post' : 'put'
        const res = await request[method]('/admin/biz/vaccine', formData)
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
  ElMessageBox.confirm('作废该记录将导致免疫逻辑失效，确定吗？', '作废警告', { type: 'warning' }).then(async () => {
    try {
      const res = await request.delete(`/admin/biz/vaccine/${row.id}`)
      if (res.code === 200) {
        ElMessage.success('记录已标记为作废')
        fetchList()
      }
    } catch (err) {
      console.error('操作失败', err)
    }
  })
}

onMounted(() => fetchList())
</script>

<style scoped>
.table-container { animation: fadeIn 0.5s; }
.warning-text { color: #e6a23c; font-weight: bold; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 20px; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

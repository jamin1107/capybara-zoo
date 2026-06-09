<template>
  <div class="page-container">
    <van-nav-bar title="用例执行" left-arrow @click-left="goBack" />

    <van-cell-group title="执行信息">
      <van-cell title="用例名称" :value="caseName || '未指定用例'" />
      <van-cell title="任务ID" :value="taskId || '未关联任务'" />
    </van-cell-group>

    <van-cell-group title="执行结果">
      <van-field
        v-model="executionResult.status"
        is-link
        readonly
        label="执行状态"
        placeholder="请选择"
        @click="showStatusPicker = true"
      />
      <van-field
        v-model="executionResult.actual_result"
        type="textarea"
        label="实际结果"
        placeholder="请输入实际执行结果"
        rows="4"
      />
      <van-field
        v-model="executionResult.duration"
        type="digit"
        label="执行耗时"
        placeholder="分钟"
      />
      <van-field
        v-model="executionResult.remark"
        type="textarea"
        label="备注"
        placeholder="其他说明"
        rows="2"
      />
    </van-cell-group>

    <van-cell-group title="关联缺陷">
      <van-cell title="是否关联缺陷">
        <template #right-icon>
          <van-switch v-model="hasBug" size="20" />
        </template>
      </van-cell>
      <van-field
        v-if="hasBug"
        v-model="executionResult.bug_title"
        label="缺陷标题"
        placeholder="请输入缺陷标题"
      />
    </van-cell-group>

    <div class="action-buttons">
      <van-button type="primary" block @click="submitExecution">
        提交执行结果
      </van-button>
    </div>

    <van-action-sheet v-model:show="showStatusPicker" :actions="statusOptions" @select="onSelectStatus" />

    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">工作台</van-tabbar-item>
      <van-tabbar-item icon="folder-o">用例库</van-tabbar-item>
      <van-tabbar-item icon="todo-list-o" dot>任务</van-tabbar-item>
      <van-tabbar-item icon="warning-o">缺陷</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTestStore } from '../stores/test'
import { executionsAPI, bugsAPI } from '../api'
import { showToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()
const store = useTestStore()

const activeTab = 2
const taskId = ref('')
const caseName = ref('')
const hasBug = ref(false)
const showStatusPicker = ref(false)

const executionResult = ref({
  status: '通过',
  actual_result: '',
  duration: 0,
  remark: '',
  bug_title: ''
})

const statusOptions = [
  { name: '通过' },
  { name: '失败' },
  { name: '阻塞' },
  { name: '跳过' }
]

onMounted(() => {
  if (route.params.taskId) {
    taskId.value = route.params.taskId
  }
  if (route.query.caseName) {
    caseName.value = route.query.caseName
  }
})

function goBack() {
  if (taskId.value) {
    router.push(`/tasks/${taskId.value}`)
  } else {
    router.push('/tasks')
  }
}

function onSelectStatus(action) {
  executionResult.value.status = action.name
  showStatusPicker.value = false
}

async function submitExecution() {
  try {
    const executionData = {
      execution_id: `EXEC-${Date.now()}`,
      task_id: taskId.value,
      case_id: route.query.caseId || '',
      executor: '当前用户',
      status: executionResult.value.status,
      actual_result: executionResult.value.actual_result,
      duration: executionResult.value.duration,
      remark: executionResult.value.remark
    }

    const res = await executionsAPI.create(executionData)

    if (res.code === 0) {
      if (hasBug.value && executionResult.value.bug_title) {
        const bugData = {
          bug_id: `BUG-${Date.now()}`,
          title: executionResult.value.bug_title,
          severity: '一般',
          priority: 'P2',
          status: '新建',
          case_id: route.query.caseId || '',
          task_id: taskId.value,
          description: `关联用例执行失败：${executionResult.value.actual_result}`
        }
        await bugsAPI.create(bugData)
      }

      showSuccessToast('执行结果已提交')
      setTimeout(() => {
        goBack()
      }, 1500)
    }
  } catch (error) {
    showToast('提交失败')
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  padding: 20px 16px;
}
</style>
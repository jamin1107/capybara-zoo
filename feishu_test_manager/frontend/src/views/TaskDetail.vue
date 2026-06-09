<template>
  <div class="page-container">
    <van-nav-bar title="任务详情" left-arrow @click-left="goBack" />

    <van-skeleton title :row="10" :loading="loading">
      <div v-if="currentTask" class="task-detail">
        <van-cell-group title="基本信息">
          <van-cell title="任务ID" :value="currentTask.fields.task_id" />
          <van-cell title="任务名称" :value="currentTask.fields.task_name" />
          <van-cell title="所属项目" :value="currentTask.fields.project || '未指定'" />
          <van-cell title="测试版本" :value="currentTask.fields.version || '未指定'" />
          <van-cell title="优先级" :value="currentTask.fields.priority || 'P2'" />
          <van-cell title="状态">
            <template #value>
              <van-tag :type="getStatusType(currentTask.fields.status)">
                {{ currentTask.fields.status || '待开始' }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>

        <van-cell-group title="执行进度">
          <van-cell>
            <van-progress
              :percentage="getProgress(currentTask.fields)"
              :color="getProgressColor(currentTask.fields)"
              :show-pivot="true"
            />
          </van-cell>
          <van-cell title="用例总数" :value="currentTask.fields.case_count || 0" />
          <van-cell title="已执行" :value="currentTask.fields.executed_count || 0" />
          <van-cell title="通过" :value="currentTask.fields.passed_count || 0" />
          <van-cell title="失败" :value="currentTask.fields.failed_count || 0" />
        </van-cell-group>

        <van-cell-group title="时间计划">
          <van-cell title="计划开始" :value="currentTask.fields.plan_start || '未指定'" />
          <van-cell title="计划结束" :value="currentTask.fields.plan_end || '未指定'" />
          <van-cell title="实际开始" :value="currentTask.fields.actual_start || '未开始'" />
        </van-cell-group>

        <van-button type="primary" block @click="startExecute" class="execute-btn">
          开始执行用例
        </van-button>

        <van-button
          v-if="currentTask.fields.status === '进行中'"
          type="success"
          block
          @click="completeTask"
          class="complete-btn"
        >
          完成任务
        </van-button>
      </div>
    </van-skeleton>

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
import { tasksAPI } from '../api'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const store = useTestStore()

const activeTab = 2
const loading = ref(true)
const currentTask = ref(null)

onMounted(async () => {
  await loadTask()
})

async function loadTask() {
  try {
    const res = await tasksAPI.get(route.params.id)
    if (res.code === 0) {
      currentTask.value = res.data
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/tasks')
}

function getProgress(fields) {
  const total = fields.case_count || 0
  const executed = fields.executed_count || 0
  if (total === 0) return 0
  return Math.round((executed / total) * 100)
}

function getProgressColor(fields) {
  const progress = getProgress(fields)
  if (progress >= 100) return '#07c160'
  if (progress >= 50) return '#1989fa'
  return '#ff976a'
}

function getStatusType(status) {
  const types = {
    '待开始': 'default',
    '进行中': 'primary',
    '已完成': 'success',
    '已关闭': 'warning'
  }
  return types[status] || 'default'
}

function startExecute() {
  if (currentTask.value) {
    router.push(`/execute/${currentTask.value.record_id}`)
  }
}

async function completeTask() {
  try {
    const res = await tasksAPI.updateStatus(route.params.id, '已完成')
    if (res.code === 0) {
      showToast('任务已完成')
      await loadTask()
      await store.fetchTasks()
    }
  } catch (error) {
    showToast('操作失败')
  }
}
</script>

<style lang="scss" scoped>
.execute-btn {
  margin: 20px 16px 10px;
}

.complete-btn {
  margin: 0 16px 20px;
}
</style>
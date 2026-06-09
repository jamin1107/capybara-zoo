<template>
  <div class="page-container">
    <van-nav-bar title="测试任务" left-arrow @click-left="goBack" />

    <van-tabs v-model:active="activeStatus" @change="onStatusChange">
      <van-tab title="全部" name="all" />
      <van-tab title="待开始" name="待开始" />
      <van-tab title="进行中" name="进行中" />
      <van-tab title="已完成" name="已完成" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group>
          <van-cell
            v-for="item in filteredTasks"
            :key="item.record_id"
            is-link
            @click="goToDetail(item.record_id)"
          >
            <template #title>
              <div class="task-title">{{ item.fields.task_name }}</div>
              <div class="task-info">ID: {{ item.fields.task_id }} | {{ item.fields.project || '未指定项目' }}</div>
            </template>
            <template #label>
              <div class="task-progress">
                <van-progress
                  :percentage="getProgress(item.fields)"
                  :color="getProgressColor(item.fields)"
                  :show-pivot="true"
                />
              </div>
              <div class="task-meta">
                <span>版本: {{ item.fields.version || '未指定' }}</span>
                <span>负责人: {{ item.fields.assign_to || '未分配' }}</span>
              </div>
            </template>
            <template #tags>
              <van-tag :type="getStatusType(item.fields.status)">
                {{ item.fields.status || '待开始' }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <van-popup v-model:show="showAddPopup" position="bottom" style="height: 85%;">
      <div class="popup-content">
        <van-nav-bar
          title="创建任务"
          left-text="取消"
          right-text="保存"
          @click-left="showAddPopup = false"
          @click-right="saveTask"
        />

        <van-form>
          <van-cell-group inset>
            <van-field
              v-model="newTask.task_id"
              label="任务ID"
              placeholder="如: TASK-001"
              :rules="[{ required: true, message: '请填写任务ID' }]"
            />
            <van-field
              v-model="newTask.task_name"
              label="任务名称"
              placeholder="请输入任务名称"
              :rules="[{ required: true, message: '请填写任务名称' }]"
            />
            <van-field
              v-model="newTask.project"
              label="所属项目"
              placeholder="请输入项目名称"
            />
            <van-field
              v-model="newTask.version"
              label="测试版本"
              placeholder="如: v1.0.0"
            />
            <van-field
              v-model="newTask.priority"
              is-link
              readonly
              label="优先级"
              placeholder="请选择"
              @click="showPriorityPicker = true"
            />
            <van-field
              v-model="newTask.plan_start"
              is-link
              readonly
              label="计划开始"
              placeholder="请选择日期"
              @click="showDatePicker = true"
            />
            <van-field
              v-model="newTask.plan_end"
              is-link
              readonly
              label="计划结束"
              placeholder="请选择日期"
              @click="showDatePicker2 = true"
            />
            <van-field
              v-model="newTask.case_count"
              type="digit"
              label="用例数量"
              placeholder="请输入关联用例数量"
            />
          </van-cell-group>
        </van-form>
      </div>
    </van-popup>

    <van-action-sheet v-model:show="showPriorityPicker" :actions="priorityOptions" @select="onSelectPriority" />
    <van-date-picker
      v-model:show="showDatePicker"
      :min-date="minDate"
      title="选择日期"
      @confirm="onDateConfirm"
    />
    <van-date-picker
      v-model:show="showDatePicker2"
      :min-date="minDate"
      title="选择日期"
      @confirm="onDateConfirm2"
    />

    <van-floating-button icon="plus" type="primary" class="fab" @click="showAddPopup = true" />

    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">工作台</van-tabbar-item>
      <van-tabbar-item icon="folder-o">用例库</van-tabbar-item>
      <van-tabbar-item icon="todo-list-o" dot>任务</van-tabbar-item>
      <van-tabbar-item icon="warning-o">缺陷</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTestStore } from '../stores/test'
import { showToast } from 'vant'

const router = useRouter()
const store = useTestStore()

const activeTab = 2
const activeStatus = ref('all')
const loading = ref(false)
const finished = ref(true)
const refreshing = ref(false)
const showAddPopup = ref(false)
const showPriorityPicker = ref(false)
const showDatePicker = ref(false)
const showDatePicker2 = ref(false)
const minDate = new Date()

const newTask = ref({
  task_id: '',
  task_name: '',
  project: '',
  version: '',
  priority: 'P2',
  plan_start: '',
  plan_end: '',
  case_count: 0
})

const priorityOptions = [
  { name: 'P0 - 紧急' },
  { name: 'P1 - 高' },
  { name: 'P2 - 中' },
  { name: 'P3 - 低' }
]

const filteredTasks = computed(() => {
  if (activeStatus.value === 'all') {
    return store.tasks
  }
  return store.tasks.filter(t => t.fields.status === activeStatus.value)
})

onMounted(() => {
  store.fetchTasks()
})

function onLoad() {
  store.fetchTasks()
  loading.value = false
  finished.value = true
}

function onRefresh() {
  store.fetchTasks()
  refreshing.value = false
}

function onStatusChange() {
  // 过滤逻辑已在computed中处理
}

function goBack() {
  router.push('/dashboard')
}

function goToDetail(id) {
  router.push(`/tasks/${id}`)
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

function onSelectPriority(action) {
  newTask.value.priority = action.name.split(' - ')[0]
  showPriorityPicker.value = false
}

function onDateConfirm({ selectedValues }) {
  newTask.value.plan_start = selectedValues.join('-')
  showDatePicker.value = false
}

function onDateConfirm2({ selectedValues }) {
  newTask.value.plan_end = selectedValues.join('-')
  showDatePicker2.value = false
}

async function saveTask() {
  try {
    const res = await store.createTask(newTask.value)
    if (res.code === 0) {
      showToast('任务创建成功')
      showAddPopup.value = false
      newTask.value = {
        task_id: '',
        task_name: '',
        project: '',
        version: '',
        priority: 'P2',
        plan_start: '',
        plan_end: '',
        case_count: 0
      }
    } else {
      showToast(res.message || '创建失败')
    }
  } catch (error) {
    showToast('创建失败')
  }
}
</script>

<style lang="scss" scoped>
.task-title {
  font-weight: 600;
  font-size: 15px;
}

.task-info {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.task-progress {
  margin: 8px 0;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 80px;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
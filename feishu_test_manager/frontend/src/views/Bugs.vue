<template>
  <div class="page-container">
    <van-nav-bar title="缺陷管理" left-arrow @click-left="goBack" />

    <van-tabs v-model:active="activeStatus" @change="onStatusChange">
      <van-tab title="全部" name="all" />
      <van-tab title="新建" name="新建" />
      <van-tab title="确认" name="确认" />
      <van-tab title="修复中" name="修复中" />
      <van-tab title="已关闭" name="已关闭" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list :finished="finished">
        <van-cell-group>
          <van-cell
            v-for="item in filteredBugs"
            :key="item.record_id"
            is-link
            @click="goToDetail(item.record_id)"
          >
            <template #title>
              <div class="bug-title">{{ item.fields.title }}</div>
              <div class="bug-id">ID: {{ item.fields.bug_id }}</div>
            </template>
            <template #tags>
              <van-tag :type="getSeverityType(item.fields.severity)" style="margin-right: 4px;">
                {{ item.fields.severity || '一般' }}
              </van-tag>
              <van-tag :type="getStatusType(item.fields.status)">
                {{ item.fields.status || '新建' }}
              </van-tag>
            </template>
            <template #label>
              <div class="bug-meta">
                <span>优先级: {{ item.fields.priority || 'P2' }}</span>
                <span>创建时间: {{ item.fields.create_time || '未知' }}</span>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <van-popup v-model:show="showAddPopup" position="bottom" style="height: 80%;">
      <div class="popup-content">
        <van-nav-bar
          title="新建缺陷"
          left-text="取消"
          right-text="保存"
          @click-left="showAddPopup = false"
          @click-right="saveBug"
        />

        <van-form>
          <van-cell-group inset>
            <van-field
              v-model="newBug.bug_id"
              label="缺陷ID"
              placeholder="如: BUG-001"
              :rules="[{ required: true, message: '请填写缺陷ID' }]"
            />
            <van-field
              v-model="newBug.title"
              label="缺陷标题"
              placeholder="请输入缺陷标题"
              :rules="[{ required: true, message: '请填写缺陷标题' }]"
            />
            <van-field
              v-model="newBug.severity"
              is-link
              readonly
              label="严重程度"
              placeholder="请选择"
              @click="showSeverityPicker = true"
            />
            <van-field
              v-model="newBug.priority"
              is-link
              readonly
              label="优先级"
              placeholder="请选择"
              @click="showPriorityPicker = true"
            />
            <van-field
              v-model="newBug.status"
              is-link
              readonly
              label="缺陷状态"
              placeholder="请选择"
              @click="showStatusPicker = true"
            />
            <van-field
              v-model="newBug.case_id"
              label="关联用例"
              placeholder="请输入关联用例ID"
            />
            <van-field
              v-model="newBug.description"
              type="textarea"
              label="缺陷描述"
              placeholder="请输入缺陷描述"
              rows="4"
            />
          </van-cell-group>
        </van-form>
      </div>
    </van-popup>

    <van-action-sheet v-model:show="showSeverityPicker" :actions="severityOptions" @select="onSelectSeverity" />
    <van-action-sheet v-model:show="showPriorityPicker" :actions="priorityOptions" @select="onSelectPriority" />
    <van-action-sheet v-model:show="showStatusPicker" :actions="statusOptions" @select="onSelectStatus" />

    <van-floating-button icon="plus" type="primary" class="fab" @click="showAddPopup = true" />

    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">工作台</van-tabbar-item>
      <van-tabbar-item icon="folder-o">用例库</van-tabbar-item>
      <van-tabbar-item icon="todo-list-o">任务</van-tabbar-item>
      <van-tabbar-item icon="warning-o" dot>缺陷</van-tabbar-item>
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

const activeTab = 3
const activeStatus = ref('all')
const refreshing = ref(false)
const finished = ref(true)
const showAddPopup = ref(false)
const showSeverityPicker = ref(false)
const showPriorityPicker = ref(false)
const showStatusPicker = ref(false)

const newBug = ref({
  bug_id: '',
  title: '',
  severity: '一般',
  priority: 'P2',
  status: '新建',
  case_id: '',
  description: ''
})

const severityOptions = [
  { name: '致命' },
  { name: '严重' },
  { name: '一般' },
  { name: '建议' }
]

const priorityOptions = [
  { name: 'P0 - 紧急' },
  { name: 'P1 - 高' },
  { name: 'P2 - 中' },
  { name: 'P3 - 低' }
]

const statusOptions = [
  { name: '新建' },
  { name: '确认' },
  { name: '修复中' },
  { name: '待验证' },
  { name: '已关闭' }
]

const filteredBugs = computed(() => {
  if (activeStatus.value === 'all') {
    return store.bugs
  }
  return store.bugs.filter(b => b.fields.status === activeStatus.value)
})

onMounted(() => {
  store.fetchBugs()
})

function onRefresh() {
  store.fetchBugs()
  refreshing.value = false
}

function onStatusChange() {
  // 过滤逻辑已在computed中处理
}

function goBack() {
  router.push('/dashboard')
}

function goToDetail(id) {
  router.push(`/bugs/${id}`)
}

function getSeverityType(severity) {
  const types = {
    '致命': 'danger',
    '严重': 'warning',
    '一般': 'primary',
    '建议': 'success'
  }
  return types[severity] || 'primary'
}

function getStatusType(status) {
  const types = {
    '新建': 'danger',
    '确认': 'warning',
    '修复中': 'primary',
    '待验证': 'info',
    '已关闭': 'success'
  }
  return types[status] || 'default'
}

function onSelectSeverity(action) {
  newBug.value.severity = action.name
  showSeverityPicker.value = false
}

function onSelectPriority(action) {
  newBug.value.priority = action.name.split(' - ')[0]
  showPriorityPicker.value = false
}

function onSelectStatus(action) {
  newBug.value.status = action.name
  showStatusPicker.value = false
}

async function saveBug() {
  try {
    const res = await store.createBug(newBug.value)
    if (res.code === 0) {
      showToast('缺陷创建成功')
      showAddPopup.value = false
      newBug.value = {
        bug_id: '',
        title: '',
        severity: '一般',
        priority: 'P2',
        status: '新建',
        case_id: '',
        description: ''
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
.bug-title {
  font-weight: 600;
  font-size: 15px;
}

.bug-id {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.bug-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
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
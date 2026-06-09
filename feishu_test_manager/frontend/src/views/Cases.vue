<template>
  <div class="page-container">
    <van-nav-bar title="用例库" left-arrow @click-left="goBack" />

    <van-search
      v-model="searchKeyword"
      placeholder="搜索用例"
      @search="onSearch"
      class="search-bar"
    />

    <van-tabs v-model:active="activeModule" @change="onTabChange">
      <van-tab title="全部" name="all" />
      <van-tab title="功能测试" name="功能测试" />
      <van-tab title="接口测试" name="接口测试" />
      <van-tab title="性能测试" name="性能测试" />
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
            v-for="item in filteredCases"
            :key="item.record_id"
            :title="item.fields.title"
            :label="`ID: ${item.fields.case_id} | 优先级: ${item.fields.priority || 'P2'}`"
            is-link
            @click="goToDetail(item.record_id)"
          >
            <template #tags>
              <van-tag :type="getPriorityType(item.fields.priority)" size="small">
                {{ item.fields.priority || 'P2' }}
              </van-tag>
              <van-tag type="default" size="small" style="margin-left: 4px;">
                {{ item.fields.type || '功能测试' }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <van-popup v-model:show="showAddPopup" position="bottom" style="height: 80%;">
      <div class="popup-content">
        <van-nav-bar
          title="新建用例"
          left-text="取消"
          right-text="保存"
          @click-left="showAddPopup = false"
          @click-right="saveCase"
        />

        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="newCase.case_id"
              name="case_id"
              label="用例ID"
              placeholder="如: TC-001"
              :rules="[{ required: true, message: '请填写用例ID' }]"
            />
            <van-field
              v-model="newCase.title"
              name="title"
              label="用例标题"
              placeholder="请输入用例标题"
              :rules="[{ required: true, message: '请填写用例标题' }]"
            />
            <van-field
              v-model="newCase.module"
              name="module"
              label="所属模块"
              placeholder="请输入所属模块"
            />
            <van-field
              v-model="newCase.type"
              name="type"
              is-link
              readonly
              label="用例类型"
              placeholder="请选择"
              @click="showTypePicker = true"
            />
            <van-field
              v-model="newCase.priority"
              name="priority"
              is-link
              readonly
              label="优先级"
              placeholder="请选择"
              @click="showPriorityPicker = true"
            />
            <van-field
              v-model="newCase.precondition"
              name="precondition"
              label="前置条件"
              type="textarea"
              placeholder="请输入前置条件"
              rows="2"
            />
            <van-field
              v-model="newCase.steps"
              name="steps"
              label="测试步骤"
              type="textarea"
              placeholder="请输入测试步骤"
              rows="4"
              :rules="[{ required: true, message: '请填写测试步骤' }]"
            />
            <van-field
              v-model="newCase.expected_result"
              name="expected_result"
              label="预期结果"
              type="textarea"
              placeholder="请输入预期结果"
              rows="2"
            />
          </van-cell-group>
        </van-form>
      </div>
    </van-popup>

    <van-action-sheet v-model:show="showTypePicker" :actions="typeOptions" @select="onSelectType" />
    <van-action-sheet v-model:show="showPriorityPicker" :actions="priorityOptions" @select="onSelectPriority" />

    <van-floating-button icon="plus" type="primary" class="fab" @click="showAddPopup = true" />

    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">工作台</van-tabbar-item>
      <van-tabbar-item icon="folder-o" dot>用例库</van-tabbar-item>
      <van-tabbar-item icon="todo-list-o">任务</van-tabbar-item>
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

const activeTab = 1
const searchKeyword = ref('')
const activeModule = ref('all')
const loading = ref(false)
const finished = ref(true)
const refreshing = ref(false)
const showAddPopup = ref(false)
const showTypePicker = ref(false)
const showPriorityPicker = ref(false)

const newCase = ref({
  case_id: '',
  title: '',
  module: '',
  type: '功能测试',
  priority: 'P2',
  precondition: '',
  steps: '',
  expected_result: ''
})

const typeOptions = [
  { name: '功能测试' },
  { name: '接口测试' },
  { name: '性能测试' }
]

const priorityOptions = [
  { name: 'P0 - 紧急' },
  { name: 'P1 - 高' },
  { name: 'P2 - 中' },
  { name: 'P3 - 低' }
]

const filteredCases = computed(() => {
  let result = store.cases

  if (activeModule.value !== 'all') {
    result = result.filter(c => c.fields.type === activeModule.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(c =>
      (c.fields.title && c.fields.title.toLowerCase().includes(keyword)) ||
      (c.fields.case_id && c.fields.case_id.toLowerCase().includes(keyword))
    )
  }

  return result
})

onMounted(() => {
  store.fetchCases()
})

function onLoad() {
  store.fetchCases()
  loading.value = false
  finished.value = true
}

function onRefresh() {
  store.fetchCases()
  refreshing.value = false
}

function onSearch() {
  // 搜索逻辑已在computed中处理
}

function onTabChange() {
  // 切换标签逻辑已在computed中处理
}

function goBack() {
  router.push('/dashboard')
}

function goToDetail(id) {
  router.push(`/cases/${id}`)
}

function getPriorityType(priority) {
  const types = {
    'P0': 'danger',
    'P1': 'warning',
    'P2': 'primary',
    'P3': 'success'
  }
  return types[priority] || 'primary'
}

function onSelectType(action) {
  newCase.value.type = action.name
  showTypePicker.value = false
}

function onSelectPriority(action) {
  newCase.value.priority = action.name.split(' - ')[0]
  showPriorityPicker.value = false
}

async function saveCase() {
  try {
    const res = await store.createCase(newCase.value)
    if (res.code === 0) {
      showToast('用例创建成功')
      showAddPopup.value = false
      newCase.value = {
        case_id: '',
        title: '',
        module: '',
        type: '功能测试',
        priority: 'P2',
        precondition: '',
        steps: '',
        expected_result: ''
      }
    } else {
      showToast(res.message || '创建失败')
    }
  } catch (error) {
    showToast('创建失败')
  }
}

function onSubmit() {
  saveCase()
}
</script>

<style lang="scss" scoped>
.search-bar {
  background: #fff;
  padding: 8px 16px;
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

  :deep(.van-nav-bar) {
    flex-shrink: 0;
  }

  :deep(.van-form) {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
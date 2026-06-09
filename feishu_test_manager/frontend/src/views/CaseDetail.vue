<template>
  <div class="page-container">
    <van-nav-bar title="用例详情" left-arrow @click-left="goBack" />

    <van-skeleton title :row="10" :loading="loading">
      <div v-if="currentCase" class="case-detail">
        <van-cell-group title="基本信息">
          <van-cell title="用例ID" :value="currentCase.fields.case_id" />
          <van-cell title="用例标题" :value="currentCase.fields.title" />
          <van-cell title="所属模块" :value="currentCase.fields.module || '未指定'" />
          <van-cell title="优先级" :value="currentCase.fields.priority || 'P2'" />
          <van-cell title="用例类型" :value="currentCase.fields.type || '功能测试'" />
        </van-cell-group>

        <van-cell-group title="前置条件">
          <van-cell>
            <div class="content-text">{{ currentCase.fields.precondition || '无' }}</div>
          </van-cell>
        </van-cell-group>

        <van-cell-group title="测试步骤">
          <van-cell>
            <div class="content-text">{{ currentCase.fields.steps || '未填写' }}</div>
          </van-cell>
        </van-cell-group>

        <van-cell-group title="预期结果">
          <van-cell>
            <div class="content-text">{{ currentCase.fields.expected_result || '未填写' }}</div>
          </van-cell>
        </van-cell-group>

        <van-button type="primary" block @click="executeCase" class="execute-btn">
          执行此用例
        </van-button>
      </div>
    </van-skeleton>

    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">工作台</van-tabbar-item>
      <van-tabbar-item icon="folder-o" dot>用例库</van-tabbar-item>
      <van-tabbar-item icon="todo-list-o">任务</van-tabbar-item>
      <van-tabbar-item icon="warning-o">缺陷</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTestStore } from '../stores/test'
import { casesAPI } from '../api'

const route = useRoute()
const router = useRouter()
const store = useTestStore()

const activeTab = 1
const loading = ref(true)
const currentCase = ref(null)

onMounted(async () => {
  await loadCase()
})

async function loadCase() {
  try {
    const res = await casesAPI.get(route.params.id)
    if (res.code === 0) {
      currentCase.value = res.data
    }
  } catch (error) {
    console.error('获取用例详情失败:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/cases')
}

function executeCase() {
  if (currentCase.value) {
    router.push(`/execute?caseId=${currentCase.value.record_id}&caseName=${encodeURIComponent(currentCase.value.fields.title)}`)
  }
}
</script>

<style lang="scss" scoped>
.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
}

.execute-btn {
  margin: 20px 16px;
}
</style>
<template>
  <div class="page-container">
    <van-nav-bar title="测试报告" left-arrow @click-left="goBack" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list :finished="finished">
        <van-cell-group title="执行统计">
          <van-cell>
            <template #title>
              <div class="stat-row">
                <div class="stat-item">
                  <span class="stat-value">{{ stats.total_cases }}</span>
                  <span class="stat-label">用例总数</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value warning">{{ stats.total_bugs }}</span>
                  <span class="stat-label">缺陷总数</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ stats.total_executions }}</span>
                  <span class="stat-label">执行次数</span>
                </div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>

        <van-cell-group title="任务完成情况">
          <van-cell title="进行中任务" :value="`${stats.active_tasks} 个`" />
          <van-cell title="待处理缺陷" :value="`${stats.pending_bugs} 个`" />
        </van-cell-group>

        <van-cell-group title="最近报告" v-if="reports.length > 0">
          <van-cell
            v-for="report in reports"
            :key="report.record_id"
            :title="report.fields.report_name"
            :label="`生成时间: ${report.fields.create_time || '未知'}`"
            is-link
          >
            <template #tags>
              <van-tag type="success">通过率 {{ report.fields.pass_rate || 0 }}%</van-tag>
            </template>
            <template #value>
              <div class="report-stats">
                <div>通过: {{ report.fields.passed_cases || 0 }}</div>
                <div>失败: {{ report.fields.failed_cases || 0 }}</div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>

        <van-empty v-else description="暂无测试报告" />
      </van-list>
    </van-pull-refresh>

    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">工作台</van-tabbar-item>
      <van-tabbar-item icon="folder-o">用例库</van-tabbar-item>
      <van-tabbar-item icon="todo-list-o">任务</van-tabbar-item>
      <van-tabbar-item icon="warning-o">缺陷</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTestStore } from '../stores/test'
import { reportsAPI } from '../api'

const router = useRouter()
const store = useTestStore()

const activeTab = 0
const refreshing = ref(false)
const finished = ref(true)
const reports = ref([])

const stats = computed(() => store.stats)

onMounted(async () => {
  await store.initSystem()
  await fetchReports()
})

async function fetchReports() {
  try {
    const res = await reportsAPI.list()
    if (res.code === 0) {
      reports.value = res.data.records
    }
  } catch (error) {
    console.error('获取报告失败:', error)
  }
}

function onRefresh() {
  store.initSystem()
  fetchReports()
  refreshing.value = false
}

function goBack() {
  router.push('/dashboard')
}
</script>

<style lang="scss" scoped>
.stat-row {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
}

.stat-item {
  text-align: center;
  flex: 1;

  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #1989fa;

    &.warning {
      color: #ff976a;
    }
  }

  .stat-label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
}

.report-stats {
  text-align: right;
  font-size: 12px;
  color: #666;
}
</style>
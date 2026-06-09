<template>
  <div class="page-container">
    <van-nav-bar title="工作台" />

    <div class="stats-grid">
      <div class="stat-card" @click="goTo('/cases')">
        <div class="stat-value">{{ stats.total_cases }}</div>
        <div class="stat-label">用例总数</div>
      </div>
      <div class="stat-card" @click="goTo('/tasks')">
        <div class="stat-value">{{ stats.total_tasks }}</div>
        <div class="stat-label">测试任务</div>
      </div>
      <div class="stat-card" @click="goTo('/bugs')">
        <div class="stat-value warning">{{ stats.pending_bugs }}</div>
        <div class="stat-label">待处理缺陷</div>
      </div>
      <div class="stat-card" @click="goTo('/reports')">
        <div class="stat-value">{{ stats.total_executions }}</div>
        <div class="stat-label">执行记录</div>
      </div>
    </div>

    <van-cell-group title="快捷操作" class="quick-actions">
      <van-cell title="新建用例" is-link @click="goTo('/cases')" icon="plus" />
      <van-cell title="创建任务" is-link @click="goTo('/tasks')" icon="todo-list-o" />
      <van-cell title="提交缺陷" is-link @click="goTo('/bugs')" icon="warning-o" />
      <van-cell title="查看报告" is-link @click="goTo('/reports')" icon="chart-trending-o" />
    </van-cell-group>

    <van-cell-group title="进行中的任务" class="active-tasks">
      <template v-if="activeTasksList.length > 0">
        <van-cell
          v-for="task in activeTasksList"
          :key="task.record_id"
          :title="task.fields.task_name"
          :label="`项目: ${task.fields.project || '未指定'}`"
          is-link
          @click="goTo(`/tasks/${task.record_id}`)"
        >
          <template #right-icon>
            <van-tag type="primary">{{ task.fields.status }}</van-tag>
          </template>
        </van-cell>
      </template>
      <van-empty v-else description="暂无进行中的任务" />
    </van-cell-group>

    <van-cell-group title="待处理缺陷" class="pending-bugs">
      <template v-if="pendingBugsList.length > 0">
        <van-cell
          v-for="bug in pendingBugsList"
          :key="bug.record_id"
          :title="bug.fields.title"
          :label="`严重程度: ${bug.fields.severity || '一般'}`"
          is-link
          @click="goTo(`/bugs`)"
        >
          <template #right-icon>
            <van-tag :type="getSeverityType(bug.fields.severity)">
              {{ bug.fields.severity || '一般' }}
            </van-tag>
          </template>
        </van-cell>
      </template>
      <van-empty v-else description="暂无待处理缺陷" />
    </van-cell-group>

    <van-tabbar v-model="activeTab" @change="onTabChange">
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

const router = useRouter()
const store = useTestStore()
const activeTab = ref(0)

const stats = computed(() => store.stats)
const activeTasksList = computed(() => store.tasks.filter(t => t.fields.status === '进行中').slice(0, 3))
const pendingBugsList = computed(() => store.bugs.filter(b => ['新建', '确认', '修复中'].includes(b.fields.status)).slice(0, 3))

onMounted(() => {
  store.initSystem()
})

function goTo(path) {
  router.push(path)
}

function onTabChange(index) {
  const routes = ['/dashboard', '/cases', '/tasks', '/bugs']
  router.push(routes[index])
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
</script>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f5f5f5;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1989fa;

    &.warning {
      color: #ff976a;
    }
  }

  .stat-label {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
  }
}

.quick-actions,
.active-tasks,
.pending-bugs {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
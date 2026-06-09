import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { casesAPI, tasksAPI, executionsAPI, bugsAPI, reportsAPI, statsAPI } from '../api'

export const useTestStore = defineStore('test', () => {
  const cases = ref([])
  const tasks = ref([])
  const executions = ref([])
  const bugs = ref([])
  const reports = ref([])
  const loading = ref(false)
  const stats = ref({
    total_cases: 0,
    total_tasks: 0,
    total_bugs: 0,
    total_executions: 0,
    active_tasks: 0,
    pending_bugs: 0
  })

  async function initSystem() {
    loading.value = true
    try {
      await Promise.all([
        fetchCases(),
        fetchTasks(),
        fetchBugs()
      ])
      await fetchStats()
    } catch (error) {
      console.error('初始化失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchCases() {
    try {
      const res = await casesAPI.list()
      if (res.code === 0) {
        cases.value = res.data.records
      }
    } catch (error) {
      console.error('获取用例失败:', error)
    }
  }

  async function fetchTasks() {
    try {
      const res = await tasksAPI.list()
      if (res.code === 0) {
        tasks.value = res.data.records
      }
    } catch (error) {
      console.error('获取任务失败:', error)
    }
  }

  async function fetchBugs() {
    try {
      const res = await bugsAPI.list()
      if (res.code === 0) {
        bugs.value = res.data.records
      }
    } catch (error) {
      console.error('获取缺陷失败:', error)
    }
  }

  async function fetchStats() {
    try {
      const res = await statsAPI.dashboard()
      if (res.code === 0) {
        stats.value = res.data
      }
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  async function createCase(data) {
    const res = await casesAPI.create(data)
    if (res.code === 0) {
      await fetchCases()
    }
    return res
  }

  async function updateCase(id, data) {
    const res = await casesAPI.update(id, data)
    if (res.code === 0) {
      await fetchCases()
    }
    return res
  }

  async function deleteCase(id) {
    const res = await casesAPI.delete(id)
    if (res.code === 0) {
      await fetchCases()
    }
    return res
  }

  async function createTask(data) {
    const res = await tasksAPI.create(data)
    if (res.code === 0) {
      await fetchTasks()
    }
    return res
  }

  async function updateTask(id, data) {
    const res = await tasksAPI.update(id, data)
    if (res.code === 0) {
      await fetchTasks()
    }
    return res
  }

  async function createBug(data) {
    const res = await bugsAPI.create(data)
    if (res.code === 0) {
      await fetchBugs()
    }
    return res
  }

  async function updateBug(id, data) {
    const res = await bugsAPI.update(id, data)
    if (res.code === 0) {
      await fetchBugs()
    }
    return res
  }

  async function executeCase(executionData) {
    const res = await executionsAPI.create(executionData)
    if (res.code === 0) {
      await fetchStats()
    }
    return res
  }

  const caseCount = computed(() => cases.value.length)
  const taskCount = computed(() => tasks.value.length)
  const bugCount = computed(() => bugs.value.length)
  const activeTasks = computed(() => tasks.value.filter(t => t.fields.status === '进行中').length)
  const pendingBugs = computed(() => bugs.value.filter(b => ['新建', '确认', '修复中'].includes(b.fields.status)).length)

  return {
    cases,
    tasks,
    executions,
    bugs,
    reports,
    loading,
    stats,
    caseCount,
    taskCount,
    bugCount,
    activeTasks,
    pendingBugs,
    initSystem,
    fetchCases,
    fetchTasks,
    fetchBugs,
    fetchStats,
    createCase,
    updateCase,
    deleteCase,
    createTask,
    updateTask,
    createBug,
    updateBug,
    executeCase
  }
})
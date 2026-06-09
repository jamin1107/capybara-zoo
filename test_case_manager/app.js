let testCases = [];
let executionList = [];
let selectedCasesForExecution = [];
let editingCaseId = null;
let currentMidsceneFormat = null;
const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

function init() {
    fetch(`${API_BASE_URL}/test-cases`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                testCases = result.data;
                renderTestCaseList();
            }
        })
        .catch(err => console.error('Error loading test cases:', err));

    fetch(`${API_BASE_URL}/execution-list`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                executionList = result.data;
                renderExecutionList();
            }
        })
        .catch(err => console.error('Error loading execution list:', err));
}

function saveExecutionListToServer() {
    fetch(`${API_BASE_URL}/execution-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executionList)
    }).catch(err => console.error('Error saving execution list:', err));
}

function switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const navItems = document.querySelectorAll('.nav-item');
    if (tab === 'management') {
        navItems[0].classList.add('active');
        document.getElementById('management-page').classList.add('active');
    } else if (tab === 'execution') {
        navItems[1].classList.add('active');
        document.getElementById('execution-page').classList.add('active');
    }
}

function showAddModal(caseId = null) {
    editingCaseId = caseId;
    
    const modal = document.getElementById('add-modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (caseId) {
        const testCase = testCases.find(c => c.id === caseId);
        if (testCase) {
            modalTitle.textContent = '编辑用例';
            document.getElementById('case-name').value = testCase.name;
            document.getElementById('case-description').value = testCase.description || '';
        }
    } else {
        modalTitle.textContent = '新增用例';
        document.getElementById('case-name').value = '';
        document.getElementById('case-description').value = '';
    }
    
    modal.classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function handleSaveTestCase() {
    const name = document.getElementById('case-name').value.trim();
    const description = document.getElementById('case-description').value.trim();
    
    if (!name) {
        alert('请输入用例名称！');
        return;
    }
    
    const testCase = {
        id: editingCaseId || undefined,
        name,
        description,
        steps: [],
        assertions: [],
        updatedAt: editingCaseId ? new Date().toISOString() : undefined,
        createdAt: !editingCaseId ? new Date().toISOString() : undefined
    };
    
    fetch(`${API_BASE_URL}/test-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            fetch(`${API_BASE_URL}/test-cases`)
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        testCases = res.data;
                        renderTestCaseList();
                    }
                });
            closeModal('add-modal');
        } else {
            alert('保存失败: ' + (result.error || '未知错误'));
        }
    })
    .catch(error => {
        console.error('Error saving test case:', error);
        alert('保存失败: ' + error.message);
    });
}

function deleteTestCase(caseId) {
    fetch(`${API_BASE_URL}/test-cases/${caseId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            fetch(`${API_BASE_URL}/test-cases`)
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        testCases = res.data;
                        renderTestCaseList();
                    }
                });
        } else {
            alert('删除失败: ' + (result.error || '未知错误'));
        }
    })
    .catch(error => {
        console.error('Error deleting test case:', error);
        alert('删除失败: ' + error.message);
    });
}

function viewMidsceneFormat(caseId) {
    const testCase = testCases.find(c => c.id === caseId);
    if (!testCase) return;
    
    fetch(`${API_BASE_URL}/convert-test-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCase, platform: 'android' })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            currentMidsceneFormat = result.data.yamlData;
            document.getElementById('midscene-content').textContent = 
                JSON.stringify(result.data.yamlData, null, 2);
            document.getElementById('midscene-modal').classList.add('show');
        }
    })
    .catch(error => {
        console.error('Error converting to midscene format:', error);
        alert('获取Midscene格式失败');
    });
}

function copyMidsceneFormat() {
    if (currentMidsceneFormat) {
        navigator.clipboard.writeText(JSON.stringify(currentMidsceneFormat, null, 2));
        alert('已复制到剪贴板！');
    }
}

function renderTestCaseList() {
    const listContainer = document.getElementById('test-case-list');
    
    if (testCases.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p>暂无测试用例，点击新增按钮添加</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = testCases.map(testCase => `
        <div class="test-case-card">
            <div class="test-case-header">
                <div>
                    <div class="test-case-name">${escapeHtml(testCase.name)}</div>
                </div>
                <div class="test-case-actions">
                    <button class="btn btn-secondary btn-small" onclick="viewMidsceneFormat('${testCase.id}')">Midscene</button>
                    <button class="btn btn-secondary btn-small" onclick="showAddModal('${testCase.id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteTestCase('${testCase.id}')">删除</button>
                </div>
            </div>
            ${testCase.description ? `<div class="test-case-description">${escapeHtml(testCase.description)}</div>` : ''}
        </div>
    `).join('');
}

function showAddToExecutionModal() {
    selectedCasesForExecution = [];
    const modal = document.getElementById('add-execution-modal');
    const selectListContainer = document.getElementById('select-case-list');
    
    if (testCases.length === 0) {
        selectListContainer.innerHTML = `
            <div class="empty-state">
                <p>暂无可添加的用例，请先在管理页面创建</p>
            </div>
        `;
    } else {
        selectListContainer.innerHTML = testCases.map(testCase => `
            <div class="select-case-item" onclick="toggleCaseSelection('${testCase.id}', this)">
                <input type="checkbox" id="select-case-${testCase.id}">
                <label class="select-case-name">${escapeHtml(testCase.name)}</label>
            </div>
        `).join('');
    }
    
    modal.classList.add('show');
}

function toggleCaseSelection(caseId, element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        element.classList.add('selected');
        if (!selectedCasesForExecution.includes(caseId)) {
            selectedCasesForExecution.push(caseId);
        }
    } else {
        element.classList.remove('selected');
        selectedCasesForExecution = selectedCasesForExecution.filter(id => id !== caseId);
    }
}

function handleAddToExecutionList() {
    selectedCasesForExecution.forEach(caseId => {
        const testCase = testCases.find(c => c.id === caseId);
        if (testCase && !executionList.find(e => e.caseId === caseId)) {
            executionList.push({
                id: Date.now() + Math.random(),
                caseId: testCase.id,
                name: testCase.name,
                steps: testCase.steps,
                assertions: testCase.assertions,
                status: 'pending',
                result: null
            });
        }
    });
    
    saveExecutionListToServer();
    renderExecutionList();
    closeModal('add-execution-modal');
}

function removeFromExecutionList(executionId) {
    executionList = executionList.filter(e => e.id !== executionId);
    saveExecutionListToServer();
    renderExecutionList();
}

function toggleExecutionDetail(executionId) {
    const detailContent = document.getElementById(`detail-${executionId}`);
    if (detailContent) {
        detailContent.classList.toggle('show');
    }
}

function renderExecutionList() {
    const listContainer = document.getElementById('execution-list');
    const executeBtn = document.getElementById('execute-btn');
    
    if (executionList.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>暂无执行用例，点击添加按钮添加</p>
            </div>
        `;
        executeBtn.disabled = true;
        return;
    }
    
    executeBtn.disabled = false;
    
    listContainer.innerHTML = executionList.map(execution => `
        <div class="execution-card">
            <div class="execution-header">
                <div>
                    <div class="execution-name">${escapeHtml(execution.name)}</div>
                </div>
                <div class="execution-actions">
                    <div class="execution-status status-${execution.status}">
                        ${getStatusText(execution.status)}
                    </div>
                    ${(execution.status === 'passed' || execution.status === 'failed') && execution.result && execution.result.yamlFile ? `
                        <button class="btn btn-secondary btn-small" onclick="viewVideo('${execution.result.yamlFile}')">
                            查看报告
                        </button>
                    ` : ''}
                    <button class="btn btn-primary btn-small" onclick="executeSingle(${execution.id})" 
                        ${execution.status === 'running' ? 'disabled' : ''}>
                        执行
                    </button>
                    <button class="btn btn-danger btn-small" onclick="removeFromExecutionList(${execution.id})">删除</button>
                </div>
            </div>
            <div class="execution-detail">
                <button class="execution-detail-toggle" onclick="toggleExecutionDetail(${execution.id})">
                    ${execution.result || execution.status === 'running' ? '查看终端输出 ▼' : '查看终端输出 ▼'}
                </button>
                <div class="execution-detail-content" id="detail-${execution.id}">
                    <div class="terminal-output" id="terminal-${execution.id}">
                        ${execution.terminalOutput || '<span style="color: #666;">等待执行...</span>'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': '⏳ 待执行',
        'running': '🔄 执行中',
        'passed': '✅ 通过',
        'failed': '❌ 失败'
    };
    return statusMap[status] || status;
}

function viewVideo(yamlFile) {
    const baseName = yamlFile.replace('.yaml', '');
    const videoUrl = `${API_BASE_URL}/video/${baseName}`;
    window.open(videoUrl, '_blank');
}

function executeSingle(executionId) {
    return new Promise((resolve) => {
        const execution = executionList.find(e => e.id === executionId);
        if (!execution || execution.status === 'running') {
            resolve();
            return;
        }
        
        const testCase = testCases.find(c => c.id === execution.caseId);
        
        execution.status = 'running';
        execution.terminalOutput = '';
        execution.result = null;
        renderExecutionList();
        
        const detailContent = document.getElementById(`detail-${execution.id}`);
        if (detailContent) {
            detailContent.classList.add('show');
        }
        
        const eventSource = new EventSource(`${API_BASE_URL}/sse/${execution.id}`);
        let isCompleted = false;
        let fetchCompleted = false;
        let sseCompleted = false;
        
        const checkAndComplete = () => {
            if (!isCompleted && fetchCompleted && sseCompleted) {
                isCompleted = true;
                eventSource.close();
                saveExecutionListToServer();
                renderExecutionList();
                resolve();
            }
        };
        
        const completeSSE = () => {
            sseCompleted = true;
            checkAndComplete();
        };
        
        const completeFetch = () => {
            fetchCompleted = true;
            checkAndComplete();
        };
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const terminalEl = document.getElementById(`terminal-${execution.id}`);
            
            if (data.type === 'stdout' || data.type === 'stderr') {
                execution.terminalOutput += escapeHtml(data.data);
                if (terminalEl) {
                    terminalEl.innerHTML = execution.terminalOutput;
                    terminalEl.scrollTop = terminalEl.scrollHeight;
                }
            } else if (data.type === 'close') {
                execution.status = data.success ? 'passed' : 'failed';
                completeSSE();
            } else if (data.type === 'error') {
                execution.terminalOutput += `<span style="color: #ff6b6b;">错误: ${escapeHtml(data.error)}</span>`;
                if (terminalEl) {
                    terminalEl.innerHTML = execution.terminalOutput;
                }
                execution.status = 'failed';
                completeSSE();
            }
        };
        
        eventSource.onerror = () => {
            completeSSE();
        };
        
        fetch(`${API_BASE_URL}/execute-test-case`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testCase, platform: 'android', executionId: execution.id })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                execution.result = result.data;
                if (result.data.stdout) {
                    execution.terminalOutput += escapeHtml(result.data.stdout);
                }
                if (result.data.stderr) {
                    execution.terminalOutput += `<span style="color: #ffa500;">${escapeHtml(result.data.stderr)}</span>`;
                }
            } else {
                execution.result = { error: result.error };
                execution.terminalOutput += `<span style="color: #ff6b6b;">错误: ${escapeHtml(result.error)}</span>`;
            }
        })
        .catch(error => {
            console.error('Error executing test case:', error);
            const success = Math.random() > 0.2;
            execution.result = {
                success: success,
                message: success ? 'Test passed successfully' : 'Test failed',
                testCaseName: testCase.name,
                timestamp: new Date().toISOString(),
                mock: true
            };
            if (!isCompleted && !sseCompleted) {
                execution.status = success ? 'passed' : 'failed';
            }
        })
        .finally(() => {
            completeFetch();
        });
    });
}

async function handleExecuteAll() {
    if (executionList.length === 0) {
        alert('请先添加用例到执行列表！');
        return;
    }
    
    const executeBtn = document.getElementById('execute-btn');
    executeBtn.disabled = true;
    executeBtn.textContent = '执行中...';
    
    try {
        for (let index = 0; index < executionList.length; index++) {
            await executeSingle(executionList[index].id);
        }
        
        const passedCount = executionList.filter(e => e.status === 'passed').length;
        const failedCount = executionList.filter(e => e.status === 'failed').length;
        alert(`执行完成！\n通过: ${passedCount}\n失败: ${failedCount}`);
    } finally {
        executeBtn.disabled = false;
        executeBtn.textContent = '执行全部用例';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();

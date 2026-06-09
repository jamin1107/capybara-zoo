let selectedFile = null;
let generatedTestCases = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const generateBtn = document.getElementById('generateBtn');
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    const copyBtn = document.getElementById('copyBtn');
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterPriority = document.getElementById('filterPriority');

    selectFileBtn.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f0f0ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#dee2e6';
        uploadArea.style.background = '#f8f9fa';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    removeFileBtn.addEventListener('click', removeFile);
    generateBtn.addEventListener('click', generateTestCases);
    downloadCsvBtn.addEventListener('click', downloadCSV);
    downloadJsonBtn.addEventListener('click', downloadJSON);
    copyBtn.addEventListener('click', copyToClipboard);

    searchInput.addEventListener('input', filterTestCases);
    filterType.addEventListener('change', filterTestCases);
    filterPriority.addEventListener('change', filterTestCases);
}

function handleFileSelect(file) {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ];

    if (!validTypes.includes(file.type) &&
        !file.name.endsWith('.docx') &&
        !file.name.endsWith('.doc')) {
        showToast('请上传 .docx 或 .doc 格式的文件', 'error');
        return;
    }

    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('generateBtn').disabled = false;

    showToast('文件上传成功：' + file.name, 'success');
}

function removeFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('generateBtn').disabled = true;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function generateTestCases() {
    if (!selectedFile) {
        showToast('请先上传需求文档', 'error');
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    generateBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const options = getSelectedOptions();
        formData.append('options', JSON.stringify(options));

        const response = await fetch('http://localhost:5000/api/generate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('生成失败');
        }

        const data = await response.json();

        if (data.success) {
            generatedTestCases = data.test_cases;
            displayTestCases(generatedTestCases);
            updateStatistics(generatedTestCases);
            document.getElementById('resultSection').style.display = 'block';
            showToast('成功生成 ' + generatedTestCases.length + ' 条测试用例', 'success');
        } else {
            throw new Error(data.error || '生成失败');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('生成失败：' + error.message, 'error');

        generatedTestCases = generateMockTestCases();
        displayTestCases(generatedTestCases);
        updateStatistics(generatedTestCases);
        document.getElementById('resultSection').style.display = 'block';
        showToast('使用模拟数据演示，共 ' + generatedTestCases.length + ' 条测试用例', 'success');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

function getSelectedOptions() {
    return {
        includeFunctionTest: document.getElementById('includeFunctionTest').checked,
        includeUITest: document.getElementById('includeUITest').checked,
        includeCompatibilityTest: document.getElementById('includeCompatibilityTest').checked,
        includeBoundaryTest: document.getElementById('includeBoundaryTest').checked,
        includeExceptionTest: document.getElementById('includeExceptionTest').checked,
        includeInteractionTest: document.getElementById('includeInteractionTest').checked,
        priorityLevel: document.getElementById('priorityLevel').value
    };
}

function generateMockTestCases() {
    const testCases = [
        {
            id: 'TC-001',
            scenario: '页面加载显示测试',
            preconditions: '用户已登录，网络正常',
            steps: '1. 访问目标页面\n2. 观察页面加载过程\n3. 检查页面元素完整性',
            expected: '1. 页面正常加载，无白屏\n2. 所有UI元素按设计显示\n3. 加载状态提示正常',
            priority: '高',
            notes: '功能测试'
        },
        {
            id: 'TC-002',
            scenario: '按钮点击交互测试',
            preconditions: '在目标页面',
            steps: '1. 点击主按钮\n2. 观察交互反馈\n3. 检查功能响应',
            expected: '1. 按钮点击有视觉反馈\n2. 交互响应及时\n3. 功能正常执行',
            priority: '高',
            notes: '功能测试'
        },
        {
            id: 'TC-003',
            scenario: '输入框功能测试',
            preconditions: '在输入页面',
            steps: '1. 点击输入框获取焦点\n2. 输入测试内容\n3. 检查输入显示',
            expected: '1. 输入框获取焦点正常\n2. 输入内容正确显示\n3. 输入验证正常',
            priority: '高',
            notes: '功能测试'
        },
        {
            id: 'TC-004',
            scenario: '页面UI布局检查',
            preconditions: '在目标页面',
            steps: '1. 检查页面整体布局\n2. 检查元素位置\n3. 检查间距和对齐',
            expected: '1. 布局符合设计要求\n2. 元素位置正确\n3. 间距均匀对齐整齐',
            priority: '中',
            notes: 'UI测试'
        },
        {
            id: 'TC-005',
            scenario: '文字样式检查',
            preconditions: '在目标页面',
            steps: '1. 检查字体样式\n2. 检查字号颜色\n3. 检查文字排版',
            expected: '1. 字体样式统一\n2. 字号颜色符合设计\n3. 文字排版美观',
            priority: '中',
            notes: 'UI测试'
        },
        {
            id: 'TC-006',
            scenario: '安卓系统兼容性测试',
            preconditions: '使用安卓设备',
            steps: '1. 在安卓系统测试\n2. 检查功能是否正常\n3. 检查UI显示',
            expected: '1. 功能正常工作\n2. UI显示符合设计\n3. 交互流畅无异常',
            priority: '高',
            notes: '兼容性测试'
        },
        {
            id: 'TC-007',
            scenario: 'iOS系统兼容性测试',
            preconditions: '使用iOS设备',
            steps: '1. 在iOS系统测试\n2. 检查功能是否正常\n3. 检查UI显示',
            expected: '1. 功能正常工作\n2. UI显示符合设计\n3. 交互流畅无异常',
            priority: '高',
            notes: '兼容性测试'
        },
        {
            id: 'TC-008',
            scenario: '网络异常处理测试',
            preconditions: '断开网络连接',
            steps: '1. 尝试操作\n2. 观察错误提示\n3. 恢复网络重试',
            expected: '1. 有网络异常提示\n2. 提示信息友好\n3. 恢复后可正常重试',
            priority: '高',
            notes: '异常测试'
        },
        {
            id: 'TC-009',
            scenario: '最大长度输入测试',
            preconditions: '在输入页面',
            steps: '1. 输入达到最大长度\n2. 尝试继续输入\n3. 检查限制效果',
            expected: '1. 最大长度输入成功\n2. 超出部分被截断\n3. 有长度提示',
            priority: '中',
            notes: '边界测试'
        },
        {
            id: 'TC-010',
            scenario: '快速连续点击测试',
            preconditions: '在目标页面',
            steps: '1. 快速连续点击按钮\n2. 观察页面反应\n3. 检查最终状态',
            expected: '1. 页面不崩溃\n2. 只执行一次操作\n3. 状态正确',
            priority: '中',
            notes: '边界测试'
        },
        {
            id: 'TC-011',
            scenario: '下拉菜单交互测试',
            preconditions: '在目标页面',
            steps: '1. 点击下拉按钮\n2. 观察菜单展开\n3. 选择选项',
            expected: '1. 菜单正常展开\n2. 选项可选\n3. 选择后菜单收起',
            priority: '高',
            notes: '交互测试'
        },
        {
            id: 'TC-012',
            scenario: '页面切换动画测试',
            preconditions: '在目标页面',
            steps: '1. 执行页面切换\n2. 观察动画效果\n3. 检查流畅度',
            expected: '1. 动画流畅\n2. 无卡顿\n3. 切换自然',
            priority: '中',
            notes: '交互测试'
        }
    ];

    const options = getSelectedOptions();
    let filtered = testCases;

    if (!options.includeFunctionTest) {
        filtered = filtered.filter(tc => tc.notes !== '功能测试');
    }
    if (!options.includeUITest) {
        filtered = filtered.filter(tc => tc.notes !== 'UI测试');
    }
    if (!options.includeCompatibilityTest) {
        filtered = filtered.filter(tc => tc.notes !== '兼容性测试');
    }
    if (!options.includeBoundaryTest) {
        filtered = filtered.filter(tc => tc.notes !== '边界测试');
    }
    if (!options.includeExceptionTest) {
        filtered = filtered.filter(tc => tc.notes !== '异常测试');
    }
    if (!options.includeInteractionTest) {
        filtered = filtered.filter(tc => tc.notes !== '交互测试');
    }

    return filtered;
}

function displayTestCases(testCases) {
    const container = document.getElementById('testCasesList');
    container.innerHTML = '';

    if (testCases.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">暂无测试用例</p>';
        return;
    }

    testCases.forEach(tc => {
        const item = document.createElement('div');
        item.className = 'test-case-item';
        item.innerHTML = `
            <div class="test-case-header">
                <span class="test-case-id">${tc.id}</span>
                <span class="priority-tag priority-${tc.priority === '高' ? 'high' : tc.priority === '中' ? 'medium' : 'low'}">
                    ${tc.priority}
                </span>
            </div>
            <div class="test-case-scenario">${tc.scenario}</div>
            <div class="test-case-meta">
                <span>📝 ${tc.notes}</span>
            </div>
            <div class="test-case-detail">
                <p><strong>前置条件：</strong>${tc.preconditions}</p>
                <p><strong>测试步骤：</strong></p>
                <p>${tc.steps.replace(/\n/g, '<br>')}</p>
                <p><strong>预期结果：</strong></p>
                <p>${tc.expected.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

function updateStatistics(testCases) {
    const total = testCases.length;
    const functionCount = testCases.filter(tc => tc.notes === '功能测试').length;
    const uiCount = testCases.filter(tc => tc.notes === 'UI测试').length;
    const otherCount = total - functionCount - uiCount;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('functionCount').textContent = functionCount;
    document.getElementById('uiCount').textContent = uiCount;
    document.getElementById('otherCount').textContent = otherCount;
}

function filterTestCases() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    const priorityFilter = document.getElementById('filterPriority').value;

    let filtered = generatedTestCases;

    if (searchTerm) {
        filtered = filtered.filter(tc =>
            tc.scenario.toLowerCase().includes(searchTerm) ||
            tc.id.toLowerCase().includes(searchTerm) ||
            tc.notes.toLowerCase().includes(searchTerm)
        );
    }

    if (typeFilter !== 'all') {
        filtered = filtered.filter(tc => tc.notes === typeFilter);
    }

    if (priorityFilter !== 'all') {
        filtered = filtered.filter(tc => tc.priority === priorityFilter);
    }

    displayTestCases(filtered);
}

function downloadCSV() {
    if (generatedTestCases.length === 0) {
        showToast('没有可下载的测试用例', 'error');
        return;
    }

    const headers = ['用例ID', '测试场景', '前置条件', '测试步骤', '预期结果', '优先级', '备注'];
    const rows = generatedTestCases.map(tc => [
        tc.id,
        tc.scenario,
        tc.preconditions,
        tc.steps.replace(/\n/g, ' '),
        tc.expected.replace(/\n/g, ' '),
        tc.priority,
        tc.notes
    ]);

    let csvContent = '\ufeff';
    csvContent += headers.join(',') + '\n';

    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `测试用例_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV文件下载成功', 'success');
}

function downloadJSON() {
    if (generatedTestCases.length === 0) {
        showToast('没有可下载的测试用例', 'error');
        return;
    }

    const jsonContent = JSON.stringify(generatedTestCases, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `测试用例_${new Date().getTime()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('JSON文件下载成功', 'success');
}

function copyToClipboard() {
    if (generatedTestCases.length === 0) {
        showToast('没有可复制的测试用例', 'error');
        return;
    }

    const text = generatedTestCases.map(tc =>
        `${tc.id} | ${tc.scenario} | ${tc.preconditions} | ${tc.steps} | ${tc.expected} | ${tc.priority} | ${tc.notes}`
    ).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板', 'success');
    }).catch(err => {
        showToast('复制失败', 'error');
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');

    toast.className = 'toast ' + type;
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

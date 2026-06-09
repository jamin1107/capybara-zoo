const API_BASE_URL = '/api';

let reviewFile = null;
let reviewPoints = [];
let isProcessing = false;

function hideAllSections() {
    document.getElementById('review-upload-section').style.display = 'block';
    document.getElementById('review-result-section').style.display = 'none';
    document.getElementById('review-progress').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('error-section').style.display = 'none';
}

function initUploadArea() {
    const reviewUploadArea = document.getElementById('review-upload-area');
    const reviewFileInput = document.getElementById('review-file-input');
    const reviewUploadContent = reviewUploadArea.querySelector('.upload-content');

    reviewUploadContent.querySelector('.browse-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        reviewFileInput.click();
    });

    reviewUploadArea.addEventListener('click', () => {
        if (!isProcessing) {
            reviewFileInput.click();
        }
    });

    reviewUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!isProcessing) {
            reviewUploadArea.classList.add('dragover');
        }
    });

    reviewUploadArea.addEventListener('dragleave', () => {
        reviewUploadArea.classList.remove('dragover');
    });

    reviewUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        reviewUploadArea.classList.remove('dragover');
        if (!isProcessing) {
            handleReviewFile(e.dataTransfer.files);
        }
    });

    reviewFileInput.addEventListener('change', (e) => {
        handleReviewFile(e.target.files);
        reviewFileInput.value = '';
    });
}

function handleReviewFile(files) {
    if (files.length > 0) {
        const file = files[0];
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            reviewFile = file;
            document.getElementById('review-file-name').textContent = file.name;
            document.getElementById('analyze-btn').disabled = false;
        } else {
            alert('请上传 .docx 格式的需求文档');
        }
    }
}

function clearReviewFile() {
    reviewFile = null;
    document.getElementById('review-file-name').textContent = '未选择文件';
    document.getElementById('analyze-btn').disabled = true;
}

function setReviewStepStatus(stepId, status, message = '') {
    const step = document.getElementById(stepId);
    step.className = 'progress-step ' + status;
    if (message) {
        step.querySelector('.step-status').textContent = message;
    }
}

async function analyzeDocument() {
    if (!reviewFile) {
        alert('请先上传需求文档');
        return;
    }

    isProcessing = true;
    const btn = document.getElementById('analyze-btn');
    btn.disabled = true;
    btn.textContent = '分析中...';

    const progressSection = document.getElementById('review-progress');
    progressSection.style.display = 'block';

    setReviewStepStatus('r-step-upload', 'active', '上传中');
    setReviewStepStatus('r-step-analyze', '', '等待中');
    setReviewStepStatus('r-step-modify', '', '等待中');
    setReviewStepStatus('r-step-generate', '', '等待中');

    try {
        const formData = new FormData();
        formData.append('file', reviewFile);

        setReviewStepStatus('r-step-upload', 'completed', '已完成');
        setReviewStepStatus('r-step-analyze', 'active', 'AI评审中');

        const response = await fetch(`${API_BASE_URL}/analyze-requirement`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            setReviewStepStatus('r-step-analyze', 'completed', '已完成');
            reviewPoints = result.data.reviewPoints || [];
            displayReviewPoints();
        } else {
            throw new Error(result.error || '分析失败');
        }
    } catch (error) {
        console.error('Error analyzing document:', error);
        setReviewStepStatus('r-step-analyze', 'error', '失败');

        document.getElementById('error-section').style.display = 'block';
        document.getElementById('error-message').textContent = error.message;
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">🤖</span> AI 评审分析';
    }
}

function displayReviewPoints() {
    document.getElementById('review-upload-section').style.display = 'none';
    document.getElementById('review-result-section').style.display = 'block';

    const issueCount = document.getElementById('issue-count');
    issueCount.textContent = reviewPoints.length;

    const container = document.getElementById('review-points-container');
    container.innerHTML = reviewPoints.map((point, index) =>
        createReviewPointHTML(point, index + 1)
    ).join('');
}

function createReviewPointHTML(point, number) {
    const categoryColors = {
        '功能边界': '#11998e',
        '交互逻辑': '#38ef7d',
        '异常场景': '#ff6b6b',
        '非功能需求': '#feca57',
        '验收标准': '#48dbfb'
    };
    const color = categoryColors[point.category] || '#11998e';

    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
    };

    return `
        <div class="review-point" data-id="${point.id || number}">
            <div class="review-point-header">
                <div class="review-point-id" style="background: ${color};">${number}</div>
                <div class="review-point-category" style="color: ${color};">${escapeHtml(point.category) || '功能边界'}</div>
                <div class="review-point-location">📍 ${escapeHtml(point.location) || '未定位'}</div>
                <div class="header-actions">
                    <button class="btn-icon btn-edit" onclick="toggleEditReviewPoint('${point.id || number}')" title="编辑">✏️</button>
                    <button class="btn-icon btn-remove" onclick="removeReviewPoint('${point.id || number}')" title="删除">🗑️</button>
                </div>
            </div>
            <div class="review-point-body">
                <div class="review-field suggestion-field">
                    <label>💡 修改建议：</label>
                    <div class="review-text highlight view-mode">${escapeHtml(point.suggestion) || '无'}</div>
                    <textarea class="review-textarea edit-mode" data-field="suggestion" style="display:none;">${escapeHtml(point.suggestion) || ''}</textarea>
                </div>
            </div>
            <div class="edit-actions edit-mode" style="display:none;">
                <button class="btn btn-primary btn-small" onclick="saveReviewPoint('${point.id || number}')">💾 保存</button>
                <button class="btn btn-outline btn-small" onclick="cancelEdit('${point.id || number}')">❌ 取消</button>
            </div>
        </div>
    `;
}

function generateId() {
    return 'rp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function toggleEditReviewPoint(id) {
    const pointElement = document.querySelector(`[data-id="${id}"]`);
    if (!pointElement) return;

    const isEditing = pointElement.classList.contains('editing');

    document.querySelectorAll('.review-point.editing').forEach(el => {
        el.classList.remove('editing');
        el.querySelectorAll('.view-mode').forEach(v => v.style.display = '');
        el.querySelectorAll('.edit-mode').forEach(e => e.style.display = 'none');
        el.querySelectorAll('.edit-mode.textarea').forEach(e => {
            if (e.tagName === 'TEXTAREA') {
                const viewEl = el.querySelector(`.view-mode[data-field="${e.dataset.field}"]`);
                if (viewEl) viewEl.style.display = '';
            }
        });
    });

    if (!isEditing) {
        pointElement.classList.add('editing');
        pointElement.querySelectorAll('.view-mode').forEach(v => v.style.display = 'none');
        pointElement.querySelectorAll('.edit-mode').forEach(e => {
            if (e.classList.contains('edit-actions')) {
                e.style.display = 'flex';
            } else {
                e.style.display = '';
            }
        });
    }
}

function cancelEdit(id) {
    const pointElement = document.querySelector(`[data-id="${id}"]`);
    if (!pointElement) return;

    pointElement.classList.remove('editing');
    pointElement.querySelectorAll('.view-mode').forEach(v => v.style.display = '');
    pointElement.querySelectorAll('.edit-mode').forEach(e => e.style.display = 'none');
}

function saveReviewPoint(id) {
    const pointElement = document.querySelector(`[data-id="${id}"]`);
    if (!pointElement) return;

    const point = reviewPoints.find(p => String(p.id || '') === String(id));
    if (!point) return;

    const fields = ['originalText', 'issue', 'suggestion'];
    fields.forEach(field => {
        const textarea = pointElement.querySelector(`.edit-mode.textarea[data-field="${field}"]`);
        if (textarea) {
            point[field] = textarea.value;
        }
    });

    pointElement.querySelectorAll('.view-mode').forEach(v => {
        const field = v.dataset.field;
        if (field && point[field] !== undefined) {
            v.innerHTML = point[field] || '无';
        }
    });

    pointElement.querySelectorAll('.view-mode').forEach(v => {
        if (!v.dataset.field) {
            const parent = v.parentElement;
            if (parent) {
                const label = parent.querySelector('label');
                if (label && label.textContent.includes('原文')) {
                    v.innerHTML = point.originalText ? point.originalText.replace(/\n/g, '<br>') : '无';
                } else if (label && label.textContent.includes('问题')) {
                    v.innerHTML = point.issue ? point.issue.replace(/\n/g, '<br>') : '无';
                } else if (label && label.textContent.includes('建议')) {
                    v.innerHTML = point.suggestion ? point.suggestion.replace(/\n/g, '<br>') : '无';
                }
            }
        }
    });

    pointElement.classList.remove('editing');
    pointElement.querySelectorAll('.view-mode').forEach(v => v.style.display = '');
    pointElement.querySelectorAll('.edit-mode').forEach(e => e.style.display = 'none');
}

function addReviewPoint() {
    const newPoint = {
        id: generateId(),
        category: '功能边界',
        location: '',
        originalText: '',
        issue: '',
        suggestion: ''
    };

    reviewPoints.push(newPoint);

    const container = document.getElementById('review-points-container');
    container.insertAdjacentHTML('beforeend', createReviewPointHTML(newPoint, reviewPoints.length));

    document.getElementById('issue-count').textContent = reviewPoints.length;
}

function removeReviewPoint(id) {
    if (!confirm('确定删除这个评审点？')) return;

    const element = document.querySelector(`[data-id="${id}"]`);
    if (element) {
        element.remove();
        reviewPoints = reviewPoints.filter(p => (p.id || '') !== id);
        document.getElementById('issue-count').textContent = reviewPoints.length;
    }
}

async function confirmReview() {
    if (reviewPoints.length === 0) {
        alert('请至少添加一个评审点');
        return;
    }

    isProcessing = true;
    const btn = document.getElementById('confirm-review-btn');
    btn.disabled = true;
    btn.textContent = '生成中...';

    const progressSection = document.getElementById('review-progress');
    progressSection.style.display = 'block';

    setReviewStepStatus('r-step-upload', 'completed', '已完成');
    setReviewStepStatus('r-step-analyze', 'completed', '已完成');
    setReviewStepStatus('r-step-modify', 'active', '修改中');
    setReviewStepStatus('r-step-generate', '', '等待中');

    try {
        const formData = new FormData();
        formData.append('file', reviewFile);
        formData.append('reviewPoints', JSON.stringify(reviewPoints));

        setReviewStepStatus('r-step-modify', 'completed', '已完成');
        setReviewStepStatus('r-step-generate', 'active', '生成中');

        const response = await fetch(`${API_BASE_URL}/generate-reviewed-document`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            setReviewStepStatus('r-step-generate', 'completed', '已完成');

            document.getElementById('review-result-section').style.display = 'none';
            document.getElementById('result-time').textContent = result.data.generatedTime;
            document.getElementById('result-size').textContent = result.data.fileSize;
            document.getElementById('download-link').href = result.data.downloadUrl;
            document.getElementById('download-link').download = result.data.filename;

            document.getElementById('result-section').style.display = 'block';
            document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            throw new Error(result.error || '生成失败');
        }
    } catch (error) {
        console.error('Error generating reviewed document:', error);
        setReviewStepStatus('r-step-generate', 'error', '失败');

        document.getElementById('error-section').style.display = 'block';
        document.getElementById('error-message').textContent = error.message;
    } finally {
        isProcessing = false;
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">✅</span> 确认评审，生成修改文档';
    }
}

function resetPage() {
    reviewFile = null;
    reviewPoints = [];
    clearReviewFile();

    document.getElementById('review-upload-section').style.display = 'block';
    document.getElementById('review-result-section').style.display = 'none';
    document.getElementById('review-progress').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('error-section').style.display = 'none';

    document.getElementById('review-points-container').innerHTML = '';

    setReviewStepStatus('r-step-upload', '', '等待中');
    setReviewStepStatus('r-step-analyze', '', '等待中');
    setReviewStepStatus('r-step-modify', '', '等待中');
    setReviewStepStatus('r-step-generate', '', '等待中');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    initUploadArea();
});
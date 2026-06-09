let currentImageSlot = 1;
let firstImage = null;
let secondImage = null;
let firstImageData = null;
let secondImageData = null;
let pageHistory = ['home-page'];
let resultImageData = null;
let currentFilter = 'original';
let editState = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotate: 0,
    filter: 'original'
};

const API_BASE_URL = '/api';
const USE_BACKEND = true;

function triggerUpload(slot) {
    currentImageSlot = slot;
    const uploadInput = document.getElementById(`slot-${slot}-upload`);
    if (uploadInput) {
        uploadInput.click();
    }
}

function handleFileUpload(event, slot) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        if (slot === 1) {
            firstImageData = imageData;
            firstImage = imageData;
            document.getElementById('slot-1-placeholder').style.display = 'none';
            document.getElementById('slot-1-image').src = imageData;
            document.getElementById('slot-1-image').style.display = 'block';
        } else {
            secondImageData = imageData;
            secondImage = imageData;
            document.getElementById('slot-2-placeholder').style.display = 'none';
            document.getElementById('slot-2-image').src = imageData;
            document.getElementById('slot-2-image').style.display = 'block';
        }
        checkCanFuse();
    };
    reader.readAsDataURL(file);
}

function checkCanFuse() {
    const fuseBtn = document.getElementById('fuse-btn');
    if (firstImageData && secondImageData) {
        fuseBtn.disabled = false;
    } else {
        fuseBtn.disabled = true;
    }
}

async function startFusion() {
    if (!firstImageData || !secondImageData) {
        alert('请先选择两张图片！');
        return;
    }
    
    document.getElementById('fusing-first').src = firstImageData;
    document.getElementById('fusing-second').src = secondImageData;
    showPage('fusing-page');
    pageHistory.push('fusing-page');
    
    if (USE_BACKEND) {
        await performRealFusion();
    } else {
        await performFrontendFusion();
    }
}

async function performFrontendFusion() {
    const progressCircle = document.getElementById('progress-circle');
    const progressPercent = document.getElementById('progress-percent');
    const circumference = 565.48;
    
    let progress = 0;
    
    const progressInterval = setInterval(() => {
        progress += Math.random() * 5 + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        
        updateProgress(progress, getStatusText(progress), progressCircle, progressPercent, circumference);
    }, 100);
    
    await new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
    
    const resultImage = await fuseImagesWithCanvas(firstImageData, secondImageData);
    showResult(resultImage);
}

function getStatusText(progress) {
    if (progress < 20) return '正在加载图片...';
    if (progress < 40) return '正在识别面部特征...';
    if (progress < 60) return 'AI正在为您的创意注入灵感...';
    if (progress < 80) return '正在生成最终效果...';
    return '融合完成！';
}

function fuseImagesWithCanvas(img1Data, img2Data) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img1 = new Image();
        const img2 = new Image();
        
        let img1Loaded = false;
        let img2Loaded = false;
        
        function checkBothLoaded() {
            if (img1Loaded && img2Loaded) {
                const width = Math.max(img1.width, img2.width);
                const height = Math.max(img1.height, img2.height);
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                
                const halfWidth = width / 2;
                
                ctx.drawImage(img1, 0, 0, halfWidth, height);
                ctx.drawImage(img2, halfWidth, 0, halfWidth, height);
                
                ctx.fillStyle = 'rgba(255, 105, 180, 0.1)';
                ctx.fillRect(0, 0, width, height);
                
                ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            }
        }
        
        img1.onload = () => {
            img1Loaded = true;
            checkBothLoaded();
        };
        
        img2.onload = () => {
            img2Loaded = true;
            checkBothLoaded();
        };
        
        img1.src = img1Data;
        img2.src = img2Data;
    });
}

async function performRealFusion() {
    const progressCircle = document.getElementById('progress-circle');
    const progressPercent = document.getElementById('progress-percent');
    const circumference = 565.48;
    
    try {
        updateProgress(10, '正在上传图片...', progressCircle, progressPercent, circumference);
        
        const formData = new FormData();
        formData.append('image1', dataURLtoFile(firstImageData, 'image1.jpg'));
        formData.append('image2', dataURLtoFile(secondImageData, 'image2.jpg'));
        formData.append('api_type', 'aliyun');
        formData.append('prompt', '两张图片进行融合');
        
        updateProgress(30, '正在发送到AI服务器...', progressCircle, progressPercent, circumference);
        
        const response = await fetch(`${API_BASE_URL}/fuse`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('融合请求失败');
        }
        
        updateProgress(50, 'AI正在处理中...', progressCircle, progressPercent, circumference);
        
        const result = await response.json();
        
        updateProgress(80, '正在生成结果...', progressCircle, progressPercent, circumference);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateProgress(100, '融合完成！', progressCircle, progressPercent, circumference);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (result.success && result.resultImage) {
            showResult(result.resultImage);
        } else {
            throw new Error(result.error || '融合失败');
        }
        
    } catch (error) {
        console.error('融合失败:', error);
        alert(`融合失败: ${error.message}\n\n将使用模拟功能继续...`);
        
        await performFrontendFusion();
    }
}

function updateProgress(percent, text, progressCircle, progressPercent, circumference) {
    progressPercent.textContent = Math.floor(percent);
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    
    const fusingText = document.querySelector('.fusing-text h2');
    if (fusingText) {
        fusingText.textContent = text;
    }
}

function showResult(imageUrl) {
    const resultImage = document.getElementById('result-image');
    if (resultImage) {
        resultImage.src = imageUrl;
        resultImage.style.display = 'block';
    }
    document.querySelector('.result-placeholder').style.display = 'none';
    showPage('result-page');
    pageHistory.push('result-page');
}

function saveToLocal() {
    const resultImage = document.getElementById('result-image');
    if (resultImage && resultImage.src) {
        const link = document.createElement('a');
        link.download = 'ai-fusion-result.jpg';
        link.href = resultImage.src;
        link.click();
    } else {
        alert('请先生成融合结果！');
    }
}

function regenerate() {
    pageHistory.pop();
    if (firstImageData && secondImageData) {
        startFusion();
    } else {
        showPage('home-page');
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function goBack() {
    if (pageHistory.length > 1) {
        pageHistory.pop();
        const previousPage = pageHistory[pageHistory.length - 1];
        showPage(previousPage);
    }
}

function navTo(section) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    if (section !== 'polaroid') {
        alert(`即将跳转到${section === 'cloud' ? '云相册' : '我的'}页面`);
    }
}

function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}

document.addEventListener('DOMContentLoaded', () => {
    // API 配置界面保持显示
});

// 跳转到编辑页面
function goToEdit() {
    const resultImage = document.getElementById('result-image');
    if (resultImage && resultImage.src) {
        resultImageData = resultImage.src;
        
        // 重置编辑状态
        editState = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            rotate: 0,
            filter: 'original'
        };
        currentFilter = 'original';
        
        // 重置控件
        document.getElementById('brightness-range').value = 100;
        document.getElementById('contrast-range').value = 100;
        document.getElementById('saturation-range').value = 100;
        document.getElementById('rotate-range').value = 0;
        
        // 重置滤镜按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.filter-btn').classList.add('active');
        
        // 设置编辑图片
        document.getElementById('edit-image').src = resultImageData;
        document.getElementById('edit-image').style.filter = '';
        document.getElementById('edit-image').style.transform = '';
        
        showPage('edit-page');
        pageHistory.push('edit-page');
    } else {
        alert('请先生成融合结果！');
    }
}

// 更新编辑效果
function updateEdit() {
    const brightness = document.getElementById('brightness-range').value;
    const contrast = document.getElementById('contrast-range').value;
    const saturation = document.getElementById('saturation-range').value;
    const rotate = document.getElementById('rotate-range').value;
    
    editState.brightness = brightness;
    editState.contrast = contrast;
    editState.saturation = saturation;
    editState.rotate = rotate;
    
    applyEdits();
}

// 应用滤镜
function applyFilter(filterType) {
    currentFilter = filterType;
    editState.filter = filterType;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    applyEdits();
}

// 应用所有编辑
function applyEdits() {
    const editImage = document.getElementById('edit-image');
    
    // 构建滤镜字符串
    let filterString = '';
    filterString += `brightness(${editState.brightness}%) `;
    filterString += `contrast(${editState.contrast}%) `;
    filterString += `saturate(${editState.saturation}%) `;
    
    // 添加特定滤镜
    switch (editState.filter) {
        case 'grayscale':
            filterString += 'grayscale(100%) ';
            break;
        case 'sepia':
            filterString += 'sepia(80%) ';
            break;
        case 'invert':
            filterString += 'invert(100%) ';
            break;
        case 'blur':
            filterString += 'blur(3px) ';
            break;
    }
    
    editImage.style.filter = filterString.trim();
    editImage.style.transform = `rotate(${editState.rotate}deg)`;
}

// 跳转到预览页面
function goToPreview() {
    // 创建画布来生成编辑后的图片
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // 设置画布尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 保存当前状态
        ctx.save();
        
        // 平移到中心
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // 旋转
        ctx.rotate((editState.rotate * Math.PI) / 180);
        
        // 绘制图片
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
        
        // 恢复状态
        ctx.restore();
        
        // 获取图片数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 应用滤镜（简化版）
        if (editState.filter !== 'original') {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                
                switch (editState.filter) {
                    case 'grayscale':
                        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                        r = g = b = gray;
                        break;
                    case 'sepia':
                        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
                        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
                        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
                        r = Math.min(255, tr);
                        g = Math.min(255, tg);
                        b = Math.min(255, tb);
                        break;
                    case 'invert':
                        r = 255 - r;
                        g = 255 - g;
                        b = 255 - b;
                        break;
                }
                
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
            }
            ctx.putImageData(imageData, 0, 0);
        }
        
        // 转换为dataURL
        const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // 设置预览图片
        document.getElementById('preview-image').src = previewDataUrl;
        resultImageData = previewDataUrl;
        
        showPage('preview-page');
        pageHistory.push('preview-page');
    };
    
    img.src = resultImageData;
}

// 从预览返回编辑
function goToEditFromPreview() {
    pageHistory.pop();
    showPage('edit-page');
}

// 打印照片
function printPhoto() {
    alert('正在连接打印机...\n\n传输打印任务...\n\n打印任务已发送！');
    
    // 这里可以添加实际的打印功能
    console.log('打印照片:', resultImageData);
}

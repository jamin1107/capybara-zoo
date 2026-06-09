let selectedFile = null;
let selectedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    setupFileUpload();
    setupImageUpload();
});

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && isValidDocFile(files[0])) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');

    uploadArea.addEventListener('click', () => imageInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => isValidImageFile(f));
        files.forEach(handleImageSelect);
    });

    imageInput.addEventListener('change', (e) => {
        Array.from(e.target.files).forEach(handleImageSelect);
    });
}

function isValidDocFile(file) {
    const ext = file.name.toLowerCase().split('.').pop();
    return ['docx', 'txt', 'md'].includes(ext);
}

function isValidImageFile(file) {
    const ext = file.name.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png'].includes(ext);
}

function handleFileSelect(file) {
    selectedFile = file;
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('uploadedFile').style.display = 'flex';
    document.getElementById('fileName').textContent = file.name;
    updateGenerateButton();
}

function removeFile() {
    selectedFile = null;
    document.getElementById('uploadArea').style.display = 'flex';
    document.getElementById('uploadedFile').style.display = 'none';
    document.getElementById('fileInput').value = '';
    updateGenerateButton();
}

function handleImageSelect(file) {
    if (!isValidImageFile(file)) return;

    selectedImages.push(file);
    updateImagePreview();
    updateGenerateButton();
}

function updateImagePreview() {
    const container = document.getElementById('imagePreview');
    const list = document.getElementById('imageList');

    if (selectedImages.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = selectedImages.map((img, index) => `
        <div class="image-item">
            <img src="${URL.createObjectURL(img)}" alt="UI图${index + 1}">
            <button class="btn-remove-image" onclick="removeImage(${index})">✕</button>
        </div>
    `).join('');
}

function removeImage(index) {
    selectedImages.splice(index, 1);
    updateImagePreview();
    updateGenerateButton();
}

function updateGenerateButton() {
    const btn = document.getElementById('generateBtn');
    btn.disabled = !selectedFile && selectedImages.length === 0;
}

async function generateTestCases() {
    const loadingSection = document.getElementById('loadingSection');
    const resultSection = document.getElementById('resultSection');
    const errorSection = document.getElementById('errorSection');
    const generateBtn = document.getElementById('generateBtn');

    loadingSection.style.display = 'block';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
    generateBtn.disabled = true;

    try {
        const formData = new FormData();
        let hasContent = false;

        if (selectedFile) {
            formData.append('docx', selectedFile);
            hasContent = true;
        }

        selectedImages.forEach(img => {
            formData.append('images', img);
        });

        if (!hasContent) {
            throw new Error('请上传需求文档');
        }

        const response = await fetch('/api/generate-testcases', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '生成失败');
        }

        document.getElementById('caseCount').textContent = data.testCaseCount;
        document.getElementById('downloadLink').href = data.filePath;
        document.getElementById('downloadLink').download = data.fileName;

        resultSection.style.display = 'block';

    } catch (error) {
        errorSection.style.display = 'block';
        document.getElementById('errorText').textContent = error.message;
    } finally {
        loadingSection.style.display = 'none';
        updateGenerateButton();
    }
}
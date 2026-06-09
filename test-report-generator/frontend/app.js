const API_BASE_URL = '/api';

async function generateTestReport() {
    const projectName = document.getElementById('projectName').value.trim();
    const testVersion = document.getElementById('testVersion').value.trim();
    const testPeriod = document.getElementById('testPeriod').value.trim();
    const testers = document.getElementById('testers').value.trim();
    const testEnvironment = document.getElementById('testEnvironment').value.trim();
    const testType = document.getElementById('testType').value.trim();
    const testScope = document.getElementById('testScope').value.trim();
    const totalCases = parseInt(document.getElementById('totalCases').value) || 0;
    const passedCases = parseInt(document.getElementById('passedCases').value) || 0;
    const failedCases = parseInt(document.getElementById('failedCases').value) || 0;
    const blockedCases = parseInt(document.getElementById('blockedCases').value) || 0;
    const notExecutedCases = parseInt(document.getElementById('notExecutedCases').value) || 0;
    const totalDefects = parseInt(document.getElementById('totalDefects').value) || 0;
    const criticalDefects = parseInt(document.getElementById('criticalDefects').value) || 0;
    const majorDefects = parseInt(document.getElementById('majorDefects').value) || 0;
    const normalDefects = parseInt(document.getElementById('normalDefects').value) || 0;
    const minorDefects = parseInt(document.getElementById('minorDefects').value) || 0;
    const remainingIssues = document.getElementById('remainingIssues').value.trim();
    const testConclusion = document.getElementById('testConclusion').value.trim();

    if (!projectName || !testVersion) {
        alert('请填写项目名称和测试版本！');
        return;
    }

    const btn = document.getElementById('generate-btn');
    btn.disabled = true;
    btn.textContent = '生成中...';

    try {
        const response = await fetch(`${API_BASE_URL}/generate-test-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectName,
                testVersion,
                testPeriod,
                testers,
                testEnvironment,
                testType,
                testScope,
                totalCases,
                passedCases,
                failedCases,
                blockedCases,
                notExecutedCases,
                totalDefects,
                criticalDefects,
                majorDefects,
                normalDefects,
                minorDefects,
                remainingIssues,
                testConclusion
            })
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('result-section').style.display = 'block';
            document.getElementById('download-link').href = result.data.downloadUrl;
            document.getElementById('download-link').download = result.data.filename;
            document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('生成失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('Error generating report:', error);
        alert('生成失败: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">📄</span> 生成Word测试报告';
    }
}

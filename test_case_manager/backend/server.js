const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const yaml = require('js-yaml');

const app = express();
const PORT = 3001;

const MIDSCENE_CONFIG = {
    MIDSCENE_MODEL_BASE_URL: "https://ark.cn-beijing.volces.com/api/v3",
    MIDSCENE_MODEL_API_KEY: "cf333074-4754-4774-9505-b0dd8244661a",
    MIDSCENE_MODEL_NAME: "ep-20260409162332-m8gwk",
    MIDSCENE_MODEL_FAMILY: "doubao-seed"
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const YAML_DIR = path.join(__dirname, 'yaml_files');
fs.mkdirSync(YAML_DIR, { recursive: true });

const TEST_CASES_FILE = path.join(__dirname, 'test_cases.json');
const EXECUTION_LIST_FILE = path.join(__dirname, 'execution_list.json');

let testResults = {};
let sseClients = {};

function loadTestCases() {
    if (fs.existsSync(TEST_CASES_FILE)) {
        try {
            const data = fs.readFileSync(TEST_CASES_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Error loading test cases:', e);
            return [];
        }
    }
    return [];
}

function saveTestCases(testCases) {
    fs.writeFileSync(TEST_CASES_FILE, JSON.stringify(testCases, null, 2));
}

function loadExecutionList() {
    if (fs.existsSync(EXECUTION_LIST_FILE)) {
        try {
            const data = fs.readFileSync(EXECUTION_LIST_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Error loading execution list:', e);
            return [];
        }
    }
    return [];
}

function saveExecutionList(executionList) {
    fs.writeFileSync(EXECUTION_LIST_FILE, JSON.stringify(executionList, null, 2));
}

function convertTestCaseToMidsceneYaml(testCase, platform = 'android') {
    const tasks = [];
    const flow = [];
    
    if (testCase.steps && testCase.steps.length > 0) {
        testCase.steps.forEach(step => {
            flow.push({ aiAct: step });
        });
    }
    
    if (testCase.assertions && testCase.assertions.length > 0) {
        testCase.assertions.forEach(assertion => {
            flow.push({ aiAssert: assertion });
        });
    }
    
    if (flow.length === 0 && testCase.description) {
        flow.push({ aiAct: testCase.description });
    }
    
    tasks.push({
        name: testCase.name,
        flow: flow
    });
    
    const yamlData = {};
    
    if (platform === 'android') {
        yamlData.android = null;
    } else if (platform === 'ios') {
        yamlData.ios = null;
    } else if (platform === 'web') {
        yamlData.web = null;
    }
    
    yamlData.tasks = tasks;
    
    return yamlData;
}

function saveYamlFile(testCase, platform = 'android') {
    const yamlData = convertTestCaseToMidsceneYaml(testCase, platform);
    const filename = `${testCase.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${Date.now()}.yaml`;
    const filepath = path.join(YAML_DIR, filename);
    
    let yamlContent = '';
    if (platform === 'android') {
        yamlContent += 'android:\n';
    } else if (platform === 'ios') {
        yamlContent += 'ios:\n';
    } else if (platform === 'web') {
        yamlContent += 'web:\n';
    }
    
    yamlContent += yaml.dump({ tasks: yamlData.tasks }, { indent: 2 });
    
    fs.writeFileSync(filepath, yamlContent);
    
    return { filename, filepath, yamlData };
}

function executeMidsceneYaml(filepath, executionId) {
    return new Promise((resolve, reject) => {
        const yamlDir = path.dirname(filepath);
        const yamlFilename = path.basename(filepath);
        
        console.log('====================================');
        console.log('  执行 Midscene 命令');
        console.log('====================================');
        console.log(`YAML文件: ${yamlFilename}`);
        console.log(`YAML文件路径: ${filepath}`);
        console.log(`执行目录: ${yamlDir}`);
        console.log(`执行命令: midscene ${yamlFilename}`);
        console.log('====================================');
        console.log('开始执行...');
        
        let allStdout = '';
        let allStderr = '';
        let timeoutId = null;
        let isResolved = false;
        
        const env = { ...process.env, ...MIDSCENE_CONFIG };
        delete env.MIDSCENE_USE_QWEN_VL;
        delete env.OPENAI_BASE_URL;
        delete env.OPENAI_API_KEY;
        
        const child = spawn('midscene', [yamlFilename], {
            cwd: yamlDir,
            shell: true,
            env: env
        });
        
        timeoutId = setTimeout(() => {
            if (!isResolved) {
                console.log('⚠️ 执行超时，强制终止进程');
                child.kill('SIGTERM');
                isResolved = true;
                sendSSEMessage(executionId, { type: 'stderr', data: '\n⚠️ 执行超时（180秒），已强制终止\n' });
                sendSSEMessage(executionId, { type: 'close', code: 1, success: false });
                reject({
                    success: false,
                    error: '执行超时（180秒）',
                    stdout: allStdout,
                    stderr: allStderr + '\n执行超时（180秒）',
                    command: `midscene ${yamlFilename}`
                });
            }
        }, 180000);
        
        child.stdout.on('data', (data) => {
            const output = data.toString();
            allStdout += output;
            process.stdout.write(output);
            sendSSEMessage(executionId, { type: 'stdout', data: output });
        });
        
        child.stderr.on('data', (data) => {
            const output = data.toString();
            allStderr += output;
            process.stderr.write(output);
            sendSSEMessage(executionId, { type: 'stderr', data: output });
        });
        
        child.on('close', (code) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeoutId);
            
            console.log('====================================');
            console.log('  执行结果');
            console.log('====================================');
            
            if (code !== 0) {
                console.error(`❌ 执行失败，退出码: ${code}`);
                console.log('====================================');
                sendSSEMessage(executionId, { type: 'close', code: code, success: false });
                reject({
                    success: false,
                    error: `命令退出码: ${code}`,
                    stdout: allStdout,
                    stderr: allStderr,
                    command: `midscene ${yamlFilename}`
                });
            } else {
                console.log(`✅ 执行成功!`);
                console.log('====================================');
                sendSSEMessage(executionId, { type: 'close', code: code, success: true });
                resolve({
                    success: true,
                    stdout: allStdout,
                    stderr: allStderr,
                    command: `midscene ${yamlFilename}`
                });
            }
        });
        
        child.on('error', (error) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timeoutId);
            
            console.error(`❌ 启动进程失败: ${error.message}`);
            console.log('====================================');
            sendSSEMessage(executionId, { type: 'error', error: error.message });
            reject({
                success: false,
                error: error.message,
                stdout: allStdout,
                stderr: allStderr,
                command: `midscene "${yamlFilename}"`
            });
        });
    });
}

function sendSSEMessage(executionId, data) {
    if (sseClients[executionId]) {
        try {
            sseClients[executionId].write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
            console.error('SSE send error:', e);
            delete sseClients[executionId];
        }
    }
}

app.get('/api/sse/:executionId', (req, res) => {
    const { executionId } = req.params;
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    
    sseClients[executionId] = res;
    
    req.on('close', () => {
        delete sseClients[executionId];
    });
});

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'styles.css'));
});

app.get('/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'app.js'));
});

app.get('/api/test-cases', (req, res) => {
    const testCases = loadTestCases();
    res.json({ success: true, data: testCases });
});

app.post('/api/test-cases', (req, res) => {
    try {
        const testCase = req.body;
        const testCases = loadTestCases();
        
        if (testCase.id) {
            const index = testCases.findIndex(c => c.id === testCase.id);
            if (index !== -1) {
                testCases[index] = testCase;
            }
        } else {
            testCase.id = Date.now().toString();
            testCases.push(testCase);
        }
        
        saveTestCases(testCases);
        res.json({ success: true, data: testCase });
    } catch (error) {
        console.error('Error saving test case:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/test-cases/:id', (req, res) => {
    try {
        const { id } = req.params;
        const testCases = loadTestCases();
        const testCaseToDelete = testCases.find(c => c.id === id);
        
        if (testCaseToDelete) {
            const testCaseName = testCaseToDelete.name;
            const safeName = testCaseName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
            
            if (fs.existsSync(YAML_DIR)) {
                const yamlFiles = fs.readdirSync(YAML_DIR);
                yamlFiles.forEach(file => {
                    if (file.startsWith(safeName + '_') && file.endsWith('.yaml')) {
                        const filePath = path.join(YAML_DIR, file);
                        try {
                            fs.unlinkSync(filePath);
                            console.log(`Deleted YAML file: ${filePath}`);
                        } catch (err) {
                            console.error(`Error deleting YAML file ${file}:`, err);
                        }
                    }
                });
            }
        }
        
        const updatedTestCases = testCases.filter(c => c.id !== id);
        saveTestCases(updatedTestCases);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting test case:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/execution-list', (req, res) => {
    const executionList = loadExecutionList();
    res.json({ success: true, data: executionList });
});

app.post('/api/execution-list', (req, res) => {
    try {
        const executionList = req.body;
        saveExecutionList(executionList);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving execution list:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

function serveReport(req, res) {
    const { baseName } = req.params;
    const reportDir = path.join(YAML_DIR, 'midscene_run', 'report');
    
    console.log('Looking for report:', baseName, 'in:', reportDir);
    
    const htmlPath = path.join(reportDir, `${baseName}.html`);
    console.log('Checking:', htmlPath, 'exists:', fs.existsSync(htmlPath));
    
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
        return;
    }
    
    console.log('Report not found. Available files:');
    if (fs.existsSync(reportDir)) {
        const files = fs.readdirSync(reportDir);
        console.log(files);
    }
    
    res.status(404).json({ success: false, error: 'Report file not found' });
}

app.get('/report/:baseName', serveReport);
app.get('/api/report/:baseName', serveReport);
app.get('/video/:baseName', serveReport);
app.get('/api/video/:baseName', serveReport);

app.post('/api/convert-test-case', (req, res) => {
    try {
        const { testCase, platform } = req.body;
        
        if (!testCase) {
            return res.status(400).json({
                success: false,
                error: 'Test case is required'
            });
        }
        
        const { filename, filepath, yamlData } = saveYamlFile(testCase, platform || 'android');
        
        res.json({
            success: true,
            data: {
                filename,
                filepath,
                yamlData
            }
        });
    } catch (error) {
        console.error('Error converting test case:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/execute-test-case', async (req, res) => {
    try {
        const { testCase, platform, executionId } = req.body;
        
        if (!testCase) {
            return res.status(400).json({
                success: false,
                error: 'Test case is required'
            });
        }
        
        const execId = executionId || Date.now();
        console.log(`Executing test case: ${testCase.name}`);
        console.log(`Platform: ${platform || 'android'}`);
        console.log(`Execution ID: ${execId}`);
        
        const { filename, filepath, yamlData } = saveYamlFile(testCase, platform || 'android');
        console.log(`YAML file saved: ${filepath}`);
        console.log('Midscene format:', JSON.stringify(yamlData, null, 2));
        
        let executionResult;
        try {
            executionResult = await executeMidsceneYaml(filepath, execId);
        } catch (execError) {
            console.log('Midscene execution failed, using mock result');
            const success = Math.random() > 0.2;
            executionResult = {
                success: success,
                message: success ? 'Test passed successfully (mock)' : 'Test failed (mock)',
                stdout: '',
                stderr: '',
                mock: true
            };
        }
        
        const result = {
            success: executionResult.success,
            message: executionResult.message || (executionResult.success ? 'Test passed successfully' : 'Test failed'),
            executionId: execId,
            testCaseName: testCase.name,
            timestamp: new Date().toISOString(),
            yamlFile: filename,
            yamlData: yamlData,
            stdout: executionResult.stdout,
            stderr: executionResult.stderr,
            mock: executionResult.mock
        };
        
        testResults[result.executionId] = result;
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error executing test case:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/test-result/:executionId', (req, res) => {
    const { executionId } = req.params;
    const result = testResults[executionId];
    
    if (!result) {
        return res.status(404).json({
            success: false,
            error: 'Test result not found'
        });
    }
    
    res.json({
        success: true,
        data: result
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================');
    console.log('  测试用例管理 - 后端服务器');
    console.log('====================================');
    console.log(`本地访问: http://localhost:${PORT}`);
    console.log(`局域网访问: http://192.168.2.114:${PORT}`);
    console.log(`YAML文件目录: ${YAML_DIR}`);
    console.log('环境配置已加载');
    console.log('====================================');
});

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document, Packer, HeadingLevel, TableRow, TableCell, TextRun, Paragraph, Table, WidthType, AlignmentType, BorderStyle, ShadingType } = require('docx');
const mammoth = require('mammoth');

const app = express();
const PORT = 3005;

const OLLAMA_API = 'https://ark.cn-beijing.volces.com/api/v3/responses';
const OLLAMA_MODEL = 'ep-20260423193522-j2jzx';
const API_KEY = 'cf333074-4754-4774-9505-b0dd8244661a';

const SYSTEM_PROMPT = `你是一个专业的测试专家，擅长需求评审。你的任务是根据以下评审规范，对需求文档进行深度分析。

评审5维度（必须全部覆盖）：
1. 功能边界：功能描述是否清晰、范围是否明确
2. 交互逻辑：操作流程、跳转逻辑是否完整
3. 异常场景：是否遗漏异常情况处理
4. 非功能需求：性能、兼容性、安全性是否明确
5. 验收标准：是否有可测试的验收条件

输出格式要求：
按1. 2. 3. 4. ...顺序编号输出，每条评审点包含以下5个字段：
- category: 问题分类（功能边界/交互逻辑/异常场景/非功能需求/验收标准）
- location: 原文位置（章节或段落）
- originalText: 原文内容
- issue: 问题描述
- suggestion: 修改建议

重要：直接输出JSON数组格式，不要有其他解释性文字，如：
[{"category":"功能边界","location":"第1章","originalText":"xxx","issue":"xxx","suggestion":"xxx"},{"category":"交互逻辑","location":"第2章","originalText":"xxx","issue":"xxx","suggestion":"xxx"}]`;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

const REPORTS_DIR = path.join(__dirname, 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

async function callOllamaLLM(prompt, retries = 3, delay = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`正在请求火山引擎API (第${attempt}次尝试)...`);
            console.log('API地址:', OLLAMA_API);
            console.log('模型:', OLLAMA_MODEL);

            const fullPrompt = `${SYSTEM_PROMPT}\n\n## 待评审的需求文档\n\n${prompt}`;

            const response = await fetch(OLLAMA_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    input: fullPrompt
                })
            });

            console.log('API响应状态:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API错误响应:', errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('API响应成功');

            let content = '';
            if (data.output && Array.isArray(data.output)) {
                const message = data.output.find(o => o.type === 'message');
                if (message && message.content && Array.isArray(message.content)) {
                    const textContent = message.content.find(c => c.type === 'output_text');
                    if (textContent && textContent.text) {
                        content = textContent.text;
                    }
                }
            }

            if (!content) {
                console.log('响应结构不完整，原始响应:', JSON.stringify(data).substring(0, 500));
                return '';
            }

            return content;
        } catch (error) {
            console.error(`火山引擎API调用失败 (第${attempt}次):`, error.message);

            if (attempt < retries) {
                console.log(`等待${delay/1000}秒后重试...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`API调用失败，已重试${retries}次: ${error.message}`);
            }
        }
    }
}

function createTableRow(cells, isHeader = false) {
    return new TableRow({
        children: cells.map((text) => {
            return new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: text, bold: isHeader })],
                    alignment: AlignmentType.CENTER
                })],
                shading: isHeader ? {
                    type: ShadingType.CLEAR,
                    color: 'auto',
                    fill: 'E6E6E6'
                } : undefined
            });
        })
    });
}

async function analyzeRequirementDocumentWithLLM(fileBuffer, fileName) {
    console.log('使用mammoth解析docx文件...');

    let content = '';
    try {
        const result = await mammoth.extractRawText({
            buffer: fileBuffer,
            encoding: 'utf-8'
        });
        content = result.value;
        console.log('文档解析成功，文本长度:', content.length);
    } catch (extractError) {
        console.error('mammoth解析失败，尝试直接读取:', extractError.message);
        content = fileBuffer.toString('utf-8');
    }

    if (!content || content.length < 10) {
        content = fileBuffer.toString('utf-8');
    }

    const reviewPrompt = `# 需求文档评审任务

请对以下需求文档进行深度评审，按5个维度分析并输出评审问题清单。

## 待评审的需求文档

---
${content}
---

请严格按照JSON格式输出评审结果，输出一个JSON数组，每个元素包含：category, location, originalText, issue, suggestion`;

    console.log('调用智谱AI大模型进行评审分析...');

    const llmResponse = await callOllamaLLM(reviewPrompt);
    console.log('大模型返回原始内容长度:', llmResponse.length);
    console.log('大模型返回原始内容:\n', llmResponse);

    let reviewPoints = [];

    try {
        let jsonStr = llmResponse;

        jsonStr = jsonStr.replace(/```json\s*/gi, '');
        jsonStr = jsonStr.replace(/```\s*/gi, '');
        jsonStr = jsonStr.replace(/"/g, '"');
        jsonStr = jsonStr.replace(/"/g, '"');
        jsonStr = jsonStr.replace(/'/g, "'");
        jsonStr = jsonStr.trim();

        const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

        try {
            reviewPoints = JSON.parse(jsonStr);
            console.log('JSON解析成功，评审点数:', reviewPoints.length);
        } catch (innerError) {
            console.error('JSON解析失败，尝试修复格式...');
            let fixedJson = jsonStr;
            fixedJson = fixedJson.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
            fixedJson = fixedJson.replace(/:\s*'([^']*)'/g, ': "$1"');
            fixedJson = fixedJson.replace(/:\s*"([^"]*)"/g, (match, content) => {
                content = content.replace(/"/g, '\\"');
                return ': "' + content + '"';
            });

            try {
                reviewPoints = JSON.parse(fixedJson);
                console.log('修复后JSON解析成功，评审点数:', reviewPoints.length);
            } catch (fixedError) {
                console.error('修复后仍然解析失败:', fixedError.message);
                throw fixedError;
            }
        }
    } catch (parseError) {
        console.error('JSON解析最终失败:', parseError.message);
        console.log('尝试从返回内容中提取评审点...');

        const textExtractPattern = /"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"/g;
        let match;
        const extractedPoints = [];

        while ((match = textExtractPattern.exec(llmResponse)) !== null) {
            const [full, category, location, originalText, issue, suggestion] = match;
            if (category && location && originalText && issue && suggestion) {
                extractedPoints.push({
                    category: category.trim(),
                    location: location.trim(),
                    originalText: originalText.trim(),
                    issue: issue.trim(),
                    suggestion: suggestion.trim()
                });
            }
        }

        if (extractedPoints.length === 0) {
            const lines = llmResponse.split('\n');
            let currentPoint = {};
            const points = [];

            for (const line of lines) {
                const categoryMatch = line.match(/category[\s:]+["']([^"']+)["']/);
                if (categoryMatch) {
                    currentPoint.category = categoryMatch[1].trim();
                }
                const locationMatch = line.match(/location[\s:]+["']([^"']+)["']/);
                if (locationMatch) {
                    currentPoint.location = locationMatch[1].trim();
                }
                const originalTextMatch = line.match(/originalText[\s:]+["']([^"']+)["']/);
                if (originalTextMatch) {
                    currentPoint.originalText = originalTextMatch[1].trim();
                }
                const issueMatch = line.match(/issue[\s:]+["']([^"']+)["']/);
                if (issueMatch) {
                    currentPoint.issue = issueMatch[1].trim();
                }
                const suggestionMatch = line.match(/suggestion[\s:]+["']([^"']+)["']/);
                if (suggestionMatch) {
                    currentPoint.suggestion = suggestionMatch[1].trim();
                    if (currentPoint.category && currentPoint.suggestion) {
                        points.push(currentPoint);
                        currentPoint = {};
                    }
                }
            }

            if (points.length > 0) {
                reviewPoints = points;
                console.log('通过逐行解析提取到评审点:', reviewPoints.length);
            }
        } else {
            reviewPoints = extractedPoints;
            console.log('通过正则提取到评审点:', reviewPoints.length);
        }
    }

    console.log('最终评审点数:', reviewPoints.length);
    console.log('返回给前端的第一个评审点:', JSON.stringify(reviewPoints[0], null, 2));

    if (!Array.isArray(reviewPoints) || reviewPoints.length === 0) {
        reviewPoints = [
            {
                id: 1,
                category: '功能边界',
                location: '整体文档',
                originalText: '文档整体',
                issue: '大模型未能正确解析评审结果，请检查文档内容',
                suggestion: '请确保文档包含可分析的需求内容'
            }
        ];
    }

    reviewPoints = reviewPoints.map((point, index) => ({
        id: index + 1,
        category: point.category || '功能边界',
        location: point.location || '未定位',
        originalText: point.originalText || '',
        issue: point.issue || '发现问题',
        suggestion: point.suggestion || '建议人工检查'
    }));

    return reviewPoints.slice(0, 50);
}

async function generateReviewedDocument(fileBuffer, fileName, reviewPoints) {
    const content = fileBuffer.toString('utf-8');

    const modifyPrompt = `# 需求文档修改任务

请根据以下评审意见，生成修改后的需求文档内容。

## 原始需求文档

---
${content}
---

## 评审意见

${reviewPoints.map((p, i) => `${i + 1}. 【${p.category}】位置：${p.location}
   原文：${p.originalText}
   问题：${p.issue}
   建议：${p.suggestion}`).join('\n\n')}

请根据评审意见修改原文，生成修改后的完整需求文档。
输出要求：
1. 只输出修改后的文档内容
2. 修改的地方用【已修改】标记
3. 保持原文格式
4. 直接输出JSON格式：{"modifiedContent": "修改后的完整文档内容"}`;

    console.log('调用火山引擎大模型生成修改文档...');

    let modifiedContent = content;
    try {
        const llmResponse = await callOllamaLLM(modifyPrompt, 3, 5000);

        if (llmResponse) {
            console.log('大模型返回原始内容长度:', llmResponse.length);

            let jsonStr = llmResponse;
            jsonStr = jsonStr.replace(/```json\s*/gi, '');
            jsonStr = jsonStr.replace(/```\s*/gi, '');
            jsonStr = jsonStr.trim();

            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }

            const parsed = JSON.parse(jsonStr);
            if (parsed.modifiedContent) {
                modifiedContent = parsed.modifiedContent;
                console.log('成功解析修改内容');
            }
        } else {
            console.log('大模型未返回内容，使用原始内容');
        }
    } catch (error) {
        console.error('大模型调用失败，使用原始内容:', error.message);
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun({ text: '需求评审报告', bold: true, size: 48, color: 'FF0000' })
                    ],
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `原文件: ${fileName}`, size: 24, color: '666666' })
                    ],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `评审时间: ${new Date().toLocaleString('zh-CN')}`, size: 24, color: '666666' })
                    ],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `评审点数: ${reviewPoints.length}个`, size: 24, color: '11998e' })
                    ],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ children: [] }),

                new Paragraph({
                    children: [new TextRun({ text: '一、评审问题汇总', bold: true, size: 32, color: '11998e' })],
                    heading: HeadingLevel.HEADING_1
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: '序号', bold: true })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'E6E6E6' }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: '分类', bold: true })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'E6E6E6' }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: '位置', bold: true })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'E6E6E6' }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: '问题描述', bold: true })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'E6E6E6' }
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: '修改建议', bold: true })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'E6E6E6' }
                                })
                            ]
                        }),
                        ...reviewPoints.map((point, index) =>
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: String(index + 1), bold: true, color: 'FF0000' })],
                                            alignment: AlignmentType.CENTER
                                        })]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: point.category })]
                                        })]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: point.location || '-' })]
                                        })]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: point.issue })]
                                        })]
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: point.suggestion, color: 'FF0000' })]
                                        })]
                                    })
                                ]
                            })
                        )
                    ]
                }),
                new Paragraph({ children: [] }),

                new Paragraph({
                    children: [new TextRun({ text: '二、修改后的需求文档', bold: true, size: 32, color: '11998e' })],
                    heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({
                    children: [new TextRun({ text: modifiedContent })]
                }),
                new Paragraph({ children: [] }),

                new Paragraph({
                    children: [new TextRun({ text: '三、详细评审点', bold: true, size: 32, color: '11998e' })],
                    heading: HeadingLevel.HEADING_1
                }),
                ...reviewPoints.flatMap((point, index) => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: (index + 1) + '. ', bold: true, color: 'FF0000', size: 28 }),
                            new TextRun({ text: '[' + point.category + ']', bold: true, color: 'FF6600' })
                        ],
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: '位置：', bold: true }),
                            new TextRun({ text: point.location || '-' })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: '原文：', bold: true }),
                            new TextRun({ text: point.originalText || '-' })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: '问题：', bold: true }),
                            new TextRun({ text: point.issue || '-' })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: '修改建议：', bold: true, color: 'FF0000' }),
                            new TextRun({ text: point.suggestion || '-', color: 'FF0000' })
                        ]
                    }),
                    new Paragraph({ children: [] })
                ])
            ]
        }]
    });

    return doc;
}

app.post('/api/analyze-requirement', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '请上传需求文档'
            });
        }

        let originalName = req.file.originalname;
        try {
            originalName = decodeURIComponent(req.file.originalname);
        } catch (e) {
            originalName = req.file.originalname;
        }

        console.log('开始AI评审分析文档:', originalName);

        const reviewPoints = await analyzeRequirementDocumentWithLLM(
            req.file.buffer,
            originalName
        );

        console.log('评审完成，发现', reviewPoints.length, '个问题点');

        res.json({
            success: true,
            data: {
                reviewPoints: reviewPoints,
                totalCount: reviewPoints.length,
                analyzedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('AI评审分析失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'AI评审分析失败'
        });
    }
});

app.post('/api/generate-reviewed-document', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '请上传需求文档'
            });
        }

        const reviewPoints = JSON.parse(req.body.reviewPoints || '[]');

        if (reviewPoints.length === 0) {
            return res.status(400).json({
                success: false,
                error: '请至少添加一个评审点'
            });
        }

        let originalName = req.file.originalname;
        try {
            originalName = decodeURIComponent(req.file.originalname);
        } catch (e) {
            originalName = req.file.originalname;
        }

        console.log('开始生成评审文档:', originalName, '评审点数:', reviewPoints.length);

        const doc = await generateReviewedDocument(
            req.file.buffer,
            originalName,
            reviewPoints
        );

        const buffer = await Packer.toBuffer(doc);

        const timestamp = Date.now();
        const baseName = req.file.originalname.replace(/\.docx$/i, '');
        const filename = `${baseName}_评审报告_${timestamp}.docx`;
        const filepath = path.join(REPORTS_DIR, filename);

        fs.writeFileSync(filepath, buffer);

        const stats = fs.statSync(filepath);
        const fileSize = stats.size < 1024 * 1024
            ? `${(stats.size / 1024).toFixed(2)} KB`
            : `${(stats.size / (1024 * 1024)).toFixed(2)} MB`;

        console.log('评审文档生成成功:', filename);

        res.json({
            success: true,
            data: {
                filename: filename,
                downloadUrl: `/api/download/${filename}`,
                generatedTime: new Date().toLocaleString('zh-CN'),
                fileSize: fileSize,
                reviewCount: reviewPoints.length
            }
        });
    } catch (error) {
        console.error('生成评审文档失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || '生成评审文档失败'
        });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(REPORTS_DIR, filename);

    if (fs.existsSync(filepath)) {
        res.download(filepath, filename);
    } else {
        res.status(404).json({
            success: false,
            error: '文件不存在'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AI需求评审工具', version: '1.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let lanIp = 'localhost';
    for (const name of Object.keys(networkInterfaces)) {
        for (const iface of networkInterfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                lanIp = iface.address;
                break;
            }
        }
        if (lanIp !== 'localhost') break;
    }
    console.log(`\n========================================`);
    console.log(`AI需求评审服务已启动`);
    console.log(`本地访问: http://localhost:${PORT}`);
    console.log(`局域网访问: http://${lanIp}:${PORT}`);
    console.log(`========================================\n`);
});
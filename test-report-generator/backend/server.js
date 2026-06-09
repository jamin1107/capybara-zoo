const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const REPORTS_DIR = path.join(__dirname, 'reports');
fs.mkdirSync(REPORTS_DIR, { recursive: true });

function createTable(headers, rows) {
    const tableRows = [];
    
    tableRows.push(new TableRow({
        children: headers.map(header => new TableCell({
            children: [new Paragraph({
                text: header,
                heading: HeadingLevel.HEADING_6
            })],
            shading: {
                type: ShadingType.SOLID,
                color: "4F81BD"
            }
        }))
    }));
    
    rows.forEach(row => {
        tableRows.push(new TableRow({
            children: row.map(cell => new TableCell({
                children: [new Paragraph(cell)]
            }))
        }));
    });
    
    return new Table({
        rows: tableRows,
        width: {
            size: 100,
            type: WidthType.PERCENTAGE
        }
    });
}

async function generateTestReport(data) {
    const {
        projectName,
        testVersion,
        testPeriod,
        testEnvironment,
        testers,
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
    } = data;

    const passRate = totalCases > 0 ? ((passedCases / totalCases) * 100).toFixed(1) : 0;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "软件测试报告",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                new Paragraph({ text: "1. 概述", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "1.1 项目背景", heading: HeadingLevel.HEADING_3 }),
                new Paragraph(`项目名称：${projectName || '未填写'}`),
                new Paragraph(`测试版本：${testVersion || '未填写'}`),
                new Paragraph(`测试周期：${testPeriod || '未填写'}`),

                new Paragraph({ text: "1.2 测试目的", heading: HeadingLevel.HEADING_3 }),
                new Paragraph("验证系统功能是否符合需求规格说明，发现并记录系统缺陷，评估系统质量，为项目上线提供决策依据。"),

                new Paragraph({ text: "2. 测试范围", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "2.1 测试模块", heading: HeadingLevel.HEADING_3 }),
                new Paragraph(testScope || '未填写'),

                new Paragraph({ text: "2.2 测试类型", heading: HeadingLevel.HEADING_3 }),
                new Paragraph(testType || '未填写'),

                new Paragraph({ text: "3. 测试环境", heading: HeadingLevel.HEADING_2 }),
                new Paragraph(testEnvironment || '未填写'),
                new Paragraph(`测试人员：${testers || '未填写'}`),

                new Paragraph({ text: "4. 用例执行情况", heading: HeadingLevel.HEADING_2 }),
                createTable(
                    ['统计项', '数量'],
                    [
                        ['总用例数', String(totalCases || 0)],
                        ['通过', String(passedCases || 0)],
                        ['失败', String(failedCases || 0)],
                        ['阻塞', String(blockedCases || 0)],
                        ['未执行', String(notExecutedCases || 0)],
                        ['通过率', `${passRate}%`]
                    ]
                ),

                new Paragraph({ text: "", spacing: { before: 200 } }),

                new Paragraph({ text: "5. 缺陷统计", heading: HeadingLevel.HEADING_2 }),
                createTable(
                    ['严重程度', '数量', '占比'],
                    [
                        ['致命', String(criticalDefects || 0), totalDefects > 0 ? `${((criticalDefects || 0) / totalDefects * 100).toFixed(1)}%` : '0%'],
                        ['严重', String(majorDefects || 0), totalDefects > 0 ? `${((majorDefects || 0) / totalDefects * 100).toFixed(1)}%` : '0%'],
                        ['一般', String(normalDefects || 0), totalDefects > 0 ? `${((normalDefects || 0) / totalDefects * 100).toFixed(1)}%` : '0%'],
                        ['轻微', String(minorDefects || 0), totalDefects > 0 ? `${((minorDefects || 0) / totalDefects * 100).toFixed(1)}%` : '0%'],
                        ['总计', String(totalDefects || 0), '100%']
                    ]
                ),

                new Paragraph({ text: "", spacing: { before: 200 } }),

                new Paragraph({ text: "6. 风险与遗留问题", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "6.1 遗留问题", heading: HeadingLevel.HEADING_3 }),
                new Paragraph(remainingIssues || '无遗留问题'),

                new Paragraph({ text: "7. 优化建议", heading: HeadingLevel.HEADING_2 }),
                new Paragraph("1. 建议优先解决致命和严重级别的缺陷"),
                new Paragraph("2. 建议增加回归测试覆盖范围"),
                new Paragraph("3. 建议完善测试用例，提高测试覆盖率"),
                new Paragraph("4. 建议建立持续集成测试流程"),

                new Paragraph({ text: "8. 测试结论", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "8.1 质量评估", heading: HeadingLevel.HEADING_3 }),
                new Paragraph(`本次测试共执行用例 ${totalCases || 0} 条，通过 ${passedCases || 0} 条，通过率 ${passRate}%。发现缺陷 ${totalDefects || 0} 个，其中致命 ${criticalDefects || 0} 个，严重 ${majorDefects || 0} 个。`),

                new Paragraph({ text: "8.2 上线建议", heading: HeadingLevel.HEADING_3 }),
                new Paragraph(testConclusion || '待评估'),

                new Paragraph({ text: "", spacing: { before: 400 } }),
                new Paragraph({
                    children: [
                        new TextRun("报告生成时间："),
                        new TextRun(new Date().toLocaleString('zh-CN'))
                    ],
                    alignment: AlignmentType.RIGHT
                }),
                new Paragraph({
                    text: `测试负责人：${testers || '未填写'}`,
                    alignment: AlignmentType.RIGHT
                })
            ]
        }]
    });

    return doc;
}

app.post('/api/generate-test-report', async (req, res) => {
    try {
        const data = req.body;
        const doc = await generateTestReport(data);
        
        const buffer = await Packer.toBuffer(doc);
        
        const filename = `测试报告_${data.projectName || '未命名'}_${Date.now()}.docx`;
        const filepath = path.join(REPORTS_DIR, filename);
        
        fs.writeFileSync(filepath, buffer);
        
        res.json({
            success: true,
            data: {
                filename,
                downloadUrl: `/api/download-report/${filename}`
            }
        });
    } catch (error) {
        console.error('Error generating test report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/download-report/:filename', (req, res) => {
    const { filename } = req.params;
    const filepath = path.join(REPORTS_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({
            success: false,
            error: 'File not found'
        });
    }
    
    res.download(filepath, filename);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================');
    console.log('  测试报告生成器');
    console.log('====================================');
    console.log(`本地访问: http://localhost:${PORT}`);
    console.log(`报告目录: ${REPORTS_DIR}`);
    console.log('====================================');
});

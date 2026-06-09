import sys
import os

try:
    import pdfplumber
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber"])
    import pdfplumber

pdf_path = '/Users/yantu/Desktop/医保培训.pdf'

pdf = pdfplumber.open(pdf_path)

print(f"前10页预览...")
for page_num in range(min(10, len(pdf.pages))):
    page = pdf.pages[page_num]
    print(f"\n{'='*50}")
    print(f"第 {page_num+1} 页")
    print(f"{'='*50}")
    
    # 打印页面文本
    text = page.extract_text()
    if text:
        print(text[:800])
    
    # 检查表格
    tables = page.extract_tables()
    if tables:
        print(f"\n📋 找到 {len(tables)} 个表格：")
        for i, table in enumerate(tables, 1):
            print(f"表格 {i}：{len(table)}行 x {len(table[0]) if table else 0}列")
            if len(table) > 0:
                print(f"第一行示例: {table[0]}")

pdf.close()

print(f"\n{'='*50}")
print("PDF分析完成！")
print(f"{'='*50}")
import sys
import os

print("安装OCR所需依赖...")

try:
    import pdf2image
    import pytesseract
    from PIL import Image
    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment
except ImportError:
    print("正在安装依赖包...")
    import subprocess
    packages = ['pdf2image', 'pytesseract', 'pillow', 'openpyxl']
    for pkg in packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q"])
        except Exception as e:
            print(f"安装 {pkg} 可能需要系统依赖: {e}")
    print("依赖安装完成！")

pdf_path = '/Users/yantu/Desktop/医保培训.pdf'
output_path = '/Users/yantu/Desktop/医保培训.xlsx'

print(f"\n开始处理PDF: {pdf_path}")

# 检查是否可以转换PDF为图片
try:
    from pdf2image import convert_from_path
    import pytesseract
    from PIL import Image
    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment
    
    # 尝试转换PDF第一页
    print("正在转换PDF为图片...")
    try:
        pages = convert_from_path(pdf_path, dpi=200, first_page=1, last_page=3)
        print(f"✅ 成功转换 {len(pages)} 页为图片")
    except Exception as e:
        print(f"\n❌ PDF转换为图片失败: {e}")
        print("\n解决方法:")
        print("  macOS: 安装 poppler: brew install poppler")
        print("  Windows: 下载poppler并添加到PATH")
        print("\n或者使用以下方法之一:")
        print("  1. 在线OCR服务")
        print("  2. Adobe Acrobat Pro")
        print("  3. 微信/QQ的OCR功能")
        sys.exit(1)
    
    print("\nPDF是扫描件，需要使用OCR识别")
    print("\n建议方案:")
    print("  方案A: 使用在线OCR服务（推荐）")
    print("    如：腾讯云OCR、百度OCR等")
    print("    优点：准确率高，支持表格识别")
    print("\n  方案B: 使用Adobe Acrobat Pro")
    print("    优点：专业，支持表格结构")
    print("\n  方案C: 使用微信/QQ的截图识别")
    print("    优点：免费，快速")

except Exception as e:
    print(f"\n初始化失败: {e}")
    print("\n由于PDF是扫描件格式，需要专业OCR工具")
    print("\n推荐步骤:")
    print("  1. 用 Adobe Acrobat 打开PDF")
    print("  2. 点击 文件 -> 导出到 -> Excel")
    print("  3. 或者使用 工具 -> 编辑PDF -> 扫描件编辑")
    print("  4. 或者使用在线PDF转Excel服务")
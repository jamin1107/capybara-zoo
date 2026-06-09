import sys
import os

print("检查PDF格式...")

try:
    import pdfplumber
    from PIL import Image
except ImportError:
    print("正在安装依赖...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber", "pillow"])
    import pdfplumber
    from PIL import Image

pdf_path = '/Users/yantu/Desktop/医保培训.pdf'

try:
    pdf = pdfplumber.open(pdf_path)
except Exception as e:
    print(f"打开PDF失败: {e}")
    sys.exit(1)

print(f"PDF总页数: {len(pdf.pages)}")

# 提取第一页的图片
page = pdf.pages[0]

# 检查是否有图片
images = page.images
print(f"\n第一页找到 {len(images)} 张图片")

if len(images) > 0:
    print(f"\n第一页图片信息:")
    for i, img in enumerate(images[:3], 1):
        print(f"  图片{i}: {img}")

# 尝试检查PDF是否是纯图片
print(f"\n第一页文本长度: {len(page.extract_text() or '')} 字符")

if len(page.extract_text() or '') < 10:
    print("\n⚠️  这看起来是一个纯图片格式的PDF（扫描件）")
    print("需要使用OCR（光学字符识别）来提取内容")
    print("建议:")
    print("  1. 使用 Adobe Acrobat 等专业工具进行OCR识别")
    print("  2. 或者使用在线OCR服务")
    print("  3. 或者将PDF转换为图片后使用OCR库处理")
else:
    print("\n✅ PDF包含可提取的文本内容")

pdf.close()
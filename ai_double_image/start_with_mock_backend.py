#!/usr/bin/env python3
"""
简化版后端服务器 - 只需要Python标准库
不需要安装任何额外依赖
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import os
import json
import base64
import urllib.parse
from io import BytesIO

class MockHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        
        file_path = '.' + self.path
        
        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.send_response(200)
            
            if file_path.endswith('.html'):
                self.send_header('Content-type', 'text/html; charset=utf-8')
            elif file_path.endswith('.css'):
                self.send_header('Content-type', 'text/css; charset=utf-8')
            elif file_path.endswith('.js'):
                self.send_header('Content-type', 'application/javascript; charset=utf-8')
            else:
                self.send_header('Content-type', 'application/octet-stream')
            
            self.end_headers()
            
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'File not found')
    
    def do_POST(self):
        if self.path == '/api/fuse':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            
            boundary = self.headers['Content-Type'].split('=')[1]
            parts = body.split(b'--' + boundary.encode())
            
            image1_data = None
            image2_data = None
            
            for part in parts:
                if b'image1' in part:
                    img_start = part.find(b'\r\n\r\n') + 4
                    img_end = part.rfind(b'\r\n')
                    image1_data = part[img_start:img_end]
                elif b'image2' in part:
                    img_start = part.find(b'\r\n\r\n') + 4
                    img_end = part.rfind(b'\r\n')
                    image2_data = part[img_start:img_end]
            
            if image1_data and image2_data:
                result_data = self.mock_fuse(image1_data, image2_data)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                
                response = {
                    'success': True,
                    'resultImage': f'data:image/jpeg;base64,{base64.b64encode(result_data).decode()}'
                }
                self.wfile.write(json.dumps(response).encode())
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                response = {'success': False, 'error': 'No images provided'}
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def mock_fuse(self, img1_data, img2_data):
        try:
            from PIL import Image
            img1 = Image.open(BytesIO(img1_data)).convert('RGBA')
            img2 = Image.open(BytesIO(img2_data)).convert('RGBA')
            
            width = max(img1.width, img2.width)
            height = max(img1.height, img2.height)
            
            img1 = img1.resize((width // 2, height), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS)
            img2 = img2.resize((width // 2, height), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS)
            
            result = Image.new('RGBA', (width, height), (255, 255, 255, 255))
            result.paste(img1, (0, 0))
            result.paste(img2, (width // 2, 0))
            
            output = BytesIO()
            result = result.convert('RGB')
            result.save(output, format='JPEG', quality=85)
            return output.getvalue()
        except ImportError:
            return img1_data
    
    def log_message(self, format, *args):
        pass

def main():
    print("====================================")
    print("  AI双图融合 - 简化版服务器")
    print("====================================")
    print("")
    print("服务器将在 http://localhost:3000 启动")
    print("按 Ctrl+C 停止服务器")
    print("")
    print("功能说明：")
    print("- 如果已安装Pillow，会进行左右拼接融合")
    print("- 如果未安装Pillow，直接返回第一张图片")
    print("")
    
    try:
        server = HTTPServer(('0.0.0.0', 3000), MockHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.shutdown()

if __name__ == '__main__':
    main()

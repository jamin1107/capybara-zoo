import os
import base64
from io import BytesIO
import json

try:
    from flask import Flask, request, jsonify, send_from_directory
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

app = None
if FLASK_AVAILABLE:
    app = Flask(__name__, static_folder='../')
    CORS(app)

UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

API_CONFIG = {
    'aliyun': {
        'api_key': 'sk-5f82c689d90142f4bc359451f6067513',
        'api_url': 'https://dashscope.aliyuncs.com/api/v1',
        'model': 'wan2.7-image'
    },
    'openai': {
        'api_key': os.getenv('OPENAI_API_KEY', ''),
        'api_url': 'https://api.openai.com/v1/images/edits'
    },
    'stability': {
        'api_key': os.getenv('STABILITY_API_KEY', ''),
        'api_url': 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image'
    }
}

def image_to_base64(image_path):
    with open(image_path, 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def simulate_fusion(image1_path, image2_path):
    if not PILLOW_AVAILABLE:
        return image1_path
    
    try:
        img1 = Image.open(image1_path).convert('RGBA')
        img2 = Image.open(image2_path).convert('RGBA')
        
        width = max(img1.width, img2.width)
        height = max(img1.height, img2.height)
        
        if hasattr(Image, 'Resampling'):
            img1 = img1.resize((width // 2, height), Image.Resampling.LANCZOS)
            img2 = img2.resize((width // 2, height), Image.Resampling.LANCZOS)
        else:
            img1 = img1.resize((width // 2, height), Image.LANCZOS)
            img2 = img2.resize((width // 2, height), Image.LANCZOS)
        
        result = Image.new('RGBA', (width, height), (255, 255, 255, 255))
        result.paste(img1, (0, 0))
        result.paste(img2, (width // 2, 0))
        
        result_path = os.path.join(RESULTS_FOLDER, 'fusion_result.png')
        result = result.convert('RGB')
        result.save(result_path, format='JPEG', quality=85)
        return result_path
    except Exception as e:
        print(f"Image processing error: {e}")
        return image1_path

def call_aliyun_fusion(image1_path, image2_path, prompt):
    if not REQUESTS_AVAILABLE:
        return None, 'Requests library not available'
    
    api_key = API_CONFIG['aliyun']['api_key']
    if not api_key:
        return None, 'Aliyun API key not configured'
    
    try:
        print("=" * 60)
        print("调用 万相2.7-image 模型")
        print("=" * 60)
        print(f"API Key: {api_key[:20]}...")
        print(f"Model: wan2.7-image")
        print(f"Image1: {image1_path}")
        print(f"Image2: {image2_path}")
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        final_prompt = '把两张图人物做成合照，保证五官和面部表情不变。要写实的风格，正面朝镜头，要iPhone自拍的风格，画面不要失真，要有自然的光感和动作'
        
        print(f"Prompt: {final_prompt}")
        
        # 将两张图片转换为base64
        content = [{'text': final_prompt}]
        
        # 添加第一张图片
        img1_base64 = image_to_base64(image1_path)
        content.append({'image': f'data:image/jpeg;base64,{img1_base64}'})
        
        # 添加第二张图片
        img2_base64 = image_to_base64(image2_path)
        content.append({'image': f'data:image/jpeg;base64,{img2_base64}'})
        
        # 使用万相2.7-image 模型
        data = {
            'model': 'wan2.7-image',
            'input': {
                'messages': [
                    {
                        'role': 'user',
                        'content': content
                    }
                ]
            },
            'parameters': {
                'prompt_extend': True,
                'watermark': False,
                'n': 1,
                'enable_interleave': False,
                'size': '1024*1024'
            }
        }
        
        print(f"\nRequest URL: https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation")
        print(f"Request data (prompt + 2 images)")
        
        response = requests.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
            headers=headers,
            json=data,
            timeout=120
        )
        
        print(f"\nResponse status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n完整响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
            
            if 'output' in result and 'choices' in result['output']:
                if len(result['output']['choices']) > 0:
                    choice = result['output']['choices'][0]
                    if 'message' in choice and 'content' in choice['message']:
                        for content_item in choice['message']['content']:
                            if 'image' in content_item:
                                image_url = content_item['image']
                                print(f"\n✅ 成功获取图片 URL: {image_url}")
                                img_response = requests.get(image_url, timeout=30)
                                result_path = os.path.join(RESULTS_FOLDER, 'wanx26_result.png')
                                with open(result_path, 'wb') as f:
                                    f.write(img_response.content)
                                print(f"✅ 图片已保存到: {result_path}")
                                return result_path, None
            
            return None, f'万相2.7 API 响应格式不对: {response.text}'
        else:
            return None, f'万相2.7 API 调用失败: {response.status_code} - {response.text}'
            
    except Exception as e:
        print(f"\n❌ 异常: {str(e)}")
        import traceback
        print(f"Stack trace:\n{traceback.format_exc()}")
        return None, str(e)

def call_openai_fusion(image1_path, image2_path, prompt):
    if not REQUESTS_AVAILABLE:
        return None, 'Requests library not available'
    
    api_key = API_CONFIG['openai']['api_key']
    if not api_key:
        return None, 'OpenAI API key not configured'
    
    try:
        headers = {
            'Authorization': f'Bearer {api_key}'
        }
        
        with open(image1_path, 'rb') as img1, open(image2_path, 'rb') as img2:
            files = {
                'image': img1,
                'mask': img2
            }
            data = {
                'prompt': prompt or 'Combine these two images creatively',
                'n': 1,
                'size': '1024x1024'
            }
            
            response = requests.post(
                API_CONFIG['openai']['api_url'],
                headers=headers,
                files=files,
                data=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'data' in result and len(result['data']) > 0:
                    image_url = result['data'][0]['url']
                    img_response = requests.get(image_url, timeout=30)
                    result_path = os.path.join(RESULTS_FOLDER, 'openai_result.png')
                    with open(result_path, 'wb') as f:
                        f.write(img_response.content)
                    return result_path, None
            
            return None, f'OpenAI API error: {response.text}'
            
    except Exception as e:
        return None, str(e)

def call_stability_fusion(image1_path, image2_path, prompt):
    if not REQUESTS_AVAILABLE or not PILLOW_AVAILABLE:
        return None, 'Required libraries not available'
    
    api_key = API_CONFIG['stability']['api_key']
    if not api_key:
        return None, 'Stability AI API key not configured'
    
    try:
        img1 = Image.open(image1_path)
        if hasattr(Image, 'Resampling'):
            img1 = img1.resize((1024, 1024), Image.Resampling.LANCZOS)
        else:
            img1 = img1.resize((1024, 1024), Image.LANCZOS)
        img1_byte_arr = BytesIO()
        img1.save(img1_byte_arr, format='PNG')
        img1_byte_arr.seek(0)
        
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
        
        files = {
            'init_image': img1_byte_arr
        }
        
        data = {
            'init_image_mode': 'IMAGE_STRENGTH',
            'image_strength': 0.35,
            'text_prompts[0][text]': prompt or 'Creative fusion of two images',
            'cfg_scale': 7,
            'samples': 1,
            'steps': 30
        }
        
        response = requests.post(
            API_CONFIG['stability']['api_url'],
            headers=headers,
            files=files,
            data=data,
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'artifacts' in result and len(result['artifacts']) > 0:
                image_data = base64.b64decode(result['artifacts'][0]['base64'])
                result_path = os.path.join(RESULTS_FOLDER, 'stability_result.png')
                with open(result_path, 'wb') as f:
                    f.write(image_data)
                return result_path, None
        
        return None, f'Stability AI API error: {response.text}'
        
    except Exception as e:
        return None, str(e)

if FLASK_AVAILABLE:
    @app.route('/')
    def index():
        return send_from_directory('../', 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        return send_from_directory('../', path)

    @app.route('/api/fuse', methods=['POST'])
    def fuse_images():
        try:
            if 'image1' not in request.files or 'image2' not in request.files:
                return jsonify({'success': False, 'error': 'No images provided'}), 400
            
            image1 = request.files['image1']
            image2 = request.files['image2']
            prompt = request.form.get('prompt', 'Creative fusion of two images')
            api_type = request.form.get('api_type', 'aliyun')
            
            image1_path = os.path.join(UPLOAD_FOLDER, 'image1.jpg')
            image2_path = os.path.join(UPLOAD_FOLDER, 'image2.jpg')
            
            image1.save(image1_path)
            image2.save(image2_path)
            
            result_path = None
            error = None
            
            if api_type == 'aliyun':
                result_path, error = call_aliyun_fusion(image1_path, image2_path, prompt)
            elif api_type == 'openai':
                result_path, error = call_openai_fusion(image1_path, image2_path, prompt)
            elif api_type == 'stability':
                result_path, error = call_stability_fusion(image1_path, image2_path, prompt)
            else:
                result_path, error = call_aliyun_fusion(image1_path, image2_path, prompt)
            
            if error:
                return jsonify({'success': False, 'error': error}), 500
            
            if result_path and os.path.exists(result_path):
                result_base64 = image_to_base64(result_path)
                return jsonify({
                    'success': True,
                    'resultImage': f'data:image/png;base64,{result_base64}'
                })
            else:
                return jsonify({'success': False, 'error': 'Failed to generate result'}), 500
                
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/config', methods=['POST'])
    def update_config():
        try:
            data = request.json
            if 'openai_key' in data:
                API_CONFIG['openai']['api_key'] = data['openai_key']
            if 'stability_key' in data:
                API_CONFIG['stability']['api_key'] = data['stability_key']
            
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print('====================================')
    print('    AI双图融合 - 后端服务器')
    print('====================================')
    print()
    
    if not FLASK_AVAILABLE:
        print('❌ Flask 未安装，服务器无法启动')
        print('请运行: pip install flask flask-cors')
        exit(1)
    
    print('✅ Flask: 已可用')
    
    if PILLOW_AVAILABLE:
        print('✅ Pillow: 已可用 (图片融合)')
    else:
        print('⚠️  Pillow: 未安装 (将直接返回原图)')
    
    if REQUESTS_AVAILABLE:
        print('✅ Requests: 已可用 (AI API调用)')
    else:
        print('⚠️  Requests: 未安装 (无法调用真实AI API)')
    
    print()
    print('服务器将在 http://localhost:3000 启动')
    print('按 Ctrl+C 停止服务器')
    print()
    
    app.run(host='0.0.0.0', port=3000, debug=True)

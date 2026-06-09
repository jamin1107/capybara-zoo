#!/usr/bin/env python3
import requests
import json

API_KEY = "sk-5f82c689d90142f4bc359451f6067513"
COMPATIBLE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations"

def test_openai_compatible():
    print("=" * 60)
    print("Testing DashScope OpenAI-compatible API")
    print("=" * 60)
    
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'model': 'dall-e-3',
        'prompt': '一个美丽的日落，在海边',
        'size': '1024x1024',
        'n': 1
    }
    
    print(f"\nRequest URL: {COMPATIBLE_URL}")
    print(f"Request data: {json.dumps(data, ensure_ascii=False, indent=2)}")
    
    try:
        response = requests.post(
            COMPATIBLE_URL,
            headers=headers,
            json=data,
            timeout=60
        )
        
        print(f"\nResponse status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS!")
            if 'data' in result and len(result['data']) > 0:
                print(f"Got {len(result['data'])} result(s)")
                if 'url' in result['data'][0]:
                    print(f"Image URL: {result['data'][0]['url']}")
                elif 'b64_json' in result['data'][0]:
                    print("Got base64 encoded image")
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        import traceback
        print(f"Stack trace:\n{traceback.format_exc()}")

if __name__ == '__main__':
    test_openai_compatible()

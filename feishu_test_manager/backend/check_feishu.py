import requests
import json

# 飞书凭证
APP_ID = 'cli_a97739114c325bc0'
APP_SECRET = 'lUEOKTpz5CM0yZWcxr4dBdQg7R5d78XR'

# 获取 tenant_access_token
url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
headers = {"Content-Type": "application/json"}
data = {
    "app_id": APP_ID,
    "app_secret": APP_SECRET
}

try:
    response = requests.post(url, headers=headers, json=data, timeout=10)
    result = response.json()

    print("=" * 50)
    print("飞书 API 连接测试")
    print("=" * 50)

    if result.get("code") == 0:
        print("✅ API 连接成功！")
        print(f"Tenant Access Token: {result.get('tenant_access_token', '')[:30]}...")
        print(f"过期时间: {result.get('expire')} 秒")
    else:
        print(f"❌ API 连接失败")
        print(f"错误码: {result.get('code')}")
        print(f"错误信息: {result.get('msg')}")

except Exception as e:
    print(f"❌ 连接错误: {e}")

print("\n" + "=" * 50)
print("请提供您的多维表格信息")
print("=" * 50)
print("""
在飞书中获取多维表格链接的方法：
1. 打开您的"测试管理系统数据" Wiki
2. 点击其中的"用例库"等多维表格
3. 点击右上角"分享"按钮
4. 复制链接给我

链接格式应该是: https://xxx.feishu.cn/base/xxx
""")
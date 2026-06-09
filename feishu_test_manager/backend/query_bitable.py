import requests

APP_ID = 'cli_a97739114c325bc0'
APP_SECRET = 'lUEOKTpz5CM0yZWcxr4dBdQg7R5d78XR'

# 获取 tenant_access_token
url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
headers = {"Content-Type": "application/json"}
data = {"app_id": APP_ID, "app_secret": APP_SECRET}

response = requests.post(url, headers=headers, json=data, timeout=10)
result = response.json()
token = result.get("tenant_access_token", "")

print("=" * 60)
print("查询用户可访问的多维表格")
print("=" * 60)

if not token:
    print("❌ 获取token失败")
    exit(1)

# 尝试查询多维表格列表
headers2 = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 尝试获取用户的bitable列表
try:
    # 方式1：通过搜索API查询bitable
    search_url = "https://open.feishu.cn/open-apis/suite/docs-api/search/object"

    # 尝试直接获取应用下的多维表格
    bitable_url = "https://open.feishu.cn/open-apis/bitable/v1/apps"

    response2 = requests.get(bitable_url, headers=headers2, timeout=10)
    result2 = response2.json()

    print(f"\n查询结果: code={result2.get('code')}")
    if result2.get('code') == 0:
        print("✅ 成功获取多维表格列表！")
        data_items = result2.get('data', {}).get('items', [])
        if data_items:
            print(f"\n找到 {len(data_items)} 个多维表格:")
            for item in data_items:
                print(f"  - {item.get('name')}: {item.get('app_token')}")
        else:
            print("未找到多维表格，可能需要用户手动创建")
    else:
        print(f"错误: {result2.get('msg')}")

except Exception as e:
    print(f"查询失败: {e}")

print("\n" + "=" * 60)
print("解决方案")
print("=" * 60)
print("""
由于您创建的是Wiki类型的多维表格，需要通过以下方式获取Token：

方法1：通过Wiki链接获取
1. 打开您的Wiki: https://my.feishu.cn/wiki/MTyiwNmfrid0ArkzSLycLjWfnYd
2. 在Wiki中找到"用例库"等多维表格
3. 点击进入多维表格后，查看浏览器URL

方法2：直接获取某个具体的bitable
如果您知道bitable的token，可以直接告诉我

方法3：使用API创建多维表格（需要用户授权）
""")
import requests
import json

APP_ID = 'cli_a97739114c325bc0'
APP_SECRET = 'lUEOKTpz5CM0yZWcxr4dBdQg7R5d78XR'

def get_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    response = requests.post(url, json={"app_id": APP_ID, "app_secret": APP_SECRET}, timeout=10)
    return response.json().get("tenant_access_token", "")

print("=" * 60)
print("检查应用权限")
print("=" * 60)

token = get_token()
if not token:
    print("❌ 获取token失败")
    exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

app_token = "XwqNbmfOraVCyQsRqsIchfBknWf"
url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables"

print("\n尝试创建数据表...")
response = requests.post(url, headers=headers, json={"table": {"Name": "用例库", "fields": []}}, timeout=10)
result = response.json()

print(f"响应: {json.dumps(result, ensure_ascii=False)}")

print("\n" + "=" * 60)
print("需要配置的应用权限")
print("=" * 60)
print("""
错误原因: 应用缺少多维表格的创建权限

需要在飞书开放平台添加以下权限：

1. 打开 https://open.feishu.cn/
2. 进入您的应用 (cli_a97739114c325bc0)
3. 点击「权限管理」
4. 添加以下权限：
   - bitable:app (多维表格)
   - bitable:app:create (创建多维表格)
   - bitable:table (数据表)
   - bitable:table:create (创建数据表)
   - bitable:field (字段)
   - bitable:field:create (创建字段)
5. 发布应用新版本

或者，您可以在飞书中手动创建数据表：

手动创建数据表的方法：
1. 打开刚创建的多维表格:
   https://my.feishu.cn/base/XwqNbmfOraVCyQsRqsIchfBknWf
2. 点击「+新建数据表」
3. 创建以下5个数据表：
   - 用例库
   - 测试任务
   - 用例执行
   - 缺陷管理
   - 测试报告
4. 然后把每个数据表的Table ID告诉我
""")

print(f"\n多维表格已创建: https://my.feishu.cn/base/{app_token}")
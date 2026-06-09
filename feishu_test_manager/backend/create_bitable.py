import requests
import json
import time

APP_ID = 'cli_a97739114c325bc0'
APP_SECRET = 'lUEOKTpz5CM0yZWcxr4dBdQg7R5d78XR'

def get_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    response = requests.post(url, json={"app_id": APP_ID, "app_secret": APP_SECRET}, timeout=10)
    return response.json().get("tenant_access_token", "")

def create_bitable(token, name):
    url = "https://open.feishu.cn/open-apis/bitable/v1/apps"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json={"name": name}, timeout=10)
    result = response.json()
    print(f"  创建多维表格: code={result.get('code')}, name={name}")
    if result.get('code') == 0:
        return result['data']['app']['app_token']
    return None

def create_table(token, app_token, name):
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json={"table": {"name": name, "fields": []}}, timeout=10)
    result = response.json()
    print(f"  创建数据表: code={result.get('code')}, name={name}")
    if result.get('code') == 0:
        return result['data']['table_id']
    return None

def add_field(token, app_token, table_id, field_name, field_type=1):
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.post(url, headers=headers, json={"field_name": field_name, "type": field_type}, timeout=10)
    return response.json().get('code') == 0

def list_tables(token, app_token):
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers, timeout=10)
    result = response.json()
    if result.get('code') == 0:
        return result['data'].get('items', [])
    return []

print("=" * 60)
print("飞书测试管理系统 - 多维表格创建")
print("=" * 60)

token = get_token()
if not token:
    print("❌ 获取token失败")
    exit(1)

print("\n✅ Token获取成功\n")

# 1. 创建多维表格
print("[1/4] 创建多维表格...")
app_token = create_bitable(token, "测试管理系统数据")
if not app_token:
    print("❌ 创建多维表格失败")
    exit(1)

print(f"  App Token: {app_token}\n")

# 2. 定义数据表结构
tables_config = {
    "用例库": [
        ("用例ID", 1),
        ("用例标题", 1),
        ("所属模块", 1),
        ("优先级", 3),
        ("用例类型", 3),
        ("前置条件", 1),
        ("测试步骤", 1),
        ("预期结果", 1),
        ("创建人", 1),
        ("创建时间", 5),
    ],
    "测试任务": [
        ("任务ID", 1),
        ("任务名称", 1),
        ("所属项目", 1),
        ("测试版本", 1),
        ("任务状态", 3),
        ("优先级", 3),
        ("负责人", 1),
        ("计划开始", 5),
        ("计划结束", 5),
        ("用例总数", 2),
        ("已执行数", 2),
        ("通过数", 2),
        ("失败数", 2),
    ],
    "用例执行": [
        ("执行ID", 1),
        ("任务ID", 1),
        ("用例ID", 1),
        ("执行人", 1),
        ("执行状态", 3),
        ("实际结果", 1),
        ("关联缺陷ID", 1),
        ("执行时间", 5),
        ("执行耗时(分钟)", 2),
        ("备注", 1),
    ],
    "缺陷管理": [
        ("缺陷ID", 1),
        ("缺陷标题", 1),
        ("严重程度", 3),
        ("优先级", 3),
        ("缺陷状态", 3),
        ("指派给", 1),
        ("报告人", 1),
        ("关联用例ID", 1),
        ("关联任务ID", 1),
        ("缺陷描述", 1),
        ("创建时间", 5),
        ("更新时间", 5),
    ],
    "测试报告": [
        ("报告ID", 1),
        ("关联任务ID", 1),
        ("报告名称", 1),
        ("总用例数", 2),
        ("已执行数", 2),
        ("通过数", 2),
        ("失败数", 2),
        ("阻塞数", 2),
        ("通过率(%)", 2),
        ("缺陷汇总", 1),
        ("创建人", 1),
        ("创建时间", 5),
    ],
}

table_ids = {}

# 3. 创建数据表和字段
print("[2/4] 创建数据表...")
for table_name in tables_config.keys():
    table_id = create_table(token, app_token, table_name)
    if table_id:
        table_ids[table_name] = table_id
        print(f"  ✓ {table_name}: {table_id}")
    else:
        print(f"  ✗ {table_name} 创建失败")
    time.sleep(0.3)

print("\n[3/4] 添加字段...")
for table_name, fields in tables_config.items():
    if table_name not in table_ids:
        continue
    table_id = table_ids[table_name]
    print(f"  {table_name}:")
    for field_name, field_type in fields:
        success = add_field(token, app_token, table_id, field_name, field_type)
        status = "✓" if success else "✗"
        print(f"    {status} {field_name}")
        time.sleep(0.1)

# 4. 输出结果
print("\n[4/4] 配置完成！")
print("\n" + "=" * 60)
print("多维表格创建成功！")
print("=" * 60)
print(f"\n多维表格链接: https://my.feishu.cn/base/{app_token}")
print(f"\n各数据表Token:")
for name, tid in table_ids.items():
    print(f"  {name}: {tid}")

# 保存到.env文件
env_content = f"""# 飞书应用配置
FEISHU_APP_ID={APP_ID}
FEISHU_APP_SECRET={APP_SECRET}

# 多维表格配置
BITABLE_APP_TOKEN={app_token}

# 各模块Table ID
BITABLE_CASES_TABLE={table_ids.get('用例库', '')}
BITABLE_TASKS_TABLE={table_ids.get('测试任务', '')}
BITABLE_EXECUTIONS_TABLE={table_ids.get('用例执行', '')}
BITABLE_BUGS_TABLE={table_ids.get('缺陷管理', '')}
BITABLE_REPORTS_TABLE={table_ids.get('测试报告', '')}

# 服务配置
DEBUG=True
HOST=0.0.0.0
PORT=5000
SECRET_KEY=feishu-test-manager-secret-key-2026
"""

with open('.env', 'w') as f:
    f.write(env_content)

print("\n✅ .env 文件已更新！")
print("\n" + "=" * 60)
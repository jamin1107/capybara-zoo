import lark_oapi as lark

FEISHU_APP_ID = 'cli_a97739114c325bc0'
FEISHU_APP_SECRET = 'lUEOKTpz5CM0yZWcxr4dBdQg7R5d78XR'

client = lark.Client.builder() \
    .app_id(FEISHU_APP_ID) \
    .app_secret(FEISHU_APP_SECRET) \
    .build()

response = client.bitable.v1.app_access_token.create(
    lark.AppAccessTokenRequest.builder()
    .app_id(FEISHU_APP_ID)
    .app_secret(FEISHU_APP_SECRET)
    .build()
)

print(f"Code: {response.code()}")
print(f"Message: {response.msg}")
if response.code() == 0:
    print("✅ 凭证验证成功！")
    print(f"Access Token: {response.data.app_access_token[:20]}...")
else:
    print("❌ 凭证验证失败")
    print(f"错误信息: {response.msg}")
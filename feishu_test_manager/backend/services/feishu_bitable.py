import lark_oapi as lark
from config import FEISHU_APP_ID, FEISHU_APP_SECRET, BITABLE_APP_TOKEN, BITABLE_TABLE_TOKENS

class FeishuBitable:
    def __init__(self):
        self.app_id = FEISHU_APP_ID
        self.app_secret = FEISHU_APP_SECRET
        self.app_token = BITABLE_APP_TOKEN
        self.client = lark.Client.builder() \
            .app_id(self.app_id) \
            .app_secret(self.app_secret) \
            .build()

    def get_access_token(self):
        try:
            response = self.client.bitable.v1.app_access_token.create(
                lark.AppAccessTokenRequest.builder()
                .app_id(self.app_id)
                .app_secret(self.app_secret)
                .build()
            )
            if response.code() == 0:
                return response.data.app_access_token
            return None
        except Exception as e:
            print(f"获取access_token失败: {e}")
            return None

    def list_records(self, table_name, page_size=100, page_token=None):
        table_id = BITABLE_TABLE_TOKENS.get(table_name)
        if not table_id:
            return None, f"Table {table_name} not configured"

        token = self.get_access_token()
        if not token:
            return None, "Failed to get access token"

        try:
            response = self.client.bitable.v1.app_table_record.list(
                app_token=self.app_token,
                table_id=table_id,
                page_size=page_size,
                page_token=page_token
            )
            if response.code() == 0:
                return response.data, None
            return None, response.msg
        except Exception as e:
            return None, str(e)

    def get_record(self, table_name, record_id):
        table_id = BITABLE_TABLE_TOKENS.get(table_name)
        if not table_id:
            return None, f"Table {table_name} not configured"

        token = self.get_access_token()
        if not token:
            return None, "Failed to get access token"

        try:
            response = self.client.bitable.v1.app_table_record.get(
                app_token=self.app_token,
                table_id=table_id,
                record_id=record_id
            )
            if response.code() == 0:
                return response.data, None
            return None, response.msg
        except Exception as e:
            return None, str(e)

    def create_record(self, table_name, fields):
        table_id = BITABLE_TABLE_TOKENS.get(table_name)
        if not table_id:
            return None, f"Table {table_name} not configured"

        token = self.get_access_token()
        if not token:
            return None, "Failed to get access token"

        try:
            response = self.client.bitable.v1.app_table_record.create(
                app_token=self.app_token,
                table_id=table_id,
                request=lark.AppTableRecordCreateRequest.builder()
                    .fields(fields)
                    .build()
            )
            if response.code() == 0:
                return response.data, None
            return None, response.msg
        except Exception as e:
            return None, str(e)

    def update_record(self, table_name, record_id, fields):
        table_id = BITABLE_TABLE_TOKENS.get(table_name)
        if not table_id:
            return None, f"Table {table_name} not configured"

        token = self.get_access_token()
        if not token:
            return None, "Failed to get access token"

        try:
            response = self.client.bitable.v1.app_table_record.update(
                app_token=self.app_token,
                table_id=table_id,
                record_id=record_id,
                request=lark.AppTableRecordUpdateRequest.builder()
                    .fields(fields)
                    .build()
            )
            if response.code() == 0:
                return response.data, None
            return None, response.msg
        except Exception as e:
            return None, str(e)

    def delete_record(self, table_name, record_id):
        table_id = BITABLE_TABLE_TOKENS.get(table_name)
        if not table_id:
            return None, f"Table {table_name} not configured"

        token = self.get_access_token()
        if not token:
            return None, "Failed to get access token"

        try:
            response = self.client.bitable.v1.app_table_record.delete(
                app_token=self.app_token,
                table_id=table_id,
                record_id=record_id
            )
            if response.code() == 0:
                return {"success": True}, None
            return None, response.msg
        except Exception as e:
            return None, str(e)

    def batch_create_records(self, table_name, records):
        table_id = BITABLE_TABLE_TOKENS.get(table_name)
        if not table_id:
            return None, f"Table {table_name} not configured"

        token = self.get_access_token()
        if not token:
            return None, "Failed to get access token"

        try:
            items = [lark.AppTableRecord.builder().fields(r).build() for r in records]
            response = self.client.bitable.v1.app_table_record.batch_create(
                app_token=self.app_token,
                table_id=table_id,
                request=lark.AppTableRecordBatchCreateRequest.builder()
                    .items(items)
                    .build()
            )
            if response.code() == 0:
                return response.data, None
            return None, response.msg
        except Exception as e:
            return None, str(e)

bitable = FeishuBitable()
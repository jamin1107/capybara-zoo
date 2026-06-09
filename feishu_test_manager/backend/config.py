import os
from dotenv import load_dotenv

load_dotenv()

FEISHU_APP_ID = os.getenv('FEISHU_APP_ID', '')
FEISHU_APP_SECRET = os.getenv('FEISHU_APP_SECRET', '')
BITABLE_APP_TOKEN = os.getenv('BITABLE_APP_TOKEN', '')
BITABLE_TABLE_TOKENS = {
    'cases': os.getenv('BITABLE_CASES_TABLE', ''),
    'tasks': os.getenv('BITABLE_TASKS_TABLE', ''),
    'executions': os.getenv('BITABLE_EXECUTIONS_TABLE', ''),
    'bugs': os.getenv('BITABLE_BUGS_TABLE', ''),
    'reports': os.getenv('BITABLE_REPORTS_TABLE', ''),
    'projects': os.getenv('BITABLE_PROJECTS_TABLE', ''),
}

class Config:
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
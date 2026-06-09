from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from services.feishu_bitable import bitable
import json
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def success_response(data=None, message="Success"):
    response = {"code": 0, "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response)

def error_response(message, code=1):
    return jsonify({"code": code, "message": message}), 400

@app.route('/')
def index():
    return success_response({"name": "飞书测试管理系统API", "version": "1.0.0"})

@app.route('/api/health')
def health():
    return success_response({"status": "healthy"})

# ==================== 用例库接口 ====================

@app.route('/api/cases', methods=['GET'])
def get_cases():
    page_size = int(request.args.get('page_size', 100))
    page_token = request.args.get('page_token')

    result, err = bitable.list_records('cases', page_size, page_token)
    if err:
        return error_response(err)

    records = []
    for item in result.items:
        record = {
            'record_id': item.record_id,
            'fields': item.fields
        }
        records.append(record)

    return success_response({
        'records': records,
        'has_more': result.has_more,
        'next_page_token': result.next_page_token
    })

@app.route('/api/cases/<record_id>', methods=['GET'])
def get_case(record_id):
    result, err = bitable.get_record('cases', record_id)
    if err:
        return error_response(err)

    return success_response({
        'record_id': result.record_id,
        'fields': result.fields
    })

@app.route('/api/cases', methods=['POST'])
def create_case():
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    required_fields = ['case_id', 'title']
    for field in required_fields:
        if field not in data:
            return error_response(f"缺少必填字段: {field}")

    fields = {
        'case_id': data.get('case_id'),
        'title': data.get('title'),
        'module': data.get('module', ''),
        'priority': data.get('priority', 'P2'),
        'type': data.get('type', '功能测试'),
        'precondition': data.get('precondition', ''),
        'steps': data.get('steps', ''),
        'expected_result': data.get('expected_result', ''),
        'tags': data.get('tags', [])
    }

    result, err = bitable.create_record('cases', fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "用例创建成功")

@app.route('/api/cases/<record_id>', methods=['PUT'])
def update_case(record_id):
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    fields = {}
    for key in ['title', 'module', 'priority', 'type', 'precondition', 'steps', 'expected_result', 'tags']:
        if key in data:
            fields[key] = data[key]

    result, err = bitable.update_record('cases', record_id, fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "用例更新成功")

@app.route('/api/cases/<record_id>', methods=['DELETE'])
def delete_case(record_id):
    result, err = bitable.delete_record('cases', record_id)
    if err:
        return error_response(err)

    return success_response(message="用例删除成功")

# ==================== 测试任务接口 ====================

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    page_size = int(request.args.get('page_size', 100))
    page_token = request.args.get('page_token')

    result, err = bitable.list_records('tasks', page_size, page_token)
    if err:
        return error_response(err)

    records = []
    for item in result.items:
        records.append({
            'record_id': item.record_id,
            'fields': item.fields
        })

    return success_response({
        'records': records,
        'has_more': result.has_more,
        'next_page_token': result.next_page_token
    })

@app.route('/api/tasks/<record_id>', methods=['GET'])
def get_task(record_id):
    result, err = bitable.get_record('tasks', record_id)
    if err:
        return error_response(err)

    return success_response({
        'record_id': result.record_id,
        'fields': result.fields
    })

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    required_fields = ['task_id', 'task_name']
    for field in required_fields:
        if field not in data:
            return error_response(f"缺少必填字段: {field}")

    fields = {
        'task_id': data.get('task_id'),
        'task_name': data.get('task_name'),
        'project': data.get('project', ''),
        'version': data.get('version', ''),
        'status': data.get('status', '待开始'),
        'priority': data.get('priority', 'P2'),
        'case_count': data.get('case_count', 0),
        'executed_count': data.get('executed_count', 0),
        'passed_count': data.get('passed_count', 0),
        'failed_count': data.get('failed_count', 0)
    }

    result, err = bitable.create_record('tasks', fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "任务创建成功")

@app.route('/api/tasks/<record_id>', methods=['PUT'])
def update_task(record_id):
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    fields = {}
    for key in ['task_name', 'project', 'version', 'status', 'priority',
                'case_count', 'executed_count', 'passed_count', 'failed_count']:
        if key in data:
            fields[key] = data[key]

    result, err = bitable.update_record('tasks', record_id, fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "任务更新成功")

@app.route('/api/tasks/<record_id>/status', methods=['PUT'])
def update_task_status(record_id):
    data = request.get_json()
    status = data.get('status')
    if not status:
        return error_response("状态不能为空")

    result, err = bitable.update_record('tasks', record_id, {'status': status})
    if err:
        return error_response(err)

    return success_response(message="状态更新成功")

@app.route('/api/tasks/<record_id>', methods=['DELETE'])
def delete_task(record_id):
    result, err = bitable.delete_record('tasks', record_id)
    if err:
        return error_response(err)

    return success_response(message="任务删除成功")

# ==================== 用例执行接口 ====================

@app.route('/api/executions', methods=['GET'])
def get_executions():
    task_id = request.args.get('task_id')

    result, err = bitable.list_records('executions', 100)
    if err:
        return error_response(err)

    records = []
    for item in result.items:
        fields = item.fields
        if task_id and fields.get('task_id') != task_id:
            continue
        records.append({
            'record_id': item.record_id,
            'fields': fields
        })

    return success_response({'records': records})

@app.route('/api/executions', methods=['POST'])
def create_execution():
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    required_fields = ['execution_id', 'task_id', 'case_id', 'executor']
    for field in required_fields:
        if field not in data:
            return error_response(f"缺少必填字段: {field}")

    fields = {
        'execution_id': data.get('execution_id'),
        'task_id': data.get('task_id'),
        'case_id': data.get('case_id'),
        'executor': data.get('executor'),
        'status': data.get('status', '未执行'),
        'actual_result': data.get('actual_result', ''),
        'duration': data.get('duration', 0)
    }

    result, err = bitable.create_record('executions', fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "执行记录创建成功")

@app.route('/api/executions/<record_id>', methods=['PUT'])
def update_execution(record_id):
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    fields = {}
    for key in ['status', 'actual_result', 'bug_id', 'duration', 'remark']:
        if key in data:
            fields[key] = data[key]

    result, err = bitable.update_record('executions', record_id, fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "执行记录更新成功")

# ==================== 缺陷管理接口 ====================

@app.route('/api/bugs', methods=['GET'])
def get_bugs():
    result, err = bitable.list_records('bugs', 100)
    if err:
        return error_response(err)

    records = []
    for item in result.items:
        records.append({
            'record_id': item.record_id,
            'fields': item.fields
        })

    return success_response({'records': records})

@app.route('/api/bugs/<record_id>', methods=['GET'])
def get_bug(record_id):
    result, err = bitable.get_record('bugs', record_id)
    if err:
        return error_response(err)

    return success_response({
        'record_id': result.record_id,
        'fields': result.fields
    })

@app.route('/api/bugs', methods=['POST'])
def create_bug():
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    required_fields = ['bug_id', 'title']
    for field in required_fields:
        if field not in data:
            return error_response(f"缺少必填字段: {field}")

    fields = {
        'bug_id': data.get('bug_id'),
        'title': data.get('title'),
        'severity': data.get('severity', '一般'),
        'priority': data.get('priority', 'P2'),
        'status': data.get('status', '新建'),
        'description': data.get('description', ''),
        'case_id': data.get('case_id', ''),
        'task_id': data.get('task_id', '')
    }

    result, err = bitable.create_record('bugs', fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "缺陷创建成功")

@app.route('/api/bugs/<record_id>', methods=['PUT'])
def update_bug(record_id):
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    fields = {}
    for key in ['title', 'severity', 'priority', 'status', 'assignee', 'description']:
        if key in data:
            fields[key] = data[key]

    result, err = bitable.update_record('bugs', record_id, fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "缺陷更新成功")

@app.route('/api/bugs/<record_id>/status', methods=['PUT'])
def update_bug_status(record_id):
    data = request.get_json()
    status = data.get('status')
    if not status:
        return error_response("状态不能为空")

    result, err = bitable.update_record('bugs', record_id, {'status': status})
    if err:
        return error_response(err)

    return success_response(message="状态更新成功")

# ==================== 测试报告接口 ====================

@app.route('/api/reports', methods=['GET'])
def get_reports():
    task_id = request.args.get('task_id')

    result, err = bitable.list_records('reports', 100)
    if err:
        return error_response(err)

    records = []
    for item in result.items:
        fields = item.fields
        if task_id and fields.get('task_id') != task_id:
            continue
        records.append({
            'record_id': item.record_id,
            'fields': fields
        })

    return success_response({'records': records})

@app.route('/api/reports', methods=['POST'])
def create_report():
    data = request.get_json()
    if not data:
        return error_response("请求数据不能为空")

    fields = {
        'report_id': data.get('report_id', f'RPT-{datetime.now().strftime("%Y%m%d%H%M%S")}'),
        'task_id': data.get('task_id'),
        'report_name': data.get('report_name'),
        'total_cases': data.get('total_cases', 0),
        'executed_cases': data.get('executed_cases', 0),
        'passed_cases': data.get('passed_cases', 0),
        'failed_cases': data.get('failed_cases', 0),
        'blocked_cases': data.get('blocked_cases', 0),
        'pass_rate': data.get('pass_rate', 0),
        'coverage': data.get('coverage', 0),
        'bug_summary': data.get('bug_summary', '')
    }

    result, err = bitable.create_record('reports', fields)
    if err:
        return error_response(err)

    return success_response({'record_id': result.record_id}, "报告创建成功")

@app.route('/api/reports/task/<task_id>', methods=['GET'])
def get_task_report(task_id):
    result, err = bitable.list_records('reports', 100)
    if err:
        return error_response(err)

    task_reports = []
    for item in result.items:
        if item.fields.get('task_id') == task_id:
            task_reports.append({
                'record_id': item.record_id,
                'fields': item.fields
            })

    return success_response({'records': task_reports})

# ==================== 统计接口 ====================

@app.route('/api/stats/dashboard', methods=['GET'])
def get_dashboard_stats():
    cases_result, cases_err = bitable.list_records('cases', 100)
    tasks_result, tasks_err = bitable.list_records('tasks', 100)
    bugs_result, bugs_err = bitable.list_records('bugs', 100)
    executions_result, executions_err = bitable.list_records('executions', 100)

    stats = {
        'total_cases': len(cases_result.items) if cases_result else 0,
        'total_tasks': len(tasks_result.items) if tasks_result else 0,
        'total_bugs': len(bugs_result.items) if bugs_result else 0,
        'total_executions': len(executions_result.items) if executions_result else 0,
        'active_tasks': 0,
        'pending_bugs': 0
    }

    if tasks_result:
        for item in tasks_result.items:
            if item.fields.get('status') == '进行中':
                stats['active_tasks'] += 1

    if bugs_result:
        for item in bugs_result.items:
            if item.fields.get('status') in ['新建', '确认', '修复中']:
                stats['pending_bugs'] += 1

    return success_response(stats)

if __name__ == '__main__':
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
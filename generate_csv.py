
#!/usr/bin/env python3
import json
import csv
import sys


def generate_csv(json_file, csv_file):
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            test_cases = json.load(f)
        
        with open(csv_file, 'w', newline='', encoding='utf-8-sig') as f:
            fieldnames = ['用例ID', '测试场景', '前置条件', '测试步骤', '预期结果', '优先级', '备注']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            writer.writeheader()
            
            for case in test_cases:
                writer.writerow({
                    '用例ID': case.get('id', ''),
                    '测试场景': case.get('scenario', ''),
                    '前置条件': case.get('preconditions', ''),
                    '测试步骤': case.get('steps', ''),
                    '预期结果': case.get('expected', ''),
                    '优先级': case.get('priority', ''),
                    '备注': case.get('notes', '')
                })
        
        print(f"成功生成CSV文件: {csv_file}")
        print(f"共生成 {len(test_cases)} 条测试用例")
        return True
    except FileNotFoundError:
        print(f"错误: 找不到文件 {json_file}")
        return False
    except json.JSONDecodeError:
        print(f"错误: JSON文件格式错误")
        return False
    except Exception as e:
        print(f"错误: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python generate_csv.py <json文件> <csv文件>")
        print("示例: python generate_csv.py test_cases.json camera_locker_test_cases.csv")
    else:
        json_file = sys.argv[1]
        csv_file = sys.argv[2]
        generate_csv(json_file, csv_file)

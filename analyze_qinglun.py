from PIL import Image
import os

media_dir = '/Users/yantu/Desktop/temp_qinglun_extract/xl/media'

def analyze_image(img_path):
    img = Image.open(img_path).convert('RGB')
    width, height = img.size
    pixels = list(img.getdata())

    r_sum, g_sum, b_sum = 0, 0, 0
    r_max, g_max, b_max = 0, 0, 0
    r_min, g_min, b_min = 255, 255, 255

    for pixel in pixels:
        r, g, b = pixel
        r_sum += r
        g_sum += g
        b_sum += b
        if r > r_max: r_max = r
        if g > g_max: g_max = g
        if b > b_max: b_max = b
        if r < r_min: r_min = r
        if g < g_min: g_min = g
        if b < b_min: b_min = b

    total = len(pixels)
    r_mean = r_sum / total
    g_mean = g_sum / total
    b_mean = b_sum / total

    avg_brightness = (r_mean + g_mean + b_mean) / 3

    color_temp_estimate = 4500
    if b_mean > 0:
        ratio = r_mean / b_mean
        if ratio > 1.2:
            color_temp_estimate = 2700
        elif ratio < 0.85:
            color_temp_estimate = 6500
        else:
            color_temp_estimate = 4500

    contrast = ((r_max - r_min) + (g_max - g_min) + (b_max - b_min)) / 3

    saturation = 0
    for pixel in pixels:
        r, g, b = pixel
        max_c = max(r, g, b)
        min_c = min(r, g, b)
        if max_c > 0:
            saturation += (max_c - min_c) / max_c
    saturation = saturation / total * 100

    return {
        'avg_brightness': round(avg_brightness, 1),
        'r': round(r_mean, 1),
        'g': round(g_mean, 1),
        'b': round(b_mean, 1),
        'color_temp_est': color_temp_estimate,
        'contrast': round(contrast, 1),
        'saturation': round(saturation, 1)
    }

mapping = {
    'cam_001': {'M1': 'image1.jpeg', 'iPhone': 'image2.jpeg', '青伦': 'image3.jpeg'},
    'cam_002': {'M1': 'image4.jpeg', 'iPhone': 'image5.jpeg', '青伦': 'image6.jpeg'},
    'cam_003': {'M1': 'image7.jpeg', 'iPhone': 'image8.jpeg', '青伦': 'image9.jpeg'},
    'cam_004': {'M1': 'image10.png', 'iPhone': 'image11.png', '青伦': 'image12.png'},
    'cam_005': {'M1': 'image13.png', 'iPhone': 'image14.png', '青伦': 'image15.png'},
    'cam_006': {'M1': 'image16.png', 'iPhone': 'image17.png', '青伦': 'image18.png'},
    'cam_007': {'M1': 'image19.png', 'iPhone': 'image20.png', '青伦': 'image21.png'},
    'cam_008': {'M1': 'image22.png', 'iPhone': 'image23.png', '青伦': 'image24.png'},
    'cam_009': {'M1': 'image25.png', 'iPhone': 'image26.png', '青伦': 'image27.png'},
    'cam_010': {'M1': 'image28.png', 'iPhone': 'image29.png', '青伦': 'image30.png'},
    'cam_011': {'M1': 'image31.png', 'iPhone': 'image32.png', '青伦': 'image33.png'},
    'cam_012': {'M1': 'image34.png', 'iPhone': 'image35.png', '青伦': 'image36.png'},
}

test_conditions = {
    'cam_001': {'env': 33, 'ct': 2700, 'desc': '较优光照/暖色调'},
    'cam_002': {'env': 33, 'ct': 4500, 'desc': '较优光照/自然白'},
    'cam_003': {'env': 33, 'ct': 6500, 'desc': '较优光照/冷色调'},
    'cam_004': {'env': 12, 'ct': 2700, 'desc': '中等光照/暖色调'},
    'cam_005': {'env': 12, 'ct': 4500, 'desc': '中等光照/自然白'},
    'cam_006': {'env': 12, 'ct': 6500, 'desc': '中等光照/冷色调'},
    'cam_007': {'env': 43, 'ct': 2700, 'desc': '较差光照/暖色调'},
    'cam_008': {'env': 43, 'ct': 4500, 'desc': '较差光照/自然白'},
    'cam_009': {'env': 43, 'ct': 6500, 'desc': '较差光照/冷色调'},
    'cam_010': {'env': 53, 'ct': 2700, 'desc': '高光照/暖色调'},
    'cam_011': {'env': 53, 'ct': 4500, 'desc': '高光照/自然白'},
    'cam_012': {'env': 53, 'ct': 6500, 'desc': '高光照/冷色调'},
}

def generate_conclusion(data, target_ct):
    if not data:
        return "数据不足", []

    brightness_scores = {}
    color_scores = {}

    for device, params in data.items():
        b_score = 0
        if 100 <= params['avg_brightness'] <= 150:
            b_score = 3
        elif 90 <= params['avg_brightness'] <= 160:
            b_score = 2
        else:
            b_score = 1

        c_diff = abs(params['color_temp_est'] - target_ct)
        if c_diff <= 300:
            c_score = 3
        elif c_diff <= 600:
            c_score = 2
        else:
            c_score = 1

        brightness_scores[device] = b_score
        color_scores[device] = c_score

    overall_scores = {}
    for device in data.keys():
        overall_scores[device] = brightness_scores[device] + color_scores[device]

    sorted_scores = sorted(overall_scores.items(), key=lambda x: x[1], reverse=True)
    best_device = sorted_scores[0][0]

    return f"{best_device}效果最优", sorted_scores

print("=" * 80)
print("青伦相机测试报告 - 客观参数分析")
print("=" * 80)

results = {}
for cam_id in sorted(mapping.keys()):
    cond = test_conditions.get(cam_id, {})
    print(f"\n【{cam_id}】{cond.get('desc', '')}")
    print(f"目标色温: {cond.get('ct', 'N/A')}K | 环境光: {cond.get('env', 'N/A')}%\n")

    data = {}
    for device, img_name in mapping[cam_id].items():
        img_path = f'{media_dir}/{img_name}'
        if os.path.exists(img_path):
            params = analyze_image(img_path)
            data[device] = params
            print(f"  {device:10s}: 亮度={params['avg_brightness']:5.1f}, R={params['r']:5.1f}, G={params['g']:5.1f}, B={params['b']:5.1f}, 色温≈{params['color_temp_est']}K, 饱和度={params['saturation']:.1f}%")

    if data:
        conclusion, scores = generate_conclusion(data, cond.get('ct', 4500))
        print(f"  结论: {conclusion}")
        results[cam_id] = {'data': data, 'conclusion': conclusion, 'scores': scores}

print("\n" + "=" * 80)
print("测试结论汇总")
print("=" * 80)

summary = {}
for cam_id, result in sorted(results.items()):
    cond = test_conditions.get(cam_id, {})
    conclusion = result['conclusion']
    scores = result['scores']

    best_device = conclusion.split('效果')[0]
    if best_device not in summary:
        summary[best_device] = 0
    summary[best_device] += 1

    print(f"{cam_id} ({cond.get('desc', '')}): {conclusion}")

print("\n--- 胜出统计 ---")
for device, count in sorted(summary.items(), key=lambda x: x[1], reverse=True):
    print(f"{device}: {count}次最优")
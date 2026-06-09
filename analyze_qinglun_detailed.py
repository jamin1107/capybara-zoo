from PIL import Image
import os
import json

media_dir = '/Users/yantu/Desktop/temp_qinglun_extract/xl/media'

def analyze_image(img_path):
    img = Image.open(img_path).convert('RGB')
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

    rg_ratio = r_mean / g_mean if g_mean > 0 else 1
    rb_ratio = r_mean / b_mean if b_mean > 0 else 1

    return {
        'avg_brightness': round(avg_brightness, 1),
        'r': round(r_mean, 1),
        'g': round(g_mean, 1),
        'b': round(b_mean, 1),
        'color_temp_est': color_temp_estimate,
        'contrast': round(contrast, 1),
        'saturation': round(saturation, 1),
        'rg_ratio': round(rg_ratio, 3),
        'rb_ratio': round(rb_ratio, 3)
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

def evaluate_light_restoration(data, target_ct):
    brightness_diff = {}
    for device, params in data.items():
        brightness_diff[device] = params['avg_brightness']
    return brightness_diff

def evaluate_color_restoration(data, target_ct):
    color_accuracy = {}
    for device, params in data.items():
        ct_diff = abs(params['color_temp_est'] - target_ct)
        sat_score = 100 - abs(params['saturation'] - 25)
        color_accuracy[device] = {
            'ct_diff': ct_diff,
            'saturation': params['saturation'],
            'rg_ratio': params['rg_ratio']
        }
    return color_accuracy

print("=" * 80)
print("青仑相机 vs M1 vs iPhone - 光线与色彩还原分析")
print("=" * 80)

light_restoration_scores = {'青仑': 0, 'M1': 0, 'iPhone': 0}
color_restoration_scores = {'青仑': 0, 'M1': 0, 'iPhone': 0}
valid_cases = 0

for cam_id in sorted(mapping.keys()):
    cond = test_conditions.get(cam_id, {})
    target_ct = cond.get('ct', 4500)

    print(f"\n{'='*80}")
    print(f"【{cam_id}】{cond.get('desc', '')}")
    print(f"目标色温: {target_ct}K | 环境光: {cond.get('env', 'N/A')}%")
    print(f"{'='*80}")

    data = {}
    for device, img_name in mapping[cam_id].items():
        img_path = f'{media_dir}/{img_name}'
        if os.path.exists(img_path):
            params = analyze_image(img_path)
            data[device] = params

    if len(data) < 2:
        print("  数据不足，跳过")
        continue

    valid_cases += 1

    print("\n--- 光线还原评估 ---")
    brightness_data = evaluate_light_restoration(data, target_ct)
    avg_brightness = sum(brightness_data.values()) / len(brightness_data)

    for device, brightness in brightness_data.items():
        diff = abs(brightness - avg_brightness)
        if device == '青仑':
            qinglun_brightness = brightness
        print(f"  {device:10s}: 亮度={brightness:5.1f}, 与平均差={diff:5.1f}")

    best_light = min(brightness_data, key=lambda d: abs(brightness_data[d] - avg_brightness))
    print(f"  光线还原最优: {best_light}")

    if best_light in light_restoration_scores:
        light_restoration_scores[best_light] += 1

    print("\n--- 色彩还原评估 ---")
    color_data = evaluate_color_restoration(data, target_ct)

    for device, color_info in color_data.items():
        ct_diff = color_info['ct_diff']
        sat = color_info['saturation']
        if device == '青仑':
            qinglun_sat = sat
        print(f"  {device:10s}: 色温={color_info['rg_ratio']}K(偏差{ct_diff}K), 饱和度={sat:.1f}%")

    best_color = min(color_data, key=lambda d: color_data[d]['ct_diff'])
    print(f"  色彩还原最优: {best_color}")

    if best_color in color_restoration_scores:
        color_restoration_scores[best_color] += 1

print(f"\n{'='*80}")
print("总结分析（共{valid_cases}个有效用例）")
print(f"{'='*80}")

print("\n--- 光线还原胜出统计 ---")
for device, count in sorted(light_restoration_scores.items(), key=lambda x: x[1], reverse=True):
    pct = count / valid_cases * 100 if valid_cases > 0 else 0
    print(f"  {device}: {count}次 ({pct:.0f}%)")

print("\n--- 色彩还原胜出统计 ---")
for device, count in sorted(color_restoration_scores.items(), key=lambda x: x[1], reverse=True):
    pct = count / valid_cases * 100 if valid_cases > 0 else 0
    print(f"  {device}: {count}次 ({pct:.0f}%)")

print(f"\n{'='*80}")
print("青仑相机评价")
print(f"{'='*80}")

qinglun_light_pct = light_restoration_scores.get('青仑', 0) / valid_cases * 100 if valid_cases > 0 else 0
qinglun_color_pct = color_restoration_scores.get('青仑', 0) / valid_cases * 100 if valid_cases > 0 else 0

print(f"\n光线还原: {qinglun_light_pct:.0f}% 用例中表现最优")
print(f"色彩还原: {qinglun_color_pct:.0f}% 用例中表现最优")

if qinglun_light_pct >= 50:
    print("\n✓ 青仑相机在光线还原方面表现优秀")
elif qinglun_light_pct >= 30:
    print("\n✓ 青仑相机在光线还原方面表现良好")
else:
    print("\n✗ 青仑相机在光线还原方面仍需改进")

if qinglun_color_pct >= 50:
    print("✓ 青仑相机在色彩还原方面表现优秀")
elif qinglun_color_pct >= 30:
    print("✓ 青仑相机在色彩还原方面表现良好")
else:
    print("✗ 青仑相机在色彩还原方面仍需改进")
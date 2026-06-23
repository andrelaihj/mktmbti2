from PIL import Image, ImageDraw, ImageFont
import os

# 15种画像数据
profiles = {
    'A': {'emoji': '🏭', 'title': '制造巨匠', 'subtitle': '匠心独运', 'summary': '有产品有产能，品质打磨到极致，但不懂展示、不擅营销。', 'color': '#10b981', 'dims': [85, 35, 40, 55]},
    'B': {'emoji': '🔮', 'title': '趋势探索者', 'subtitle': '洞若观火', 'summary': '洞察力强，能从新闻看商机，但永远觉得"条件不够成熟"。', 'color': '#f59e0b', 'dims': [45, 80, 40, 50]},
    'C': {'emoji': '🚀', 'title': '破局先锋', 'subtitle': '冲动型选手', 'summary': '执行力强，想到就干，但方向不对跑得越快离目标越远。', 'color': '#ef4444', 'dims': [50, 55, 85, 35]},
    'D': {'emoji': '🧮', 'title': '想太多先生', 'subtitle': '决策瘫痪', 'summary': '风险意识强，分析报告写了几十份，但永远下不了决定。', 'color': '#ec4899', 'dims': [50, 50, 35, 85]},
    'E': {'emoji': '⭐', 'title': '六边形战士', 'subtitle': '差一步', 'summary': '能力全面均衡，什么都有，但就是不动，"再等等看"。', 'color': '#8b5cf6', 'dims': [75, 72, 68, 70]},
    'F': {'emoji': '🤔', 'title': '差一步先生', 'subtitle': '永远准备中', 'summary': '有基础认知但不深入，上月亚马逊，本月独立站，下月换方向。', 'color': '#06b6d4', 'dims': [55, 58, 52, 56]},
    'G': {'emoji': '💨', 'title': '机会猎人', 'subtitle': '蜻蜓点水', 'summary': '嗅觉敏锐，到处追风口，什么试过什么没做成。', 'color': '#14b8a6', 'dims': [40, 70, 70, 35]},
    'H': {'emoji': '🌈', 'title': '规划型选手', 'subtitle': '完美计划', 'summary': '战略眼光好，计划书从1.0写到12.0，但永远停在第一步。', 'color': '#f97316', 'dims': [70, 70, 35, 55]},
    'I': {'emoji': '🛡️', 'title': '基业长青', 'subtitle': '稳扎稳打', 'summary': '风险意识强，稳健=保守，错失机会却不敢动。', 'color': '#84cc16', 'dims': [70, 40, 40, 70]},
    'J': {'emoji': '🌀', 'title': '追风人', 'subtitle': '永远慢半拍', 'summary': '什么火做什么，亚马逊火做亚马逊，每次都慢一步。', 'color': '#a855f7', 'dims': [35, 40, 70, 35]},
    'K': {'emoji': '🎒', 'title': '厉兵秣马', 'subtitle': '准备周全', 'summary': '资质证书齐全，知识储备充分，但永远在准备，从不上场。', 'color': '#22c55e', 'dims': [80, 75, 35, 55]},
    'L': {'emoji': '⚡', 'title': '门外汉', 'subtitle': '认知空白', 'summary': '有热情有野心，但没工厂没产品没资源，处于危险边缘。', 'color': '#fbbf24', 'dims': [35, 35, 35, 35]},
    'M': {'emoji': '📊', 'title': '精算型', 'subtitle': '算了不动', 'summary': '数据分析能力强，算完发现"风险太高"，永远不下水。', 'color': '#64748b', 'dims': [60, 60, 35, 75]},
    'N': {'emoji': '🔥', 'title': '热血型', 'subtitle': '心有余力不足', 'summary': '有梦想有野心，但连一张海外订单都没有。', 'color': '#f43f5e', 'dims': [40, 75, 75, 35]},
    'O': {'emoji': '🥚', 'title': '初学者', 'subtitle': '还没入门', 'summary': '刚听说"跨境电商"这个词，认知相当于刚知道1+1=2。', 'color': '#78716c', 'dims': [35, 35, 35, 55]},
}

# 分类信息
categories = [
    {'icon': '🏭', 'title': '制造实力派', 'desc': '有产品有产能，但困于"酒香也怕巷子深"', 'color': '#10b981', 'types': ['A', 'I', 'K']},
    {'icon': '🔮', 'title': '觉醒观望派', 'desc': '看得多想得多，但永远停在"第一步"之前', 'color': '#f59e0b', 'types': ['B', 'D', 'F', 'H', 'M']},
    {'icon': '🚀', 'title': '行动冲锋派', 'desc': '执行力强但缺聚焦，要么盲目冲动要么四处打游击', 'color': '#ef4444', 'types': ['C', 'G', 'J', 'N']},
    {'icon': '⭐', 'title': '蓄势待发派', 'desc': '什么条件都有，但就是迈不出那一步', 'color': '#8b5cf6', 'types': ['E']},
    {'icon': '🥚', 'title': '新手探索派', 'desc': '认知或资源尚在起步，需要从零开始', 'color': '#ec4899', 'types': ['L', 'O']},
]

dim_labels = ['产能底气', '市场嗅觉', '行动惯性', '决策算账']
dim_colors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899']

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_font(size):
    font_paths = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/simsun.ttc",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                continue
    return ImageFont.load_default()

def wrap_text(text, max_chars):
    lines = []
    while len(text) > max_chars:
        idx = max_chars
        for p in ['，', '。', '！', '？', ',', '.']:
            if p in text[:max_chars]:
                idx = max(text[:max_chars].rfind(p), idx)
        if idx == max_chars:
            idx = max_chars - 1
        lines.append(text[:idx+1])
        text = text[idx+1:]
    lines.append(text)
    return lines

def create_mosaic():
    canvas_width = 2400
    canvas_height = 3400
    
    canvas = Image.new('RGB', (canvas_width, canvas_height), (10, 10, 15))
    draw = ImageDraw.Draw(canvas)
    
    font_title = get_font(44)
    font_cat = get_font(26)
    font_cat_s = get_font(16)
    font_type = get_font(30)
    font_sub = get_font(16)
    font_text = get_font(14)
    font_dim = get_font(12)
    font_small = get_font(13)
    
    # 标题区
    draw.text((canvas_width//2, 45), "出海十五型画像分类拼图", font=font_title, fill=(255, 255, 255), anchor='mt')
    draw.text((canvas_width//2, 95), "根据业务认知 / 产品资源 / 当前卡点 / 市场调研的本质现象划分", font=font_cat_s, fill=(130, 130, 130), anchor='mt')
    
    card_width = 355
    card_height = 430
    gap_x = 22
    gap_y = 20
    start_y = 155
    current_y = start_y
    
    for cat in categories:
        cat_color = hex_to_rgb(cat['color'])
        header_height = 65
        
        # 分类标题背景
        header = Image.new('RGB', (canvas_width, header_height), (24, 24, 44))
        hdraw = ImageDraw.Draw(header)
        hdraw.rectangle([(0, 0), (6, header_height)], fill=cat_color)
        canvas.paste(header, (0, current_y))
        draw = ImageDraw.Draw(canvas)
        
        # 分类标题
        draw.text((35, current_y + header_height//2), cat['icon'], font=get_font(30), fill=(255, 255, 255), anchor='lm')
        draw.text((85, current_y + 15), cat['title'], font=font_cat, fill=(255, 255, 255), anchor='lt')
        draw.text((85, current_y + 46), cat['desc'], font=font_cat_s, fill=(150, 150, 150), anchor='lt')
        
        count_text = f"{len(cat['types'])}种画像"
        draw.text((canvas_width - 35, current_y + header_height//2), count_text, font=font_cat_s, fill=cat_color, anchor='rm')
        
        current_y += header_height + 12
        
        # 卡片
        cards_per_row = min(4, len(cat['types']))
        padding = (canvas_width - cards_per_row * card_width - (cards_per_row - 1) * gap_x) // 2
        
        for col, type_key in enumerate(cat['types']):
            p = profiles[type_key]
            card_x = padding + col * (card_width + gap_x)
            card_y = current_y
            
            # 卡片背景
            card = Image.new('RGB', (card_width, card_height), (28, 28, 50))
            cdraw = ImageDraw.Draw(card)
            cdraw.rectangle([(0, 0), (card_width, 4)], fill=hex_to_rgb(p['color']))
            cdraw.rounded_rectangle([(0, 0), (card_width-1, card_height-1)], radius=10, outline=(55, 55, 90), width=1)
            
            canvas.paste(card, (card_x, card_y))
            draw = ImageDraw.Draw(canvas)
            
            # Emoji & 类型
            draw.text((card_x + 15, card_y + 18), p['emoji'], font=get_font(38), fill=(255, 255, 255), anchor='lt')
            draw.text((card_x + 75, card_y + 16), f"{type_key}型", font=font_type, fill=hex_to_rgb(p['color']), anchor='lt')
            draw.text((card_x + 75, card_y + 50), p['subtitle'], font=font_sub, fill=(170, 170, 170), anchor='lt')
            
            # 分隔线
            draw.line([(card_x + 15, card_y + 82), (card_x + card_width - 15, card_y + 82)], fill=(55, 55, 90), width=1)
            
            # 概述
            lines = wrap_text(p['summary'], 19)
            text_y = card_y + 95
            for line in lines[:3]:
                draw.text((card_x + 15, text_y), line, font=font_text, fill=(210, 210, 210), anchor='lt')
                text_y += 25
            
            # 维度条
            bar_start_y = card_y + 195
            bar_height = 22
            bar_max_width = card_width - 55
            
            for i, (dim_val, dim_label, dim_color) in enumerate(zip(p['dims'], dim_labels, dim_colors)):
                bar_y = bar_start_y + i * (bar_height + 12)
                
                draw.text((card_x + 15, bar_y + 2), dim_label, font=font_dim, fill=(140, 140, 140), anchor='lt')
                draw.rectangle([(card_x + 85, bar_y + 3), (card_x + 85 + bar_max_width, bar_y + bar_height - 1)], fill=(38, 38, 55))
                
                fill_width = int(bar_max_width * dim_val / 100)
                draw.rectangle([(card_x + 85, bar_y + 3), (card_x + 85 + fill_width, bar_y + bar_height - 1)], fill=hex_to_rgb(dim_color))
                
                draw.text((card_x + card_width - 12, bar_y + bar_height//2 + 2), str(dim_val), font=font_dim, fill=hex_to_rgb(dim_color), anchor='rm')
        
        current_y += card_height + gap_y + 15
    
    # 底部
    draw.text((canvas_width//2, canvas_height - 35), "点击上方导航切换查看各类型详细报告", font=font_small, fill=(110, 110, 110), anchor='mt')
    
    output_path = r"C:\Users\80547\Desktop\mktmbti2\15types-mosaic.png"
    canvas.save(output_path, 'PNG')
    print(f"拼图已生成: {output_path}")

if __name__ == "__main__":
    create_mosaic()

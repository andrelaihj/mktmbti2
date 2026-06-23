from PIL import Image, ImageDraw, ImageFont
import os
import math

# 完整的15种画像数据
profiles = {
    'A': {
        'emoji': '🏭', 'title': '制造巨匠', 'subtitle': '匠心独运', 'color': '#10b981',
        'summary': '你是那种把产品当孩子养的人。品质管控近乎偏执，车间管理像军队，供应链环节尽在掌控。但问题是：你花十年打磨的产品力，在跨境平台上销量可能是别人的十分之一。',
        'dims': [85, 35, 40, 55],
        'strengths': ['品质管控近乎偏执，产品在业内有口碑', '车间管理有序，供应链环节尽在掌控', '成本意识强，每分钱去处都有账可查', '产能弹性好，能同时调度多条产线'],
        'weakness': ['过度执着细节，影响决策效率', '品质与营销失衡，酒香也怕巷子深', '不善展示产品，好东西卖不出好价', '难以授权他人，事事亲力亲为'],
        'opportunity': ['品质出海风口已至，高端制造正当时', '只需改变"让人看见"的方式', '专业产品手册+平台布局+展会亮相', '轻营销动作，比熬夜加班更能改变局面'],
        'actions': ['制作一套专业英文产品手册', '在领英/阿里国际站展示工厂实力', '参加一次行业展会'],
        'reminder': '你不需要改变产品，只需要改变展示产品的方式。'
    },
    'B': {
        'emoji': '🔮', 'title': '趋势探索者', 'subtitle': '洞若观火', 'color': '#f59e0b',
        'summary': '你对市场趋势的敏感度是天生的，能从新闻看到商机，善于提炼规律，有全局视野。但每次快要下结论时，总觉得"条件还不够成熟"。笔记本写满洞察，从未落地。',
        'dims': [45, 80, 40, 50],
        'strengths': ['市场洞察力强，能从新闻看到商机', '信息整合能力突出，善于提炼规律', '全局视野好，多维度综合考量', '冷静理性，不被短期波动左右'],
        'weakness': ['过度分析反而止步不前', '永远觉得"条件还不够成熟"', '机会窗口在你观望时悄然关闭', '笔记本写满洞察，从未落地'],
        'opportunity': ['眼光是稀缺资产，变现需要行动', '不需要All in，先用最小成本试水', '选一个方向，找当地供应商聊聊', '先干起来，边干边想'],
        'actions': ['选定一个最看好的方向，立刻行动', '找一个行业内的人深度聊聊', '设定决策时限'],
        'reminder': '你的洞察是资产，但只有行动才能变现。'
    },
    'C': {
        'emoji': '🚀', 'title': '破局先锋', 'subtitle': '冲动型选手', 'color': '#ef4444',
        'summary': '你的执行力是天赋，想到就干不怕失败，速度就是武器。但踩坑无数，学费交了一轮又一轮，用战术勤奋掩盖战略懒惰。方向不对，跑得越快离目标越远。',
        'dims': [50, 55, 85, 35],
        'strengths': ['执行力是天赋，想到就干不犹豫', '不怕失败，大不了重来', '不被焦虑消耗，快速推进事务', '速度是武器，抢占先机'],
        'weakness': ['踩坑无数，学费交了又交', '用战术勤奋掩盖战略懒惰', '方向不对，跑得越快离目标越远', '不擅画靶心，闭眼乱射'],
        'opportunity': ['执行力是超能力，只需装上瞄准镜', '行动前花10分钟想清楚"为什么要做"', '问自己：最坏结果是什么？能承受吗？', '有策略地冲锋，而非无目的地乱撞'],
        'actions': ['每个行动前写下"为什么做"', '设定可接受亏损上限', '找一个导师帮你把脉方向'],
        'reminder': '你缺的不是冲劲，是一个清晰的靶心。'
    },
    'D': {
        'emoji': '🧮', 'title': '想太多先生', 'subtitle': '决策瘫痪', 'color': '#ec4899',
        'summary': '你的风险意识是天赋，能一眼看到机会背后的坑，分析能力很强。但决策如生死题，永远觉得"还有没想到的风险"。分析报告写了无数份，每份都是"未完成"状态。',
        'dims': [50, 50, 35, 85],
        'strengths': ['风险意识强，能一眼看到机会背后的坑', '分析能力突出，数据条理清晰', '决策有依据，不脑子发热拍板', '不被短期诱惑，坚持独立判断'],
        'weakness': ['决策如生死题，害怕选择本身', '永远觉得"还有没想到的风险"', '停在准备阶段，难以迈出第一步', '分析报告无数，都是"未完成"状态'],
        'opportunity': ['想得够多了，缺的是按下启动键', '不是要更多信息，是要决策勇气', '给自己设时限：本周选定目标市场', '70%把握就可以行动了'],
        'actions': ['设定决策时限，强制下结论', '找一个有经验的人帮你把关', '用小步快跑代替大而全的分析'],
        'reminder': '你已经想得足够清楚了，缺的是勇气。'
    },
    'E': {
        'emoji': '⭐', 'title': '六边形战士', 'subtitle': '差一步', 'color': '#8b5cf6',
        'summary': '你能力全面均衡，没有明显短板，资源眼光执行力都有。但就是迈不出步子，"再等等看吧"是口头禅。不是没有能力，是不敢行动。站在金矿边上却还在挖土。',
        'dims': [75, 72, 68, 70],
        'strengths': ['能力全面均衡，无明显短板', '综合实力强，能够独当一面', '适应能力好，能在变化中保持稳定', '抗风险能力突出，很少措手不及'],
        'weakness': ['什么都有，却不知为何迈不出步子', '资源眼光能力都在，就是不动', '"再等等看吧"是口头禅', '不是没有能力，是不敢行动'],
        'opportunity': ['站在金矿边上却还在挖土', '不需要更多准备，现在就可以开始', '不需要等更好时机，需要的是第一步', '装备齐全，先迈出第一步'],
        'actions': ['不要等了，现在就开始联系客户', '找一个出海顾问带你', '用实战来验证你的准备'],
        'reminder': '你已经装备齐全了，唯一的缺的就是——上场。'
    },
    'F': {
        'emoji': '🤔', 'title': '差一步先生', 'subtitle': '永远准备中', 'color': '#06b6d4',
        'summary': '你有一点基础认知，不是完全的小白，心态平稳愿意沉下心准备。但上个月亚马逊，这月独立站，下月换方向。第N次"准备开始"，总觉"再给我一点时间就能准备好"。',
        'dims': [55, 58, 52, 56],
        'strengths': ['有一点基础认知，不是完全的小白', '不排斥新事物，愿意持续学习', '心态平稳，愿意沉下心准备', '愿意观望学习，不会盲目冲进去'],
        'weakness': ['第N次"准备开始"了', '上月亚马逊，这月独立站，下月换方向', '总觉得"再给我一点时间就能准备好"', '永远准备不好'],
        'opportunity': ['不需要更多准备，接受不完美的开始', '完成比完美重要', '选一个平台，先做起来', '边做边学，比想清楚再做更高效'],
        'actions': ['选定一个平台，坚持3个月', '找一个有结果的人带你', '接受"边做边学"的节奏'],
        'reminder': '完成比完美重要，现在就开始。'
    },
    'G': {
        'emoji': '💨', 'title': '机会猎人', 'subtitle': '蜻蜓点水', 'color': '#14b8a6',
        'summary': '你对机会的嗅觉是天生的，反应速度快，愿意尝试新事物，适应变化能力强。但什么试过什么没做成，永远从一个坑跳到另一个坑。到处采蜜但不酿蜜。',
        'dims': [40, 70, 70, 35],
        'strengths': ['机会嗅觉敏锐，能第一时间感知风口', '反应速度快，看到机会就冲', '愿意尝试新事物，不固步自封', '适应变化能力强，能迅速调转方向'],
        'weakness': ['什么试过，什么没做成', '永远从一个坑跳到另一个坑', '追逐下一个机会，不深耕任何领域', '到处采蜜但不酿蜜'],
        'opportunity': ['嗅觉是天赋，需要落在正确的土地', '不是找更多机会，是锁定一个深挖', '问自己：过去三年做得最久的是什么？', '找到一朵花，深挖下去'],
        'actions': ['选定一个赛道，坚持1年', '建立自己的核心壁垒', '停止追风口，开始深耕'],
        'reminder': '你的嗅觉需要落在正确的土壤上。'
    },
    'H': {
        'emoji': '🌈', 'title': '规划型选手', 'subtitle': '完美计划', 'color': '#f97316',
        'summary': '你的视野开阔，有战略眼光，知识储备丰富，善于规划。计划从1.0到12.0，"再完善一下"是口头禅。计划赶不上变化，永远停在第一步。脑子里装着完整帝国，身体在原地。',
        'dims': [70, 70, 35, 55],
        'strengths': ['视野开阔，不局限于眼前', '战略眼光好，能看到更大图景', '知识储备丰富，研究过大量案例', '善于规划，能拆解复杂项目'],
        'weakness': ['计划从1.0到12.0，永远停在第一步', '"再完善一下，再想清楚一点"', '计划赶不上变化，永远改不完', '脑子里装着完整帝国，身体在原地'],
        'opportunity': ['差的是"现在就开始"的那一步', '边干边调整，比想完美再干更高效', '把计划缩短到"今天能做的下一步"', '24小时内必须完成一个启动任务'],
        'actions': ['把计划缩减为一个"今天能做的下一步"', '24小时内完成一个启动任务', '找一个已经在做的人监督你'],
        'reminder': '你差的不是想法，是行动。'
    },
    'I': {
        'emoji': '🛡️', 'title': '基业长青', 'subtitle': '稳扎稳打', 'color': '#84cc16',
        'summary': '你的风险意识很强，财务管理出色，是长期主义者，抗压能力强。但稳健=保守？错过很多机会，有时会想"当初冲一把是不是不一样"。需要找到稳健出海的方式。',
        'dims': [70, 40, 40, 70],
        'strengths': ['风险意识强，很少踩大坑', '财务管理出色，精打细算', '长期主义者，不被短期利益诱惑', '抗压能力强，能保持冷静'],
        'weakness': ['有时会想"当初冲一把是不是不一样"', '稳健 = 保守？不见得', '错过的机会让你羡慕又后悔', '需要找到稳健出海的方式'],
        'opportunity': ['稳健是天赋，需要找到适合的出海方式', '找到低风险的切入点', '先用一个产品、一个市场试水', '用订单验证可行性，再考虑扩大'],
        'actions': ['找到一个低风险切入点', '先用一个产品试水', '用稳健的方式迈出第一步'],
        'reminder': '稳健不等于保守，找到你的出海方式。'
    },
    'J': {
        'emoji': '🌀', 'title': '追风人', 'subtitle': '永远慢半拍', 'color': '#a855f7',
        'summary': '你行动力强，愿意尝试新事物，嗅觉灵敏，能感知风向变化。但三年做成过一件事吗？每次都追风口的尾巴，什么火做什么，什么都没做成。永远在追，永远慢半拍。',
        'dims': [35, 40, 70, 35],
        'strengths': ['行动力强，说干就干', '愿意尝试新事物，不排斥风口', '嗅觉灵敏，能感知风向变化', '不惧怕变化，愿意跟随趋势调整'],
        'weakness': ['三年来说成过一件事吗？', '每次都追风口的尾巴，慢一步', '永远在追，永远慢半拍', '什么火做什么，什么都没做成'],
        'opportunity': ['从追风者变成造风者', '问自己三个问题：产品、市场、客户', '选一个赛道，用一年时间深耕', '建立自己的核心壁垒'],
        'actions': ['停下来问自己三个核心问题', '选择一个赛道，深耕1年', '建立自己的核心壁垒'],
        'reminder': '停止追风，开始造风。'
    },
    'K': {
        'emoji': '🎒', 'title': '厉兵秣马', 'subtitle': '准备周全', 'color': '#22c55e',
        'summary': '你准备非常充分周全，了解可能比从业者深入，资质证书齐全，有品牌意识。但准备了这么久，到底在等什么？准备是永无止境的，装备齐全只差上场。',
        'dims': [80, 75, 35, 55],
        'strengths': ['准备充分周全，了解可能比从业者深入', '资质证书齐全，商标认证都已备好', '风险意识强，已想好应对之策', '有品牌意识，早早思考护城河'],
        'weakness': ['准备了这么久，到底在等什么？', '等把所有平台规则都搞清楚？', '等把所有市场都研究透？', '准备是永无止境的'],
        'opportunity': ['已经比大多数人都准备得更好了', '别人踩坑换来的经验，你已拥有', '知识体系扎实，有系统的认知框架', '装备齐全，只差上场'],
        'actions': ['不要等了，现在就开始联系客户', '找一个有经验的出海顾问带你', '用实战来验证你的准备'],
        'reminder': '你已经装备齐全了，唯一的缺的就是——上场。'
    },
    'L': {
        'emoji': '⚡', 'title': '门外汉', 'subtitle': '认知空白', 'color': '#fbbf24',
        'summary': '你对出海充满幻想，看着别人晒订单晒收入，觉得自己上也能行。但脑子里一片空白：有工厂吗？有产品吗？有客户吗？大部分答案是"没有"。处于危险边缘试探状态。',
        'dims': [35, 35, 35, 35],
        'strengths': ['有心气、有热情，不甘于现状', '愿意尝试新事物，愿意走出舒适区', '没有固化思维，愿意探索', '有改变现状的强烈意愿'],
        'weakness': ['有工厂吗？有稳定产品吗？', '有懂英文的业务员吗？', '有海外客户资源吗？有多少启动资金？', '大部分答案是"没有"或"不确定"'],
        'opportunity': ['先泼自己一盆冷水', '诚实地盘点自己，摊开家底', '找到可以切入的细分赛道', '知道自己能做什么，是第一步'],
        'actions': ['花一周时间盘点：产品、产能、资金', '找到3-5个领域内做得好的人，研究他们', '找一个在做的工厂，先去参观学习'],
        'reminder': '先搞清楚自己，再谈出海。'
    },
    'M': {
        'emoji': '📊', 'title': '精算型', 'subtitle': '算了不动', 'color': '#64748b',
        'summary': '你做决策之前必须把所有数据都算清楚，数据分析能力强，成本意识极强，理性不冲动。但算得越清楚反而越不敢动，每一个数字都在说"还不行"。永远在岸上算，永远不下水。',
        'dims': [60, 60, 35, 75],
        'strengths': ['数据分析能力是核心武器', '成本意识极强，精打细算', '理性不冲动，不被情绪左右', '风险识别准确，能预判失败原因'],
        'weakness': ['算得越清楚，反而越不敢动', '每一个数字都在说"还不行"', '不是在做决策，是在找借口', '永远在岸上算，永远不下水'],
        'opportunity': ['分析能力是翅膀，不扇动飞不起来', '不是想清楚再动，是动起来边做边调整', '设定一个"可接受亏损"上限', '带着这个上限去尝试'],
        'actions': ['设定"可接受亏损"数字，带着上限去尝试', '用小步快跑代替大而全的分析', '找一个出海成功的人，听他的建议'],
        'reminder': '算够了，该行动了。'
    },
    'N': {
        'emoji': '🔥', 'title': '热血型', 'subtitle': '心有余力不足', 'color': '#f43f5e',
        'summary': '你一想到出海就热血沸腾，有梦想有野心，目标感极强，热情能感染身边的人。但连一张海外订单都没有，订单不会从天上掉下来，野心和能力之间隔着一道鸿沟。',
        'dims': [40, 75, 75, 35],
        'strengths': ['目标感极强，不达目的不罢休', '热情能感染身边的人', '愿意投入，无论是时间还是金钱', '不惧怕挑战，保持积极心态'],
        'weakness': ['现在有海外订单吗？大概没有', '订单不会从天上掉下来', '需要产品、客户、渠道、谈判、交付能力', '这不是靠热血就能解决的'],
        'opportunity': ['野心需要落地', '第一步：评估产能是否支撑野心', '第二步：找到愿意尝试的第一批客户', '第三步：用订单验证市场假设'],
        'actions': ['评估产能能否支撑野心', '制定切实可行的扩张计划', '用订单来验证市场'],
        'reminder': '让热情找到落点，少谈梦想多谈订单。'
    },
    'O': {
        'emoji': '🥚', 'title': '初学者', 'subtitle': '还没入门', 'color': '#78716c',
        'summary': '你刚听说"跨境电商"、"海外市场"这些词，认知水平相当于刚知道1+1=2就去参加奥数竞赛。亚马逊FBA是什么？独立站怎么建？海外客户开发信怎么写？一脸懵。',
        'dims': [35, 35, 35, 55],
        'strengths': ['没有固化思维，没有先入为主的偏见', '愿意从零开始学习', '有学习的好奇心', '没有历史包袱'],
        'weakness': ['亚马逊FBA是什么？独立站怎么建？', '谷歌广告怎么投？海外客户开发信怎么写？', '国际物流怎么走？', '听完这些问题一脸懵'],
        'opportunity': ['先别急着出海，先把基础打好', '你现在最需要的是认知，不是机会', '找一个有结果的人，老老实实跟着学', '用一个月时间建立第一个认知框架'],
        'actions': ['找一个在出海领域有结果的人', '花1个月时间系统学习一个领域', '找到一个细分赛道，深挖下去'],
        'reminder': '找到对的老师，少走弯路。'
    }
}

dim_labels = ['产能底气', '市场嗅觉', '行动惯性', '决策算账']
dim_colors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899']

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_font(size):
    font_paths = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
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
        for p in ['，', '。', '！', '？', ',', '.', '、']:
            if p in text[:max_chars]:
                idx = max(text[:max_chars].rfind(p), idx)
        if idx == max_chars:
            idx = max_chars - 1
        lines.append(text[:idx+1])
        text = text[idx+1:]
    lines.append(text)
    return lines

def draw_radar(draw, center, radius, values, colors, labels):
    """绘制雷达图"""
    n = len(values)
    angle_step = 2 * math.pi / n
    
    # 绘制背景网格
    for r in [0.25, 0.5, 0.75, 1.0]:
        points = []
        for i in range(n):
            angle = -math.pi/2 + i * angle_step
            x = center[0] + radius * r * math.cos(angle)
            y = center[1] + radius * r * math.sin(angle)
            points.append((x, y))
        for i in range(n):
            draw.line([points[i], points[(i+1)%n]], fill=(60, 60, 80), width=1)
    
    # 绘制数据区域
    points = []
    for i, val in enumerate(values):
        angle = -math.pi/2 + i * angle_step
        x = center[0] + radius * (val/100) * math.cos(angle)
        y = center[1] + radius * (val/100) * math.sin(angle)
        points.append((x, y))
    
    # 填充
    draw.polygon(points, fill=(*hex_to_rgb(colors[0]), 80))
    draw.polygon(points, outline=hex_to_rgb(colors[0]), width=2)
    
    # 绘制数据点和连线
    for i, (val, color) in enumerate(zip(values, colors)):
        angle = -math.pi/2 + i * angle_step
        x = center[0] + radius * (val/100) * math.cos(angle)
        y = center[1] + radius * (val/100) * math.sin(angle)
        draw.ellipse([(x-4, y-4), (x+4, y+4)], fill=hex_to_rgb(color))
        
        # 标签
        label_x = center[0] + (radius + 18) * math.cos(angle)
        label_y = center[1] + (radius + 18) * math.sin(angle)
        bbox = draw.textbbox((0, 0), labels[i], font=get_font(10))
        draw.text((label_x - (bbox[2]-bbox[0])//2, label_y - (bbox[3]-bbox[1])//2), labels[i], font=get_font(10), fill=(150, 150, 150))

def create_full_mosaic():
    # 每张卡片尺寸
    card_width = 450
    card_height = 680
    
    # 布局：5行3列
    cols = 3
    rows = 5
    gap_x = 20
    gap_y = 20
    margin = 30
    
    canvas_width = cols * card_width + (cols - 1) * gap_x + margin * 2
    canvas_height = rows * card_height + (rows - 1) * gap_y + margin * 2 + 80
    
    canvas = Image.new('RGB', (canvas_width, canvas_height), (10, 10, 15))
    draw = ImageDraw.Draw(canvas)
    
    # 字体
    font_title = get_font(32)
    font_subtitle = get_font(22)
    font_section = get_font(14)
    font_text = get_font(11)
    font_small = get_font(10)
    
    # 标题
    draw.text((canvas_width//2, 35), "出海十五型完整画像", font=font_title, fill=(255, 255, 255), anchor='mt')
    draw.text((canvas_width//2, 75), "15 TYPES OF OVERSEAS BUSINESS PROFILES", font=get_font(12), fill=(120, 120, 120), anchor='mt')
    
    type_keys = list(profiles.keys())
    
    for idx, type_key in enumerate(type_keys):
        p = profiles[type_key]
        row = idx // cols
        col = idx % cols
        
        card_x = margin + col * (card_width + gap_x)
        card_y = margin + 100 + row * (card_height + gap_y)
        
        # 卡片背景
        card = Image.new('RGB', (card_width, card_height), (22, 22, 40))
        cdraw = ImageDraw.Draw(card)
        
        # 顶部颜色条
        cdraw.rectangle([(0, 0), (card_width, 5)], fill=hex_to_rgb(p['color']))
        
        # 边框
        cdraw.rounded_rectangle([(0, 0), (card_width-1, card_height-1)], radius=10, outline=(50, 50, 80), width=1)
        
        canvas.paste(card, (card_x, card_y))
        draw = ImageDraw.Draw(canvas)
        
        # 头部：Emoji + 类型
        draw.text((card_x + 15, card_y + 12), p['emoji'], font=get_font(28), fill=(255, 255, 255), anchor='lt')
        draw.text((card_x + 55, card_y + 10), f"{type_key}型", font=font_subtitle, fill=hex_to_rgb(p['color']), anchor='lt')
        draw.text((card_x + 55, card_y + 36), p['subtitle'], font=font_small, fill=(150, 150, 150), anchor='lt')
        
        # 分隔线1
        draw.line([(card_x + 15, card_y + 58), (card_x + card_width - 15, card_y + 58)], fill=(50, 50, 80), width=1)
        
        # 性格总结（左侧，雷达图在右侧）
        radar_x = card_x + card_width - 110
        radar_y = card_y + 75
        radar_radius = 45
        draw_radar(draw, (radar_x, radar_y), radar_radius, p['dims'], dim_colors, dim_labels)
        
        # 总结文字
        summary_lines = wrap_text(p['summary'], 26)
        text_y = card_y + 65
        for i, line in enumerate(summary_lines[:3]):
            draw.text((card_x + 15, text_y), line, font=font_text, fill=(200, 200, 200), anchor='lt')
            text_y += 16
        
        # 分隔线2
        draw.line([(card_x + 15, card_y + 125), (card_x + card_width - 15, card_y + 125)], fill=(50, 50, 80), width=1)
        
        # 四大维度数值
        bar_y = card_y + 132
        bar_width = (card_width - 50) // 4 - 5
        for i, (val, color) in enumerate(zip(p['dims'], dim_colors)):
            bar_x = card_x + 15 + i * (bar_width + 5)
            draw.rectangle([(bar_x, bar_y), (bar_x + bar_width, bar_y + 6)], fill=(40, 40, 60))
            draw.rectangle([(bar_x, bar_y), (bar_x + int(bar_width * val / 100), bar_y + 6)], fill=hex_to_rgb(color))
            draw.text((bar_x + bar_width//2, bar_y + 8), dim_labels[i], font=font_small, fill=(120, 120, 120), anchor='mt')
        
        # ===== 四大模块 =====
        section_y = card_y + 160
        
        # 模块1：你的家底（优势）
        draw.text((card_x + 15, section_y), "💪 你的家底", font=font_section, fill=hex_to_rgb(p['color']), anchor='lt')
        section_y += 18
        for item in p['strengths'][:2]:
            lines = wrap_text(item, 30)
            for line in lines:
                draw.text((card_x + 20, section_y), line, font=font_small, fill=(180, 180, 180), anchor='lt')
                section_y += 14
        section_y += 5
        
        # 模块2：天赋课题（短板）
        draw.text((card_x + 15, section_y), "📌 天赋课题", font=font_section, fill=hex_to_rgb('#ef4444'), anchor='lt')
        section_y += 18
        for item in p['weakness'][:2]:
            lines = wrap_text(item, 30)
            for line in lines:
                draw.text((card_x + 20, section_y), line, font=font_small, fill=(180, 180, 180), anchor='lt')
                section_y += 14
        section_y += 5
        
        # 模块3：机会路径
        draw.text((card_x + 15, section_y), "🌟 机会路径", font=font_section, fill=hex_to_rgb('#10b981'), anchor='lt')
        section_y += 18
        for item in p['opportunity'][:2]:
            lines = wrap_text(item, 30)
            for line in lines:
                draw.text((card_x + 20, section_y), line, font=font_small, fill=(180, 180, 180), anchor='lt')
                section_y += 14
        section_y += 5
        
        # 模块4：具体动作
        draw.text((card_x + 15, section_y), "🎯 具体动作", font=font_section, fill=hex_to_rgb('#f59e0b'), anchor='lt')
        section_y += 18
        for item in p['actions'][:2]:
            lines = wrap_text(item, 30)
            for line in lines:
                draw.text((card_x + 20, section_y), line, font=font_small, fill=(180, 180, 180), anchor='lt')
                section_y += 14
        
        # 分隔线
        section_y += 8
        draw.line([(card_x + 15, section_y), (card_x + card_width - 15, section_y)], fill=(50, 50, 80), width=1)
        section_y += 10
        
        # 模块5：说句实在话
        reminder_lines = wrap_text(p['reminder'], 32)
        draw.text((card_x + 15, section_y), "💬 说句实在话", font=font_section, fill=(160, 160, 160), anchor='lt')
        section_y += 18
        for line in reminder_lines[:2]:
            draw.text((card_x + 15, section_y), line, font=font_small, fill=(180, 180, 180), anchor='lt')
            section_y += 14
    
    output_path = r"C:\Users\80547\Desktop\mktmbti2\15types-full-mosaic.png"
    canvas.save(output_path, 'PNG', quality=95)
    print(f"完整拼图已生成: {output_path}")
    return output_path

if __name__ == "__main__":
    create_full_mosaic()

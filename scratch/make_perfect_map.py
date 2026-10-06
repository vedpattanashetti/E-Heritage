import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

WIDTH = 1200
HEIGHT = 896

# ==============================================================================
# 1. CANONICAL COORDINATES (SINGLE SOURCE OF TRUTH)
# ==============================================================================

# Cardinal Dhams
DHAMS = {
    "badrinath":  {"name": "Badrinath",      "devanagari": "बद्रीनाथ",       "pt": (540, 215), "label_pos": (540, 190)},
    "dwarka":     {"name": "Dwarka",         "devanagari": "द्वारका",        "pt": (275, 455), "label_pos": (275, 490)},
    "puri":       {"name": "Jagannath Puri", "devanagari": "जगन्नाथ पुरी",   "pt": (755, 510), "label_pos": (755, 545)},
    "rameswaram": {"name": "Rameswaram",     "devanagari": "रामेश्वरम्",     "pt": (575, 785), "label_pos": (575, 820)},
}

# The 7 Sacred Rivers (Sapta Sindhu)
RIVERS = {
    "ganga": [
        (540, 215), (555, 250), (590, 290), (635, 335), (665, 360),
        (700, 370), (745, 385), (780, 410), (815, 435)
    ],
    "yamuna": [
        (525, 225), (515, 265), (530, 305), (555, 330), (600, 350), (665, 360)
    ],
    "saraswati": [
        (485, 235), (475, 275), (490, 310), (540, 340), (665, 360)
    ],
    "sindhu": [
        (480, 130), (430, 140), (370, 180), (330, 230), (300, 290),
        (280, 345), (270, 395)
    ],
    "narmada": [
        (660, 430), (615, 435), (560, 440), (505, 445), (440, 450), (375, 458)
    ],
    "godavari": [
        (405, 495), (445, 508), (495, 520), (550, 532), (605, 545), (665, 560), (700, 575)
    ],
    "kaveri": [
        (465, 690), (495, 700), (525, 712), (555, 720), (580, 722), (605, 720)
    ]
}

# 12 Jyotirlingas
JYOTIRLINGAS = {
    "somnath":                   (325, 505),
    "mallikarjuna":              (565, 600),
    "mahakaleshwar":             (460, 415),
    "omkareshwar":               (485, 445),
    "kedarnath":                 (530, 205),
    "bhimashankar":              (420, 540),
    "kashi":                     (690, 365),
    "trimbakeshwar":             (405, 495),
    "baidyanath":                (745, 385),
    "nageshwar":                 (270, 440),
    "ramanathaswamy_jyotirlinga":(575, 785),
    "grishneshwar":              (445, 505)
}

# 5 Pancha Bhoota Sthalas
ELEMENTS = {
    "srikalahasti":    (595, 660),
    "kanchipuram":     (590, 685),
    "tiruvannamalai":  (560, 700),
    "chidambaram":     (590, 720),
    "thiruvanaikaval": (540, 725)
}

# Coastline / Landmass polygon of Bharat
COASTLINE = [
    # Kashmir & Himalayas
    (460, 110), (510, 95), (560, 110), (610, 125), (670, 155), (730, 190),
    (790, 220), (850, 240), (910, 250), (960, 270), (980, 310), (950, 345),
    (905, 365), (865, 385), (835, 415), (815, 435),
    # Eastern Coast (Odisha, Andhra, Tamil Nadu)
    (790, 475), (755, 510), (715, 550), (670, 590), (635, 635),
    (610, 680), (595, 730), (580, 780), (575, 805),
    # Southern Tip & Cape Comorin
    (555, 815), (535, 810), (515, 790),
    # Western Coast (Malabar, Konkan, Maharashtra)
    (495, 740), (475, 690), (450, 630), (430, 570), (410, 520), (395, 480),
    # Gulf of Khambhat & Saurashtra Peninsula
    (375, 465), (355, 480), (325, 505), (295, 495), (275, 465), (270, 440),
    # Gulf of Kutch & Rann
    (295, 425), (340, 420), (310, 395), (270, 395),
    # Indus / Northwest boundary
    (280, 345), (310, 280), (340, 225), (390, 170), (430, 130), (460, 110)
]

SRI_LANKA = [
    (585, 805), (605, 800), (620, 815), (625, 840), (610, 860), (590, 850), (580, 825)
]

print('Canonical points loaded')

# ==============================================================================
# 2. RENDERING THE MASTERPIECE ANTIQUE MAP
# ==============================================================================

def create_map(is_river_focus=False):
    # 1. Base aged parchment
    # Rich warm aged parchment color palette
    im = Image.new('RGB', (WIDTH, HEIGHT), (228, 208, 172))
    draw = ImageDraw.Draw(im)

    # Generate antique parchment fiber & texture noise
    np.random.seed(42)
    noise = np.random.normal(0, 8, (HEIGHT, WIDTH, 3)).astype(np.int16)
    base_arr = np.array(im, dtype=np.int16)
    textured = np.clip(base_arr + noise, 0, 255).astype(np.uint8)
    im = Image.fromarray(textured)
    draw = ImageDraw.Draw(im)

    # Vignette shadow around edges (tea-stained parchment effect)
    vignette = Image.new('L', (WIDTH, HEIGHT), 0)
    v_draw = ImageDraw.Draw(vignette)
    v_draw.rectangle([60, 50, WIDTH - 60, HEIGHT - 50], fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=40))
    # Invert vignette so edges are dark
    edge_dark = Image.new('RGB', (WIDTH, HEIGHT), (75, 50, 28))
    inv_vignette = Image.fromarray(255 - np.array(vignette))
    im.paste(edge_dark, (0, 0), inv_vignette)

    draw = ImageDraw.Draw(im)

    # 2. Ocean Ripples / Coastal Wave Hachures
    # Draw multiple faint concentric echoes around the coast
    for offset in [4, 9, 15, 22]:
        draw.polygon(COASTLINE, outline=(170, 145, 115), width=1)
        draw.polygon(SRI_LANKA, outline=(170, 145, 115), width=1)

    # 3. Landmass fill (slightly lighter warm sunlit parchment tone)
    land_mask = Image.new('L', (WIDTH, HEIGHT), 0)
    l_draw = ImageDraw.Draw(land_mask)
    l_draw.polygon(COASTLINE, fill=255)
    l_draw.polygon(SRI_LANKA, fill=255)
    
    land_color = Image.new('RGB', (WIDTH, HEIGHT), (242, 226, 196))
    im.paste(land_color, (0, 0), land_mask)
    draw = ImageDraw.Draw(im)

    # Coastline contour in rich antique iron gall ink
    draw.polygon(COASTLINE, outline=(65, 42, 22), width=3)
    draw.polygon(SRI_LANKA, outline=(65, 42, 22), width=2)

    # 4. Mountain Ranges (Himalayas, Vindhyas, Sahyadris)
    # Himalayas
    himalaya_pts = [
        (480, 120), (520, 110), (560, 130), (610, 150), (670, 180),
        (740, 215), (800, 240), (860, 255), (920, 270)
    ]
    for i in range(len(himalaya_pts) - 1):
        x1, y1 = himalaya_pts[i]
        x2, y2 = himalaya_pts[i+1]
        mid_x = (x1 + x2) // 2
        mid_y = (y1 + y2) // 2
        # Mountain peak triangle
        peak = (mid_x, mid_y - 28)
        left = (x1, y1 + 8)
        right = (x2, y2 + 8)
        draw.polygon([left, peak, right], fill=(215, 195, 168), outline=(60, 38, 20), width=2)
        # Snow crest highlight
        snow_peak = (mid_x, mid_y - 28)
        snow_left = (mid_x - 8, mid_y - 14)
        snow_right = (mid_x + 8, mid_y - 14)
        draw.polygon([snow_left, snow_peak, snow_right], fill=(255, 255, 255), outline=(180, 160, 140), width=1)
        # Ridge shadow
        draw.line([snow_peak, (mid_x, mid_y + 8)], fill=(70, 45, 25), width=2)

    # Vindhya Ranges (Central India)
    vindhya_pts = [(450, 425), (490, 428), (540, 432), (590, 425), (640, 420)]
    for i in range(len(vindhya_pts) - 1):
        x1, y1 = vindhya_pts[i]
        x2, y2 = vindhya_pts[i+1]
        mid_x = (x1 + x2) // 2
        mid_y = (y1 + y2) // 2
        draw.polygon([(x1, y1+4), (mid_x, mid_y-14), (x2, y2+4)], fill=(205, 185, 155), outline=(75, 50, 30), width=1)

    # Western Ghats / Sahyadri (Western peninsula)
    ghats_pts = [(410, 520), (430, 570), (450, 630), (475, 690), (495, 740), (515, 780)]
    for i in range(len(ghats_pts) - 1):
        x1, y1 = ghats_pts[i]
        x2, y2 = ghats_pts[i+1]
        mid_x = (x1 + x2) // 2
        mid_y = (y1 + y2) // 2
        draw.polygon([(x1-4, y1), (mid_x+10, mid_y-6), (x2-4, y2)], fill=(205, 185, 155), outline=(75, 50, 30), width=1)

    # 5. Sacred Rivers
    # Draw engraved rivers with variable width
    for r_name, pts in RIVERS.items():
        # Core river channel in antique sepia ink
        draw.line(pts, fill=(50, 35, 22), width=3, joint='curve')
        # Subtle clean water tint in center of line
        draw.line(pts, fill=(75, 105, 125), width=1, joint='curve')

    # 6. Four Cardinal Char Dham Temple Illustrations
    def draw_temple(cx, cy, name, dev):
        # Platform base
        draw.rectangle([cx - 24, cy + 6, cx + 24, cy + 14], fill=(225, 200, 165), outline=(50, 32, 18), width=2)
        # Mandapa (hall)
        draw.rectangle([cx - 18, cy - 8, cx + 18, cy + 6], fill=(235, 210, 175), outline=(50, 32, 18), width=2)
        # Sanctum pillars
        for px in [-12, -4, 4, 12]:
            draw.line([(cx + px, cy - 8), (cx + px, cy + 6)], fill=(50, 32, 18), width=1)
        # Soaring Shikhara tower
        draw.polygon([(cx - 14, cy - 8), (cx, cy - 32), (cx + 14, cy - 8)], fill=(215, 185, 150), outline=(50, 32, 18), width=2)
        # Kalasha & Dhwaja (flag at pinnacle)
        draw.ellipse([cx - 3, cy - 36, cx + 3, cy - 30], fill=(218, 165, 32), outline=(50, 32, 18), width=1)
        draw.line([(cx, cy - 36), (cx, cy - 42)], fill=(50, 32, 18), width=1)
        draw.polygon([(cx, cy - 42), (cx + 9, cy - 39), (cx, cy - 36)], fill=(220, 80, 20), outline=(50, 32, 18), width=1)

    for k, d in DHAMS.items():
        draw_temple(d["pt"][0], d["pt"][1], d["name"], d["devanagari"])

    # 7. Ornate Royal Frame & Cartouche
    # Outer double border
    draw.rectangle([35, 25, WIDTH - 35, HEIGHT - 25], outline=(60, 38, 20), width=4)
    draw.rectangle([45, 35, WIDTH - 45, HEIGHT - 35], outline=(150, 110, 60), width=2)
    draw.rectangle([52, 42, WIDTH - 52, HEIGHT - 42], outline=(60, 38, 20), width=1)

    # Corner rosettes
    for cx in [45, WIDTH - 45]:
        for cy in [35, HEIGHT - 35]:
            draw.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], fill=(215, 180, 120), outline=(60, 38, 20), width=2)
            draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=(150, 90, 40), outline=(60, 38, 20), width=1)

    # 8. Compass Rose (in Bay of Bengal)
    cr_x, cr_y = 750, 680
    r_outer = 45
    r_inner = 14
    for angle_deg in range(0, 360, 45):
        rad = math.radians(angle_deg)
        rad_left = math.radians(angle_deg - 22.5)
        rad_right = math.radians(angle_deg + 22.5)
        p_tip = (cr_x + r_outer * math.cos(rad), cr_y + r_outer * math.sin(rad))
        p_left = (cr_x + r_inner * math.cos(rad_left), cr_y + r_inner * math.sin(rad_left))
        p_right = (cr_x + r_inner * math.cos(rad_right), cr_y + r_inner * math.sin(rad_right))
        draw.polygon([(cr_x, cr_y), p_left, p_tip], fill=(70, 45, 25), outline=(50, 30, 15), width=1)
        draw.polygon([(cr_x, cr_y), p_right, p_tip], fill=(210, 180, 130), outline=(50, 30, 15), width=1)
    draw.ellipse([cr_x - 8, cr_y - 8, cr_x + 8, cr_y + 8], fill=(218, 165, 32), outline=(50, 30, 15), width=2)

    # 9. Title Cartouche
    tc_x, tc_y = 960, 130
    draw.rectangle([tc_x - 140, tc_y - 45, tc_x + 140, tc_y + 45], fill=(238, 220, 190), outline=(60, 38, 20), width=3)
    draw.rectangle([tc_x - 134, tc_y - 39, tc_x + 134, tc_y + 39], outline=(160, 120, 70), width=1)

    # Try default fonts or render labels cleanly
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/DevanagariMT.ttc", 22)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 13)
        font_ocean = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 15)
        font_dham = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 12)
    except:
        font_large = font_sub = font_ocean = font_dham = ImageFont.load_default()

    draw.text((tc_x, tc_y - 14), "॥ श्री भारतवर्षम् ॥", fill=(60, 35, 18), font=font_large, anchor="mm")
    draw.text((tc_x, tc_y + 16), "SACRED GEOGRAPHY OF BHARAT", fill=(110, 75, 45), font=font_sub, anchor="mm")

    # Ocean & Direction Labels
    draw.text((190, 560), "ARABIAN SEA\n(सिन्धु सागर)", fill=(110, 85, 60), font=font_ocean, anchor="mm", align="center")
    draw.text((930, 560), "BAY OF BENGAL\n(बंगाल की खाड़ी)", fill=(110, 85, 60), font=font_ocean, anchor="mm", align="center")
    draw.text((580, 848), "INDIAN OCEAN (हिन्द महासागर)", fill=(110, 85, 60), font=font_ocean, anchor="mm")

    # Dham text labels
    for k, d in DHAMS.items():
        lx, ly = d["label_pos"]
        draw.text((lx, ly - 6), d["name"], fill=(50, 30, 15), font=font_dham, anchor="mm")
        draw.text((lx, ly + 9), d["devanagari"], fill=(130, 80, 35), font=font_dham, anchor="mm")

    # If is_river_focus is requested:
    # Dim the entire background into a warm dusky parchment tone
    # and illuminate ONLY the 4 rivers (Ganga, Narmada, Godavari, Kaveri)
    if is_river_focus:
        dimmed = ImageEnhance.Brightness(im).enhance(0.30)
        dimmed = ImageEnhance.Color(dimmed).enhance(0.70)

        bright = ImageEnhance.Brightness(im).enhance(1.50)
        bright = ImageEnhance.Contrast(bright).enhance(1.30)

        r_mask = Image.new('L', (WIDTH, HEIGHT), 0)
        rm_draw = ImageDraw.Draw(r_mask)
        # Broad illumination mask along Ganga, Narmada, Godavari, Kaveri
        for r_key in ["ganga", "yamuna", "narmada", "godavari", "kaveri"]:
            rm_draw.line(RIVERS[r_key], fill=255, width=65, joint='curve')
        
        r_mask = r_mask.filter(ImageFilter.GaussianBlur(radius=25))
        im = Image.composite(bright, dimmed, r_mask)

    return im

base_map = create_map(is_river_focus=False)
base_map.save("images/curriculum/tirthas.jpg", quality=95)
print("Saved pristine new images/curriculum/tirthas.jpg")

river_map = create_map(is_river_focus=True)
river_map.save("images/curriculum/tirthas_rivers_focus.jpg", quality=95)
print("Saved pristine new images/curriculum/tirthas_rivers_focus.jpg")

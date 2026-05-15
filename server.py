from flask import Flask, request, jsonify
import requests
import os
import json

app = Flask(__name__)
ANTHROPIC_KEY = os.environ.get('ANTHROPIC_KEY', '')

@app.route('/suggest', methods=['POST'])
def suggest():
    try:
        data = request.get_json()
        inventory = data.get('inventory', [])
        item_list = '\n'.join([f"- {item['name']} ({item['daysLeft']} days left)" for item in inventory])
        prompt = (
            "Here is my current fridge and pantry inventory with days until expiry:\n\n"
            + item_list
            + "\n\nSuggest exactly 3 recipes I could make that would best use the ingredients closest to expiring. "
            "For each recipe give me a name, a single short sentence explaining which expiring ingredients it uses, "
            "a difficulty level (Easy/Medium/Hard), and an estimated cook time.\n\n"
            "Respond ONLY with a valid JSON array, no other text, no markdown, no backticks:\n"
            '[{"name": "Recipe Name", "reason": "Uses your expiring ingredient", "difficulty": "Easy", "time": "20 min"}]'
        )
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_KEY,
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': 'claude-haiku-4-5-20251001',
                'max_tokens': 1024,
                'messages': [{'role': 'user', 'content': prompt}]
            }
        )
        result = response.json()
        text = result['content'][0]['text']
        cleaned = text.replace('```json', '').replace('```', '').strip()
        suggestions = json.loads(cleaned)
        return jsonify({'suggestions': suggestions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/parse-recipe', methods=['POST'])
def parse_recipe():
    try:
        data = request.get_json()
        raw_text = data.get('text', '')
        prompt = (
            "You are a recipe parser. Extract the recipe from the text below and return it as structured JSON.\n\n"
            "CRITICAL FORMATTING RULES for ingredients:\n"
            "- ingredient name: base ingredient ONLY, Title Case, singular form. NO prep methods, NO descriptors.\n"
            '  CORRECT: "Yellow Onion", "Cilantro", "Jalapeno Pepper", "Chicken Thigh"\n'
            '  WRONG: "diced yellow onion", "fresh cilantro loosely packed", "boneless skinless chicken thighs"\n'
            "- prep: how to prepare it, lowercase. Examples: \"diced\", \"minced\", \"loosely packed\"\n"
            "- quantity: a number only. Normalize ranges to midpoint (6 to 8 = 7). 'half' = 0.5.\n"
            "- unit: one of: tsp, tbsp, cup, oz, lb, g, ml, l — or null for countable items\n\n"
            "For steps: clean, numbered instructions.\n\n"
            "Return ONLY this JSON, no other text:\n"
            '{"name": "Recipe Name", "time": "30 min", "difficulty": "Easy", "ingredients": '
            '[{"name": "Yellow Onion", "quantity": 2, "unit": null, "prep": "diced"}], '
            '"steps": ["Heat oil in a large pan over medium heat."]}\n\n'
            "Recipe text to parse:\n"
            + raw_text[:6000]
        )
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_KEY,
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': 'claude-haiku-4-5-20251001',
                'max_tokens': 2048,
                'messages': [{'role': 'user', 'content': prompt}]
            }
        )
        result = response.json()
        text = result['content'][0]['text']
        cleaned = text.replace('```json', '').replace('```', '').strip()
        recipe = json.loads(cleaned)
        return jsonify({'success': True, 'recipe': recipe})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'result': str(result) if 'result' in dir() else 'no result'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/scan-receipt', methods=['POST'])
def scan_receipt():
    try:
        data = request.get_json()
        image_data = data.get('image', '')
        prompt = (
            "You are an expert grocery receipt parser. Look at this receipt image and extract all food and grocery items purchased.\n\n"
            "IGNORE THESE LINES - they are not purchases:\n"
            "- Any line containing: 'BONUS BUY SAVINGS', 'PRICE YOU PAY', 'Card Savings', 'Regular Price', 'VIC SAVINGS', 'FUEL POINTS', 'TAX', 'BALANCE', 'TOTAL', 'SUBTOTAL'\n"
            "- Any line starting with 'SC' followed by numbers (store coupon/discount lines)\n"
            "- Lines with 'MR', 'NP', 'BAG FEE', 'CHANGE', 'VISA', 'MASTERCARD', 'CASH'\n"
            "- Store header info: store name, address, phone, cashier, date, time\n"
            "- Category headers printed in ALL CAPS alone on a line (DAIRY, MEAT, PRODUCE, GROCERY, etc)\n\n"
            "KEEP THESE LINES - they are actual purchases:\n"
            "- Any item line with a price ending in 'F', 'T', 'S', or 'B'\n"
            "- Weight lines like '0.83 lb @ 2.49 /lb' followed by an item name\n"
            "- Lines starting with 'WT' followed by an item name\n"
            "- Lines with quantities like '2 QTY' or '2 @'\n\n"
            "DECODING ABBREVIATIONS:\n"
            "- Store brand prefixes to ignore: HT, WEG, WG, WB, SF, SB, TJ, BC, DH, AG, MC, PK\n"
            "- BNLS=Boneless, SKNLS/SKNLS=Skinless, BRST=Breast, GRND=Ground, CHKN/CH=Chicken\n"
            "- ORG/ORGNC=Organic, NAT=Natural, WHL=Whole, WHT=Wheat, MLK=Milk, PCH=Peach\n"
            "- MXBRY=Mixberry, SHLS=Shells, CHD=Cheddar, MAC&C=Mac and Cheese\n"
            "- SDLS=Seedless, SOLS=Seedless, CUCS=Cucumbers, LG=Large, SM=Small, MED=Medium\n"
            "- CHERUBS=Cherry Tomatoes, FLT=Fillet, SALMN=Salmon, COD=Cod\n"
            "- IQF=Individually Quick Frozen, QRT=Quart, PLN=Plain, GRE=Greek\n"
            "- PLD=Peeled, CAR=Carrots, MNDRIN/MNDRN=Mandarin, KANZI=Kanzi (apple variety)\n"
            "- Use clean common names: 'Cherry Tomato' not 'Cherubs', decode all abbreviations\n\n"
            "QUANTITIES:\n"
            "- '2 QTY ITEM' means quantity 2\n"
            "- '0.83 lb @ 2.49/lb' means quantity 0.83, unit lb\n"
            "- '4 @ 0.50' means quantity 4\n"
            "- If the same item appears twice with different prices, they are TWO separate purchases - keep both\n\n"
            "For each item return:\n"
            "- name: clean readable name, Title Case, singular\n"
            "- category: one of Produce, Meat, Dairy, Deli, Bakery, Frozen, Pantry, Beverages, Nuts & Dried Fruit, Other\n"
            "- quantity: number only, default 1\n"
            "- unit: null for countable items, or lb/oz/cup/pack/tub as appropriate\n\n"
            "Return ONLY a valid JSON array, no other text:\n"
            '[{"name": "Cherry Tomato", "category": "Produce", "quantity": 2, "unit": "tub"}, '
            '{"name": "Carrot", "category": "Produce", "quantity": 2, "unit": "lb"}]'
        )
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_KEY,
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': 'claude-sonnet-4-5',
                'max_tokens': 2048,
                'messages': [{
                    'role': 'user',
                    'content': [
                        {
                            'type': 'image',
                            'source': {
                                'type': 'base64',
                                'media_type': 'image/jpeg',
                                'data': image_data,
                            }
                        },
                        {
                            'type': 'text',
                            'text': prompt
                        }
                    ]
                }]
            }
        )
        result = response.json()
        text = result['content'][0]['text']
        cleaned = text.replace('```json', '').replace('```', '').strip()
        items = json.loads(cleaned)
        return jsonify({'success': True, 'items': items})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'result': str(result) if 'result' in dir() else 'no result'}), 500
        
@app.route('/parse-order', methods=['POST'])
def parse_order():
    try:
        data = request.get_json()
        text = data.get('html', '')[:8000]
        store = data.get('store', 'grocery store')
        prompt = (
            f"You are parsing a {store} online order history page. Extract all grocery/food items from this page text.\n\n"
            "For each item return:\n"
            "- name: clean readable name, Title Case, singular, no brand names unless essential\n"
            "- category: one of Produce, Meat, Dairy, Deli, Bakery, Frozen, Pantry, Beverages, Nuts & Dried Fruit, Other\n"
            "- quantity: number only, default 1\n"
            "- unit: null for countable items, or lb/oz/cup/pack as appropriate\n\n"
            "Ignore: prices, savings, donations, bags, gift cards, non-food household items.\n"
            "Return ONLY a valid JSON array, no other text:\n"
            '[{"name": "Chicken Breast", "category": "Meat", "quantity": 1, "unit": "lb"}]'
            f"\n\nPage text:\n{text}"
        )
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01'},
            json={'model': 'claude-sonnet-4-5', 'max_tokens': 2048, 'messages': [{'role': 'user', 'content': prompt}]}
        )
        result = response.json()
        text = result['content'][0]['text']
        cleaned = text.replace('```json', '').replace('```', '').strip()
        items = json.loads(cleaned)
        return jsonify({'success': True, 'items': items})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'detail': str(result) if 'result' in locals() else 'no result'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)

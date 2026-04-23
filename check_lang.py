import json

with open(r'C:\Users\haro\.openclaw\workspace\sc-exam-study\src\data\sc-exam.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'Total questions: {len(data)}')

jp_count = 0
en_count = 0
en_ids = []

for q in data:
    has_jp = any('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' for c in q['question'])
    if has_jp:
        jp_count += 1
    else:
        en_count += 1
        en_ids.append(q['id'])

print(f'Japanese questions: {jp_count}')
print(f'English questions: {en_count}')
print(f'English question IDs: {en_ids[:20]}...')

# Show first 3 English questions
for q in data:
    has_jp = any('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' for c in q['question'])
    if not has_jp:
        print(f'\nID {q["id"]}:')
        print(f'  Q: {q["question"]}')
        print(f'  Options: {q["options"]}')
        break

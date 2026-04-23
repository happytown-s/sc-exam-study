import json

with open(r'C:\Users\haro\.openclaw\workspace\sc-exam-study\src\data\sc-exam.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Collect all English questions and options
questions = []
for q in data:
    questions.append(q['question'])
    for opt in q['options']:
        questions.append(opt)

# Write all texts to a file for reference
with open(r'C:\Users\haro\.openclaw\workspace\sc-exam-study\all_texts.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f'Total text entries: {len(questions)}')

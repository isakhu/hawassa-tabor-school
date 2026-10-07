import os
import re

app_dir = r"c:\Users\HP\Desktop\finished projects\hawassa tabor\frontend\app"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    out_lines = []
    in_mock = False
    modified = False

    for line in lines:
        if in_mock:
            if line.strip() == '];' or line.strip() == ']':
                in_mock = False
            continue
        
        match = re.search(r'^(const mock[A-Za-z]+.*?=\s*)\[', line)
        if match:
            # If it's already empty, just keep it
            if line.strip().endswith('[];'):
                out_lines.append(line)
            else:
                out_lines.append(match.group(1) + '[];\n')
                in_mock = True
                modified = True
        else:
            out_lines.append(line)
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(out_lines)
        print(f"Cleaned {os.path.basename(filepath)}")

for root, _, files in os.walk(app_dir):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))

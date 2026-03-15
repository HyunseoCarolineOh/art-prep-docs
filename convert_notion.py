import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/현서/.claude/projects/C--claude-local-art-prep/be3810f7-9435-482c-8331-956da835b882/tool-results/badw2s3wn.txt', 'rb') as f:
    raw = f.read()
data = json.loads(raw)
results = data['results']

def render_rich_text(rt_list):
    out = ''
    for r in rt_list:
        txt = r.get('plain_text', '')
        ann = r.get('annotations', {})
        if ann.get('code'):
            txt = '`' + txt + '`'
        if ann.get('bold'):
            txt = '**' + txt + '**'
        if ann.get('italic'):
            txt = '*' + txt + '*'
        if ann.get('strikethrough'):
            txt = '~~' + txt + '~~'
        out += txt
    return out

lines = []
has_children_ids = []

for block in results:
    btype = block.get('type')
    bid = block.get('id')
    has_children = block.get('has_children', False)
    content = block.get(btype, {})

    rt = content.get('rich_text', [])
    text = render_rich_text(rt)

    if btype == 'heading_1':
        lines.append('# ' + text)
    elif btype == 'heading_2':
        lines.append('## ' + text)
    elif btype == 'heading_3':
        lines.append('### ' + text)
    elif btype == 'paragraph':
        lines.append(text if text else '')
    elif btype == 'bulleted_list_item':
        lines.append('- ' + text)
    elif btype == 'numbered_list_item':
        lines.append('1. ' + text)
    elif btype == 'to_do':
        checked = content.get('checked', False)
        lines.append(('- [x] ' if checked else '- [ ] ') + text)
    elif btype == 'quote':
        lines.append('> ' + text)
    elif btype == 'code':
        lang = content.get('language', '')
        lines.append('```' + lang)
        lines.append(text)
        lines.append('```')
    elif btype == 'divider':
        lines.append('---')
    elif btype == 'callout':
        icon = content.get('icon', {})
        icon_txt = icon.get('emoji', '') if icon else ''
        lines.append('> **' + icon_txt + '** ' + text)
    elif btype == 'toggle':
        lines.append('**' + text + '**')
        if has_children:
            has_children_ids.append((bid, btype))
    elif btype == 'table':
        width = content.get('table_width', 2)
        has_col_header = content.get('has_column_header', False)
        lines.append(f'[TABLE: {bid} | width={width} | has_column_header={has_col_header}]')
        if has_children:
            has_children_ids.append((bid, btype))
    else:
        if text:
            lines.append(text)

print('\n'.join(lines))
print('\n\n=== has_children 블록 목록 ===')
for bid, btype in has_children_ids:
    print(f'[{btype}] {bid}')
print(f'\nhas_more: {data["has_more"]}')
print(f'next_cursor: {data["next_cursor"]}')

import cssutils

def extract_hover_selectors(css_file):
    css_parser = cssutils.CSSParser()
    with open(css_file, 'r') as file:
        css = file.read()
    stylesheet = css_parser.parseString(css)
    hover_selectors = []
    for rule in stylesheet:
        if isinstance(rule, cssutils.css.CSSStyleRule):
            for selector in rule.selectorList:
                if ':hover' in selector.selectorText:
                    hover_selectors.append(selector.selectorText)
    return hover_selectors

def generate_media_query_block(hover_selectors):
    selectors = ',\n  '.join(hover_selectors)
    return f"""
@media (pointer: coarse) {{
  {selectors} {{
    all: unset !important;
  }}
}}"""

css_file = 'style.css'
hover_selectors = extract_hover_selectors(css_file)
media_query_block = generate_media_query_block(hover_selectors)
print(media_query_block)

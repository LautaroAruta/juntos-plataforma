import pypdf

reader = pypdf.PdfReader('c:/Users/user/Downloads/JUNTOS/juntos-plataforma/Análisis de Marca y Diseño de App.pdf')
text = ""
for page in reader.pages:
    page_text = page.extract_text()
    page_text = page_text.replace('\n\n', '@@@').replace('\n', ' ').replace('@@@', '\n\n')
    # compress multiple spaces
    import re
    page_text = re.sub(' +', ' ', page_text)
    text += page_text + "\n\n"

with open("extracted_text_clean.txt", "w", encoding="utf-8") as f:
    f.write(text)

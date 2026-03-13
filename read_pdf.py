import pypdf

reader = pypdf.PdfReader('c:/Users/user/Downloads/JUNTOS/juntos-plataforma/Análisis de Marca y Diseño de App.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open("extracted_text.txt", "w", encoding="utf-8") as f:
    f.write(text)

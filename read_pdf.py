from pypdf import PdfReader
import sys

# Ensure stdout uses UTF-8
sys.stdout.reconfigure(encoding='utf-8')

reader = PdfReader("CahierDeCharge.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

print(text)

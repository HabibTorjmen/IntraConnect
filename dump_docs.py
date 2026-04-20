import os
import sys
import PyPDF2
import docx

def read_pdf(file_path):
    text = ""
    try:
        reader = PyPDF2.PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        text = f"Error reading PDF: {e}"
    return text

def read_docx(file_path):
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        text = f"Error reading Docx: {e}"
    return text

files = [
    r"c:\Users\Habib Torjmen\Desktop\Habib Enetcom\PFE NADA\Bussiness.docx",
    r"c:\Users\Habib Torjmen\Desktop\Habib Enetcom\PFE NADA\CahierDeCharge.pdf",
    r"c:\Users\Habib Torjmen\Desktop\Habib Enetcom\PFE NADA\SPRINTs AND BACKLOAGS.pdf"
]

with open(r"c:\Users\Habib Torjmen\Desktop\Habib Enetcom\PFE NADA\docs_dump.txt", "w", encoding="utf-8") as out:
    for f in files:
        out.write(f"\n================ {os.path.basename(f)} ================\n")
        if f.endswith(".pdf"):
            out.write(read_pdf(f))
        elif f.endswith(".docx"):
            out.write(read_docx(f))

print("Dumped all files.")

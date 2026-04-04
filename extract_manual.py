import pdfplumber
import sys

pdf_path = r"C:\Users\madan\OneDrive\Desktop\Box Design App\BoxDesignAI-App\BoxDesign_AI_Functional_Testing_Manual.pdf"
output_path = r"C:\Users\madan\OneDrive\Desktop\Box Design App\BoxDesignAI-App\test-bundle-output\manual_text.txt"

try:
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
    print(f"Text extracted to {output_path}")
except Exception as e:
    print(f"Error: {e}")

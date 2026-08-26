import os
import sys
import subprocess

pdf_path = os.path.join(os.path.dirname(__file__), "Writing sample 1.pdf")
output_dir = os.path.join(os.path.dirname(__file__), "assets")
os.makedirs(output_dir, exist_ok=True)

# Exact pages requested (1-indexed): 8, 10, 16, 17, 20
pages_to_extract = {
    8: "task1a_sample_script_page8.png",
    10: "task1b_sample_script_page10.png",
    16: "task2a_sample_script_page16.png",
    17: "task2a_sample_script_page17.png",
    20: "task2b_sample_script_page20.png"
}

def ensure_dependencies():
    try:
        import pypdfium2
        return True
    except ImportError:
        print("Installing pypdfium2 for PDF rendering...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdfium2", "Pillow", "--quiet"])
        return True

def extract():
    ensure_dependencies()
    import pypdfium2 as pdfium
    pdf = pdfium.PdfDocument(pdf_path)
    print(f"Loaded PDF: {pdf_path}, Total pages: {len(pdf)}")
    
    for page_num_1, filename in pages_to_extract.items():
        page_idx = page_num_1 - 1
        page = pdf[page_idx]
        # Render at 300 DPI (scale 300 / 72 = 4.166667)
        bitmap = page.render(scale=300 / 72)
        pil_image = bitmap.to_pil()
        out_file = os.path.join(output_dir, filename)
        pil_image.save(out_file, dpi=(300, 300))
        print(f"[OK] Saved Page {page_num_1} -> {out_file} (Dimensions: {pil_image.size[0]}x{pil_image.size[1]})")

if __name__ == "__main__":
    extract()
    print("ALL TARGET PAGES SUCCESSFULLY EXTRACTED TO ASSETS!")

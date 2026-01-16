from pathlib import Path


def extract_text(file_path: str | Path) -> str:
    """
    Extracts text from the given file (PDF or Image).
    """
    path = Path(file_path)
    if not path.exists():
        return ""

    suffix = path.suffix.lower()
    text = ""

    if suffix == ".pdf":
        text = _extract_from_pdf(path)
    elif suffix in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        text = _extract_from_image(path)
    else:
        # Fallback for CSV or txt
        try:
            return path.read_text(errors="ignore")
        except Exception:
            return ""

    return text.strip()


def _extract_from_pdf(pdf_path: Path) -> str:
    text_content = []
    try:
        import pymupdf  # fitz
        with pymupdf.open(pdf_path) as doc:
            for page in doc:
                text_content.append(page.get_text())
        
        # If text is empty, it might be a scanned PDF -> use OCR (not implemented fully for PDF here to save complexity, assuming native PDF)
        # But SRS said Tesseract. Let's add basic OCR invocation if empty.
        raw_text = "\n".join(text_content)
        if len(raw_text.strip()) < 50:
            # Try converting first page to image and OCR
            try:
                from pdf2image import convert_from_path
                import pytesseract
                
                # Convert only the first few pages to avoid massive processing time for MVP
                images = convert_from_path(str(pdf_path), first_page=1, last_page=3)
                ocr_text = ""
                for img in images:
                    ocr_text += pytesseract.image_to_string(img)
                
                if len(ocr_text.strip()) > len(raw_text.strip()):
                    return ocr_text
            except ImportError:
                print("pdf2image or pytesseract not installed/configured.")
            except Exception as e:
                print(f"OCR fallback failed: {e}")
            
        return raw_text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def _extract_from_image(img_path: Path) -> str:
    try:
        import pytesseract
        from PIL import Image
        return pytesseract.image_to_string(Image.open(img_path))
    except Exception as e:
        print(f"Error extracting image text: {e}")
        return ""

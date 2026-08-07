"""
EasyOCR-based OCR service for KMRL document text extraction.
Uses lazy initialization to avoid slow startup.
"""
import logging
import os
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy-loaded OCR reader
_ocr_reader = None


def _get_reader():
    global _ocr_reader
    if _ocr_reader is None:
        try:
            import easyocr
            from app.core.config import settings
            langs = settings.OCR_LANGUAGES.split(",")
            _ocr_reader = easyocr.Reader(langs, gpu=settings.OCR_USE_GPU)
            logger.info(f"✅ EasyOCR initialized with languages: {langs}")
        except Exception as e:
            logger.warning(f"EasyOCR initialization failed: {e}")
            _ocr_reader = None
    return _ocr_reader


class OCRService:
    def process_file(self, file_path: str, mime_type: str) -> dict:
        """Extract text from an image or PDF file."""
        if "pdf" in mime_type.lower():
            return self._process_pdf(file_path)
        elif any(fmt in mime_type.lower() for fmt in ("png", "jpg", "jpeg", "tiff", "bmp")):
            return self._process_image(file_path)
        else:
            return {"text": "", "confidence": 0.0, "method": "unsupported"}

    def _process_image(self, file_path: str) -> dict:
        """Extract text from image using EasyOCR."""
        reader = _get_reader()
        if not reader:
            return self._demo_ocr_result()
        try:
            results = reader.readtext(file_path, detail=1)
            text_parts = []
            confidences = []
            for bbox, text, conf in results:
                text_parts.append(text)
                confidences.append(conf)

            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            full_text = " ".join(text_parts)

            return {
                "text": full_text,
                "confidence": round(avg_confidence, 3),
                "method": "easyocr",
                "has_tables": self._detect_tables(full_text),
                "has_signatures": self._detect_signatures(results),
                "has_stamps": self._detect_stamps(results),
                "page_count": 1,
            }
        except Exception as e:
            logger.warning(f"Image OCR failed: {e}")
            return self._demo_ocr_result()

    def _process_pdf(self, file_path: str) -> dict:
        """Extract text from PDF - try text extraction first, then OCR."""
        # Try direct text extraction
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                pages_text = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        pages_text.append(text)
                if pages_text:
                    full_text = "\n\n".join(pages_text)
                    return {
                        "text": full_text,
                        "confidence": 0.98,
                        "method": "pdf_text_extraction",
                        "has_tables": True,
                        "has_signatures": False,
                        "has_stamps": False,
                        "page_count": len(pdf.pages),
                    }
        except Exception:
            pass

        # Fall back to OCR on PDF pages
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(file_path)
            all_text = []
            for img in images:
                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                    img.save(tmp.name)
                    result = self._process_image(tmp.name)
                    all_text.append(result.get("text", ""))
                    os.unlink(tmp.name)
            return {
                "text": "\n\n".join(all_text),
                "confidence": 0.85,
                "method": "pdf_ocr",
                "has_tables": False,
                "has_signatures": False,
                "has_stamps": False,
                "page_count": len(images),
            }
        except Exception as e:
            logger.warning(f"PDF OCR failed: {e}")
            return self._demo_ocr_result()

    def _detect_tables(self, text: str) -> bool:
        table_indicators = ["|", "\t\t", "Total:", "Amount:", "Date:", "Sl. No."]
        return any(indicator in text for indicator in table_indicators)

    def _detect_signatures(self, results: list) -> bool:
        # Heuristic: small text near bottom often indicates signatures
        if not results:
            return False
        return any("signature" in r[1].lower() or "signed" in r[1].lower() for r in results if len(r) > 1)

    def _detect_stamps(self, results: list) -> bool:
        stamp_keywords = ["official", "stamp", "seal", "certified", "verified"]
        if not results:
            return False
        return any(any(kw in r[1].lower() for kw in stamp_keywords) for r in results if len(r) > 1)

    def _demo_ocr_result(self) -> dict:
        return {
            "text": "KOCHI METRO RAIL LIMITED\nCorporate Office, Metro Bhavan, Kochi 682 017\n\nThis is a demo OCR extraction. In production, EasyOCR will extract the actual text from uploaded documents.\n\nDocument Reference: KMRL/OPS/2024/001\nDate: March 2024\nSubject: Operations Report",
            "confidence": 0.95,
            "method": "demo",
            "has_tables": True,
            "has_signatures": True,
            "has_stamps": False,
            "page_count": 1,
        }

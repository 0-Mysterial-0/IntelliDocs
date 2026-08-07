"""
Duplicate detection service for KMRL IntelliDocs.
Calculates text similarity and vector similarity between newly uploaded documents and existing files.
"""
import logging
from typing import Optional, List, Dict

logger = logging.getLogger(__name__)


class DuplicateService:
    def check_duplicate(self, text_content: str, threshold: float = 0.85) -> Dict:
        """
        Compare extracted text against vector store and text corpus to identify duplicates.
        Returns match metadata including similarity percentage.
        """
        if not text_content or len(text_content.strip()) < 20:
            return {"is_duplicate": False, "highest_similarity": 0.0, "matched_doc_id": None}

        try:
            from app.services.search_service import SearchService
            search_svc = SearchService()
            results = search_svc.semantic_search(text_content[:500], n_results=3)

            if results and len(results) > 0:
                top_match = results[0]
                score = top_match.get("score", 0.0)

                if score >= threshold:
                    logger.info(f"⚠️ Potential duplicate detected ({score*100:.1f}% match) with doc {top_match.get('document_id')}")
                    return {
                        "is_duplicate": True,
                        "highest_similarity": round(score, 3),
                        "matched_doc_id": top_match.get("document_id"),
                        "matched_doc_title": top_match.get("title", "Existing Document"),
                    }
        except Exception as e:
            logger.warning(f"Duplicate check error: {e}")

        return {"is_duplicate": False, "highest_similarity": 0.0, "matched_doc_id": None}

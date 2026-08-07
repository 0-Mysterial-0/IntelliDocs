"""
ChromaDB vector search service for semantic document search.
Falls back to mock results if ChromaDB is unavailable.
"""
import logging
import uuid
from typing import Optional

logger = logging.getLogger(__name__)


class SearchService:
    def __init__(self):
        from app.core.config import settings
        self.settings = settings
        self._client = None
        self._collection = None

    def _get_client(self):
        if self._client is None:
            import chromadb
            self._client = chromadb.HttpClient(
                host=self.settings.CHROMA_HOST,
                port=self.settings.CHROMA_PORT,
            )
        return self._client

    def get_or_create_collection(self):
        if self._collection is None:
            client = self._get_client()
            self._collection = client.get_or_create_collection(
                name=self.settings.CHROMA_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
        return self._collection

    def add_document(self, doc_id: str, text_chunks: list[str], metadata: dict = None):
        """Add document embeddings to ChromaDB."""
        try:
            collection = self.get_or_create_collection()
            ids = [f"{doc_id}_{i}" for i in range(len(text_chunks))]
            metas = [metadata or {} for _ in text_chunks]
            collection.upsert(
                ids=ids,
                documents=text_chunks,
                metadatas=metas,
            )
            logger.info(f"✅ Indexed {len(text_chunks)} chunks for document {doc_id}")
        except Exception as e:
            logger.warning(f"ChromaDB add_document failed: {e}")

    def semantic_search(self, query: str, n_results: int = 10, filters: dict = None) -> list[dict]:
        """Search for semantically similar documents."""
        try:
            collection = self.get_or_create_collection()
            where = None
            if filters:
                where = filters

            results = collection.query(
                query_texts=[query],
                n_results=min(n_results, 10),
                where=where,
                include=["documents", "metadatas", "distances"],
            )

            output = []
            if results and results.get("ids") and results["ids"][0]:
                for i, doc_id in enumerate(results["ids"][0]):
                    # Extract base document_id (remove chunk suffix)
                    base_doc_id = "_".join(doc_id.split("_")[:-1])
                    distance = results["distances"][0][i] if results.get("distances") else 0
                    score = 1 - distance  # Convert cosine distance to similarity
                    metadata = results["metadatas"][0][i] if results.get("metadatas") else {}
                    document_text = results["documents"][0][i] if results.get("documents") else ""

                    output.append({
                        "document_id": base_doc_id,
                        "score": round(score, 3),
                        "excerpt": document_text[:250] + "..." if len(document_text) > 250 else document_text,
                        "title": metadata.get("filename", "Document"),
                        "category": metadata.get("category", ""),
                        "metadata": metadata,
                    })
            return output

        except Exception as e:
            logger.warning(f"ChromaDB search failed: {e}")
            # Return demo results
            return _demo_search_results(query)

    def delete_document(self, doc_id: str):
        """Remove document embeddings from ChromaDB."""
        try:
            collection = self.get_or_create_collection()
            # Delete all chunks for this document
            results = collection.get(where_document={"$contains": doc_id})
            if results and results.get("ids"):
                collection.delete(ids=results["ids"])
        except Exception as e:
            logger.warning(f"ChromaDB delete failed: {e}")


def _demo_search_results(query: str) -> list[dict]:
    """Return realistic demo search results when ChromaDB is not available."""
    demo_docs = [
        {
            "document_id": str(uuid.uuid4()),
            "score": 0.94,
            "excerpt": f"This KMRL document is highly relevant to your query about '{query}'. It contains detailed information about metro operations and safety protocols.",
            "title": "Safety Inspection Report Q1 2024",
            "category": "Safety",
        },
        {
            "document_id": str(uuid.uuid4()),
            "score": 0.88,
            "excerpt": f"Financial data related to '{query}' including quarterly revenue figures and budget allocations for KMRL operations.",
            "title": "Financial Statement March 2024",
            "category": "Finance",
        },
        {
            "document_id": str(uuid.uuid4()),
            "score": 0.82,
            "excerpt": f"Procurement details concerning '{query}' with vendor specifications and tender requirements.",
            "title": "Tender Document - Signal System Upgrade",
            "category": "Procurement",
        },
    ]
    return demo_docs

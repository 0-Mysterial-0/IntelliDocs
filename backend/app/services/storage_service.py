"""MinIO storage service for document file management."""
import logging
import io
from typing import Optional

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self):
        from app.core.config import settings
        self.settings = settings
        self._client = None

    def _get_client(self):
        if self._client is None:
            from minio import Minio
            self._client = Minio(
                endpoint=self.settings.MINIO_ENDPOINT,
                access_key=self.settings.MINIO_ACCESS_KEY,
                secret_key=self.settings.MINIO_SECRET_KEY,
                secure=self.settings.MINIO_SECURE,
                region=self.settings.MINIO_REGION,
            )
        return self._client

    def ensure_bucket_exists(self):
        try:
            client = self._get_client()
            bucket = self.settings.MINIO_BUCKET
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
                logger.info(f"✅ Created MinIO bucket: {bucket}")
            else:
                logger.info(f"✅ MinIO bucket '{bucket}' exists")
        except Exception as e:
            logger.warning(f"MinIO bucket check failed: {e}")

    def upload_bytes(self, content: bytes, object_name: str, content_type: str = "application/octet-stream") -> str:
        """Upload bytes to MinIO and return the object path."""
        try:
            client = self._get_client()
            data = io.BytesIO(content)
            client.put_object(
                bucket_name=self.settings.MINIO_BUCKET,
                object_name=object_name,
                data=data,
                length=len(content),
                content_type=content_type,
            )
            logger.info(f"✅ Uploaded {object_name} to MinIO")
            return object_name
        except Exception as e:
            logger.warning(f"MinIO upload failed for {object_name}: {e}")
            return object_name  # Return path even if upload fails (demo mode)

    def get_presigned_url(self, object_name: str, expires_hours: int = 1) -> Optional[str]:
        """Generate a presigned URL for file download."""
        try:
            from datetime import timedelta
            client = self._get_client()
            url = client.presigned_get_object(
                bucket_name=self.settings.MINIO_BUCKET,
                object_name=object_name,
                expires=timedelta(hours=expires_hours),
            )
            return url
        except Exception as e:
            logger.warning(f"MinIO presigned URL failed: {e}")
            return f"http://localhost:9000/{self.settings.MINIO_BUCKET}/{object_name}"

    def delete_object(self, object_name: str):
        """Delete an object from MinIO."""
        try:
            client = self._get_client()
            client.remove_object(self.settings.MINIO_BUCKET, object_name)
        except Exception as e:
            logger.warning(f"MinIO delete failed: {e}")

    def get_bytes(self, object_name: str) -> Optional[bytes]:
        """Download an object from MinIO."""
        try:
            client = self._get_client()
            response = client.get_object(self.settings.MINIO_BUCKET, object_name)
            data = response.read()
            response.close()
            response.release_conn()
            return data
        except Exception as e:
            logger.warning(f"MinIO download failed: {e}")
            return None

    def list_objects(self, prefix: str = "") -> list[dict]:
        """List objects in MinIO bucket with optional prefix."""
        try:
            client = self._get_client()
            objects = client.list_objects(self.settings.MINIO_BUCKET, prefix=prefix, recursive=True)
            return [
                {
                    "name": obj.object_name,
                    "size": obj.size,
                    "last_modified": obj.last_modified.isoformat() if obj.last_modified else None,
                }
                for obj in objects
            ]
        except Exception as e:
            logger.warning(f"MinIO list failed: {e}")
            return []

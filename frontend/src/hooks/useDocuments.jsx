import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";
import { ENV } from "../config/env";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch document list
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient("/documents/");
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // 2. Upload file via FormData (POST /documents/upload)
  const uploadDocument = async (file) => {
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${ENV.API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || "Upload failed");
      }

      // Re-fetch documents so the library updates immediately
      await fetchDocuments();
    } catch (err) {
      setError(err.message || "Failed to upload document");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // 3. Delete file (DELETE /documents/{id})
  const deleteDocument = async (id) => {
    try {
      await apiClient(`/documents/${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete document");
    }
  };

  return {
    documents,
    loading,
    uploading,
    error,
    uploadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments,
  };
}
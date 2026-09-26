import { useState, useCallback, useEffect } from "react";
import api from "../auth/api";

/**
 * Handles fetching, uploading, and deleting documents.
 * AdminDashboard just calls the functions this returns — no axios code
 * or loading/error juggling lives in the page component.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Adjust the path here if your list endpoint is named differently
      const res = await api.get("/documents/");
      setDocuments(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function uploadDocument(file) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchDocuments(); // refresh the list so the new file shows up
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
      throw err;
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(documentId) {
    // Optimistic update: remove it immediately, roll back if the call fails
    const previous = documents;
    setDocuments((docs) => docs.filter((d) => d.id !== documentId));
    try {
      await api.delete(`/documents/${documentId}`);
    } catch (err) {
      setDocuments(previous);
      setError(err.response?.data?.detail || "Delete failed.");
      throw err;
    }
  }

  return {
    documents,
    loading,
    error,
    uploading,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
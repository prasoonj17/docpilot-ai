import { useState } from "react";
import { uploadDocument, deleteDocument } from "../../api/documents";
import { useMascot } from "../auth/MascotContext";

export default function DocumentPanel({ documents, onRefresh }) {
  const { setMood } = useMascot();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg("");
    setMood("loading"); // Dog starts running laps

    try {
      await uploadDocument(file);
      setMood("success"); // Dog and boy celebrate
      onRefresh();
    } catch (err) {
      setMood("error"); // Dog barks
      setErrorMsg(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
      setTimeout(() => setMood("idle"), 3000); // Dog goes back to sleep
      e.target.value = "";
    }
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDocument(docId);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || "Could not delete document");
    }
  };

  return (
    <aside className="doc-sidebar">
      <div className="doc-sidebar-header">
        <h3>Knowledge Base</h3>
        <span className="badge badge--admin">Admin Only</span>
      </div>

      {errorMsg && <div className="alert alert--error">{errorMsg}</div>}

      <label className={`upload-dropzone ${isUploading ? "is-busy" : ""}`}>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          disabled={isUploading}
          style={{ display: "none" }}
        />
        <span>{isUploading ? "Uploading & Indexing..." : "+ Upload New PDF"}</span>
      </label>

      <ul className="doc-list">
        {documents.map((doc) => (
          <li key={doc.id} className="doc-item">
            <span className="doc-name">{doc.name || `Document #${doc.id}`}</span>
            <button
              type="button"
              className="btn-trash"
              onClick={() => handleDelete(doc.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
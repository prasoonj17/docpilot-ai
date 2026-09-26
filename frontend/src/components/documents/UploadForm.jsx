import { useState, useRef } from "react";

export default function UploadForm({ onUpload, uploading }) {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    try {
      await onUpload(file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // Handled by parent view
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-upload-form">
      <div
        className={`dropzone-box ${isDragOver ? "is-dragover" : ""} ${file ? "has-file" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden-file-input"
        />

        <div className="dropzone-content">
          <span className="dropzone-icon">{file ? "📑" : "☁️"}</span>
          {file ? (
            <div className="file-selected-badge">
              <strong>{file.name}</strong>
              <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
            </div>
          ) : (
            <div className="dropzone-text">
              <strong>Click to upload</strong> or drag & drop PDF here
              <span>Supports company policy, handbook, or reports</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading || !file}
        className="btn btn--prime-new btn--upload-action"
      >
        {uploading ? (
          <span className="uploading-spinner">
            <span className="spin-dot"></span> Processing & Indexing...
          </span>
        ) : (
          "Upload to Knowledge Base"
        )}
      </button>
    </form>
  );
}
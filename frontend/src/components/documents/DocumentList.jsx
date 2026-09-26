import { useState } from "react";
import DocumentItem from "./DocumentItem";

export default function DocumentList({ documents, loading, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="document-list__status">Loading documents…</p>;
  }

  if (!documents.length) {
    return <p className="document-list__status">No documents uploaded yet.</p>;
  }

  return (
    <ul className="document-list">
      {documents.map((doc) => (
        <DocumentItem
          key={doc.id}
          document={doc}
          onDelete={handleDelete}
          deleting={deletingId === doc.id}
        />
      ))}
    </ul>
  );
}
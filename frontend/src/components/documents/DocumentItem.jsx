export default function DocumentItem({ document, onDelete, deleting }) {
  return (
    <li className="document-item">
      <div className="document-item__info">
        <span className="document-item__name">{document.filename || document.name}</span>
        {document.uploaded_at && (
          <span className="document-item__date">
            {new Date(document.uploaded_at).toLocaleDateString()}
          </span>
        )}
      </div>
      <button
        type="button"
        className="btn btn--ghost document-item__delete"
        onClick={() => onDelete(document.id)}
        disabled={deleting}
      >
        {deleting ? "Removing…" : "Delete"}
      </button>
    </li>
  );
}
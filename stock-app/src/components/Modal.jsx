export function Modal({ show, onClose, title, children }) {
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                {children}
            </div>
        </div>
    );
}

import { toast } from 'react-toastify';

// Success toast
export const showSuccessToast = (message, options = {}) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
    });
};

// Error toast
export const showErrorToast = (message, options = {}) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
    });
};

// Info toast
export const showInfoToast = (message, options = {}) => {
    toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
    });
};

// Warning toast
export const showWarningToast = (message, options = {}) => {
    toast.warning(message, {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        ...options
    });
};

// Confirm toast (custom implementation for replace window.confirm)
export const showConfirmToast = (message, onConfirm, onCancel) => {
    const toastId = toast.info(
        <div>
            <p className="mb-3">{message}</p>
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        toast.dismiss(toastId);
                        onConfirm();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Confirm
                </button>
                <button
                    onClick={() => {
                        toast.dismiss(toastId);
                        if (onCancel) onCancel();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>,
        {
            position: "top-center",
            autoClose: false,
            closeButton: false,
            draggable: false,
            closeOnClick: false,
        }
    );
};

// Promise toast - useful for async operations
export const showPromiseToast = (promise, messages) => {
    return toast.promise(
        promise,
        {
            pending: messages.pending || 'Processing...',
            success: messages.success || 'Success! 👌',
            error: messages.error || 'Something went wrong 🤯'
        },
        {
            position: "top-right",
            autoClose: 3000,
        }
    );
};

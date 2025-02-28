import { NewQuestion } from "@/types";
import { useState, useRef } from "react";

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    question: NewQuestion,
    files: { image?: File; pdf?: File }
  ) => void;
  validationErrors: string[];
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  validationErrors,
}) => {
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    round: 1,
    questionNumber: "",
    content: "",
    answer: "",
    hints: [""],
  });

  // File state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);

  // File input refs for resetting
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPdf(e.target.files[0]);
    }
  };

  const clearFileInputs = () => {
    setSelectedImage(null);
    setSelectedPdf(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleSubmit = () => {
    const files: { image?: File; pdf?: File } = {};
    if (selectedImage) files.image = selectedImage;
    if (selectedPdf) files.pdf = selectedPdf;
    onSubmit(newQuestion, files);
  };

  const handleClose = () => {
    clearFileInputs();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8 h-[600px] overflow-y-scroll">
        <h2 className="text-xl font-bold mb-4">Add New Question</h2>

        {validationErrors.length > 0 && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-1">Round</label>
            <select
              value={newQuestion.round}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  round: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
            >
              {[1, 2, 3].map((num) => (
                <option key={num} value={num}>
                  Round {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Question Number</label>
            <input
              type="number"
              value={newQuestion.questionNumber}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  questionNumber: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
              min="1"
            />
          </div>

          <div>
            <label className="block mb-1">Content</label>
            <textarea
              value={newQuestion.content}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, content: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-1">Answer</label>
            <input
              type="text"
              value={newQuestion.answer}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, answer: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-1">Image (Optional)</label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-2 border rounded"
            />
            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  title="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block mb-1">PDF Document (Optional)</label>
            <input
              type="file"
              ref={pdfInputRef}
              onChange={handlePdfChange}
              accept="application/pdf"
              className="w-full p-2 border rounded"
            />
            {selectedPdf && (
              <div className="mt-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="red"
                  viewBox="0 0 16 16"
                >
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5v2z" />
                  <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z" />
                </svg>
                <span className="ml-2">{selectedPdf.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPdf(null);
                    if (pdfInputRef.current) pdfInputRef.current.value = "";
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Remove PDF"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">Hints</label>
            <div className="space-y-2">
              {newQuestion.hints.map((hint, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => {
                      const newHints = [...newQuestion.hints];
                      newHints[index] = e.target.value;
                      setNewQuestion({ ...newQuestion, hints: newHints });
                    }}
                    className="flex-1 p-2 border rounded"
                    placeholder={`Hint ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newHints = newQuestion.hints.filter(
                        (_, i) => i !== index
                      );
                      setNewQuestion({ ...newQuestion, hints: newHints });
                    }}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                    disabled={newQuestion.hints.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setNewQuestion({
                    ...newQuestion,
                    hints: [...newQuestion.hints, ""],
                  });
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add another hint
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
};

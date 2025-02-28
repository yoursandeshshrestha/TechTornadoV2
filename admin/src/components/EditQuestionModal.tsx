import { Question } from "@/types";
import { useState, useEffect, useRef } from "react";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: Question, files: { image?: File; pdf?: File }) => void;
  question: Question | null;
  validationErrors: string[];
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  question,
  validationErrors,
}) => {
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);

  // File state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);

  // File input refs for resetting
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Track existing media to show in the UI
  const [existingMedia, setExistingMedia] = useState<{
    image?: { url: string; fileName: string };
    pdf?: { url: string; fileName: string };
  } | null>(null);

  useEffect(() => {
    if (question) {
      setEditedQuestion(question);

      // Reset file selections when question changes
      setSelectedImage(null);
      setSelectedPdf(null);
      setImagePreview(null);

      // Check for existing media
      if (question.media) {
        setExistingMedia(question.media);
      } else {
        setExistingMedia(null);
      }
    }
  }, [question]);

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
    if (editedQuestion) {
      const files: { image?: File; pdf?: File } = {};
      if (selectedImage) files.image = selectedImage;
      if (selectedPdf) files.pdf = selectedPdf;
      onSubmit(editedQuestion, files);
    }
  };

  const handleClose = () => {
    clearFileInputs();
    onClose();
  };

  if (!isOpen || !editedQuestion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8 h-[600px] overflow-y-scroll">
        <h2 className="text-xl font-bold mb-4">Edit Question</h2>

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
              value={editedQuestion.round}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
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
              value={editedQuestion.questionNumber}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
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
              value={editedQuestion.content}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  content: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-1">Answer</label>
            <input
              type="text"
              value={editedQuestion.answer}
              onChange={(e) =>
                setEditedQuestion({ ...editedQuestion, answer: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-1">Image (Optional)</label>
            {!selectedImage && existingMedia?.image && (
              <div className="mb-2 p-2 border rounded flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Current image: {existingMedia.image.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Upload a new file to replace it
                  </p>
                </div>
              </div>
            )}
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
            {!selectedPdf && existingMedia?.pdf && (
              <div className="mb-2 p-2 border rounded flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="red"
                  className="mr-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5v2z" />
                  <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Current PDF: {existingMedia.pdf.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Upload a new file to replace it
                  </p>
                </div>
              </div>
            )}
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
                  <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029z" />
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
              {editedQuestion.hints.map((hint, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => {
                      const newHints = [...editedQuestion.hints];
                      newHints[index] = e.target.value;
                      setEditedQuestion({ ...editedQuestion, hints: newHints });
                    }}
                    className="flex-1 p-2 border rounded"
                    placeholder={`Hint ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newHints = editedQuestion.hints.filter(
                        (_, i) => i !== index
                      );
                      setEditedQuestion({ ...editedQuestion, hints: newHints });
                    }}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                    disabled={editedQuestion.hints.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEditedQuestion({
                    ...editedQuestion,
                    hints: [...editedQuestion.hints, ""],
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
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

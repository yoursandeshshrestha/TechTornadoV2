import { Question } from "@/types";
import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash } from "lucide-react";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: Question) => void;
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (question) {
      setEditedQuestion(question);
    }
  }, [question]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = () => {
    if (editedQuestion) {
      // Filter out empty hints
      const formattedQuestion = {
        ...editedQuestion,
        hints: editedQuestion.hints.filter((hint) => hint.trim() !== ""),
      };

      onSubmit(formattedQuestion);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const addHint = () => {
    if (editedQuestion) {
      setEditedQuestion({
        ...editedQuestion,
        hints: [...editedQuestion.hints, ""],
      });
    }
  };

  const updateHint = (index: number, value: string) => {
    if (editedQuestion) {
      const updatedHints = [...editedQuestion.hints];
      updatedHints[index] = value;
      setEditedQuestion({
        ...editedQuestion,
        hints: updatedHints,
      });
    }
  };

  const removeHint = (index: number) => {
    if (editedQuestion && editedQuestion.hints.length > 1) {
      const updatedHints = editedQuestion.hints.filter((_, i) => i !== index);
      setEditedQuestion({
        ...editedQuestion,
        hints: updatedHints,
      });
    }
  };

  if (!isOpen || !editedQuestion) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-xl font-semibold text-gray-800">Edit Question</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500">
            <ul className="list-disc list-inside text-red-700 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form fields - scrollable area */}
        <div className="p-6 space-y-5 overflow-y-auto flex-grow">
          {/* Basic question info - two columns for small inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Round
              </label>
              <select
                value={editedQuestion.round}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    round: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>
                    Round {num}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Number
              </label>
              <input
                type="number"
                value={editedQuestion.questionNumber}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    questionNumber: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                min="1"
              />
            </div>
          </div>

          {/* Question content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Content
            </label>
            <textarea
              value={editedQuestion.content}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  content: e.target.value,
                })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-24"
              rows={4}
              placeholder="Enter your question here..."
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <input
              type="text"
              value={editedQuestion.answer}
              onChange={(e) =>
                setEditedQuestion({ ...editedQuestion, answer: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Correct answer"
            />
          </div>

          {/* Hints section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Hints
              </label>
              <button
                type="button"
                onClick={addHint}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Hint
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {editedQuestion.hints.map((hint, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Hint {index + 1}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={hint}
                      onChange={(e) => updateHint(index, e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter hint ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHint(index)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    disabled={editedQuestion.hints.length === 1}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {editedQuestion.hints.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No hints added yet. Click &ldquo;Add Hint&ldquo; to add one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;

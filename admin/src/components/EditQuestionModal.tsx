import { Question } from "@/types";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (question) {
      setEditedQuestion(question);
    }
  }, [question]);

  if (!isOpen || !editedQuestion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
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
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(editedQuestion)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

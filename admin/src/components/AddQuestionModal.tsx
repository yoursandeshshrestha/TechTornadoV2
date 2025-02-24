import { NewQuestion } from "@/types";
import { useState } from "react";

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: NewQuestion) => void;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
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
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(newQuestion)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
};

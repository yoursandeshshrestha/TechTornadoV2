"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Plus, Upload, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { QuestionList } from "@/components/QuestionList";
import { AddQuestionModal } from "@/components/AddQuestionModal";
import { EditQuestionModal } from "@/components/EditQuestionModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useApi } from "@/hooks/useApi";
import type { RootState } from "@/lib/redux/store";
import { NewQuestion, Question } from "@/types";

const validateQuestion = (
  question: Question | NewQuestion,
  existingQuestions: Question[]
): string[] => {
  const errors: string[] = [];

  if (!question.round || ![1, 2, 3].includes(question.round)) {
    errors.push("Round must be 1, 2, or 3");
  }

  if (!question.questionNumber || Number(question.questionNumber) < 1) {
    errors.push("Question number is required and must be positive");
  }

  const isDuplicate = existingQuestions.some(
    (q) =>
      q.round === question.round &&
      q.questionNumber === question.questionNumber &&
      q._id !== (question as Question)._id
  );

  if (isDuplicate) {
    errors.push(
      `Question number ${question.questionNumber} already exists in round ${question.round}`
    );
  }

  if (!question.content?.trim()) {
    errors.push("Question content is required");
  }

  if (!question.answer?.trim()) {
    errors.push("Answer is required");
  }

  if (!Array.isArray(question.hints)) {
    errors.push("Hints must be an array");
  } else {
    question.hints = question.hints.filter((hint) => hint.trim());
  }

  return errors;
};

const QuestionManager = () => {
  const [isQuestionsLocked, setIsQuestionsLocked] = useState(true);
  const [activeRound, setActiveRound] = useState("All Rounds");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { fetchWithErrorHandling, isLoading } = useApi();
  const auth = useSelector((state: RootState) => state.auth);

  // Define fetchAllQuestions with useCallback to prevent recreation on each render
  const fetchAllQuestions = useCallback(async () => {
    try {
      const response = await fetchWithErrorHandling<Question[]>(
        "/api/admin/questions"
      );

      if (response.success && Array.isArray(response.data)) {
        setAllQuestions(response.data);
      } else if (response.message === "No questions found") {
        // Handle the empty questions case gracefully
        console.info("No questions available in the database");
        toast.info("No questions found. Add some questions to get started!");
        setAllQuestions([]);
      } else {
        console.warn("Unexpected response format:", response);
        toast.warning("Unexpected response format from server");
        setAllQuestions([]);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setAllQuestions([]);
      toast.error("Failed to fetch questions. Please try again.");
    }
  }, [fetchWithErrorHandling]);

  // Only fetch questions once when auth.token changes
  useEffect(() => {
    let isMounted = true;
    if (auth.token && isMounted) {
      fetchAllQuestions();
    }
    return () => {
      isMounted = false;
    };
  }, [auth.token, fetchAllQuestions]);

  // Update filtered questions when activeRound or allQuestions change
  useEffect(() => {
    if (activeRound === "All Rounds") {
      setFilteredQuestions(allQuestions);
    } else {
      setFilteredQuestions(
        allQuestions.filter((q) => q.round === Number(activeRound))
      );
    }
  }, [activeRound, allQuestions]);

  const handleAddQuestion = async (newQuestion: NewQuestion) => {
    const errors = validateQuestion(newQuestion, allQuestions);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await fetchWithErrorHandling("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuestion),
      });

      if (response.success) {
        await fetchAllQuestions();
        setIsAddModalOpen(false);
        setValidationErrors([]);
        toast.success("Question added successfully");
      } else {
        if (response.message?.includes("already exists")) {
          setValidationErrors([
            `Question number ${newQuestion.questionNumber} already exists in round ${newQuestion.round}`,
          ]);
        } else {
          setValidationErrors([response.message || "Failed to add question"]);
        }
        toast.error(response.message || "Failed to add question");
      }
    } catch (err: unknown) {
      console.error("Failed to add question:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add question";
      setValidationErrors([errorMessage]);
      toast.error(errorMessage);
    }
  };

  const handleEditQuestion = async (editedQuestion: Question) => {
    const errors = validateQuestion(editedQuestion, allQuestions);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const response = await fetchWithErrorHandling(
        `/api/admin/questions/${editedQuestion._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedQuestion),
        }
      );

      if (response.success) {
        await fetchAllQuestions();
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
        setValidationErrors([]);
        toast.success("Question updated successfully");
      } else {
        if (response.message?.includes("already exists")) {
          setValidationErrors([
            `Question number ${editedQuestion.questionNumber} already exists in round ${editedQuestion.round}`,
          ]);
        } else {
          setValidationErrors([
            response.message || "Failed to update question",
          ]);
        }
        toast.error(response.message || "Failed to update question");
      }
    } catch (err: unknown) {
      console.error("Failed to update question:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update question";
      setValidationErrors([errorMessage]);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      const response = await fetchWithErrorHandling(
        `/api/admin/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success) {
        await fetchAllQuestions();
        setIsDeleteModalOpen(false);
        setSelectedQuestion(null);
        toast.success("Question deleted successfully");
      } else {
        toast.error("Failed to delete question");
      }
    } catch (err) {
      console.error("Failed to delete question:", err);
      toast.error("Failed to delete question");
    }
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      ![
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(file.type)
    ) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("questions", file);

    try {
      const response = await fetchWithErrorHandling(
        "/api/admin/questions/bulk",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.success) {
        await fetchAllQuestions();
        event.target.value = "";
        toast.success("Questions uploaded successfully");
      } else {
        toast.error(response.message || "Failed to upload questions");
      }
    } catch (err) {
      console.error("Failed to upload questions:", err);
    }
  };

  if (!auth.token) {
    return null;
  }

  if (isQuestionsLocked) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <Lock className="h-16 w-16 text-gray-400 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">
            Questions are Locked
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Click the button below to reveal all questions and their answers.
          </p>
          <button
            onClick={() => setIsQuestionsLocked(false)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-all"
          >
            <Unlock className="h-5 w-5" />
            Reveal Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Question Manager</h1>

        <div className="flex gap-4">
          <div className="flex gap-2">
            {["All Rounds", "1", "2", "3"].map((round) => (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    activeRound === round
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {round === "All Rounds" ? round : `Round ${round}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsQuestionsLocked(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Lock className="h-4 w-4" />
            Lock Questions
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow-sm hover:bg-green-700 hover:shadow transition-all"
          >
            <Plus className="h-5 w-5" /> Add Question
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm cursor-pointer hover:bg-blue-700 hover:shadow transition-all">
            <Upload className="h-5 w-5" /> Bulk Upload
            <input
              type="file"
              onChange={handleBulkUpload}
              className="hidden"
              accept=".csv,.xlsx,.xls"
            />
          </label>
        </div>
      </div>

      {filteredQuestions.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-full">
              <Plus className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No questions found
            </h3>
            <p className="text-gray-600 max-w-md">
              {activeRound === "All Rounds"
                ? "There are no questions yet. Click the 'Add Question' button to create your first question."
                : `There are no questions in Round ${activeRound}. Select a different round or add a new question.`}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow-sm hover:bg-green-700 hover:shadow transition-all"
            >
              <Plus className="h-5 w-5" /> Add Question
            </button>
          </div>
        </div>
      ) : (
        <QuestionList
          questions={filteredQuestions}
          onDelete={(question) => {
            setSelectedQuestion(question);
            setIsDeleteModalOpen(true);
          }}
          onEdit={(question) => {
            setSelectedQuestion(question);
            setIsEditModalOpen(true);
          }}
          isLoading={isLoading}
        />
      )}

      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setValidationErrors([]);
        }}
        onSubmit={handleAddQuestion}
        validationErrors={validationErrors}
      />

      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQuestion(null);
          setValidationErrors([]);
        }}
        onSubmit={handleEditQuestion}
        question={selectedQuestion}
        validationErrors={validationErrors}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedQuestion(null);
        }}
        onConfirm={() => {
          if (selectedQuestion?._id) {
            handleDelete(selectedQuestion._id);
          }
        }}
        title="Delete Question"
        message={`Are you sure you want to delete the question: "${selectedQuestion?.content}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default QuestionManager;

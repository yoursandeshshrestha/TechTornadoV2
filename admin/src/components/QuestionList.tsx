import { Question } from "@/types";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

interface QuestionListProps {
  questions: Question[];
  onDelete: (question: Question) => void;
  onEdit: (question: Question) => void;
  isLoading?: boolean;
  error?: string;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onDelete,
  onEdit,
  isLoading = false,
}) => {
  // State to track expanded rows for viewing all hints
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Handle long content with truncation
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "-";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Toggle expanded state for a specific question
  const toggleExpand = (questionId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Show loading state with improved skeleton
  if (isLoading) {
    return (
      <div className="w-full space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="h-6 bg-gray-200 rounded-md w-1/4 animate-pulse" />
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Round
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Question #
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Content
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Answer
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Hints
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {questions.map((question, index) => (
              <React.Fragment key={question._id}>
                <tr
                  className={`
                    transition-colors hover:bg-gray-50
                    ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                  `}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.round || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      #{question.questionNumber || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {truncateText(question.content)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {truncateText(question.answer)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {question.hints && question.hints.length > 0
                          ? truncateText(question.hints[0])
                          : "-"}
                      </div>

                      {question.hints && question.hints.length > 1 && (
                        <button
                          onClick={() => toggleExpand(question._id)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          aria-label={
                            expandedRows[question._id]
                              ? "Collapse hints"
                              : "Expand hints"
                          }
                        >
                          {expandedRows[question._id] ? (
                            <ChevronUp className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      )}

                      {question.hints && question.hints.length > 1 && (
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                          {question.hints.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(question)}
                        className="group p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Edit question"
                      >
                        <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => onDelete(question)}
                        className="group p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Delete question"
                      >
                        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded row for all hints */}
                {expandedRows[question._id] &&
                  question.hints &&
                  question.hints.length > 1 && (
                    <tr
                      key={`hints-${question._id}`}
                      className={`
                      ${index % 2 === 0 ? "bg-gray-50/50" : "bg-gray-100/50"}
                      border-t border-gray-100
                    `}
                    >
                      <td className="px-6 py-4" colSpan={2}>
                        <div className="ml-4 py-1 pl-4 border-l-2 border-indigo-400">
                          <span className="text-xs font-semibold text-indigo-700 uppercase">
                            All Hints
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4" colSpan={4}>
                        <div className="space-y-3">
                          {question.hints.map((hint, hintIndex) => (
                            <div key={hintIndex} className="flex">
                              <span className="text-xs font-medium text-gray-500 mr-2 mt-0.5 min-w-8">
                                #{hintIndex + 1}:
                              </span>
                              <p className="text-sm text-gray-700">{hint}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
              </React.Fragment>
            ))}

            {questions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500 bg-gray-50/50"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium">No questions found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Add some questions to get started
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionList;

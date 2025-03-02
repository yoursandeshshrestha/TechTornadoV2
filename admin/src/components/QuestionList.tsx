import { Question } from "@/types";
import { Pencil, Trash2, FileText } from "lucide-react";

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
  // Handle long content with truncation
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "-";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4">
        <div className="h-10 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 bg-gray-200 rounded-lg w-5/6 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                Hint
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Media
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {questions.map((question, index) => (
              <tr
                key={question._id}
                className={`
                  transition-colors hover:bg-gray-50
                  ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
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
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {question.hints?.length > 0
                      ? truncateText(question.hints[0])
                      : "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {question.media?.image && (
                      <div className="flex items-center text-xs text-gray-600">
                        <div className="h-3.5 w-3.5 mr-1 text-blue-500" />
                        <span
                          className="truncate max-w-[150px]"
                          title={question.media.image.fileName}
                        >
                          {question.media.image.fileName}
                        </span>
                      </div>
                    )}
                    {question.media?.pdf && (
                      <div className="flex items-center text-xs text-gray-600">
                        <FileText className="h-3.5 w-3.5 mr-1 text-red-500" />
                        <span
                          className="truncate max-w-[150px]"
                          title={question.media.pdf.fileName}
                        >
                          {question.media.pdf.fileName}
                        </span>
                      </div>
                    )}
                    {!question.media?.image && !question.media?.pdf && (
                      <span className="text-xs text-gray-400">No media</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
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
            ))}
            {questions.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-gray-500 bg-gray-50/50"
                >
                  <p className="text-sm font-medium">No questions found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add some questions to get started
                  </p>
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

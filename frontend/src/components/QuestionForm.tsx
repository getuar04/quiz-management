import { useState } from "react";
import { quizService } from "../services/api";

interface QuestionFormProps {
  quizId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuestionForm({ quizId, onSuccess, onCancel }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setError("All options must be filled");
      return;
    }
    if (options.length < 2) {
      setError("At least 2 options are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await quizService.addQuestion(quizId, {
        text: questionText,
        options,
        correctAnswer,
        points: 1,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-100 mb-6">Add New Question</h2>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter the question..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Options <span className="text-gray-500 font-normal">(select the correct answer)</span>
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={index}
                    checked={correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span className="text-sm font-bold text-indigo-400 w-5">
                    {String.fromCharCode(65 + index)}
                  </span>
                </label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="w-8 h-8 bg-gray-800 hover:bg-red-900/60 text-gray-500 hover:text-red-300 rounded-lg flex items-center justify-center text-xs transition-colors border border-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-3 px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-800 hover:border-indigo-600 rounded-lg transition-colors"
          >
            + Add Option
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Adding..." : "Add Question"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

import React from 'react'
import { Edit3, ArrowUpDown } from 'lucide-react'
import { ExamQuestion, MatchingPair } from './types'

interface ExamQuestionRendererProps {
  question: ExamQuestion
  matchingPairs: MatchingPair[]
  selectedLeftItem: string | null
  onAnswerSelect: (answer: string | string[]) => void
  onMatchingSelect: (leftItem: string, rightItem: string) => void
  onSetSelectedLeftItem: (item: string | null) => void
}

export function ExamQuestionRenderer({ 
  question, 
  matchingPairs, 
  selectedLeftItem, 
  onAnswerSelect, 
  onMatchingSelect, 
  onSetSelectedLeftItem 
}: ExamQuestionRendererProps) {
  if (!question) return null

  switch (question.type) {
    case 'MCQ':
      return (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 text-sm ${
                question.userAnswer === option
                  ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          ))}
        </div>
      )

    case 'ShortAnswer':
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Type your answer here..."
            value={(question.userAnswer as string) || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex items-center text-sm text-gray-600">
            <Edit3 className="w-4 h-4 mr-2" />
            <span>Provide a concise answer</span>
          </div>
        </div>
      )

    case 'Subjective':
      return (
        <div className="space-y-3">
          <textarea
            placeholder="Write your detailed answer here..."
            value={(question.userAnswer as string) || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
            rows={4}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          />
          <div className="flex items-center text-sm text-gray-600">
            <Edit3 className="w-4 h-4 mr-2" />
            <span>Provide a detailed explanation with examples where appropriate</span>
          </div>
        </div>
      )

    case 'Matching':
      if (matchingPairs.length === 0) {
        return <div className="text-center text-gray-500">Loading matching pairs...</div>
      }

      const leftItems = matchingPairs.map(pair => pair.left)
      const rightItems = [...new Set(matchingPairs.map(pair => pair.right))]

      return (
        <div className="space-y-4">
          <div className="flex items-center text-sm text-blue-600 mb-4">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <span>Click a left item, then click its matching right item</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-center mb-3">Match these items:</h4>
              {leftItems.map((leftItem, index) => {
                const pair = matchingPairs.find(p => p.left === leftItem)
                const isSelected = selectedLeftItem === leftItem
                const isMatched = pair?.matched
                
                return (
                  <button
                    key={index}
                    onClick={() => onSetSelectedLeftItem(isSelected ? null : leftItem)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                      isMatched
                        ? 'bg-green-100 border-green-400 text-green-800'
                        : isSelected
                        ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={isMatched}
                  >
                    {leftItem}
                    {isMatched && (
                      <span className="ml-2 text-green-600">
                        ✓ → {pair.right}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-center mb-3">With these options:</h4>
              {rightItems.map((rightItem, index) => {
                const isMatchedToSelected = matchingPairs.some(
                  pair => pair.right === rightItem && pair.matched
                )
                
                return (
                  <button
                    key={index}
                    onClick={() => selectedLeftItem && onMatchingSelect(selectedLeftItem, rightItem)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                      isMatchedToSelected
                        ? 'bg-green-100 border-green-400 text-green-800'
                        : selectedLeftItem
                        ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!selectedLeftItem || isMatchedToSelected}
                  >
                    {rightItem}
                    {isMatchedToSelected && <span className="ml-2 text-green-600">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-center text-sm text-gray-600">
            Matched: {matchingPairs.filter(p => p.matched).length} / {matchingPairs.length}
          </div>
        </div>
      )

    default:
      return <div className="text-center text-red-600">Unsupported question type: {question.type}</div>
  }
}
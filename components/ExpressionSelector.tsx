import React from 'react';
import type { Expression } from '../types';
import { EXPRESSIONS } from '../constants';
import { Tooltip } from './Tooltip';
import { useTranslations } from '../hooks/useTranslations';

interface ExpressionSelectorProps {
  onExpressionSelect: (expression: Expression) => void;
  selectedExpression: Expression | null;
}

export const ExpressionSelector: React.FC<ExpressionSelectorProps> = ({ onExpressionSelect, selectedExpression }) => {
  const t = useTranslations();
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.expressionsTitle}</h3>
      <div className="grid grid-cols-3 gap-2">
        {EXPRESSIONS.map((expression) => (
          <Tooltip key={expression.id} text={t.expressions[expression.id]} position="top">
            <button
              onClick={() => onExpressionSelect(expression)}
              className={`w-full aspect-square rounded-lg border text-center transition-all duration-200 flex items-center justify-center p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${selectedExpression?.id === expression.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                  : 'bg-white border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-500'
                }
              `}
            >
              <expression.icon className="w-8 h-8" />
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
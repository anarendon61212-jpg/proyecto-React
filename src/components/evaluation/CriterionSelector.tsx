import React from 'react';
import type { CriterionOption, ScaleOption } from '../../types/grade';

type Props = {
  criterion: CriterionOption;
  onChangeScale: (criterionId: string, scaleId: string | null) => void;
  onChangeComment: (criterionId: string, comment: string) => void;
  showError?: boolean;
};

const CriterionSelector: React.FC<Props> = ({ criterion, onChangeScale, onChangeComment, showError = false }) => {
  return (
    <div className={`rounded bg-white p-4 dark:bg-boxdark ${showError ? 'border border-danger' : 'border border-stroke'}`}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-medium text-black dark:text-white">{criterion.name}</p>
          {criterion.weight !== undefined && (
            <p className="text-xs text-bodydark2">Peso: {criterion.weight}%</p>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-black dark:text-white">Nivel</label>
        <select
          value={criterion.selected_scale_id || ''}
          onChange={(e) => onChangeScale(criterion.criterion_id, e.target.value || null)}
          className={`w-full rounded bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark ${showError ? 'border-danger/50' : 'border-stroke'}`}
        >
          <option value="">Selecciona nivel...</option>
          {criterion.scales.map((s: ScaleOption) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-black dark:text-white">Comentario (opcional)</label>
        <textarea
          value={criterion.comment || ''}
          onChange={(e) => onChangeComment(criterion.criterion_id, e.target.value)}
          rows={2}
          className="w-full rounded border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          placeholder="Observaciones por criterio"
        />
        {showError && (
          <p className="mt-2 text-xs text-danger">Falta seleccionar un nivel para este criterio</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(CriterionSelector);

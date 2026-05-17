import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumb';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { asignaturaService } from '../../../services/asignaturaService';
import {
  CriterionApi,
  RubricApi,
  ScaleApi,
  rubricaService,
} from '../../../services/rubricaService';

type SubjectApi = {
  id: string;
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  creditos?: number;
  is_active?: boolean;
  name?: string;
  code?: string;
  description?: string;
  credits?: number;
};

type SubjectAssociationMap = Record<string, string>;

type StoredScaleTemplate = {
  id: string;
  name: string;
  scales: NormalizedScale[];
  createdAt: string;
};

type ReusableScaleOption = {
  id: string;
  name: string;
  scales: NormalizedScale[];
  helperText: string;
  source: 'guardada' | 'criterio';
};

type ScaleForm = {
  localId: string;
  name: string;
  description: string;
  value: string;
};

type CriterionForm = {
  localId: string;
  name: string;
  description: string;
  weight: string;
  scales: ScaleForm[];
};

type NormalizedScale = {
  name: string;
  description: string;
  value: number;
};

type NormalizedCriterion = {
  name: string;
  description: string;
  weight: number;
  scales: NormalizedScale[];
};

type RubricCardData = RubricApi & {
  subjectId: string;
  criteria: CriterionApi[];
  scaleCount: number;
  totalWeight: number;
};

const createLocalId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const createEmptyScale = (): ScaleForm => ({
  localId: createLocalId(),
  name: '',
  description: '',
  value: '',
});

const createEmptyCriterion = (): CriterionForm => ({
  localId: createLocalId(),
  name: '',
  description: '',
  weight: '',
  scales: [createEmptyScale(), createEmptyScale()],
});

const cloneScalesToForm = (scales: NormalizedScale[]): ScaleForm[] =>
  scales.map((scale) => ({
    localId: createLocalId(),
    name: scale.name,
    description: scale.description,
    value: String(scale.value),
  }));

const normalizePersistedScales = (scales: ScaleApi[]): NormalizedScale[] | null => {
  if (scales.length < 2 || scales.length > 5) {
    return null;
  }

  const normalizedScales: NormalizedScale[] = [];
  const usedValues = new Set<number>();

  for (const scale of scales) {
    const scaleName = scale.name.trim();
    const scaleDescription = scale.description.trim();
    const parsedValue = Number(scale.value);

    if (!scaleName || !scaleDescription || !Number.isFinite(parsedValue)) {
      return null;
    }

    if (parsedValue < 0 || parsedValue > 50) {
      return null;
    }

    if (usedValues.has(parsedValue)) {
      return null;
    }

    usedValues.add(parsedValue);
    normalizedScales.push({
      name: scaleName,
      description: scaleDescription,
      value: parsedValue,
    });
  }

  return normalizedScales.sort((left, right) => left.value - right.value);
};

const pickText = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
};

const getSubjectName = (subject?: SubjectApi | null) =>
  pickText(subject?.nombre, subject?.name, 'Asignatura sin nombre');

const getSubjectCode = (subject?: SubjectApi | null) =>
  pickText(subject?.codigo, subject?.code, 'Sin codigo');

const getSubjectLabel = (subject?: SubjectApi | null) =>
  `${getSubjectName(subject)} (${getSubjectCode(subject)})`;

const getRubricStatus = (rubric: RubricApi) => {
  if (rubric.is_archived) {
    return 'Archivada';
  }

  if (rubric.is_public) {
    return 'Publicada';
  }

  return 'Borrador';
};

const getRubricStatusClasses = (rubric: RubricApi) => {
  if (rubric.is_archived) {
    return 'bg-warning/10 text-warning';
  }

  if (rubric.is_public) {
    return 'bg-success/10 text-success';
  }

  return 'bg-primary/10 text-primary';
};

const RubricManager = () => {
  const [subjects, setSubjects] = useState<SubjectApi[]>([]);
  const [rubrics, setRubrics] = useState<RubricApi[]>([]);
  const [criteriaData, setCriteriaData] = useState<CriterionApi[]>([]);
  const [scalesData, setScalesData] = useState<ScaleApi[]>([]);
  const [subjectAssociations, setSubjectAssociations] =
    useLocalStorage<SubjectAssociationMap>('rubric_subject_associations', {});
  const [savedScaleTemplates, setSavedScaleTemplates] =
    useLocalStorage<StoredScaleTemplate[]>('rubric_scale_templates', []);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<CriterionForm[]>([createEmptyCriterion()]);
  const [editingRubricId, setEditingRubricId] = useState<string | null>(null);
  const [selectedReusableScaleByCriterion, setSelectedReusableScaleByCriterion] =
    useState<Record<string, string>>({});
  const [showArchived, setShowArchived] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingAction, setSavingAction] = useState<'draft' | 'publish' | null>(null);

  const activeSubjects = useMemo(
    () => subjects.filter((subject) => subject.is_active !== false),
    [subjects],
  );

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const rubricsById = useMemo(
    () => new Map(rubrics.map((rubric) => [rubric.id, rubric])),
    [rubrics],
  );

  const selectedSubject = useMemo(
    () => (selectedSubjectId ? subjectsById.get(selectedSubjectId) || null : null),
    [selectedSubjectId, subjectsById],
  );

  const totalWeight = useMemo(
    () =>
      criteria.reduce((sum, criterion) => {
        const parsedWeight = Number(criterion.weight);
        return sum + (Number.isFinite(parsedWeight) ? parsedWeight : 0);
      }, 0),
    [criteria],
  );

  const scalesByCriterionId = useMemo(() => {
    const grouped = new Map<string, ScaleApi[]>();

    scalesData.forEach((scale) => {
      const current = grouped.get(scale.criterion_id) || [];
      current.push(scale);
      grouped.set(scale.criterion_id, current);
    });

    return grouped;
  }, [scalesData]);

  const reusableScaleOptions = useMemo(() => {
    const storedOptions: ReusableScaleOption[] = savedScaleTemplates
      .filter((template) => template.scales.length >= 2 && template.scales.length <= 5)
      .map((template) => ({
        id: `saved:${template.id}`,
        name: template.name,
        scales: template.scales,
        helperText: `${template.scales.length} niveles guardados para reutilizar`,
        source: 'guardada',
      }));

    const criterionOptions: ReusableScaleOption[] = criteriaData
      .map((criterion) => {
        const normalizedScales = normalizePersistedScales(
          scalesByCriterionId.get(criterion.id) || [],
        );

        if (!normalizedScales) {
          return null;
        }

        const rubric = rubricsById.get(criterion.rubric_id);

        return {
          id: `criterion:${criterion.id}`,
          name: criterion.name,
          scales: normalizedScales,
          helperText: `${rubric?.title || 'Rubrica'} - ${normalizedScales.length} niveles`,
          source: 'criterio',
        };
      })
      .filter((option): option is ReusableScaleOption => option !== null);

    return [...storedOptions, ...criterionOptions];
  }, [criteriaData, rubricsById, savedScaleTemplates, scalesByCriterionId]);

  const reusableScaleOptionsById = useMemo(
    () => new Map(reusableScaleOptions.map((option) => [option.id, option])),
    [reusableScaleOptions],
  );

  const rubricCards = useMemo(() => {
    const groupedCriteria = new Map<string, CriterionApi[]>();

    criteriaData.forEach((criterion) => {
      const current = groupedCriteria.get(criterion.rubric_id) || [];
      current.push(criterion);
      groupedCriteria.set(criterion.rubric_id, current);
    });

    return rubrics
      .map((rubric) => {
        const rubricCriteria = groupedCriteria.get(rubric.id) || [];
        const scaleCount = rubricCriteria.reduce((sum, criterion) => {
          return sum + (scalesByCriterionId.get(criterion.id)?.length || 0);
        }, 0);
        const totalCriteriaWeight = rubricCriteria.reduce(
          (sum, criterion) => sum + Number(criterion.weight || 0),
          0,
        );

        return {
          ...rubric,
          subjectId: subjectAssociations[rubric.id] || '',
          criteria: rubricCriteria,
          scaleCount,
          totalWeight: totalCriteriaWeight,
        } as RubricCardData;
      })
      .filter((rubric) => (showArchived ? true : !rubric.is_archived))
      .sort((left, right) => {
        const leftDate = new Date(left.updated_at || left.created_at || 0).getTime();
        const rightDate = new Date(right.updated_at || right.created_at || 0).getTime();
        return rightDate - leftDate;
      });
  }, [criteriaData, rubrics, scalesByCriterionId, showArchived, subjectAssociations]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [subjectsResponse, rubricsResponse, criteriaResponse, scalesResponse] =
        await Promise.all([
          asignaturaService.getAsignaturas(),
          rubricaService.getRubrics(),
          rubricaService.getCriteria(),
          rubricaService.getScales(),
        ]);

      setSubjects((subjectsResponse || []) as SubjectApi[]);
      setRubrics(rubricsResponse);
      setCriteriaData(criteriaResponse);
      setScalesData(scalesResponse);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error cargando rubricas';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSelectedSubjectId('');
    setTitle('');
    setDescription('');
    setCriteria([createEmptyCriterion()]);
    setSelectedReusableScaleByCriterion({});
    setEditingRubricId(null);
  };

  const loadRubricIntoForm = (rubricId: string) => {
    const rubric = rubricsById.get(rubricId);
    if (!rubric) {
      toast.error('Rubrica no encontrada');
      return;
    }

    // set high-level fields
    setTitle(rubric.title || '');
    setDescription(rubric.description || '');
    setSelectedSubjectId(subjectAssociations[rubricId] || '');
    setEditingRubricId(rubricId);

    // build criteria forms from loaded data
    const rubricCriteria = criteriaData.filter((c) => c.rubric_id === rubricId);
    if (rubricCriteria.length === 0) {
      setCriteria([createEmptyCriterion()]);
      return;
    }

    const mapped: CriterionForm[] = rubricCriteria.map((c) => {
      const scalesFor = (scalesData || []).filter((s) => s.criterion_id === c.id);
      const scaleForms: ScaleForm[] = scalesFor.length
        ? cloneScalesToForm(
            scalesFor.map((s) => ({ name: s.name, description: s.description, value: Number(s.value) })),
          )
        : [createEmptyScale(), createEmptyScale()];

      return {
        localId: createLocalId(),
        name: c.name,
        description: c.description || '',
        weight: String(c.weight || 0),
        scales: scaleForms,
      };
    });

    setCriteria(mapped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Rubrica cargada para edición');
  };

  const updateCriterion = (
    criterionLocalId: string,
    field: 'name' | 'description' | 'weight',
    value: string,
  ) => {
    setCriteria((current) =>
      current.map((criterion) =>
        criterion.localId === criterionLocalId
          ? { ...criterion, [field]: value }
          : criterion,
      ),
    );
  };

  const addCriterion = () => {
    setCriteria((current) => [...current, createEmptyCriterion()]);
  };

  const removeCriterion = (criterionLocalId: string) => {
    if (criteria.length === 1) {
      toast.error('La rubrica debe tener al menos un criterio');
      return;
    }

    setCriteria((current) =>
      current.filter((criterion) => criterion.localId !== criterionLocalId),
    );
    setSelectedReusableScaleByCriterion((current) => {
      const updated = { ...current };
      delete updated[criterionLocalId];
      return updated;
    });
  };

  const addScale = (criterionLocalId: string) => {
    setCriteria((current) =>
      current.map((criterion) => {
        if (criterion.localId !== criterionLocalId) {
          return criterion;
        }

        if (criterion.scales.length >= 5) {
          toast.error('Cada criterio puede tener maximo 5 escalas');
          return criterion;
        }

        return {
          ...criterion,
          scales: [...criterion.scales, createEmptyScale()],
        };
      }),
    );
  };

  const removeScale = (criterionLocalId: string, scaleLocalId: string) => {
    setCriteria((current) =>
      current.map((criterion) => {
        if (criterion.localId !== criterionLocalId) {
          return criterion;
        }

        if (criterion.scales.length <= 2) {
          toast.error('Cada criterio debe tener al menos 2 escalas');
          return criterion;
        }

        return {
          ...criterion,
          scales: criterion.scales.filter((scale) => scale.localId !== scaleLocalId),
        };
      }),
    );
  };

  const updateScale = (
    criterionLocalId: string,
    scaleLocalId: string,
    field: 'name' | 'description' | 'value',
    value: string,
  ) => {
    setCriteria((current) =>
      current.map((criterion) => {
        if (criterion.localId !== criterionLocalId) {
          return criterion;
        }

        return {
          ...criterion,
          scales: criterion.scales.map((scale) =>
            scale.localId === scaleLocalId ? { ...scale, [field]: value } : scale,
          ),
        };
      }),
    );
  };

  const normalizeCriterionScales = (
    criterion: CriterionForm,
    criterionIndex: number,
  ): NormalizedScale[] | null => {
    if (criterion.scales.length < 2 || criterion.scales.length > 5) {
      toast.error(`El criterio ${criterionIndex + 1} debe tener entre 2 y 5 escalas`);
      return null;
    }

    const normalizedScales: NormalizedScale[] = [];
    const usedValues = new Set<number>();

    for (let scaleIndex = 0; scaleIndex < criterion.scales.length; scaleIndex += 1) {
      const scale = criterion.scales[scaleIndex];
      const scaleName = scale.name.trim();
      const scaleDescription = scale.description.trim();
      const parsedValue = Number(scale.value);

      if (!scaleName) {
        toast.error(
          `La escala ${scaleIndex + 1} del criterio ${criterionIndex + 1} debe tener nombre`,
        );
        return null;
      }

      if (!scaleDescription) {
        toast.error(
          `La escala ${scaleIndex + 1} del criterio ${criterionIndex + 1} debe tener descripcion`,
        );
        return null;
      }

      if (!Number.isFinite(parsedValue)) {
        toast.error(
          `La escala ${scaleIndex + 1} del criterio ${criterionIndex + 1} debe tener un valor numerico`,
        );
        return null;
      }

      if (parsedValue < 0 || parsedValue > 50) {
        toast.error(
          `La escala ${scaleIndex + 1} del criterio ${criterionIndex + 1} debe tener un valor entre 0 y 50`,
        );
        return null;
      }

      if (usedValues.has(parsedValue)) {
        toast.error(
          `Los valores de escala del criterio ${criterionIndex + 1} no pueden repetirse`,
        );
        return null;
      }

      usedValues.add(parsedValue);
      normalizedScales.push({
        name: scaleName,
        description: scaleDescription,
        value: parsedValue,
      });
    }

    return normalizedScales.sort((left, right) => left.value - right.value);
  };

  const applyReusableScale = (criterionLocalId: string) => {
    const reusableScaleId = selectedReusableScaleByCriterion[criterionLocalId];

    if (!reusableScaleId) {
      toast.error('Selecciona una escala reutilizable');
      return;
    }

    const selectedScaleOption = reusableScaleOptionsById.get(reusableScaleId);

    if (!selectedScaleOption) {
      toast.error('La escala reutilizable seleccionada ya no esta disponible');
      return;
    }

    setCriteria((current) =>
      current.map((criterion) =>
        criterion.localId === criterionLocalId
          ? { ...criterion, scales: cloneScalesToForm(selectedScaleOption.scales) }
          : criterion,
      ),
    );

    toast.success('La escala se aplico al criterio');
  };

  const saveScaleTemplate = async (
    criterion: CriterionForm,
    criterionIndex: number,
  ) => {
    const normalizedScales = normalizeCriterionScales(criterion, criterionIndex);

    if (!normalizedScales) {
      return;
    }

    const defaultTemplateName = criterion.name.trim()
      ? `Escala ${criterion.name.trim()}`
      : `Escala criterio ${criterionIndex + 1}`;

    const result = await Swal.fire({
      title: 'Guardar escala reutilizable',
      input: 'text',
      inputLabel: 'Nombre de la escala',
      inputValue: defaultTemplateName,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Ingresa un nombre para la escala';
        }

        return undefined;
      },
    });

    if (!result.isConfirmed || !result.value?.trim()) {
      return;
    }

    setSavedScaleTemplates((current) => [
      {
        id: createLocalId(),
        name: result.value.trim(),
        scales: normalizedScales,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    toast.success('La escala se guardo para reutilizarla en otros criterios');
  };

  const validateForm = (): NormalizedCriterion[] | null => {
    if (!selectedSubjectId) {
      toast.error('Selecciona una asignatura');
      return null;
    }

    if (!title.trim()) {
      toast.error('El nombre de la rubrica es obligatorio');
      return null;
    }

    if (!description.trim()) {
      toast.error('La descripcion de la rubrica es obligatoria');
      return null;
    }

    if (criteria.length === 0) {
      toast.error('Agrega al menos un criterio');
      return null;
    }

    const normalizedCriteria: NormalizedCriterion[] = [];
    let computedWeight = 0;

    for (let index = 0; index < criteria.length; index += 1) {
      const criterion = criteria[index];
      const criterionName = criterion.name.trim();
      const criterionDescription = criterion.description.trim();
      const parsedWeight = Number(criterion.weight);

      if (!criterionName) {
        toast.error(`El criterio ${index + 1} debe tener nombre`);
        return null;
      }

      if (!criterionDescription) {
        toast.error(`El criterio ${index + 1} debe tener descripcion`);
        return null;
      }

      if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
        toast.error(`El criterio ${index + 1} debe tener un peso valido`);
        return null;
      }

      const normalizedScales = normalizeCriterionScales(criterion, index);

      if (!normalizedScales) {
        return null;
      }

      computedWeight += parsedWeight;
      normalizedCriteria.push({
        name: criterionName,
        description: criterionDescription,
        weight: parsedWeight,
        scales: normalizedScales,
      });
    }

    if (Math.abs(computedWeight - 100) > 0.01) {
      toast.error('La suma de los pesos debe ser exactamente 100%');
      return null;
    }

    return normalizedCriteria;
  };

  const persistRubric = async (action: 'draft' | 'publish') => {
    const normalizedCriteria = validateForm();
    if (!normalizedCriteria) {
      return;
    }

    setSavingAction(action);

    try {
      let rubric;

      if (editingRubricId) {
        // update existing rubric
        rubric = await rubricaService.updateRubric(editingRubricId, {
          title: title.trim(),
          description: description.trim(),
        });

        // delete existing criteria & scales for this rubric, then recreate
        const existingCriteria = criteriaData.filter((c) => c.rubric_id === editingRubricId);
        for (const ex of existingCriteria) {
          const existingScales = scalesData.filter((s) => s.criterion_id === ex.id);
          for (const sc of existingScales) {
            try {
              await rubricaService.deleteScale(sc.id);
            } catch (e) {
              // ignore individual delete errors
            }
          }

          try {
            await rubricaService.deleteCriterion(ex.id);
          } catch (e) {
            // ignore
          }
        }

        // recreate criteria and scales
        for (const criterion of normalizedCriteria) {
          const createdCriterion = await rubricaService.createCriterion({
            rubric_id: rubric.id,
            name: criterion.name,
            description: criterion.description,
            weight: criterion.weight,
          });

          for (const scale of criterion.scales) {
            await rubricaService.createScale({
              criterion_id: createdCriterion.id,
              name: scale.name,
              description: scale.description,
              value: scale.value,
            });
          }
        }
      } else {
        // create new rubric
        rubric = await rubricaService.createRubric({
          title: title.trim(),
          description: description.trim(),
          is_public: false,
          is_archived: false,
        });

        for (const criterion of normalizedCriteria) {
          const createdCriterion = await rubricaService.createCriterion({
            rubric_id: rubric.id,
            name: criterion.name,
            description: criterion.description,
            weight: criterion.weight,
          });

          for (const scale of criterion.scales) {
            await rubricaService.createScale({
              criterion_id: createdCriterion.id,
              name: scale.name,
              description: scale.description,
              value: scale.value,
            });
          }
        }
      }

      setSubjectAssociations((current) => ({
        ...current,
        [rubric.id]: selectedSubjectId,
      }));

      if (action === 'publish') {
        try {
          await rubricaService.publishRubric(rubric.id);
          toast.success('Rubrica publicada correctamente');
        } catch (error: any) {
          const publishMessage =
            error.response?.data?.message ||
            'No fue posible publicar la rubrica';
          toast.error(
            `La rubrica se guardo como borrador, pero no se pudo publicar: ${publishMessage}`,
          );
        }
      } else {
        toast.success(editingRubricId ? 'Rubrica actualizada' : 'Rubrica guardada como borrador');
      }

      resetForm();
      await loadData();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al guardar la rubrica';
      toast.error(errorMessage);
    } finally {
      setSavingAction(null);
    }
  };

  const isFormValidForPublish = (): boolean => {
    if (!selectedSubjectId) return false;
    if (!title.trim() || !description.trim()) return false;
    if (criteria.length === 0) return false;

    // check weights and scales quickly without toasts
    let computedWeight = 0;
    for (const criterion of criteria) {
      const parsedWeight = Number(criterion.weight);
      if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) return false;
      if (criterion.scales.length < 2 || criterion.scales.length > 5) return false;

      const used = new Set<number>();
      for (const scale of criterion.scales) {
        const val = Number(scale.value);
        if (
          !scale.name.trim() ||
          !scale.description.trim() ||
          !Number.isFinite(val) ||
          val < 0 ||
          val > 50
        )
          return false;
      }

      computedWeight += parsedWeight;
    }

    if (Math.abs(computedWeight - 100) > 0.01) return false;
    return true;
  };

  const handlePublishDraft = async (rubric: RubricCardData) => {
    const result = await Swal.fire({
      title: 'Publicar rubrica',
      text: `Se publicara la rubrica "${rubric.title}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, publicar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    if (!subjectAssociations[rubric.id]) {
      toast.error('Asocia una asignatura a la rúbrica antes de publicarla');
      return;
    }

    if (!rubric.title?.trim()) {
      toast.error('La rúbrica debe tener un nombre antes de publicarse');
      return;
    }

    if (!rubric.description?.trim()) {
      toast.error('La rúbrica debe tener una descripción antes de publicarse');
      return;
    }

    if ((rubric.criteria || []).length === 0) {
      toast.error('La rúbrica no tiene criterios y no puede publicarse');
      return;
    }

    if (rubric.criteria.some((criterion) => !criterion.description?.trim())) {
      toast.error('Todos los criterios deben tener descripción antes de publicar');
      return;
    }

    if (Math.abs((rubric.totalWeight || 0) - 100) > 0.01) {
      toast.error('La suma de los pesos de los criterios debe ser 100% antes de publicar');
      return;
    }

    try {
      await rubricaService.publishRubric(rubric.id);
      toast.success('Rubrica publicada correctamente');
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al publicar la rubrica',
      );
    }
  };

  const handleArchiveRubric = async (rubric: RubricCardData) => {
    const result = await Swal.fire({
      title: 'Archivar rubrica',
      text: `La rubrica "${rubric.title}" quedara archivada`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, archivar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await rubricaService.updateRubric(rubric.id, { is_archived: true });
      toast.success('Rubrica archivada correctamente');
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al archivar la rubrica',
      );
    }
  };

  const handleDeleteDraft = async (rubric: RubricCardData) => {
    if (rubric.is_public) {
      toast.error('Una rubrica publicada no puede eliminarse, solo archivarse');
      return;
    }

    const result = await Swal.fire({
      title: 'Eliminar borrador',
      text: `Se eliminara la rubrica "${rubric.title}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await rubricaService.deleteRubric(rubric.id);
      setSubjectAssociations((current) => {
        const updated = { ...current };
        delete updated[rubric.id];
        return updated;
      });
      toast.success('Rubrica eliminada correctamente');
      await loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al eliminar la rubrica',
      );
    }
  };

  return (
    <>
      <Breadcrumb pageName="Rubricas de Evaluacion" />

      <div className="space-y-6">
        <div className="rounded-sm border border-stroke bg-white px-5 pb-6 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <div className="mb-6 flex flex-col gap-2">
            <h3 className="text-xl font-bold text-black dark:text-white">
              Crear Rubrica
            </h3>
            <p className="text-sm text-bodydark2">
              Define la rubrica, sus criterios y las escalas necesarias para poder
              guardarla como borrador o publicarla.
            </p>
            <p className="text-sm text-bodydark2">
              Tambien puedes reutilizar escalas guardadas o escalas ya definidas
              previamente en otros criterios.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Asignatura
              </label>
              <select
                value={selectedSubjectId}
                onChange={(event) => setSelectedSubjectId(event.target.value)}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
              >
                <option value="">Selecciona una asignatura...</option>
                {activeSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {getSubjectLabel(subject)}
                  </option>
                ))}
              </select>
              {selectedSubject && (
                <p className="mt-1 text-xs text-bodydark2">
                  Rubrica para: {getSubjectLabel(selectedSubject)}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Nombre de la rubrica
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: Rubrica de proyecto final"
                className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
              />
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Descripcion
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Describe el objetivo y uso de la rubrica"
                className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
              />
            </div>

            <div className="rounded border border-stroke bg-gray-1 p-4 dark:border-strokedark dark:bg-meta-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-semibold text-black dark:text-white">
                    Criterios
                  </h4>
                  <p className="text-sm text-bodydark2">
                    Los pesos de todos los criterios deben sumar exactamente 100%.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-3 py-1 text-xs font-medium ${
                      Math.abs(totalWeight - 100) < 0.01
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    Peso acumulado: {totalWeight}%
                  </span>
                  <button
                    type="button"
                    onClick={addCriterion}
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                  >
                    Agregar criterio
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {criteria.map((criterion, criterionIndex) => (
                  <div
                    key={criterion.localId}
                    className="rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h5 className="font-medium text-black dark:text-white">
                        Criterio {criterionIndex + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeCriterion(criterion.localId)}
                        className="text-sm font-medium text-danger hover:opacity-80"
                      >
                        Eliminar criterio
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(event) =>
                            updateCriterion(
                              criterion.localId,
                              'name',
                              event.target.value,
                            )
                          }
                          placeholder="Ej: Presentacion"
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Peso porcentual
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="0.01"
                          value={criterion.weight}
                          onChange={(event) =>
                            updateCriterion(
                              criterion.localId,
                              'weight',
                              event.target.value,
                            )
                          }
                          placeholder="Ej: 25"
                          className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Descripcion
                      </label>
                      <textarea
                        value={criterion.description}
                        onChange={(event) =>
                          updateCriterion(
                            criterion.localId,
                            'description',
                            event.target.value,
                          )
                        }
                        rows={3}
                        placeholder="Describe lo que evaluara este criterio"
                        className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
                      />
                    </div>

                    <div className="mt-5 rounded border border-stroke bg-gray-1 p-4 dark:border-strokedark dark:bg-meta-4">
                      <div className="mb-4 flex flex-col gap-4">
                        <div>
                          <h6 className="font-medium text-black dark:text-white">
                            Escalas del criterio
                          </h6>
                          <p className="text-sm text-bodydark2">
                            Cada criterio debe tener entre 2 y 5 escalas para
                            poder publicarse y sus valores deben ser unicos.
                          </p>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                              Reutilizar escala previa
                            </label>
                            <select
                              value={
                                selectedReusableScaleByCriterion[criterion.localId] || ''
                              }
                              onChange={(event) =>
                                setSelectedReusableScaleByCriterion((current) => ({
                                  ...current,
                                  [criterion.localId]: event.target.value,
                                }))
                              }
                              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
                            >
                              <option value="">Selecciona una escala...</option>
                              {reusableScaleOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.name} -{' '}
                                  {option.source === 'guardada'
                                    ? 'Plantilla guardada'
                                    : 'Criterio existente'}
                                </option>
                              ))}
                            </select>
                            {selectedReusableScaleByCriterion[criterion.localId] &&
                              reusableScaleOptionsById.get(
                                selectedReusableScaleByCriterion[criterion.localId],
                              ) && (
                                <p className="mt-1 text-xs text-bodydark2">
                                  {
                                    reusableScaleOptionsById.get(
                                      selectedReusableScaleByCriterion[criterion.localId],
                                    )?.helperText
                                  }
                                </p>
                              )}
                            {reusableScaleOptions.length === 0 && (
                              <p className="mt-1 text-xs text-bodydark2">
                                Aun no hay escalas reutilizables disponibles.
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => applyReusableScale(criterion.localId)}
                            className="rounded border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                          >
                            Aplicar escala
                          </button>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                saveScaleTemplate(criterion, criterionIndex)
                              }
                              className="rounded border border-success px-4 py-2 text-sm font-medium text-success hover:bg-success hover:text-white"
                            >
                              Guardar plantilla
                            </button>
                            <button
                              type="button"
                              onClick={() => addScale(criterion.localId)}
                              className="rounded border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                            >
                              Agregar escala
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {criterion.scales.map((scale, scaleIndex) => (
                          <div
                            key={scale.localId}
                            className="rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-black dark:text-white">
                                Escala {scaleIndex + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  removeScale(criterion.localId, scale.localId)
                                }
                                className="text-sm font-medium text-danger hover:opacity-80"
                              >
                                Eliminar escala
                              </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                  Nombre
                                </label>
                                <input
                                  type="text"
                                  value={scale.name}
                                  onChange={(event) =>
                                    updateScale(
                                      criterion.localId,
                                      scale.localId,
                                      'name',
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Ej: Excelente"
                                  className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                  Descripcion
                                </label>
                                <input
                                  type="text"
                                  value={scale.description}
                                  onChange={(event) =>
                                    updateScale(
                                      criterion.localId,
                                      scale.localId,
                                      'description',
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Describe el nivel de desempeno"
                                  className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Valor numerico
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.01"
                                value={scale.value}
                                onChange={(event) =>
                                  updateScale(
                                    criterion.localId,
                                    scale.localId,
                                    'value',
                                    event.target.value,
                                  )
                                }
                                placeholder="Ej: 4"
                                className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => persistRubric('draft')}
                disabled={savingAction !== null}
                className="flex-1 rounded border border-primary px-5 py-3 font-medium text-primary hover:bg-primary hover:text-white disabled:opacity-50"
              >
                {savingAction === 'draft'
                  ? 'Guardando borrador...'
                  : 'Guardar como borrador'}
              </button>

              <button
                type="button"
                onClick={() => persistRubric('publish')}
                disabled={savingAction !== null || !isFormValidForPublish()}
                className="flex-1 rounded bg-primary px-5 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                {savingAction === 'publish'
                  ? 'Publicando...'
                  : 'Guardar y publicar'}
              </button>
            </div>
            {!isFormValidForPublish() && (
              <p className="mt-2 text-sm text-warning">
                No se puede publicar: revisa que la rúbrica tenga una asignatura seleccionada, los criterios y escalas válidos, y que la suma de pesos sea 100%.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pb-6 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Rubricas Registradas
              </h3>
              <p className="text-sm text-bodydark2">
                Los borradores pueden eliminarse. Las publicadas solo pueden archivarse.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(event) => setShowArchived(event.target.checked)}
                className="rounded border-stroke"
              />
              Mostrar archivadas
            </label>
          </div>

          {loading ? (
            <div className="py-8 text-center text-bodydark2">Cargando...</div>
          ) : rubricCards.length === 0 ? (
            <div className="py-8 text-center text-bodydark2">
              No hay rubricas registradas.
            </div>
          ) : (
            <div className="space-y-4">
              {rubricCards.map((rubric) => {
                const associatedSubject = subjectsById.get(rubric.subjectId);

                return (
                  <div
                    key={rubric.id}
                    className="rounded border border-stroke bg-white p-5 dark:border-strokedark dark:bg-boxdark"
                  >
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-semibold text-black dark:text-white">
                            {rubric.title}
                          </h4>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getRubricStatusClasses(
                              rubric,
                            )}`}
                          >
                            {getRubricStatus(rubric)}
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-bodydark2">
                          {rubric.description || 'Sin descripcion'}
                        </p>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                            Asignatura asociada
                          </label>
                          <select
                            value={subjectAssociations[rubric.id] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSubjectAssociations((current) => ({
                                ...current,
                                [rubric.id]: value,
                              }));
                              toast.success('Asignatura asociada actualizada');
                            }}
                            className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
                          >
                            <option value="">Sin asignar</option>
                            {activeSubjects.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {getSubjectLabel(sub)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => loadRubricIntoForm(rubric.id)}
                          className="rounded border border-secondary px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary hover:text-white"
                        >
                          Editar
                        </button>
                        {!rubric.is_public && !rubric.is_archived && (
                          <button
                            type="button"
                            onClick={() => handlePublishDraft(rubric)}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                          >
                            Publicar
                          </button>
                        )}

                        {rubric.is_public && !rubric.is_archived && (
                          <button
                            type="button"
                            onClick={() => handleArchiveRubric(rubric)}
                            className="rounded border border-warning px-4 py-2 text-sm font-medium text-warning hover:bg-warning hover:text-white"
                          >
                            Archivar
                          </button>
                        )}

                        {!rubric.is_public && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDraft(rubric)}
                            className="rounded border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger hover:text-white"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {rubric.criteria.length} criterio(s)
                      </span>
                      <span className="rounded bg-success/10 px-3 py-1 text-xs font-medium text-success">
                        Peso total: {rubric.totalWeight}%
                      </span>
                      <span className="rounded bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                        {rubric.scaleCount} escala(s)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {rubric.criteria.map((criterion) => (
                        <div
                          key={criterion.id}
                          className="rounded border border-stroke bg-gray-1 px-4 py-3 dark:border-strokedark dark:bg-meta-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-black dark:text-white">
                                {criterion.name}
                              </p>
                              <p className="text-sm text-bodydark2">
                                {criterion.description || 'Sin descripcion'}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                Peso: {criterion.weight}%
                              </span>
                              <span className="rounded bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                Escalas:{' '}
                                {scalesByCriterionId.get(criterion.id)?.length || 0}
                              </span>
                            </div>
                          </div>

                          {(scalesByCriterionId.get(criterion.id)?.length || 0) > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(scalesByCriterionId.get(criterion.id) || [])
                                .slice()
                                .sort(
                                  (left, right) =>
                                    Number(left.value) - Number(right.value),
                                )
                                .map((scale) => (
                                  <span
                                    key={scale.id}
                                    className="rounded bg-white px-2.5 py-1 text-xs font-medium text-black dark:bg-boxdark dark:text-white"
                                  >
                                    {scale.name}: {scale.value}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RubricManager;

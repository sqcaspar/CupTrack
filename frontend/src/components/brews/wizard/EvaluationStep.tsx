import React, { useState } from 'react';
import { 
  BrewEvaluation, 
  QuickEvaluation, 
  SCAEvaluation, 
  CVAAffectiveEvaluation, 
  CVADescriptiveEvaluation, 
  calculateCVAAffectiveScore,
  calculateSCAFinalScore,
  getSCAAQualityClassification,
  SCAA_TAINT_DEFECTS,
  SCAA_FAULT_DEFECTS,
  SCAA_CONSTANTS
} from '../../../types/brew';
import { SCASlider } from '../../ui/SCASlider';
import { SCAIntensitySlider } from '../../ui/SCAIntensitySlider';
import { SCAOrthonasalCheckboxes, SCAMainTastesCheckboxes, SCAMouthfeelCheckboxes } from '../../ui/SCADescriptorCheckboxes';
import { SCAAcidityDescriptors, SCASweetnessDescriptors } from '../../ui/SCAFreeTextInput';
import '../../ui/SCASlider.css';
import '../../ui/SCAIntensitySlider.css';
import '../../ui/SCADescriptorCheckboxes.css';
import '../../ui/SCAFreeTextInput.css';
import '../../../styles/SCADescriptiveAssessment.css';
import '../../../styles/SCAAProtocol.css';

interface EvaluationStepProps {
  data?: BrewEvaluation;
  errors: Record<string, string>;
  onChange: (data?: BrewEvaluation) => void;
}

export const EvaluationStep: React.FC<EvaluationStepProps> = ({
  data,
  errors,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    data?.type || 'quick'
  );
  
  // Store all evaluation types to preserve data across tab switches
  const [allEvaluations, setAllEvaluations] = useState<{
    quick?: QuickEvaluation;
    sca?: SCAEvaluation;
    cva_affective?: CVAAffectiveEvaluation;
    cva_descriptive?: CVADescriptiveEvaluation;
  }>(() => {
    if (data) {
      return { [data.type]: data };
    }
    return {};
  });

  const handleTabChange = (type: string) => {
    setActiveTab(type);
    
    // Get or create evaluation for this type
    let evaluation = allEvaluations[type as keyof typeof allEvaluations];
    
    if (!evaluation) {
      // Initialize default evaluation data
      const baseEvaluation = {
        type: type as 'quick' | 'sca' | 'cva_affective' | 'cva_descriptive',
        notes: data?.notes || ''
      };

      switch (type) {
        case 'quick':
          evaluation = {
            ...baseEvaluation,
            type: 'quick',
            overallQuality: 7
          };
          break;
        
        case 'sca':
          const defaultScores = {
            fragrance: 8.00,     // SCAA baseline - quarter-point increment
            aroma: 8.00,
            flavor: 8.00,
            aftertaste: 7.75,   // Valid quarter-point
            acidity: 7.75,      // Valid quarter-point
            body: 7.75,         // Valid quarter-point
            balance: 7.50,      // Fixed to quarter-point (was 7.5)
            uniformity: 8.00,   // NEW - typically scored high
            cleanCup: 8.00,     // NEW - typically scored high  
            sweetness: 7.75,    // NEW
            overall: 8.00
          };
          
          const defaultDefects = {
            taints: { count: 0, types: [], descriptions: [] },
            faults: { count: 0, types: [], descriptions: [] },
            totalPenalty: 0
          };
          
          const defaultProcedure = {
            evaluationTemperature: {
              start: SCAA_CONSTANTS.TEMPERATURE.INITIAL,
              end: SCAA_CONSTANTS.TEMPERATURE.TASTE_END
            },
            evaluationTime: {},
            cupsEvaluated: 5,
            cupperName: ''
          };
          
          evaluation = {
            ...baseEvaluation,
            type: 'sca',
            scores: defaultScores,
            defects: defaultDefects,
            procedure: defaultProcedure,
            finalScore: calculateSCAFinalScore(defaultScores, defaultDefects),
            qualityClassification: getSCAAQualityClassification(calculateSCAFinalScore(defaultScores, defaultDefects))
          };
          break;
        
        case 'cva_affective':
          evaluation = {
            ...baseEvaluation,
            type: 'cva_affective',
            sections: {
              fragrance: 5,     // SCA neutral point
              aroma: 5,
              flavor: 5,
              aftertaste: 5,
              acidity: 5,
              sweetness: 5,
              mouthfeel: 5,
              overall: 5
            },
            nonUniformCups: 0,
            defectiveCups: 0,
            scaScore: calculateCVAAffectiveScore({
              fragrance: 5, aroma: 5, flavor: 5, aftertaste: 5,
              acidity: 5, sweetness: 5, mouthfeel: 5, overall: 5
            }, 0, 0)
          };
          break;
        
        case 'cva_descriptive':
          evaluation = {
            ...baseEvaluation,
            type: 'cva_descriptive',
            fragrance: {
              intensity: 7,
              orthonasal: [],
              notes: ''
            },
            aroma: {
              intensity: 7,
              notes: ''
            },
            flavor: {
              intensity: 7,
              retronasal: [],
              mainTastes: [],
              notes: ''
            },
            aftertaste: {
              intensity: 7,
              notes: ''
            },
            acidity: {
              intensity: 7,
              descriptors: [],
              notes: ''
            },
            sweetness: {
              intensity: 7,
              descriptors: [],
              notes: ''
            },
            mouthfeel: {
              intensity: 7,
              characteristics: [],
              notes: ''
            },
            roastLevel: '',
            sampleNumber: ''
          };
          break;
      }
      
      // Update our internal state
      setAllEvaluations(prev => ({
        ...prev,
        [type]: evaluation
      }));
    }
    
    // Update parent with current evaluation
    onChange(evaluation);
  };
  
  const updateCurrentEvaluation = (updates: any) => {
    const currentEval = allEvaluations[activeTab as keyof typeof allEvaluations];
    if (currentEval) {
      const updatedEval = { ...currentEval, ...updates };
      setAllEvaluations(prev => ({
        ...prev,
        [activeTab]: updatedEval
      }));
      onChange(updatedEval);
    }
  };
  
  const isTabCompleted = (type: string) => {
    const evaluation = allEvaluations[type as keyof typeof allEvaluations];
    if (!evaluation) return false;
    
    switch (type) {
      case 'quick':
        return true; // Quick always has default value
      case 'sca':
        const scaEvaluation = evaluation as SCAEvaluation;
        return evaluation.type === 'sca' && 
               scaEvaluation.scores &&
               Object.values(scaEvaluation.scores).every((score: number) => score >= 6.0 && score <= 9.0) &&
               scaEvaluation.defects &&
               typeof scaEvaluation.finalScore === 'number';
      case 'cva_affective':
        return evaluation.type === 'cva_affective' && 
               Object.values((evaluation as CVAAffectiveEvaluation).sections).every(score => score >= 1 && score <= 9);
      case 'cva_descriptive':
        const descEval = evaluation as CVADescriptiveEvaluation;
        return evaluation.type === 'cva_descriptive' && 
               descEval.fragrance?.intensity >= 0 && descEval.aroma?.intensity >= 0 &&
               descEval.flavor?.intensity >= 0 && descEval.aftertaste?.intensity >= 0 &&
               descEval.acidity?.intensity >= 0 && descEval.sweetness?.intensity >= 0 &&
               descEval.mouthfeel?.intensity >= 0;
      default:
        return false;
    }
  };

  const getCurrentEvaluation = () => {
    return allEvaluations[activeTab as keyof typeof allEvaluations] || data;
  };

  const renderEvaluationForm = () => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return null;

    switch (activeTab) {
      case 'quick':
        const quickEval = currentEval as QuickEvaluation;
        return (
          <div className="quick-evaluation">
            <div className="form-group">
              <label className="form-label">Overall Quality (1-10)</label>
              <div className="rating-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={quickEval?.overallQuality || 7}
                  onChange={(e) => updateCurrentEvaluation({
                    overallQuality: parseFloat(e.target.value)
                  })}
                  className="slider"
                />
                <div className="slider-value">{quickEval?.overallQuality || 7}/10</div>
              </div>
              <div className="rating-labels">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        );

      case 'sca':
        const scaEval = currentEval as SCAEvaluation;
        
        const updateSCAScore = (attribute: string, value: number) => {
          const updatedScores = {
            ...scaEval?.scores,
            [attribute]: value
          };
          
          const finalScore = calculateSCAFinalScore(updatedScores, scaEval?.defects || {
            taints: { count: 0, types: [], descriptions: [] },
            faults: { count: 0, types: [], descriptions: [] }, 
            totalPenalty: 0
          });
          
          updateCurrentEvaluation({
            scores: updatedScores,
            finalScore,
            qualityClassification: getSCAAQualityClassification(finalScore)
          });
        };
        
        const updateSCADefects = (defectType: 'taints' | 'faults', field: string, value: any) => {
          const currentDefects = scaEval?.defects || {
            taints: { count: 0, types: [], descriptions: [] },
            faults: { count: 0, types: [], descriptions: [] },
            totalPenalty: 0
          };
          
          const updatedDefects = {
            ...currentDefects,
            [defectType]: {
              ...currentDefects[defectType],
              [field]: value
            }
          };
          
          // Recalculate total penalty
          updatedDefects.totalPenalty = (updatedDefects.taints.count * 2) + (updatedDefects.faults.count * 4);
          
          const finalScore = calculateSCAFinalScore(scaEval?.scores || {}, updatedDefects);
          
          updateCurrentEvaluation({
            defects: updatedDefects,
            finalScore,
            qualityClassification: getSCAAQualityClassification(finalScore)
          });
        };

        return (
          <div className="scaa-cupping-evaluation">
            <div className="scaa-header">
              <h4>SCAA Cupping Protocols 2005 - Official SCA Protocol</h4>
              <p className="scaa-description">
                Professional coffee cupping evaluation using the <strong>official SCAA standard</strong> with 
                11 flavor attributes scored on a 6.00-9.00 scale in quarter-point increments.
              </p>
            </div>

            {/* Evaluation Procedure Guidance */}
            <div className="scaa-procedure-guide">
              <h5>📋 Official SCAA Cupping Procedure</h5>
              <div className="procedure-steps">
                <div className="procedure-step">
                  <strong>1. Fragrance (200°F):</strong> Evaluate dry grounds before adding water
                </div>
                <div className="procedure-step">
                  <strong>2. Aroma (200°F):</strong> Break crust and evaluate wet aroma
                </div>
                <div className="procedure-step">
                  <strong>3. Tasting (160°F-70°F):</strong> Taste and evaluate as coffee cools
                </div>
              </div>
            </div>

            {/* 11 SCAA Flavor Attributes */}
            <div className="scaa-attributes-grid">
              <h5>SCAA 11 Flavor Attributes (6.00-9.00 Scale)</h5>
              
              {/* Primary Attributes */}
              <div className="attributes-section">
                <h6>Primary Flavor Assessment</h6>
                <div className="attributes-grid">
                  <div className="attribute-group">
                    <label className="attribute-label">Fragrance (Dry Grounds)</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.fragrance || 8.0}
                      onChange={(e) => updateSCAScore('fragrance', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Orthonasal smell of dry grounds</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Aroma (Wet Grounds)</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.aroma || 8.0}
                      onChange={(e) => updateSCAScore('aroma', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">After crust breaking</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Flavor</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.flavor || 8.0}
                      onChange={(e) => updateSCAScore('flavor', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Primary taste impression</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Aftertaste</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.aftertaste || 7.75}
                      onChange={(e) => updateSCAScore('aftertaste', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Lingering taste after swallowing</div>
                  </div>
                </div>
              </div>

              {/* Secondary Attributes */}
              <div className="attributes-section">
                <h6>Structural Assessment</h6>
                <div className="attributes-grid">
                  <div className="attribute-group">
                    <label className="attribute-label">Acidity</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.acidity || 7.75}
                      onChange={(e) => updateSCAScore('acidity', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Brightness and liveliness</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Body</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.body || 7.75}
                      onChange={(e) => updateSCAScore('body', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Tactile mouthfeel</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Balance</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.balance || 7.5}
                      onChange={(e) => updateSCAScore('balance', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Harmony of flavor elements</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Sweetness</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.sweetness || 7.75}
                      onChange={(e) => updateSCAScore('sweetness', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Natural sugars perception</div>
                  </div>
                </div>
              </div>

              {/* Quality Attributes */}
              <div className="attributes-section">
                <h6>Quality Assessment</h6>
                <div className="attributes-grid">
                  <div className="attribute-group">
                    <label className="attribute-label">Uniformity</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.uniformity || 8.0}
                      onChange={(e) => updateSCAScore('uniformity', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Consistency across cups</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Clean Cup</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.cleanCup || 8.0}
                      onChange={(e) => updateSCAScore('cleanCup', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Absence of defects</div>
                  </div>
                  
                  <div className="attribute-group">
                    <label className="attribute-label">Overall</label>
                    <input
                      type="number"
                      min={SCAA_CONSTANTS.SCORE_RANGE.MIN}
                      max={SCAA_CONSTANTS.SCORE_RANGE.MAX}
                      step={SCAA_CONSTANTS.SCORE_RANGE.INCREMENT}
                      value={scaEval?.scores?.overall || 8.0}
                      onChange={(e) => updateSCAScore('overall', parseFloat(e.target.value))}
                      className="scaa-score-input"
                    />
                    <div className="score-hint">Holistic evaluation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SCAA Defects Assessment */}
            <div className="scaa-defects-section">
              <h5>SCAA Defects Assessment</h5>
              
              <div className="defects-grid">
                <div className="defect-category">
                  <h6>Taints (2 points deduction each)</h6>
                  <div className="defect-input-group">
                    <label className="defect-label">Number of Taints (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={scaEval?.defects?.taints?.count || 0}
                      onChange={(e) => updateSCADefects('taints', 'count', parseInt(e.target.value))}
                      className="defect-count-input"
                    />
                  </div>
                  
                  {(scaEval?.defects?.taints?.count || 0) > 0 && (
                    <div className="defect-types">
                      <label className="defect-label">Taint Types</label>
                      <select 
                        multiple
                        value={scaEval?.defects?.taints?.types || []}
                        onChange={(e) => updateSCADefects('taints', 'types', Array.from(e.target.selectedOptions, option => option.value))}
                        className="defect-select"
                      >
                        {SCAA_TAINT_DEFECTS.map(defect => (
                          <option key={defect} value={defect}>{defect}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="defect-category">
                  <h6>Faults (4 points deduction each)</h6>
                  <div className="defect-input-group">
                    <label className="defect-label">Number of Faults (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={scaEval?.defects?.faults?.count || 0}
                      onChange={(e) => updateSCADefects('faults', 'count', parseInt(e.target.value))}
                      className="defect-count-input"
                    />
                  </div>
                  
                  {(scaEval?.defects?.faults?.count || 0) > 0 && (
                    <div className="defect-types">
                      <label className="defect-label">Fault Types</label>
                      <select 
                        multiple
                        value={scaEval?.defects?.faults?.types || []}
                        onChange={(e) => updateSCADefects('faults', 'types', Array.from(e.target.selectedOptions, option => option.value))}
                        className="defect-select"
                      >
                        {SCAA_FAULT_DEFECTS.map(defect => (
                          <option key={defect} value={defect}>{defect}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="defects-penalty">
                <strong>Total Defect Penalty: -{scaEval?.defects?.totalPenalty || 0} points</strong>
                <div className="penalty-breakdown">
                  Taints: {scaEval?.defects?.taints?.count || 0} × 2 = -{(scaEval?.defects?.taints?.count || 0) * 2} | 
                  Faults: {scaEval?.defects?.faults?.count || 0} × 4 = -{(scaEval?.defects?.faults?.count || 0) * 4}
                </div>
              </div>
            </div>

            {/* Final Score Display */}
            <div className="scaa-final-score">
              <div className="score-display">
                <h5>Final SCAA Score</h5>
                <div className="score-value">
                  {scaEval?.finalScore?.toFixed(2) || 0}/100
                </div>
                <div className="quality-classification">
                  {scaEval?.qualityClassification || 'Standard Grade'}
                </div>
              </div>
              
              <div className="score-breakdown">
                <div className="breakdown-line">
                  <span>Sum of Attributes:</span>
                  <span>
                    {scaEval?.scores ? Object.values(scaEval.scores).reduce((sum: number, score: number) => sum + score, 0).toFixed(2) : 0}
                  </span>
                </div>
                <div className="breakdown-line">
                  <span>Defect Penalty:</span>
                  <span>-{scaEval?.defects?.totalPenalty || 0}</span>
                </div>
                <div className="breakdown-line total">
                  <span><strong>Final Score:</strong></span>
                  <span><strong>{scaEval?.finalScore?.toFixed(2) || 0}</strong></span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'cva_affective':
        const affectiveEval = currentEval as CVAAffectiveEvaluation;
        
        const updateSection = (section: string, value: number) => {
          const updatedSections = {
            ...affectiveEval?.sections,
            [section]: value
          };
          
          const scaScore = calculateCVAAffectiveScore(
            updatedSections,
            affectiveEval?.nonUniformCups || 0,
            affectiveEval?.defectiveCups || 0
          );
          
          updateCurrentEvaluation({
            sections: updatedSections,
            scaScore
          });
        };

        const updateDefectsUniformity = (field: string, value: number | string) => {
          const updates: any = { [field]: value };
          
          if (field === 'nonUniformCups' || field === 'defectiveCups') {
            updates.scaScore = calculateCVAAffectiveScore(
              affectiveEval?.sections || {
                fragrance: 5, aroma: 5, flavor: 5, aftertaste: 5,
                acidity: 5, sweetness: 5, mouthfeel: 5, overall: 5
              },
              field === 'nonUniformCups' ? value as number : affectiveEval?.nonUniformCups || 0,
              field === 'defectiveCups' ? value as number : affectiveEval?.defectiveCups || 0
            );
          }
          
          updateCurrentEvaluation(updates);
        };

        return (
          <div className="cva-affective-evaluation">
            <h4>SCA Coffee Value Assessment: Affective Assessment</h4>
            <p className="assessment-description">
              Rate your <strong>impression of quality</strong> for each cupping section using the 9-point SCA scale.
              5 = Neither high nor low quality (neutral).
            </p>

            {/* SCA 8-Point Impression of Quality Scale */}
            <div className="sca-impression-scale">
              <div className="scale-legend">
                <div className="scale-point">① Extremely Low</div>
                <div className="scale-point">② Very Low</div>
                <div className="scale-point">③ Moderately Low</div>
                <div className="scale-point">④ Slightly Low</div>
                <div className="scale-point neutral">⑤ Neither High Nor Low</div>
                <div className="scale-point">⑥ Slightly High</div>
                <div className="scale-point">⑦ Moderately High</div>
                <div className="scale-point">⑧ Very High</div>
                <div className="scale-point">⑨ Extremely High</div>
              </div>
            </div>

            {/* Eight SCA Cupping Sections - Elegant Slider Interface */}
            <div className="sca-sliders-container">
              <div className="sca-sliders-grid">
                {Object.entries({
                  fragrance: 'Fragrance (Dry Grounds)',
                  aroma: 'Aroma (Wet Brew)', 
                  flavor: 'Flavor (In Mouth)',
                  aftertaste: 'Aftertaste (After Swallowing)',
                  acidity: 'Acidity (Sour Taste)',
                  sweetness: 'Sweetness (Sweet Taste)',
                  mouthfeel: 'Mouthfeel (Tactile Feel)',
                  overall: 'Overall (General Impression)'
                }).map(([section, label]) => (
                  <SCASlider
                    key={section}
                    label={label}
                    value={affectiveEval?.sections?.[section as keyof typeof affectiveEval.sections] || 5}
                    onChange={(value) => updateSection(section, value)}
                    className="sca-cupping-slider"
                  />
                ))}
              </div>
            </div>

            {/* Defects and Uniformity Section */}
            <div className="defects-uniformity-section">
              <h5>Defects and Uniformity Assessment</h5>
              
              <div className="defects-uniformity-grid">
                <div className="form-group">
                  <label className="form-label">Non-Uniform Cups (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={affectiveEval?.nonUniformCups || 0}
                    onChange={(e) => updateDefectsUniformity('nonUniformCups', parseInt(e.target.value))}
                    className="form-input"
                  />
                  <div className="form-hint">Cups with qualitatively different characteristics</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Defective Cups (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={affectiveEval?.defectiveCups || 0}
                    onChange={(e) => updateDefectsUniformity('defectiveCups', parseInt(e.target.value))}
                    className="form-input"
                  />
                  <div className="form-hint">Cups with sensory defects (-4 points each)</div>
                </div>

                {(affectiveEval?.defectiveCups || 0) > 0 && (
                  <div className="form-group">
                    <label className="form-label">Defect Type</label>
                    <select
                      value={affectiveEval?.defectType || ''}
                      onChange={(e) => updateDefectsUniformity('defectType', e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select defect type</option>
                      <option value="moldy">Moldy</option>
                      <option value="phenolic">Phenolic</option>
                      <option value="potato">Potato</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SCA Score Display */}
            <div className="sca-score-display">
              <h5>SCA Affective Score</h5>
              <div className="score-value">
                {affectiveEval?.scaScore?.toFixed(2) || '72.75'}/100
              </div>
              <div className="score-formula">
                Formula: S = 0.65625 × Σ(sections) + 52.75 - 2×(non-uniform) - 4×(defective)
              </div>
            </div>
          </div>
        );

      case 'cva_descriptive':
        const descriptiveEval = currentEval as CVADescriptiveEvaluation;
        
        const updateSectionIntensity = (section: string, intensity: number) => {
          const currentSection = descriptiveEval?.[section as keyof CVADescriptiveEvaluation] as any;
          updateCurrentEvaluation({
            [section]: {
              ...currentSection,
              intensity
            }
          });
        };

        const updateSectionDescriptors = (section: string, field: string, value: any) => {
          const currentSection = descriptiveEval?.[section as keyof CVADescriptiveEvaluation] as any;
          updateCurrentEvaluation({
            [section]: {
              ...currentSection,
              [field]: value
            }
          });
        };

        return (
          <div className="sca-cva-descriptive-evaluation">
            <div className="sca-assessment-header">
              <h4>SCA Coffee Value Assessment: Descriptive Assessment</h4>
              <p className="assessment-description">
                Official <strong>SCA Standard 103-P/2024</strong> assessment for descriptive profiling and 
                characterizing the sensory attributes of coffee objectively.
              </p>
            </div>

            {/* Assessment Metadata */}
            <div className="sca-assessment-metadata">
              <div className="metadata-grid">
                <div className="form-group">
                  <label className="form-label">Roast Level (Visual Estimation)</label>
                  <select
                    value={descriptiveEval?.roastLevel || ''}
                    onChange={(e) => updateCurrentEvaluation({ roastLevel: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select roast level...</option>
                    <option value="Light">Light</option>
                    <option value="Medium-Light">Medium-Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Medium-Dark">Medium-Dark</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sample Number</label>
                  <input
                    type="text"
                    value={descriptiveEval?.sampleNumber || ''}
                    onChange={(e) => updateCurrentEvaluation({ sampleNumber: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Sample A"
                  />
                </div>
              </div>
            </div>

            {/* SCA 6 Cupping Sections */}
            <div className="sca-cupping-sections">
              
              {/* Section 1: Fragrance */}
              <div className="sca-cupping-section fragrance">
                <h5 className="section-title">1. Fragrance (Dry Grounds)</h5>
                <p className="section-description">
                  Orthonasal olfactory perception of coffee grounds prior to brewing
                </p>
                
                <SCAIntensitySlider
                  label="Fragrance Intensity"
                  value={descriptiveEval?.fragrance?.intensity || 7}
                  onChange={(intensity) => updateSectionIntensity('fragrance', intensity)}
                  className="section-intensity"
                />
                
                <SCAOrthonasalCheckboxes
                  selectedDescriptors={descriptiveEval?.fragrance?.orthonasal || []}
                  onSelectionChange={(descriptors) => updateSectionDescriptors('fragrance', 'orthonasal', descriptors)}
                />

                <div className="form-group">
                  <label className="form-label">Additional Fragrance Notes</label>
                  <textarea
                    value={descriptiveEval?.fragrance?.notes || ''}
                    onChange={(e) => updateSectionDescriptors('fragrance', 'notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Freely elicited descriptors for fragrance..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Section 2: Aroma */}
              <div className="sca-cupping-section aroma">
                <h5 className="section-title">2. Aroma (Brewed Coffee)</h5>
                <p className="section-description">
                  Orthonasal olfactory perception right after brewing and while breaking crust
                </p>
                
                <SCAIntensitySlider
                  label="Aroma Intensity"
                  value={descriptiveEval?.aroma?.intensity || 7}
                  onChange={(intensity) => updateSectionIntensity('aroma', intensity)}
                  className="section-intensity"
                />

                <div className="shared-descriptors-note">
                  <span>📝 Aroma shares the orthonasal CATA descriptors with Fragrance section above</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Aroma Notes</label>
                  <textarea
                    value={descriptiveEval?.aroma?.notes || ''}
                    onChange={(e) => updateSectionDescriptors('aroma', 'notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Freely elicited descriptors for aroma..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Section 3: Flavor */}
              <div className="sca-cupping-section flavor">
                <h5 className="section-title">3. Flavor (In Mouth)</h5>
                <p className="section-description">
                  Perception from taste + retronasal olfactory while brew is in mouth
                </p>
                
                <SCAIntensitySlider
                  label="Flavor Intensity"
                  value={descriptiveEval?.flavor?.intensity || 7}
                  onChange={(intensity) => updateSectionIntensity('flavor', intensity)}
                  className="section-intensity"
                />
                
                <div className="flavor-descriptors-grid">
                  <SCAOrthonasalCheckboxes
                    selectedDescriptors={descriptiveEval?.flavor?.retronasal || []}
                    onSelectionChange={(descriptors) => updateSectionDescriptors('flavor', 'retronasal', descriptors)}
                  />
                  
                  <SCAMainTastesCheckboxes
                    selectedDescriptors={descriptiveEval?.flavor?.mainTastes || []}
                    onSelectionChange={(descriptors) => updateSectionDescriptors('flavor', 'mainTastes', descriptors)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Flavor Notes</label>
                  <textarea
                    value={descriptiveEval?.flavor?.notes || ''}
                    onChange={(e) => updateSectionDescriptors('flavor', 'notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Freely elicited descriptors for flavor..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Section 4: Aftertaste */}
              <div className="sca-cupping-section aftertaste">
                <h5 className="section-title">4. Aftertaste (After Swallow)</h5>
                <p className="section-description">
                  Perception from taste + retronasal olfactory after brew is ejected/swallowed
                </p>
                
                <SCAIntensitySlider
                  label="Aftertaste Intensity"
                  value={descriptiveEval?.aftertaste?.intensity || 7}
                  onChange={(intensity) => updateSectionIntensity('aftertaste', intensity)}
                  className="section-intensity"
                />

                <div className="shared-descriptors-note">
                  <span>📝 Aftertaste shares retronasal and main tastes CATA descriptors with Flavor section above</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Aftertaste Notes</label>
                  <textarea
                    value={descriptiveEval?.aftertaste?.notes || ''}
                    onChange={(e) => updateSectionDescriptors('aftertaste', 'notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Freely elicited descriptors for aftertaste..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Section 5: Acidity */}
              <div className="sca-cupping-section acidity">
                <h5 className="section-title">5. Acidity (Sour Taste)</h5>
                <p className="section-description">
                  Perception of sour taste provoked by the brew (intensity and character)
                </p>
                
                <SCAIntensitySlider
                  label="Acidity Intensity"
                  value={descriptiveEval?.acidity?.intensity || 7}
                  onChange={(intensity) => updateSectionIntensity('acidity', intensity)}
                  className="section-intensity"
                />
                
                <SCAAcidityDescriptors
                  descriptors={descriptiveEval?.acidity?.descriptors || []}
                  onDescriptorsChange={(descriptors) => updateSectionDescriptors('acidity', 'descriptors', descriptors)}
                />

                <div className="form-group">
                  <label className="form-label">Additional Acidity Notes</label>
                  <textarea
                    value={descriptiveEval?.acidity?.notes || ''}
                    onChange={(e) => updateSectionDescriptors('acidity', 'notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Additional freely elicited descriptors..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Section 6: Sweetness */}
              <div className="sca-cupping-section sweetness">
                <h5 className="section-title">6. Sweetness (Sweet Taste)</h5>
                <p className="section-description">
                  Perception of gustatory or retronasal sweetness provoked by the brew
                </p>
                
                <SCAIntensitySlider
                  label="Sweetness Intensity"
                  value={descriptiveEval?.sweetness?.intensity || 7}
                  onChange={(intensity) => updateSectionIntensity('sweetness', intensity)}
                  className="section-intensity"
                />
                
                <SCASweetnessDescriptors
                  descriptors={descriptiveEval?.sweetness?.descriptors || []}
                  onDescriptorsChange={(descriptors) => updateSectionDescriptors('sweetness', 'descriptors', descriptors)}
                />

                <div className="form-group">
                  <label className="form-label">Additional Sweetness Notes</label>
                  <textarea
                    value={descriptiveEval?.sweetness?.notes || ''}
                    onChange={(e) => updateSectionDescriptors('sweetness', 'notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Additional freely elicited descriptors..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Section 7: Mouthfeel */}
              <div className="sca-cupping-section mouthfeel">
                <h5 className="section-title">7. Mouthfeel (Tactile Perception)</h5>
                <p className="section-description">
                  Tactile perception while brew is in mouth (weight, texture, astringency)
                </p>
                
                <SCAIntensitySlider
                  label="Mouthfeel Intensity (Body Level)"
                  value={descriptiveEval?.mouthfeel?.intensity || 7}
                  onChange={(intensity) => updateSectionIntensity('mouthfeel', intensity)}
                  className="section-intensity"
                />
                
                <SCAMouthfeelCheckboxes
                  selectedDescriptors={descriptiveEval?.mouthfeel?.characteristics || []}
                  onSelectionChange={(descriptors) => updateSectionDescriptors('mouthfeel', 'characteristics', descriptors)}
                />

                <div className="form-group">
                  <label className="form-label">Additional Mouthfeel Notes</label>
                  <textarea
                    value={descriptiveEval?.mouthfeel?.notes || ''}
                    onChange={(e) => updateSectionDescriptors('mouthfeel', 'notes', e.target.value)}
                    className="form-textarea"
                    placeholder="Freely elicited descriptors for mouthfeel..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* SCA Assessment Information */}
            <div className="sca-assessment-info">
              <h5>📋 SCA Assessment Methodology</h5>
              <div className="methodology-grid">
                <div className="methodology-item">
                  <h6>Intensity Rating</h6>
                  <p>15-point scales (0-15) assess total intensity of each section, not individual characteristics</p>
                </div>
                <div className="methodology-item">
                  <h6>CATA Descriptors</h6>
                  <p>Check-All-That-Apply systems with selection limits per SCA standard</p>
                </div>
                <div className="methodology-item">
                  <h6>Free Descriptors</h6>
                  <p>Freely elicited terms for precise descriptions and rare characteristics</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Initialize first tab if no data exists
  React.useEffect(() => {
    if (!data) {
      handleTabChange(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="evaluation-step">
      <div className="step-description">
        <p>
          Evaluate your brew's quality using one of the standardized methods. 
          You can fill out multiple assessment types and switch between them.
        </p>
      </div>

      {/* Tabbed Interface Navigation */}
      <div className="evaluation-tabs">
        <div className="tab-navigation">
          <button
            type="button"
            className={`tab-button ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => handleTabChange('quick')}
          >
            <span className="tab-label">Quick Assessment</span>
            {isTabCompleted('quick') && <span className="tab-indicator">✓</span>}
          </button>
          
          <button
            type="button"
            className={`tab-button ${activeTab === 'sca' ? 'active' : ''}`}
            onClick={() => handleTabChange('sca')}
          >
            <span className="tab-label">SCA Protocol</span>
            {isTabCompleted('sca') && <span className="tab-indicator">✓</span>}
          </button>
          
          <button
            type="button"
            className={`tab-button ${activeTab === 'cva_affective' ? 'active' : ''}`}
            onClick={() => handleTabChange('cva_affective')}
          >
            <span className="tab-label">SCA Affective</span>
            {isTabCompleted('cva_affective') && <span className="tab-indicator">✓</span>}
          </button>
          
          <button
            type="button"
            className={`tab-button ${activeTab === 'cva_descriptive' ? 'active' : ''}`}
            onClick={() => handleTabChange('cva_descriptive')}
          >
            <span className="tab-label">SCA Descriptive</span>
            {isTabCompleted('cva_descriptive') && <span className="tab-indicator">✓</span>}
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {renderEvaluationForm()}
        </div>
      </div>

      {/* Shared Tasting Notes - appears on all tabs */}
      <div className="form-group shared-notes">
        <label htmlFor="notes" className="form-label">Tasting Notes</label>
        <textarea
          id="notes"
          className="form-textarea"
          value={getCurrentEvaluation()?.notes || ''}
          onChange={(e) => updateCurrentEvaluation({
            notes: e.target.value
          })}
          placeholder="Describe the flavor, aroma, mouthfeel, and overall experience..."
          rows={4}
          maxLength={1000}
        />
        <div className="form-hint">
          Optional notes about taste, aroma, and overall brewing experience (shared across all assessment types)
        </div>
      </div>

      {/* Evaluation Method Explanations */}
      <div className="evaluation-explanations">
        <h4>📊 Evaluation Methods Explained</h4>
        <div className="explanations-grid">
          <div className="explanation-item">
            <h5>SCAA Cupping Protocol (Official SCA Protocol)</h5>
            <ul>
              <li>Official SCAA Cupping Protocols 2005 standard</li>
              <li>11 flavor attributes scored 6.00-9.00 (quarter-point increments)</li>
              <li>Temperature-based evaluation procedure (200°F to 70°F)</li>
              <li>Comprehensive defects system (Taints: -2pts, Faults: -4pts)</li>
              <li>80+ points = Specialty Grade coffee classification</li>
              <li>Professional industry standard for quality assessment</li>
            </ul>
          </div>
          <div className="explanation-item">
            <h5>SCA Affective Method</h5>
            <ul>
              <li>Official SCA Standard 104-2024</li>
              <li>Measures "impression of quality" (1-9 scale)</li>
              <li>8 cupping sections + defects/uniformity</li>
              <li>Professional standard for quality assessment</li>
            </ul>
          </div>
          <div className="explanation-item">
            <h5>SCA Descriptive Method</h5>
            <ul>
              <li>Official SCA Standard 103-P/2024</li>
              <li>Objective sensory profiling (15-point intensity scales)</li>
              <li>6 cupping sections + CATA descriptor systems</li>
              <li>Professional standard for descriptive analysis</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="step-tips">
        <h4>☕ Tasting Tips</h4>
        <ul>
          <li>Let coffee cool slightly before tasting for best flavor perception</li>
          <li>Cleanse your palate with water between tastings</li>
          <li>Use consistent cupping spoons and techniques</li>
          <li>Evaluate aroma both dry (grounds) and wet (brewed)</li>
          <li>Consider how flavors change as the coffee cools</li>
        </ul>
      </div>
    </div>
  );
};
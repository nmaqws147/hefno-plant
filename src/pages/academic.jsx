// components/knowledge/AcademicPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import academicData from '../knowledge_base/academic/data.json';
import './academic.css';
import { Helmet } from 'react-helmet-async';

const AcademicPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [activeTab, setActiveTab] = useState('glossary');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);

  useEffect(() => {
    setData(academicData);
    if (academicData?.glossary?.terms) {
      setFilteredTerms(academicData.glossary.terms);
    }
  }, []);

  useEffect(() => {
    if (data?.glossary?.terms) {
      const filtered = data.glossary.terms.filter(term =>
        term.arabic.includes(searchQuery) ||
        term.english.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTerms(filtered);
    }
  }, [searchQuery, data]);

  const handleTermClick = (term) => {
    setSelectedTerm(term);
    setShowTermModal(true);
  };

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
    setShowPlantModal(true);
  };

  const handleRefClick = (ref) => {
    setSelectedRef(ref);
    setShowRefModal(true);
  };

  const closeModals = () => {
    setShowTermModal(false);
    setShowPlantModal(false);
    setShowRefModal(false);
    setSelectedTerm(null);
    setSelectedPlant(null);
    setSelectedRef(null);
  };

  if (!data) {
    return (
      <div className="academic-page loading" dir="rtl">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>جاري تحميل البيانات الأكاديمية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="academic-page  " dir="rtl">
      <Helmet>
        <title>المصطلحات الأكاديمية | Hefno-Plant</title>
        <meta name="description" content="قاموس المصطلحات الأكاديمية في العلوم الزراعية — تعريفات ومفاهيم بأسلوب مبسط." />
      </Helmet>

      {/* رأس الصفحة */}
      <div className="academic-header special-page-header">
        <button className="back-button" onClick={() => navigate('/knowledge-base')}>
          <span>←</span> العودة
        </button>
        <div className="header-content">
          <div className="header-icon">
            <span>📚</span>
          </div>
          <div className="header-text">
            <h1>{data.metadata.name_ar}</h1>
            <p className="header-en">{data.metadata.name_en}</p>
            <p className="header-description">{data.metadata.description_ar}</p>
            <div className="stats-badge">
              <span className="stat-badge">📖 {data.glossary?.terms?.length} مصطلح</span>
              <span className="stat-badge">🌱 {data.plant_academic_data?.plants?.length} نبات</span>
              <span className="stat-badge">📚 {data.key_references_general?.books?.length} مرجع</span>
            </div>
          </div>
        </div>
      </div>

      {/* تبويبات */}
      <div className="academic-tabs">
        <button
          className={`academic-tab ${activeTab === 'glossary' ? 'active' : ''}`}
          onClick={() => setActiveTab('glossary')}
        >
          <span>📖</span> قاموس المصطلحات
        </button>
        <button
          className={`academic-tab ${activeTab === 'plants' ? 'active' : ''}`}
          onClick={() => setActiveTab('plants')}
        >
          <span>🌱</span> البيانات الأكاديمية للنباتات
        </button>
        <button
          className={`academic-tab ${activeTab === 'equations' ? 'active' : ''}`}
          onClick={() => setActiveTab('equations')}
        >
          <span>📐</span> المعادلات الأساسية
        </button>
        <button
          className={`academic-tab ${activeTab === 'references' ? 'active' : ''}`}
          onClick={() => setActiveTab('references')}
        >
          <span>📚</span> المراجع العلمية
        </button>
        <button
          className={`academic-tab ${activeTab === 'quickref' ? 'active' : ''}`}
          onClick={() => setActiveTab('quickref')}
        >
          <span>⚡</span> مراجع سريعة
        </button>
      </div>

      {/* محتوى قاموس المصطلحات */}
      {activeTab === 'glossary' && (
        <div className="glossary-section">
          <div className="glossary-header">
            <h2 className="section-title">{data.glossary.title_ar}</h2>
            <p className="section-description">{data.glossary.description_ar}</p>
            <div className="search-box">
              <input
                type="text"
                placeholder="ابحث عن مصطلح..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="terms-grid">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className="term-card"
                onClick={() => handleTermClick(term)}
              >
                <div className="card-glass"></div>
                <div className="card-content">
                  <h3 className="term-arabic">{term.arabic}</h3>
                  <p className="term-english">{term.english}</p>
                  {term.latin && <p className="term-latin">{term.latin}</p>}
                  <p className="term-definition-preview">
                    {term.definition_ar.substring(0, 100)}...
                  </p>
                  <div className="term-field">
                    <span className="field-badge">{term.field_ar}</span>
                  </div>
                  <div className="card-footer">
                    <div className="card-link">
                      عرض التفاصيل
                      <span className="link-arrow">←</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* محتوى البيانات الأكاديمية للنباتات */}
      {activeTab === 'plants' && (
        <div className="plants-academic-section">
          <h2 className="section-title">{data.plant_academic_data.title_ar}</h2>
          <p className="section-description">{data.plant_academic_data.description_ar}</p>
          <div className="plants-academic-grid">
            {data.plant_academic_data.plants.map((plant) => (
              <div
                key={plant.plant_id}
                className="plant-academic-card"
                onClick={() => handlePlantClick(plant)}
              >
                <div className="card-glass"></div>
                <div className="card-content">
                  <h3 className="plant-name">{plant.name_ar}</h3>
                  <p className="plant-name-en">{plant.name_en}</p>
                  <div className="taxonomy-preview">
                    <div className="tax-item">
                      <span className="tax-label">الفصيلة:</span>
                      <span className="tax-value">{plant.taxonomy.family_ar}</span>
                    </div>
                    <div className="tax-item">
                      <span className="tax-label">الجنس:</span>
                      <span className="tax-value">{plant.taxonomy.genus_ar}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="card-link">
                      عرض التصنيف الكامل
                      <span className="link-arrow">←</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* محتوى المعادلات الأساسية */}
      {activeTab === 'equations' && (
        <div className="equations-section">
          <h2 className="section-title">{data.essential_equations.title_ar}</h2>
          <div className="equations-grid">
            {data.essential_equations.equations.map((eq) => (
              <div key={eq.id} className="equation-card">
                <div className="card-glass"></div>
                <div className="card-content">
                  <h3 className="equation-name">{eq.name_ar}</h3>
                  <p className="equation-name-en">{eq.name_en}</p>
                  <div className="equation-formula">
                    <code>{eq.formula}</code>
                  </div>
                  {eq.example_ar && (
                    <div className="equation-example">
                      <span className="example-label">مثال:</span>
                      <p>{eq.example_ar}</p>
                    </div>
                  )}
                  {eq.note_ar && (
                    <div className="equation-note">
                      <span className="note-label">ملاحظة:</span>
                      <p>{eq.note_ar}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* محتوى المراجع العلمية */}
      {activeTab === 'references' && (
        <div className="references-section">
          <h2 className="section-title">{data.key_references_general.title_ar}</h2>
          
          <div className="ref-subsection">
            <h3>📚 الكتب المرجعية</h3>
            <div className="references-grid">
              {data.key_references_general.books.map((book, idx) => (
                <div key={idx} className="ref-card" onClick={() => handleRefClick(book)}>
                  <div className="card-glass"></div>
                  <div className="card-content">
                    <h4 className="ref-title">{book.title}</h4>
                    <p className="ref-authors">{book.authors}</p>
                    <p className="ref-year">{book.year} | {book.publisher}</p>
                    {book.isbn && <p className="ref-isbn">ISBN: {book.isbn}</p>}
                    <div className="card-footer">
                      <div className="card-link">
                        عرض التفاصيل
                        <span className="link-arrow">←</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ref-subsection">
            <h3>📊 المجلات العلمية</h3>
            <div className="journals-grid">
              {data.key_references_general.key_journals_ar.map((journal, idx) => (
                <div key={idx} className="journal-card">
                  <div className="card-glass"></div>
                  <div className="card-content">
                    <h4>{journal.name}</h4>
                    <p>{journal.publisher}</p>
                    <span className="journal-focus">{journal.focus_ar}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ref-subsection">
            <h3>🌐 قواعد البيانات الإلكترونية</h3>
            <div className="databases-grid">
              {data.key_references_general.online_databases_ar.map((db, idx) => (
                <div key={idx} className="database-card">
                  <div className="card-glass"></div>
                  <div className="card-content">
                    <h4>{db.name}</h4>
                    <a href={`https://${db.url}`} target="_blank" rel="noopener noreferrer" className="db-url">
                      {db.url}
                    </a>
                    <p className="db-note">{db.note_ar}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* محتوى المراجع السريعة */}
      {activeTab === 'quickref' && (
        <div className="quickref-section">
          <h2 className="section-title">{data.academic_quick_reference.title_ar}</h2>
          
          <div className="quickref-table">
            <h3>{data.academic_quick_reference.essential_elements_table.title_ar}</h3>
            <div className="elements-table">
              <div className="table-header">
                <span>الرمز</span>
                <span>العنصر</span>
                <span>المصدر</span>
                <span>الوظيفة</span>
                <span>أعراض النقص</span>
              </div>
              {data.academic_quick_reference.essential_elements_table.elements.slice(0, 10).map((el, idx) => (
                <div key={idx} className="table-row">
                  <span className="element-symbol">{el.symbol}</span>
                  <span>{el.name_ar}</span>
                  <span>{el.source_ar}</span>
                  <span>{el.function_ar}</span>
                  <span>{el.deficiency_ar}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="quickref-table">
            <h3>{data.academic_quick_reference.soil_fertility_indicators_ar.title_ar}</h3>
            <div className="soil-table">
              <div className="table-header">
                <span>المؤشر</span>
                <span>المدى الأمثل</span>
                <span>النموذجي في مصر</span>
                <span>التأثير</span>
              </div>
              {data.academic_quick_reference.soil_fertility_indicators_ar.indicators.map((ind, idx) => (
                <div key={idx} className="table-row">
                  <span>{ind.parameter_ar}</span>
                  <span>{ind.optimal_ar}</span>
                  <span>{ind.egypt_typical_ar}</span>
                  <span>{ind.impact_ar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal لعرض تفاصيل المصطلح */}
      {showTermModal && selectedTerm && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="academic-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">📖</div>
              <div className="modal-title">
                <h2>{selectedTerm.arabic}</h2>
                <p className="modal-scientific">{selectedTerm.english}</p>
                {selectedTerm.latin && <p className="modal-latin">{selectedTerm.latin}</p>}
              </div>
              <button className="modal-close" onClick={closeModals}>✕</button>
            </div>
            <div className="modal-body">
              <div className="definition-section">
                <h3>📝 التعريف</h3>
                <p>{selectedTerm.definition_ar}</p>
                {selectedTerm.definition_en && (
                  <p className="definition-en">{selectedTerm.definition_en}</p>
                )}
              </div>
              {selectedTerm.equation && (
                <div className="equation-section">
                  <h3>📐 المعادلة</h3>
                  <code>{selectedTerm.equation}</code>
                </div>
              )}
              {selectedTerm.formula_ar && (
                <div className="formula-section">
                  <h3>📊 الصيغة</h3>
                  <p>{selectedTerm.formula_ar}</p>
                </div>
              )}
              {selectedTerm.related_terms && (
                <div className="related-section">
                  <h3>🔗 مصطلحات مرتبطة</h3>
                  <div className="related-tags">
                    {selectedTerm.related_terms.map((term, idx) => (
                      <span key={idx} className="related-tag">{term}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="field-section">
                <h3>🏷️ المجال</h3>
                <span className="field-badge large">{selectedTerm.field_ar}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModals}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal لعرض تفاصيل النبات الأكاديمية */}
      {showPlantModal && selectedPlant && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="academic-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🌱</div>
              <div className="modal-title">
                <h2>{selectedPlant.name_ar}</h2>
                <p className="modal-scientific">{selectedPlant.name_en}</p>
              </div>
              <button className="modal-close" onClick={closeModals}>✕</button>
            </div>
            <div className="modal-body">
              <div className="taxonomy-full">
                <h3>📋 التصنيف العلمي</h3>
                <div className="taxonomy-grid">
                  <div className="tax-item"><span className="tax-label">المملكة:</span><span>{selectedPlant.taxonomy.kingdom_ar}</span></div>
                  <div className="tax-item"><span className="tax-label">الشعبة:</span><span>{selectedPlant.taxonomy.division_ar}</span></div>
                  <div className="tax-item"><span className="tax-label">الصف:</span><span>{selectedPlant.taxonomy.class_ar}</span></div>
                  <div className="tax-item"><span className="tax-label">الرتبة:</span><span>{selectedPlant.taxonomy.order_ar}</span></div>
                  <div className="tax-item"><span className="tax-label">الفصيلة:</span><span>{selectedPlant.taxonomy.family_ar}</span></div>
                  <div className="tax-item"><span className="tax-label">الجنس:</span><span>{selectedPlant.taxonomy.genus_ar}</span></div>
                  <div className="tax-item"><span className="tax-label">النوع:</span><span>{selectedPlant.taxonomy.species_ar}</span></div>
                  <div className="tax-item"><span className="tax-label">الكروموسومات:</span><span>{selectedPlant.taxonomy.chromosome_number}</span></div>
                </div>
              </div>
              {selectedPlant.academic_terms_ar && (
                <div className="academic-terms">
                  <h3>📚 مصطلحات أكاديمية</h3>
                  <div className="terms-list">
                    {Object.entries(selectedPlant.academic_terms_ar).map(([key, value]) => (
                      <div key={key} className="term-item">
                        <span className="term-name">{value.split(' ')[0]}</span>
                        <span className="term-def">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedPlant.key_references && (
                <div className="references-list">
                  <h3>📖 المراجع العلمية</h3>
                  {selectedPlant.key_references.map((ref, idx) => (
                    <div key={idx} className="ref-item">
                      <p><strong>{ref.authors}</strong> ({ref.year}). {ref.title}. <em>{ref.journal || ref.book}</em>, {ref.volume ? ` ${ref.volume}` : ''}{ref.pages ? `, ${ref.pages}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModals}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal لعرض تفاصيل المرجع */}
      {showRefModal && selectedRef && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="academic-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">📚</div>
              <div className="modal-title">
                <h2>{selectedRef.title}</h2>
                <p className="modal-scientific">{selectedRef.authors}</p>
              </div>
              <button className="modal-close" onClick={closeModals}>✕</button>
            </div>
            <div className="modal-body">
              <div className="ref-details">
                <div className="detail-item">
                  <span className="detail-label">السنة:</span>
                  <span className="detail-value">{selectedRef.year}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">الناشر:</span>
                  <span className="detail-value">{selectedRef.publisher}</span>
                </div>
                {selectedRef.isbn && (
                  <div className="detail-item">
                    <span className="detail-label">ISBN:</span>
                    <span className="detail-value">{selectedRef.isbn}</span>
                  </div>
                )}
                {selectedRef.relevance_ar && (
                  <div className="detail-item">
                    <span className="detail-label">الأهمية:</span>
                    <span className="detail-value">{selectedRef.relevance_ar}</span>
                  </div>
                )}
              </div>
              <div className="citation-section">
                <h3>📝 كيفية الاستشهاد (APA 7th)</h3>
                <div className="citation-box">
                  {selectedRef.authors} ({selectedRef.year}). <em>{selectedRef.title}</em>. {selectedRef.publisher}.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModals}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicPage;
import { useCallback, useEffect, useRef, useState } from 'react';
import './advanced-search.css';

const AdvancedSearch = ({ 
  data,                   // مصدر البيانات (مصفوفة)
  searchFields,           // الحقول المراد البحث فيها
  onResults,              // Callback للنتائج
  placeholder = "بحث...",
  showFilters = true,     
  filters = [],           
  debounceTime = 300,     
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  // دالة للحصول على قيمة من object متداخل (تعريفها خارج الـ useCallback لتبسيط الكود)
  const getNestedValue = (obj, path) => {
    if (!obj) return null;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // تحميل سجل البحث من localStorage عند التثبيت فقط
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // 1. دالة البحث الرئيسية مغلفة بـ useCallback لمنع إعادة التعريف غير الضرورية
  const performSearch = useCallback((term, currentFilters) => {
    if (!data || !Array.isArray(data)) {
      if (onResults) onResults([]);
      return [];
    }

    let results = [...data];

    // البحث النصي
    if (term && term.trim()) {
      const lowerTerm = term.toLowerCase().trim();
      results = results.filter(item => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field);
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(lowerTerm);
          }
          return false;
        });
      });
    }

    // تطبيق الفلاتر
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        results = results.filter(item => {
          const itemValue = getNestedValue(item, key);
          if (itemValue && typeof itemValue === 'string') {
            if (itemValue.includes('•') || itemValue.includes(',')) {
              return itemValue.toLowerCase().includes(value.toLowerCase());
            }
            return itemValue.toLowerCase() === value.toLowerCase();
          }
          return false;
        });
      }
    });

    // إرسال النتائج للـ parent
    if (onResults) {
      onResults(results);
    }
    
    return results;
  }, [data, onResults, searchFields]);

  // 2. الـ Debounced search المحسن لحل تحذيرات ESLint
  useEffect(() => {
    const timer = setTimeout(() => {
      // تنفيذ البحث
      const results = performSearch(searchTerm, activeFilters);
      
      // منطق حفظ سجل البحث: يتم هنا بدلاً من داخل دالة البحث لتجنب التكرار غير المفيد
      if (searchTerm.trim().length > 2 && results.length > 0) {
        setSearchHistory(prev => {
          const newHistory = [searchTerm, ...prev.filter(h => h !== searchTerm)].slice(0, 5);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
          return newHistory;
        });
      }

      // منطق اقتراحات البحث
      if (searchTerm && searchTerm.length > 1) {
        const suggestionsList = data
          .filter(item => {
            return searchFields.some(field => {
              const value = getNestedValue(item, field);
              return value && typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase());
            });
          })
          .slice(0, 5)
          .map(item => {
            for (const field of searchFields) {
              const value = getNestedValue(item, field);
              if (value && typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())) {
                return value;
              }
            }
            return null;
          })
          .filter((v, i, a) => v && a.indexOf(v) === i); 
        
        setSuggestions(suggestionsList);
      } else {
        setSuggestions([]);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchTerm, activeFilters, data, debounceTime, performSearch, searchFields]);

  // إعادة تعيين كل الفلاتر
  const resetFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setSuggestions([]);
    performSearch('', {});
  };

  // تغيير الفلتر
  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (value === 'all') {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
  };

  // اختيار اقتراح
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    inputRef.current?.focus();
    performSearch(suggestion, activeFilters);
  };

  // مسح البحث
  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    performSearch('', activeFilters);
    inputRef.current?.focus();
  };

  return (
    <div className={`advanced-search ${className}`}>
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <span className="search-icon" style={{right:20, width:"fit-content"}}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>✕</button>
          )}
          {showFilters && (
            <button 
              className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>⚙️</span>
              <span>{showAdvanced ? 'إخفاء' : 'خيارات متقدمة'}</span>
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="suggestion-item" onClick={() => handleSuggestionClick(suggestion)}>
                <span className="suggestion-icon">🔍</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {searchHistory.length > 0 && !searchTerm && (
          <div className="search-history">
            <div className="history-header">
              <span>🕒 آخر عمليات البحث</span>
              <button onClick={() => {
                setSearchHistory([]);
                localStorage.removeItem('searchHistory');
              }}>مسح</button>
            </div>
            {searchHistory.map((item, idx) => (
              <div key={idx} className="history-item" onClick={() => {
                setSearchTerm(item);
                performSearch(item, activeFilters);
              }}>
                <span className="history-icon">🕒</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showFilters && showAdvanced && filters.length > 0 && (
        <div className="filters-panel">
          <div className="filters-header">
            <span className="filters-title">🔧 فلتر متقدم</span>
            <button className="reset-filters" onClick={resetFilters}>إعادة تعيين الكل</button>
          </div>
          <div className="filters-grid">
            {filters.map((filter) => (
              <div key={filter.key} className="filter-group">
                <label className="filter-label">{filter.label}</label>
                <select
                  className="filter-select"
                  value={activeFilters[filter.key] || 'all'}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="all">الكل</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <div className="search-stats">
            <span className="stats-badge">
              📊 {data?.length || 0} مورد متاح
            </span>
            {Object.keys(activeFilters).length > 0 && (
              <button className="clear-filters" onClick={resetFilters}>
                مسح الفلاتر ({Object.keys(activeFilters).length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
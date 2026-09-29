import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WeedEfficacyTable from '../component/WeedEfficacyTable';

const rows = [
  {
    weed_id: 'weed-01',
    weed_name_arabic: 'الفلاريس — الشوفان الكاذب',
    efficacy_level: 4,
    efficacy_arabic: 'ممتاز',
    timing_arabic: 'ما بعد الإنبات — على النجيليات في طور 2-6 أوراق',
    notes_arabic: 'DIM فعّال ضد الفلاريس المقاومة للـ FOPs',
    resistance_warning: true,
    resistance_note_arabic: 'تحذير: مقاومة عالية جداً',
  },
  {
    weed_id: 'weed-02',
    weed_name_arabic: 'الشوفان البري',
    efficacy_level: 3,
    efficacy_arabic: 'جيد',
    timing_arabic: 'ما بعد الإنبات',
    notes_arabic: null,
    resistance_warning: false,
    resistance_note_arabic: null,
  },
];

describe('WeedEfficacyTable', () => {
  it('renders weed name, efficacy label, level and timing', () => {
    render(<WeedEfficacyTable rows={rows} />);

    expect(screen.getByText('الفلاريس — الشوفان الكاذب')).toBeInTheDocument();
    expect(screen.getByText('ممتاز (4/5)')).toBeInTheDocument();
    expect(screen.getByText('جيد (3/5)')).toBeInTheDocument();
    expect(screen.getByText('ما بعد الإنبات — على النجيليات في طور 2-6 أوراق')).toBeInTheDocument();
  });

  it('renders resistance warning only when flagged', () => {
    render(<WeedEfficacyTable rows={rows} />);

    expect(screen.getByText('تحذير: مقاومة عالية جداً')).toBeInTheDocument();
    expect(screen.queryByText('تحذير مقاومة')).not.toBeInTheDocument();
  });

  it('renders null for empty rows', () => {
    const { container } = render(<WeedEfficacyTable rows={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

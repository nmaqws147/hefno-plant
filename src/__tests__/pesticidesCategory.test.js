import '@testing-library/jest-dom';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

jest.mock('react-router-dom', () => {
  if (typeof global.TextEncoder === 'undefined') {
    const util = require('util');
    global.TextEncoder = util.TextEncoder;
    global.TextDecoder = util.TextDecoder;
  }
  const reactRouter = require('react-router');
  return { __esModule: true, ...reactRouter };
});
import PesticidesCategoryPage from '../pages/pesticides-category';
import { getGroups } from '../pesticides-folder/buildGroups';

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const renderCategory = (categoryId) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/knowledge-base/pesticides/${categoryId}`]}>
        <Routes>
          <Route path="/knowledge-base/pesticides/:categoryId" element={<PesticidesCategoryPage />} />
          <Route path="/knowledge-base/pesticides/group/:groupCode" element={<div data-testid="group-page-stub" />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </HelmetProvider>
  );

const hracGroup = (code) => getGroups('hrac-grp').find(g => g.code === code);
const fracGroup = (code) => getGroups('frac-grp').find(g => g.code === code);

const cardFor = (code) => screen.getByText(code).closest('.group');

beforeEach(() => localStorage.clear());

describe('herbicide (HRAC) cards', () => {
  it('renders all 16 groups, with L and Z greyed out, disabled and still visible', () => {
    renderCategory('herbicides');

    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(16);

    ['L', 'Z'].forEach(code => {
      const card = cardFor(code);
      expect(card).toHaveAttribute('aria-disabled', 'true');
      expect(card.className).toContain('cursor-not-allowed');
      expect(card.className).toContain('opacity-60');
      expect(card.className).not.toContain('cursor-pointer');
      expect(card.className).not.toContain('hover:-translate-y-1');
    });
  });

  it('swaps the empty-group footer affordance on L and Z', () => {
    renderCategory('herbicides');

    ['L', 'Z'].forEach(code => {
      const card = cardFor(code);
      expect(within(card).getByText('لا توجد مواد مسجلة')).toBeInTheDocument();
      expect(within(card).queryByText('عرض المواد')).not.toBeInTheDocument();
      expect(within(card).getByText('0 مادة فعالة')).toBeInTheDocument();
    });

    const aCard = cardFor('A');
    expect(within(aCard).getByText('عرض المواد')).toBeInTheDocument();
    expect(within(aCard).queryByText('لا توجد مواد مسجلة')).not.toBeInTheDocument();
    expect(within(aCard).getByText(`${hracGroup('A').ai_count} مادة فعالة`)).toBeInTheDocument();
  });

  it('does not navigate and does not persist a selection when clicking an empty group', () => {
    renderCategory('herbicides');

    fireEvent.click(cardFor('L'));
    fireEvent.click(cardFor('Z'));

    expect(localStorage.getItem('selectedPesticideGroup')).toBeNull();
    expect(screen.getByTestId('location-display')).toHaveTextContent('/knowledge-base/pesticides/herbicides');
  });

  it('still navigates and persists the selection for a populated group', () => {
    renderCategory('herbicides');

    fireEvent.click(cardFor('A'));

    const stored = JSON.parse(localStorage.getItem('selectedPesticideGroup'));
    expect(stored.category).toBe('herbicides');
    expect(stored.group.id).toBe(hracGroup('A').id);
    expect(screen.getByTestId('location-display')).toHaveTextContent(`/knowledge-base/pesticides/group/${hracGroup('A').id}`);
  });

  it('shows Arabic-first content on herbicide cards', () => {
    renderCategory('herbicides');

    ['A', 'L'].forEach(code => {
      const group = hracGroup(code);
      const heading = screen.getByRole('heading', { level: 4, name: group.name_ar });
      const card = heading.closest('.group');

      expect(within(card).getByText(group.name_en)).toBeInTheDocument();
      expect(within(card).getByText('الفئة الكيميائية:')).toBeInTheDocument();
      expect(within(card).queryByText('المجموعة الكيميائية:')).not.toBeInTheDocument();
      expect(within(card).getByText('الحشائش المستهدفة:')).toBeInTheDocument();
      expect(within(card).getByText(group.target_weeds_ar[0])).toBeInTheDocument();
    });
  });
});

describe('non-herbicide categories are unaffected', () => {
  it('keeps FRAC group 50 (ai_count 0) a normal, clickable card', () => {
    renderCategory('fungicides');

    const card = cardFor('50');
    expect(card).toHaveAttribute('aria-disabled', 'false');
    expect(card.className).toContain('cursor-pointer');
    expect(card.className).not.toContain('cursor-not-allowed');
    expect(card.className).not.toContain('opacity-60');

    expect(within(card).getByText('عرض المواد')).toBeInTheDocument();
    expect(within(card).getByText('متعدد مادة فعالة')).toBeInTheDocument();
    expect(within(card).queryByText('لا توجد مواد مسجلة')).not.toBeInTheDocument();

    expect(document.querySelectorAll('.cursor-not-allowed')).toHaveLength(0);
  });

  it('keeps the original chevron direction and heading structure on fungicide cards', () => {
    renderCategory('fungicides');

    const card = cardFor('50');
    expect(card.querySelector('.lucide-chevron-right')).not.toBeNull();
    expect(card.querySelector('.lucide-chevron-left')).toBeNull();

    expect(within(card).getByText('المجموعة الكيميائية:')).toBeInTheDocument();
    expect(within(card).queryByText('الفئة الكيميائية:')).not.toBeInTheDocument();
    expect(within(card).queryByText('الحشائش المستهدفة:')).not.toBeInTheDocument();
  });

  it('keeps FRAC group 50 navigable', () => {
    renderCategory('fungicides');

    fireEvent.click(cardFor('50'));

    expect(screen.getByTestId('location-display')).toHaveTextContent(`/knowledge-base/pesticides/group/${fracGroup('50').id}`);
  });
});

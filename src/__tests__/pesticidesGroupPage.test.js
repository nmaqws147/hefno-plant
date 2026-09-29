import '@testing-library/jest-dom';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
import PesticideGroupPage from '../pages/pesticides-group-page';
import { getGroups } from '../pesticides-folder/buildGroups';

const renderGroupPage = (category, group) => {
  localStorage.setItem('selectedPesticideGroup', JSON.stringify({ category, group }));
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/knowledge-base/pesticides/group/${group.id}`]}>
        <Routes>
          <Route path="/knowledge-base/pesticides/group/:groupCode" element={<PesticideGroupPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
};

const hracGroup = (code) => getGroups('hrac-grp').find(g => g.code === code);

const clethodimWeeds = [
  'الفلاريس — الشوفان الكاذب',
  'الشوفان البري',
  'النجيل الثابت',
  'الذيل الثعلبي — سيتاريا',
  'الحلفا — إيمبيراتا',
  'الذرة الجارة',
];

describe('pesticides group page (HRAC wiring)', () => {
  it('renders herbicide active ingredients for an HRAC group', async () => {
    renderGroupPage('herbicides', hracGroup('A'));

    expect(await screen.findByText('Clethodim')).toBeInTheDocument();
    expect(screen.queryByText('لا توجد مواد فعالة')).not.toBeInTheDocument();
  });

  it('lists each target weed exactly once', async () => {
    renderGroupPage('herbicides', hracGroup('A'));
    const cardName = await screen.findByText('Clethodim');
    const card = cardName.closest('.cursor-pointer');

    expect(within(card).getByText('+3')).toBeInTheDocument();

    fireEvent.click(cardName);
    fireEvent.click(screen.getByRole('button', { name: 'أهداف وسلامة' }));

    const modal = document.querySelector('.fixed.inset-0');
    clethodimWeeds.forEach(weed => {
      expect(within(modal).getAllByText(weed)).toHaveLength(1);
    });
  });

  it('shows group-level weeds, selectivity and efficacy chips', async () => {
    renderGroupPage('herbicides', hracGroup('A'));
    const cardName = await screen.findByText('Clethodim');

    const descCard = screen.getByText('عن هذه المجموعة').closest('div');
    expect(within(descCard).getByText('الحشائش المستهدفة:')).toBeInTheDocument();
    expect(within(descCard).getByText('الانتقائية: انتقائي جداً — ضد الحشائش الضيقة فقط — آمن على الشتلة العريضة في معظم الحالات')).toBeInTheDocument();

    const card = cardName.closest('.cursor-pointer');
    expect(within(card).getByText('6 حشيشة')).toBeInTheDocument();
    expect(within(card).getByText('أقصى فعالية 4/5')).toBeInTheDocument();
    expect(within(card).getByText('6 تحذير')).toBeInTheDocument();
  });

  it('adds mode of action, rotation and weed efficacy content for herbicides', async () => {
    renderGroupPage('herbicides', hracGroup('A'));
    const cardName = await screen.findByText('Clethodim');
    fireEvent.click(cardName);

    expect(screen.getByText('آلية التأثير')).toBeInTheDocument();
    expect(screen.getByText('موقع التأثير: ACCase enzyme (plastidic)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'الفعالية ضد الحشائش' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'تطبيق' }));
    expect(screen.getByText('قاعدة التناوب')).toBeInTheDocument();
    expect(screen.getByText(/تناوب مع K1 أو N/)).toBeInTheDocument();
    expect(screen.getByText(/مجموعات متوافقة/)).toBeInTheDocument();
    expect(screen.getByText(/مقاومة متبادلة جزئية مع FOPs/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'الفعالية ضد الحشائش' }));
    expect(screen.getByText('الفعالية ضد الحشائش المستهدفة')).toBeInTheDocument();
    expect(screen.getByText('ممتاز (4/5)')).toBeInTheDocument();
  });

  it('renders an empty state for HRAC groups without active ingredients', async () => {
    renderGroupPage('herbicides', hracGroup('L'));

    expect(await screen.findByText('لا توجد مواد فعالة')).toBeInTheDocument();
    expect(screen.getByText('الحشائش المستهدفة:')).toBeInTheDocument();
    expect(screen.getByText('الانتقائية: انتقائي نسبياً — يُطبَّق على التربة')).toBeInTheDocument();
  });

  it('renders the unclassified HRAC group Z without crashing', async () => {
    renderGroupPage('herbicides', hracGroup('Z'));

    expect(await screen.findByText('لا توجد مواد فعالة')).toBeInTheDocument();
    expect(screen.getByText('عن هذه المجموعة')).toBeInTheDocument();
  });

  it('keeps non-herbicide categories rendering with their three tabs', async () => {
    const group = getGroups('irac-grp').find(g => g.code === '1A');
    renderGroupPage('insecticides', group);

    expect(await screen.findByText('Chlorpyrifos')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Chlorpyrifos'));
    expect(screen.queryByRole('button', { name: 'الفعالية ضد الحشائش' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'أهداف وسلامة' })).toBeInTheDocument();
  });

  it('renders the selectivity sentence exactly once in the group card', async () => {
    renderGroupPage('herbicides', hracGroup('A'));
    await screen.findByText('Clethodim');

    const descCard = screen.getByText('عن هذه المجموعة').closest('div');
    const selectivity = 'انتقائي جداً — ضد الحشائش الضيقة فقط — آمن على الشتلة العريضة في معظم الحالات';
    const occurrences = descCard.textContent.split(selectivity).length - 1;

    expect(occurrences).toBe(1);
  });

  it('shows HRAC letter codes instead of internal ids in the rotation line', async () => {
    renderGroupPage('herbicides', hracGroup('A'));
    const cardName = await screen.findByText('Clethodim');
    fireEvent.click(cardName);
    fireEvent.click(screen.getByRole('button', { name: 'تطبيق' }));

    const rotationLine = screen.getByText(/مجموعات متوافقة/);
    expect(rotationLine).toHaveTextContent(/مجموعات متوافقة: B، K3، N/);
    expect(rotationLine).not.toHaveTextContent('hrac-');
  });

  it('renders labeled application notes in the application tab', async () => {
    renderGroupPage('herbicides', hracGroup('A'));
    const cardName = await screen.findByText('Clethodim');
    fireEvent.click(cardName);
    fireEvent.click(screen.getByRole('button', { name: 'تطبيق' }));

    expect(screen.getByText('الجرعة ما بعد الإنبات')).toBeInTheDocument();
    expect(screen.getByText('ملاحظات التطبيق').parentElement).toHaveTextContent('الجرعة ما بعد الإنبات');
  });

  it('keeps the HRAC-only modal boxes out of a FRAC fungicide modal', async () => {
    const group = getGroups('frac-grp').find(g => g.code === '3');
    renderGroupPage('fungicides', group);

    const cardName = await screen.findByText('Tebuconazole');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Triazoles, Imidazoles, Pyrimidines');

    fireEvent.click(cardName);
    expect(screen.queryByText('آلية التأثير')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'تطبيق' }));
    expect(screen.queryByText('قاعدة التناوب')).not.toBeInTheDocument();
    expect(within(document.querySelector('.fixed.inset-0')).getByRole('button', { name: 'أهداف وسلامة' })).toBeInTheDocument();
  });

  it('shows the level-4 red resistance risk for a group-B herbicide AI', async () => {
    const group = getGroups('hrac-grp').find(g => g.code === 'B');
    renderGroupPage('herbicides', group);

    const cardName = await screen.findByText('Metsulfuron-methyl');
    const card = cardName.closest('.cursor-pointer');
    const cardRisk = within(card).getByText('مخاطر المقاومة:').nextElementSibling;
    expect(cardRisk).toHaveTextContent('شديد جداً');
    expect(cardRisk).toHaveStyle('color: rgb(220, 38, 38)');

    fireEvent.click(cardName);
    const modal = document.querySelector('.fixed.inset-0');
    fireEvent.click(within(modal).getByRole('button', { name: 'تطبيق' }));
    const modalRisk = within(modal).getByText('مخاطر المقاومة:').nextElementSibling;
    expect(modalRisk).toHaveTextContent('شديد جداً');
    expect(modalRisk).toHaveStyle('color: rgb(220, 38, 38)');
  });

  it('renders an Arabic-first header for herbicide groups', async () => {
    const group = getGroups('hrac-grp').find(g => g.code === 'A');
    renderGroupPage('herbicides', group);

    await screen.findByText('Clethodim');
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('مثبطات إنزيم ACCase — أريلوكسي فينوكسي بروبيونات وسيكلوهيكساندايون');
    expect(
      screen.getByText('ACCase inhibitors — Aryloxyphenoxypropionates (FOPs) & Cyclohexanediones (DIMs)')
    ).toBeInTheDocument();
    expect(h1.textContent).not.toMatch(/ACCase inhibitors/);
  });

  it('shows the pre-harvest label only for an AI that carries a PHI note', async () => {
    const first = renderGroupPage('herbicides', hracGroup('A'));
    fireEvent.click(await screen.findByText('Fluazifop-P-butyl'));
    fireEvent.click(screen.getByRole('button', { name: 'تطبيق' }));
    expect(screen.getByText('فترة ما قبل الحصاد')).toBeInTheDocument();
    first.unmount();

    renderGroupPage('herbicides', hracGroup('A'));
    fireEvent.click(await screen.findByText('Clethodim'));
    fireEvent.click(screen.getByRole('button', { name: 'تطبيق' }));
    expect(screen.queryByText('فترة ما قبل الحصاد')).not.toBeInTheDocument();
  });
});

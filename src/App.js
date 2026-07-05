// App.jsx
import { lazy, Suspense, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './App.css';
import Header from './component/header';
import Footer from './component/footer';
import ScrollToTop from './component/scrollTop';
import CookieConsent from './component/cookieConsent';
import useTracking from './hooks/useTracking';

// Lazy Load 
const HomeScreen = lazy(() => import('./pages/homescreen'));
const DiagnoseScreen = lazy(() => import('./component/dialog'));
const WeatherScreen = lazy(() => import('./component/weather'));
const KnowledgeBase = lazy(() => import('./component/knowledge'));
const AIAssistant = lazy(() => import('./component/ai_assistance'));
const ResourcesPage = lazy(() => import('./component/resources'));
const FertilizerPlanner = lazy(() => import('./pages/program-planner'));

const BlogPage = lazy(() => import('./pages/blog/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/blog/BlogPostPage'));
const AdminBlogPage = lazy(() => import('./pages/blog/AdminBlogPage'));

const KnowledgeLayout = lazy(() => import('./pages/knowledge-layer'));
const AgriculturalCalendarPage = lazy(() => import('./pages/calendar'));
const PlantNutrientsPage = lazy(() => import('./pages/plant-elements'));
const FertilizersPage = lazy(() => import('./pages/fertilizers'));
const SoilsPage = lazy(() => import('./pages/soil-irri'));
const WeedsPage = lazy(() => import('./pages/weeds'));
const PlantsPage = lazy(() => import('./pages/plants-crops'));
const AcademicPage = lazy(() => import('./pages/academic'));

const DiseasesPage = lazy(() => import('./knowledge_base/disease'));
const BacteriaDiseasesPage = lazy(() => import('./knowledge_base/bacteria'));
const VirusesDiseasesPage = lazy(() => import('./knowledge_base/virus'));
const NematodesDiseasesPage = lazy(() => import('./knowledge_base/nema'));
const ParasiticPlantsPage = lazy(() => import('./knowledge_base/para'));
const FungalDiseasesPage = lazy(() => import('./knowledge_base/phys'));
const FungalClassificationPage = lazy(() => import('./knowledge_base/fungi'));

const OomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/oomy'));
const ZygomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/zygo'));
const AscomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/asco'));
const BasidiomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/basi'));

const InsectsPageNew = lazy(() => import('./pages/insects'));
const InsectOrderPage = lazy(() => import('./pages/insects-order-page'));
const PublicHealthPestsPage = lazy(() => import('./knowledge_base/insects/public-health'));
const NematodaPage = lazy(() => import('./knowledge_base/insects/nematoda'));

const PesticidesHub = lazy(() => import('./pages/pesticidesHub'));
const PesticideGroupPage = lazy(() => import('./pages/pesticides-group-page'));
const PrivacyPage = lazy(() => import('./pages/privacy'));
const TermsPage = lazy(() => import('./pages/terms'));
const AboutPage = lazy(() => import('./pages/about'));

// 🎨 Loader بسيط
const Loader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner" />
    <span className="page-loader-text">Loading HefnoPlant</span>
  </div>
);

// 📦 Main Content
const AppContent = () => {

  const { trackAction } = useTracking();
  const location = useLocation();
  
  // تتبع التطبيق عند التحميل
  useEffect(() => {
    trackAction('app_loaded');
  }, []);

  return (
    <div className="app" id="main-app">
      <Helmet>
        <title>Hefno-Plant | خبيرك الزراعي الذكي</title>
        <meta name="description" content="منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي، دليل المبيدات، التقويم الزراعي، وأكثر." />
      </Helmet>
      <Header />
      <ScrollToTop />

      <Suspense fallback={<Loader />}>
        <Routes>

          {/* الصفحة الرئيسية */}
          <Route path="/" element={<HomeScreen />} />

          {/* باقي الصفحات */}
          <Route
            path="*"
            element={
              <main className="main-content main-background">
                <Toaster />

                <Routes>
                  <Route path="/diagnose" element={<DiagnoseScreen />} />
                  <Route path="/weather" element={<WeatherScreen />} />
                  <Route path="/ai-chat" element={<AIAssistant />} />
                  <Route path="/knowledge-base/resources" element={<ResourcesPage />} />
                  <Route path="/program-planner" element={<FertilizerPlanner />} />

                  {/* Knowledge Base */}
                  <Route path="/knowledge-base" element={<KnowledgeLayout />}>
                    <Route index element={<KnowledgeBase />} />
                    <Route path="calendar" element={<AgriculturalCalendarPage />} />
                    <Route path="plant-elements" element={<PlantNutrientsPage />} />
                    <Route path="fertilizer" element={<FertilizersPage />} />
                    <Route path="soil-irri" element={<SoilsPage />} />
                    <Route path="weeds" element={<WeedsPage />} />
                    <Route path="plants-crops" element={<PlantsPage />} />
                    <Route path="academic" element={<AcademicPage />} />
                    <Route path="diseases" element={<DiseasesPage />} />

                    {/* الأمراض */}
                    <Route path="diseases/bacteria" element={<BacteriaDiseasesPage />} />
                    <Route path="diseases/viruses" element={<VirusesDiseasesPage />} />
                    <Route path="diseases/nematodes" element={<NematodesDiseasesPage />} />
                    <Route path="diseases/parasitic_plants" element={<ParasiticPlantsPage />} />
                    <Route path="diseases/physiological_disorders" element={<FungalDiseasesPage />} />
                    <Route path="diseases/fungi" element={<FungalClassificationPage />} />
                    <Route path="diseases/fungi/oomy" element={<OomycotaDiseasesPage />} />
                    <Route path="diseases/fungi/zygo" element={<ZygomycotaDiseasesPage />} />
                    <Route path="diseases/fungi/asco" element={<AscomycotaDiseasesPage />} />
                    <Route path="diseases/fungi/basi" element={<BasidiomycotaDiseasesPage />} />

                    {/* الحشرات */}
                    <Route path="insects" element={<InsectsPageNew />} />
                    <Route path="insects/:orderId" element={<InsectOrderPage />} />
                    <Route path="insects/public-health-pets" element={<PublicHealthPestsPage />} />
                    <Route path="insects/nematoda" element={<NematodaPage />} />

                    {/* المبيدات */}
                    <Route path="pesticides" element={<PesticidesHub />} />
                    <Route path="pesticides/group/:groupCode" element={<PesticideGroupPage />} />
                  </Route>
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/admin/blog" element={<AdminBlogPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
              </main>
            }
          />
        </Routes>
      </Suspense>

      <Footer />
      <CookieConsent />
    </div>
  );
};

// 🚀 App الرئيسي
const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
};

export default App;
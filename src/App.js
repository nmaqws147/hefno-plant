// App.jsx
import { lazy, Suspense, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './component/SEO';
import { Toaster } from 'sonner';
import './App.css';
import Header from './component/header';
import Footer from './component/footer';
import ScrollToTop from './component/scrollTop';
import CookieConsent from './component/cookieConsent';
import ErrorBoundary from './component/ErrorBoundary';
import useTracking from './hooks/useTracking';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './component/ProtectedRoute';
import PublicRoute from './component/PublicRoute';
import FullPageLoader from './component/FullPageLoader';
import ChatWidget from './component/ChatWidget';

const GlobalToaster = () => <Toaster position="top-center" richColors closeButton />;

// Lazy Load 
const HomeScreen = lazy(() => import('./pages/homescreen'));
const DiagnoseScreen = lazy(() => import('./pages/DiagnosePage'));
const WeatherScreen = lazy(() => import('./component/weather'));
const KnowledgeBase = lazy(() => import('./component/knowledge'));


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
const PhysiologicalDisordersPage = lazy(() => import('./knowledge_base/phys'));
const FungalClassificationPage = lazy(() => import('./knowledge_base/fungi'));

const FoodSafetyPage = lazy(() => import('./knowledge_base/food-safety/food-safety'));
const HoneyBeesPage = lazy(() => import('./knowledge_base/honey-bees/honey-bees'));

const OomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/oomy'));
const ZygomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/zygo'));
const AscomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/asco'));
const BasidiomycotaDiseasesPage = lazy(() => import('./knowledge_base/fungi-classes/basi'));

const InsectsPageNew = lazy(() => import('./pages/insects'));
const InsectOrderPage = lazy(() => import('./pages/insects-order-page'));
const PublicHealthPestsPage = lazy(() => import('./knowledge_base/insects/public-health'));
const NematodaPage = lazy(() => import('./knowledge_base/insects/nematoda'));
const NematodaSpeciesListPage = lazy(() => import('./pages/nematoda/NematodaSpeciesList'));
const NematodaSpeciesDetailPage = lazy(() => import('./pages/nematoda/NematodaSpeciesDetail'));

const PesticidesHub = lazy(() => import('./pages/pesticidesHub'));
const PesticidesCategoryPage = lazy(() => import('./pages/pesticides-category'));
const PesticideGroupPage = lazy(() => import('./pages/pesticides-group-page'));
const PrivacyPage = lazy(() => import('./pages/privacy'));
const TermsPage = lazy(() => import('./pages/terms'));
const AboutPage = lazy(() => import('./pages/about'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminStats = lazy(() => import('./component/admin-stats'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const Loader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner" />
    <span className="page-loader-text">HefnoPlant</span>
  </div>
);

// 📦 Main Content
const AppContent = () => {
  const { loading, isAdmin } = useAuth();

  const { trackAction } = useTracking();
  const location = useLocation();

  useEffect(() => {
    trackAction('app_loaded');
  }, [trackAction]);

  if (loading) return <FullPageLoader />;

  return (
    <div className="app" id="main-app">
      <SEO
        description="منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي، دليل المبيدات، التقويم الزراعي، وأكثر."
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              name: 'Hefno-Plant',
              url: 'https://hefnoplant.site',
              description: 'منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي، دليل المبيدات، التقويم الزراعي.',
              inLanguage: 'ar',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://hefnoplant.site/knowledge-base?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@type': 'Organization',
              name: 'Hefno-Plant',
              url: 'https://hefnoplant.site',
              logo: 'https://hefnoplant.site/og-image.png',
              description: 'منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي',
              sameAs: [
                'https://www.facebook.com/elhfnawee.dowidar.5',
                'https://www.youtube.com/@Eng-elhefnawy',
                'https://www.tiktok.com/@elhefnawyde',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+20-110-211-8765',
                contactType: 'customer service',
              },
            },
          ],
        }}
      />
      <GlobalToaster />
      <Header />
      <ScrollToTop />

      <Suspense fallback={<Loader />}>
        <Routes>

          {/* الصفحات العامة (بدون تسجيل دخول) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

          {/* الصفحة الرئيسية — عامة للزوار */}
          <Route path="/" element={<HomeScreen />} />

          {/* الصفحات المحمية (تتطلب تسجيل دخول) */}
          <Route path="/admin-panel" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* باقي الصفحات المحمية */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <main className="main-content main-background">
                    <ErrorBoundary>
                      <Routes>
                      <Route path="/diagnose" element={<DiagnoseScreen />} />
                      <Route path="/weather" element={<WeatherScreen />} />
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
                        <Route path="food-safety" element={<FoodSafetyPage />} />
                        <Route path="honey-bees" element={<HoneyBeesPage />} />
                        <Route path="diseases" element={<DiseasesPage />} />

                        {/* الأمراض */}
                        <Route path="diseases/bacteria" element={<BacteriaDiseasesPage />} />
                        <Route path="diseases/viruses" element={<VirusesDiseasesPage />} />
                        <Route path="diseases/nematodes" element={<NematodesDiseasesPage />} />
                        <Route path="diseases/parasitic_plants" element={<ParasiticPlantsPage />} />
                        <Route path="diseases/physiological_disorders" element={<PhysiologicalDisordersPage />} />
                        <Route path="diseases/fungi" element={<FungalClassificationPage />} />
                        <Route path="diseases/fungi/oomy" element={<OomycotaDiseasesPage />} />
                        <Route path="diseases/fungi/zygo" element={<ZygomycotaDiseasesPage />} />
                        <Route path="diseases/fungi/asco" element={<AscomycotaDiseasesPage />} />
                        <Route path="diseases/fungi/basi" element={<BasidiomycotaDiseasesPage />} />

                        {/* الحشرات */}
                        <Route path="insects" element={<InsectsPageNew />} />
                        <Route path="insects/:orderId" element={<InsectOrderPage />} />
                        <Route path="insects/public-health-pests" element={<PublicHealthPestsPage />} />
                        <Route path="insects/nematoda" element={<NematodaPage />} />

                        {/* النيماتودا */}
                        <Route path="nematoda-species" element={<NematodaSpeciesListPage />} />
                        <Route path="nematoda-species/:speciesId" element={<NematodaSpeciesDetailPage />} />

                        {/* المبيدات */}
                        <Route path="pesticides" element={<PesticidesHub />} />
                        <Route path="pesticides/group/:groupCode" element={<PesticideGroupPage />} />
                        <Route path="pesticides/:categoryId" element={<PesticidesCategoryPage />} />
                      </Route>
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogPostPage />} />

                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    </ErrorBoundary>
                </main>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      <Footer />
      <CookieConsent />
      <ChatWidget />
    </div>
  );
};

// 🚀 App الرئيسي
const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
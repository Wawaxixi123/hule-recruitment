import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import JobCreatePage from "./pages/JobCreatePage";
import JobDetailPage from "./pages/JobDetailPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import CandidateComparePage from "./pages/CandidateComparePage";
import InterviewsPage from "./pages/InterviewsPage";
import InterviewDetailPage from "./pages/InterviewDetailPage";
import SkillHubPage from "./pages/SkillHubPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import KnowledgePage from "./pages/KnowledgePage";
import HoroAIPage from "./pages/HoroAIPage";
import BackgroundCheckPage from "./pages/BackgroundCheckPage";
import SourcingPage from "./pages/SourcingPage";
import EmailImportPage from "./pages/EmailImportPage";
import VideoRecordPage from "./pages/VideoRecordPage";
import FeishuRecordPage from "./pages/FeishuRecordPage";
import { AuthProvider } from "./contexts/AuthContext";
import { FeishuProvider } from "./contexts/FeishuContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/jobs/create" component={JobCreatePage} />
      <Route path="/jobs/:id" component={JobDetailPage} />
      <Route path="/candidates" component={CandidatesPage} />
      <Route path="/candidates/compare" component={CandidateComparePage} />
      <Route path="/candidates/:id" component={CandidateDetailPage} />
      <Route path="/interviews" component={InterviewsPage} />
      <Route path="/interviews/:id" component={InterviewDetailPage} />
      <Route path="/skill-hub" component={SkillHubPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/knowledge" component={KnowledgePage} />
      <Route path="/horo-ai" component={HoroAIPage} />
      <Route path="/background-check" component={BackgroundCheckPage} />
      <Route path="/sourcing" component={SourcingPage} />
      <Route path="/email-import" component={EmailImportPage} />
      <Route path="/video-record" component={VideoRecordPage} />
      <Route path="/feishu-record" component={FeishuRecordPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <FeishuProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
          </FeishuProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

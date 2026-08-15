import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PageLoading } from './components/ui/Loading'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'

const LandingPage=lazy(()=>import('./pages/LandingPage').then(m=>({default:m.LandingPage})))
const LoginPage=lazy(()=>import('./pages/LoginPage').then(m=>({default:m.LoginPage})))
const SignUpPage=lazy(()=>import('./pages/SignUpPage').then(m=>({default:m.SignUpPage})))
const PrivacyPage=lazy(()=>import('./pages/PrivacyPage').then(m=>({default:m.PrivacyPage})))
const CitizenLayout=lazy(()=>import('./layouts/CitizenLayout').then(m=>({default:m.CitizenLayout})))
const CitizenHome=lazy(()=>import('./pages/citizen/CitizenHome').then(m=>({default:m.CitizenHome})))
const CitizenIncidentDetail=lazy(()=>import('./pages/citizen/CitizenIncidentDetail').then(m=>({default:m.CitizenIncidentDetail})))
const MyReports=lazy(()=>import('./pages/citizen/MyReports').then(m=>({default:m.MyReports})))
const NearbyIssues=lazy(()=>import('./pages/citizen/NearbyIssues').then(m=>({default:m.NearbyIssues})))
const ReportFlow=lazy(()=>import('./pages/citizen/ReportFlow').then(m=>({default:m.ReportFlow})))
const CommandLayout=lazy(()=>import('./layouts/CommandLayout').then(m=>({default:m.CommandLayout})))
const Overview=lazy(()=>import('./pages/command/Overview').then(m=>({default:m.Overview})))
const PriorityQueue=lazy(()=>import('./pages/command/PriorityQueue').then(m=>({default:m.PriorityQueue})))
const IncidentDetail=lazy(()=>import('./pages/command/IncidentDetail').then(m=>({default:m.IncidentDetail})))
const CityMap=lazy(()=>import('./pages/command/CityMap').then(m=>({default:m.CityMap})))
const DuplicateClusters=lazy(()=>import('./pages/command/DuplicateClusters').then(m=>({default:m.DuplicateClusters})))
const Resources=lazy(()=>import('./pages/command/Resources').then(m=>({default:m.Resources})))
const Hotspots=lazy(()=>import('./pages/command/Hotspots').then(m=>({default:m.Hotspots})))
const Analytics=lazy(()=>import('./pages/command/Analytics').then(m=>({default:m.Analytics})))
const Settings=lazy(()=>import('./pages/command/Settings').then(m=>({default:m.Settings})))
const FieldWorkerApp=lazy(()=>import('./pages/field/FieldWorkerApp').then(m=>({default:m.FieldWorkerApp})))
const RecyclingPartner=lazy(()=>import('./pages/partner/RecyclingPartner').then(m=>({default:m.RecyclingPartner})))
const AdminConsole=lazy(()=>import('./pages/admin/AdminConsole').then(m=>({default:m.AdminConsole})))

export default function App(){return <HashRouter><AuthProvider><DataProvider><Suspense fallback={<PageLoading/>}><Routes>
  <Route path="/" element={<LandingPage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/signup" element={<SignUpPage/>}/><Route path="/privacy" element={<PrivacyPage/>}/>
  <Route path="/app" element={<ProtectedRoute roles={['CITIZEN']}><CitizenLayout/></ProtectedRoute>}><Route index element={<CitizenHome/>}/><Route path="report" element={<ReportFlow/>}/><Route path="reports" element={<MyReports/>}/><Route path="reports/:id" element={<CitizenIncidentDetail/>}/><Route path="nearby" element={<NearbyIssues/>}/></Route>
  <Route path="/command" element={<ProtectedRoute roles={['MUNICIPAL_OFFICER','ADMIN']}><CommandLayout/></ProtectedRoute>}><Route index element={<Overview/>}/><Route path="incidents" element={<PriorityQueue all/>}/><Route path="priority" element={<PriorityQueue/>}/><Route path="incidents/:id" element={<IncidentDetail/>}/><Route path="map" element={<CityMap/>}/><Route path="clusters" element={<DuplicateClusters/>}/><Route path="teams" element={<Resources type="teams"/>}/><Route path="vehicles" element={<Resources type="vehicles"/>}/><Route path="hotspots" element={<Hotspots/>}/><Route path="analytics" element={<Analytics/>}/><Route path="settings" element={<Settings/>}/></Route>
  <Route path="/field" element={<ProtectedRoute roles={['FIELD_WORKER']}><FieldWorkerApp/></ProtectedRoute>}/><Route path="/recycler" element={<ProtectedRoute roles={['RECYCLING_PARTNER']}><RecyclingPartner/></ProtectedRoute>}/><Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminConsole/></ProtectedRoute>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></Suspense></DataProvider></AuthProvider></HashRouter>}

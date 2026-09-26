import { Routes, Route } from 'react-router'
import Shell from './components/Shell'
import Dashboard from './pages/Dashboard'
import FarmerProfile from './pages/FarmerProfile'
import FarmTwin from './pages/FarmTwin'
import CropCycle from './pages/CropCycle'
import FieldQueue from './pages/FieldQueue'
import Financing from './pages/Financing'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/farmers/:id" element={<FarmerProfile />} />
        <Route path="/farms/:id" element={<FarmTwin />} />
        <Route path="/cycles/:id" element={<CropCycle />} />
        <Route path="/field-queue" element={<FieldQueue />} />
        <Route path="/finance/:id" element={<Financing />} />
        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  )
}

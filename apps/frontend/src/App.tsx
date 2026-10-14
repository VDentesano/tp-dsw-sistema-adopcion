import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { CatalogoMascotas } from "./pages/CatalogoMascotas";
import { DetalleMascota } from "./pages/DetalleMascota";
import { PostulacionForm } from "./pages/PostulacionForm";
import { MisSolicitudes } from "./pages/MisSolicitudes";
import { SolicitudesRefugio } from "./pages/SolicitudesRefugio";
import { DetalleSolicitud } from "./pages/DetalleSolicitud";
import { AbmEspecies } from "./pages/AbmEspecies";
import { AbmRazas } from "./pages/AbmRazas";
import { Aviso } from "./components/Aviso";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/mascotas" replace />} />
        <Route path="/mascotas" element={<CatalogoMascotas />} />
        <Route path="/mascotas/:id" element={<DetalleMascota />} />
        <Route path="/mascotas/:id/postular" element={<PostulacionForm />} />
        <Route path="/solicitudes" element={<MisSolicitudes />} />
        <Route path="/refugio/solicitudes" element={<SolicitudesRefugio />} />
        <Route path="/refugio/solicitudes/:id" element={<DetalleSolicitud />} />
        <Route path="/admin" element={<Navigate to="/admin/especies" replace />} />
        <Route path="/admin/especies" element={<AbmEspecies />} />
        <Route path="/admin/razas" element={<AbmRazas />} />
        <Route path="*" element={<Aviso>Esta página no existe.</Aviso>} />
      </Route>
    </Routes>
  );
}

export default App;

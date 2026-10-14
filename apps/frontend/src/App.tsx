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
import { AbmRefugios } from "./pages/AbmRefugios";
import { AbmLocalidades } from "./pages/AbmLocalidades";
import { AbmUsuarios } from "./pages/AbmUsuarios";
import { AbmMascotas } from "./pages/AbmMascotas";
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
        <Route path="/admin" element={<Navigate to="/admin/mascotas" replace />} />
        <Route path="/admin/mascotas" element={<AbmMascotas />} />
        <Route path="/admin/razas" element={<AbmRazas />} />
        <Route path="/admin/especies" element={<AbmEspecies />} />
        <Route path="/admin/refugios" element={<AbmRefugios />} />
        <Route path="/admin/localidades" element={<AbmLocalidades />} />
        <Route path="/admin/usuarios" element={<AbmUsuarios />} />
        <Route path="*" element={<Aviso>Esta página no existe.</Aviso>} />
      </Route>
    </Routes>
  );
}

export default App;

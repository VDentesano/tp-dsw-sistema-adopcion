import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { CatalogoMascotas } from "./pages/CatalogoMascotas";
import { DetalleMascota } from "./pages/DetalleMascota";
import { PostulacionForm } from "./pages/PostulacionForm";
import { MisSolicitudes } from "./pages/MisSolicitudes";
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
        <Route path="*" element={<Aviso>Esta página no existe.</Aviso>} />
      </Route>
    </Routes>
  );
}

export default App;

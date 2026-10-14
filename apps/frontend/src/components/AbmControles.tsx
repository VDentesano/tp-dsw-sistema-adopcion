import s from "../pages/Abm.module.css";

/** Botones del formulario de un ABM: agregar, o guardar y cancelar si se esta modificando. */
export function BotonesFormulario({
  editando,
  guardando,
  completo,
  onCancelar,
}: {
  editando: boolean;
  guardando: boolean;
  /** Si estan cargados los campos obligatorios. */
  completo: boolean;
  onCancelar: () => void;
}) {
  return (
    <div className={s.botones}>
      <button type="submit" className={s.primario} disabled={guardando || !completo}>
        {editando ? "Guardar cambios" : "Agregar"}
      </button>
      {editando && (
        <button type="button" className={s.secundario} disabled={guardando} onClick={onCancelar}>
          Cancelar
        </button>
      )}
    </div>
  );
}

/** Botones de cada fila del listado. */
export function BotonesFila({
  guardando,
  onModificar,
  onEliminar,
}: {
  guardando: boolean;
  onModificar: () => void;
  onEliminar: () => void;
}) {
  return (
    <div className={s.botones}>
      <button type="button" className={s.secundario} disabled={guardando} onClick={onModificar}>
        Modificar
      </button>
      <button type="button" className={s.peligro} disabled={guardando} onClick={onEliminar}>
        Eliminar
      </button>
    </div>
  );
}

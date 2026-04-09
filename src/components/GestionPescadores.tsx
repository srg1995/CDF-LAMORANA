import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';

interface Pescador {
  id: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  dni: string;
  num_federativa: string;
  num_licencia: string;
  anio_nacimiento: number;
  telefono?: string;
}

interface PescadorFormData {
  nombre: string;
  apellido1: string;
  apellido2: string;
  dni: string;
  num_federativa: string;
  num_licencia: string;
  anio_nacimiento: string;
  telefono: string;
}

const anioActual = new Date().getFullYear();

function esMenor(anioNacimiento: number): boolean {
  return anioActual - anioNacimiento < 18;
}

const formDataVacio: PescadorFormData = {
  nombre: '',
  apellido1: '',
  apellido2: '',
  dni: '',
  num_federativa: '',
  num_licencia: '',
  anio_nacimiento: '',
  telefono: '',
};

export default function GestionPescadores() {
  const [pescadores, setPescadores] = useState<Pescador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PescadorFormData>(formDataVacio);
  const [enviando, setEnviando] = useState(false);
  const [editandoInline, setEditandoInline] = useState<Record<string, Partial<Pescador>>>({});
  const [expandido, setExpandido] = useState<Set<string>>(new Set());

  useEffect(() => {
    cargarPescadores();
  }, []);

  async function cargarPescadores() {
    try {
      setCargando(true);
      setError(null);
      const data = await pb.collection('pescadores')
        .getFullList<Pescador>({ sort: 'apellido1' });
      setPescadores(data);
    } catch {
      setError('No se pudo conectar con PocketBase. Verifica que el servidor esté corriendo.');
    } finally {
      setCargando(false);
    }
  }

  function abrirModalNuevo() {
    setEditandoId(null);
    setFormData(formDataVacio);
    setModalOpen(true);
  }


  function cerrarModal() {
    setModalOpen(false);
    setEditandoId(null);
    setFormData(formDataVacio);
  }

  async function guardarPescador() {
    if (!formData.nombre.trim() || !formData.apellido1.trim() || !formData.dni.trim() || !formData.anio_nacimiento) {
      return;
    }

    setEnviando(true);
    try {
      const data = {
        nombre: formData.nombre.trim(),
        apellido1: formData.apellido1.trim(),
        apellido2: formData.apellido2.trim(),
        dni: formData.dni.trim(),
        num_federativa: formData.num_federativa.trim(),
        num_licencia: formData.num_licencia.trim(),
        anio_nacimiento: parseInt(formData.anio_nacimiento, 10),
        telefono: formData.telefono.trim(),
      };

      if (editandoId) {
        await pb.collection('pescadores').update(editandoId, data);
      } else {
        await pb.collection('pescadores').create(data);
      }

      await cargarPescadores();
      cerrarModal();
    } catch {
      setError('Error al guardar pescador.');
    } finally {
      setEnviando(false);
    }
  }

  async function eliminarPescador(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este pescador?')) {
      return;
    }

    try {
      await pb.collection('pescadores').delete(id);
      await cargarPescadores();
    } catch {
      setError('Error al eliminar pescador.');
    }
  }

  async function guardarCambioInline(id: string) {
    const cambios = editandoInline[id];
    if (!cambios || Object.keys(cambios).length === 0) {
      setEditandoInline((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    try {
      await pb.collection('pescadores').update(id, cambios);
      await cargarPescadores();
      setEditandoInline((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      setError('Error al actualizar pescador.');
    }
  }

  function actualizarCampoInline(id: string, campo: string, valor: string) {
    setEditandoInline((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [campo]: campo === 'anio_nacimiento' ? parseInt(valor, 10) : valor,
      },
    }));
  }

  const puedeSalvarPescador = formData.nombre.trim() !== '' &&
                              formData.apellido1.trim() !== '' &&
                              formData.dni.trim() !== '' &&
                              formData.anio_nacimiento !== '';

  return (
    <>
      {/* Card Principal */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              👥 Socios
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {pescadores.length} pescador{pescadores.length !== 1 ? 'es' : ''} registrado{pescadores.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={abrirModalNuevo}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Nuevo pescador
          </button>
        </div>

        {/* Contenido */}
        {cargando ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando pescadores…</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-6">
            {error}
          </div>
        ) : pescadores.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No hay pescadores. Crea uno para comenzar.
          </div>
        ) : (
          <div className="space-y-3">
            {pescadores.map((p) => {
              const enEdicion = editandoInline[p.id];
              const esExpandido = expandido.has(p.id);
              return (
                <div
                  key={p.id}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg transition"
                >
                  {/* Header colapsable */}
                  <button
                    onClick={() => {
                      setExpandido((prev) => {
                        const next = new Set(prev);
                        if (next.has(p.id)) {
                          next.delete(p.id);
                        } else {
                          next.add(p.id);
                        }
                        return next;
                      });
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-700/70 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          esExpandido ? 'rotate-90' : ''
                        }`}
                      >
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white font-medium">
                        {p.nombre} {p.apellido1} {p.apellido2}
                      </span>
                    </div>
                    {p.telefono && (
                      <span className="text-slate-400 text-sm">
                        {p.telefono}
                      </span>
                    )}
                  </button>

                  {/* Contenido expandido */}
                  {esExpandido && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-600">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 mt-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={enEdicion?.nombre ?? p.nombre}
                        onChange={(e) => actualizarCampoInline(p.id, 'nombre', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Apellido 1 */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Apellido 1</label>
                      <input
                        type="text"
                        value={enEdicion?.apellido1 ?? p.apellido1}
                        onChange={(e) => actualizarCampoInline(p.id, 'apellido1', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Apellido 2 */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Apellido 2</label>
                      <input
                        type="text"
                        value={enEdicion?.apellido2 ?? p.apellido2}
                        onChange={(e) => actualizarCampoInline(p.id, 'apellido2', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* DNI */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">DNI</label>
                      <input
                        type="text"
                        value={enEdicion?.dni ?? p.dni}
                        onChange={(e) => actualizarCampoInline(p.id, 'dni', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition font-mono"
                      />
                    </div>

                    {/* Nº Federativa */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nº Federativa</label>
                      <input
                        type="text"
                        value={enEdicion?.num_federativa ?? p.num_federativa}
                        onChange={(e) => actualizarCampoInline(p.id, 'num_federativa', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Nº Licencia */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nº Licencia</label>
                      <input
                        type="text"
                        value={enEdicion?.num_licencia ?? p.num_licencia}
                        onChange={(e) => actualizarCampoInline(p.id, 'num_licencia', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Año Nacimiento */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Año Nacimiento</label>
                      <input
                        type="number"
                        value={enEdicion?.anio_nacimiento ?? p.anio_nacimiento}
                        onChange={(e) => actualizarCampoInline(p.id, 'anio_nacimiento', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={enEdicion?.telefono ?? p.telefono ?? ''}
                        onChange={(e) => actualizarCampoInline(p.id, 'telefono', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Mayor de edad */}
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!esMenor(enEdicion?.anio_nacimiento ?? p.anio_nacimiento)}
                          disabled
                          className="rounded border-slate-500 bg-slate-600 text-sky-500"
                        />
                        <span className="text-xs font-medium text-slate-400">Mayor de edad</span>
                      </label>
                    </div>
                  </div>

                      {/* Botones */}
                      <div className="flex gap-2 justify-end">
                        {Object.keys(editandoInline).includes(p.id) ? (
                          <>
                            <button
                              onClick={() => guardarCambioInline(p.id)}
                              className="text-xs px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white font-medium transition"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() =>
                                setEditandoInline((prev) => {
                                  const next = { ...prev };
                                  delete next[p.id];
                                  return next;
                                })
                              }
                              className="text-xs px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-500 text-white font-medium transition"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                // Activar edición inline
                                setEditandoInline((prev) => ({
                                  ...prev,
                                  [p.id]: {},
                                }));
                              }}
                              className="text-xs px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-700 text-white font-medium transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarPescador(p.id)}
                              className="text-xs px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium transition border border-red-600/30"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editandoId ? 'Editar pescador' : 'Nuevo pescador'}
            </h3>

            <div className="space-y-4 mb-6">
              {/* Nombre */}
              <div>
                <label htmlFor="modal-nombre" className="block text-sm font-medium text-slate-300 mb-1">
                  Nombre *
                </label>
                <input
                  id="modal-nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="Juan"
                />
              </div>

              {/* Apellido 1 */}
              <div>
                <label htmlFor="modal-apellido1" className="block text-sm font-medium text-slate-300 mb-1">
                  Apellido 1 *
                </label>
                <input
                  id="modal-apellido1"
                  type="text"
                  value={formData.apellido1}
                  onChange={(e) => setFormData({ ...formData, apellido1: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="García"
                />
              </div>

              {/* Apellido 2 */}
              <div>
                <label htmlFor="modal-apellido2" className="block text-sm font-medium text-slate-300 mb-1">
                  Apellido 2
                </label>
                <input
                  id="modal-apellido2"
                  type="text"
                  value={formData.apellido2}
                  onChange={(e) => setFormData({ ...formData, apellido2: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="López"
                />
              </div>

              {/* DNI */}
              <div>
                <label htmlFor="modal-dni" className="block text-sm font-medium text-slate-300 mb-1">
                  DNI *
                </label>
                <input
                  id="modal-dni"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition font-mono"
                  placeholder="12345678A"
                />
              </div>

              {/* Nº Federativa */}
              <div>
                <label htmlFor="modal-federativa" className="block text-sm font-medium text-slate-300 mb-1">
                  Nº Federativa
                </label>
                <input
                  id="modal-federativa"
                  type="text"
                  value={formData.num_federativa}
                  onChange={(e) => setFormData({ ...formData, num_federativa: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="FED-001"
                />
              </div>

              {/* Nº Licencia */}
              <div>
                <label htmlFor="modal-licencia" className="block text-sm font-medium text-slate-300 mb-1">
                  Nº Licencia
                </label>
                <input
                  id="modal-licencia"
                  type="text"
                  value={formData.num_licencia}
                  onChange={(e) => setFormData({ ...formData, num_licencia: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="LIC-001"
                />
              </div>

              {/* Año Nacimiento */}
              <div>
                <label htmlFor="modal-anio" className="block text-sm font-medium text-slate-300 mb-1">
                  Año Nacimiento *
                </label>
                <input
                  id="modal-anio"
                  type="number"
                  value={formData.anio_nacimiento}
                  onChange={(e) => setFormData({ ...formData, anio_nacimiento: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="1980"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="modal-telefono" className="block text-sm font-medium text-slate-300 mb-1">
                  Teléfono
                </label>
                <input
                  id="modal-telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="+34 612 345 678"
                />
              </div>
            </div>

            {/* Botones Modal */}
            <div className="flex gap-3">
              <button
                onClick={guardarPescador}
                disabled={!puedeSalvarPescador || enviando}
                className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                {enviando ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={cerrarModal}
                disabled={enviando}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
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
}

const anioActual = new Date().getFullYear();

function esMenor(anioNacimiento: number): boolean {
  return anioActual - anioNacimiento < 18;
}

export default function GestionJornada() {
  const [pescadores, setPescadores] = useState<Pescador[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pb.collection('pescadores')
      .getFullList<Pescador>({ sort: 'apellido1' })
      .then((data) => {
        setPescadores(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo conectar con PocketBase. Verifica que el servidor esté corriendo.');
        setCargando(false);
      });
  }, []);

  function togglePescador(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleTodos() {
    if (seleccionados.size === pescadores.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(pescadores.map((p) => p.id)));
    }
  }

  function exportarExcel() {
    const filas = pescadores
      .filter((p) => seleccionados.has(p.id))
      .map((p) => ({
        Nombre: p.nombre,
        'Apellido 1': p.apellido1,
        'Apellido 2': p.apellido2,
        DNI: p.dni,
        'Nº Federativa': p.num_federativa,
        'Nº Licencia': p.num_licencia,
        'Año Nacimiento': p.anio_nacimiento,
        Menor: esMenor(p.anio_nacimiento) ? 'Sí' : 'No',
      }));

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Jornada');

    const nombreLugar = lugar.trim().replace(/\s+/g, '_') || 'Sin_Lugar';
    const nombreFecha = fecha || 'Sin_Fecha';
    XLSX.writeFile(libro, `${nombreLugar}_${nombreFecha}.xlsx`);
  }

  const puedeExportar = seleccionados.size > 0 && lugar.trim() !== '' && fecha !== '';
  const todosSeleccionados = pescadores.length > 0 && seleccionados.size === pescadores.length;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            📅 Registro de jornada
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Selecciona los pescadores y exporta la lista
          </p>
        </div>
      </div>

      {/* Inputs jornada */}
      <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lugar" className="block text-sm font-medium text-slate-300 mb-1.5">
              Lugar
            </label>
            <input
              id="lugar"
              type="text"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Ej: Río Ebro"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-slate-300 mb-1.5">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Cabecera tabla + botón export */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <p className="text-sm text-slate-400">
          {seleccionados.size > 0 ? (
            <span className="text-sky-400 font-medium">{seleccionados.size} pescador{seleccionados.size !== 1 ? 'es' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}</span>
          ) : (
            'Selecciona los pescadores que van hoy'
          )}
        </p>
        <button
          onClick={exportarExcel}
          disabled={!puedeExportar}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V13a1 1 0 11-2 0V6.414L7.707 7.707A1 1 0 016.293 6.293l3-3A1 1 0 0110 3zM3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="text-center py-12 text-slate-400 text-sm">Cargando pescadores…</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-6">
          {error}
        </div>
      ) : pescadores.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No hay pescadores en la base de datos.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={todosSeleccionados}
                    onChange={toggleTodos}
                    className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Apellido 1</th>
                <th className="px-4 py-3">Apellido 2</th>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Nº Federativa</th>
                <th className="px-4 py-3">Nº Licencia</th>
                <th className="px-4 py-3">Año Nac.</th>
                <th className="px-4 py-3">Menor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {pescadores.map((p) => {
                const activo = seleccionados.has(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => togglePescador(p.id)}
                    className={`cursor-pointer transition-colors ${
                      activo
                        ? 'bg-sky-900/30 hover:bg-sky-900/40'
                        : 'bg-slate-900/50 hover:bg-slate-800'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => togglePescador(p.id)}
                        className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                    <td className="px-4 py-3 text-slate-300">{p.apellido1}</td>
                    <td className="px-4 py-3 text-slate-300">{p.apellido2 || '—'}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{p.dni}</td>
                    <td className="px-4 py-3 text-slate-300">{p.num_federativa}</td>
                    <td className="px-4 py-3 text-slate-300">{p.num_licencia}</td>
                    <td className="px-4 py-3 text-slate-300">{p.anio_nacimiento}</td>
                    <td className="px-4 py-3">
                      {esMenor(p.anio_nacimiento) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/15 text-amber-400 border border-amber-400/20">
                          Sí
                        </span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as XLSX from 'xlsx';
import GestionJornada from '@/components/GestionJornada';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetFullList = mock(() => Promise.resolve([]));

mock.module('@/lib/pocketbase', () => ({
  default: {
    collection: mock(() => ({ getFullList: mockGetFullList })),
  },
}));

const mockWriteFile = mock(() => undefined);
const mockJsonToSheet = mock(() => ({}));
const mockBookNew = mock(() => ({}));
const mockBookAppendSheet = mock(() => undefined);

mock.module('xlsx', () => ({
  utils: {
    json_to_sheet: mockJsonToSheet,
    book_new: mockBookNew,
    book_append_sheet: mockBookAppendSheet,
  },
  writeFile: mockWriteFile,
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const anioActual = new Date().getFullYear();

const PESCADORES_FIXTURE = [
  {
    id: '1',
    nombre: 'Juan',
    apellido1: 'García',
    apellido2: 'López',
    dni: '12345678A',
    num_federativa: 'FED001',
    num_licencia: 'LIC001',
    anio_nacimiento: anioActual - 30, // adulto
  },
  {
    id: '2',
    nombre: 'María',
    apellido1: 'Martínez',
    apellido2: '',
    dni: '87654321B',
    num_federativa: 'FED002',
    num_licencia: 'LIC002',
    anio_nacimiento: anioActual - 15, // menor
  },
  {
    id: '3',
    nombre: 'Pedro',
    apellido1: 'Sánchez',
    apellido2: 'Ruiz',
    dni: '11223344C',
    num_federativa: 'FED003',
    num_licencia: 'LIC003',
    anio_nacimiento: anioActual - 18, // exactamente 18 → NO es menor
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GestionJornada', () => {
  beforeEach(() => {
    mockGetFullList.mockClear();
    mockWriteFile.mockClear();
    mockJsonToSheet.mockClear();
    mockBookNew.mockClear();
    mockBookAppendSheet.mockClear();
  });

  // ── Estado de carga ─────────────────────────────────────────────────────────

  describe('estado de carga', () => {
    it('muestra el mensaje de carga mientras espera PocketBase', () => {
      mockGetFullList.mockImplementation(() => new Promise(() => {}));
      render(<GestionJornada />);
      expect(screen.getByText('Cargando pescadores…')).toBeInTheDocument();
    });
  });

  // ── Estado de error ─────────────────────────────────────────────────────────

  describe('estado de error', () => {
    it('muestra el error cuando PocketBase falla', async () => {
      mockGetFullList.mockRejectedValue(new Error('connection refused'));
      render(<GestionJornada />);
      await waitFor(() => {
        expect(
          screen.getByText(/No se pudo conectar con PocketBase/i),
        ).toBeInTheDocument();
      });
    });
  });

  // ── Sin datos ───────────────────────────────────────────────────────────────

  describe('sin pescadores', () => {
    it('muestra mensaje vacío cuando la colección está vacía', async () => {
      mockGetFullList.mockResolvedValue([]);
      render(<GestionJornada />);
      await waitFor(() => {
        expect(
          screen.getByText('No hay pescadores en la base de datos.'),
        ).toBeInTheDocument();
      });
    });
  });

  // ── Renderizado de datos ────────────────────────────────────────────────────

  describe('renderizado de pescadores', () => {
    beforeEach(() => {
      mockGetFullList.mockResolvedValue(PESCADORES_FIXTURE);
    });

    it('muestra el nombre y apellidos de cada pescador', async () => {
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));
      expect(screen.getByText('García')).toBeInTheDocument();
      expect(screen.getByText('Martínez')).toBeInTheDocument();
      expect(screen.getByText('Pedro')).toBeInTheDocument();
    });

    it('muestra "—" cuando apellido2 está vacío', async () => {
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('marca como menor al pescador con menos de 18 años', async () => {
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const filas = screen.getAllByRole('row').slice(1);
      const filaMaria = filas.find((row) => within(row).queryByText('María'));

      expect(filaMaria).toBeDefined();
      expect(within(filaMaria!).getByText('Sí')).toBeInTheDocument();
    });

    it('NO marca como menor al pescador con exactamente 18 años', async () => {
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const filas = screen.getAllByRole('row').slice(1);
      const filaPedro = filas.find((row) => within(row).queryByText('Pedro'));

      expect(filaPedro).toBeDefined();
      expect(within(filaPedro!).getByText('No')).toBeInTheDocument();
    });

    it('NO marca como menor al pescador adulto', async () => {
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const filas = screen.getAllByRole('row').slice(1);
      const filaJuan = filas.find((row) => within(row).queryByText('Juan'));

      expect(filaJuan).toBeDefined();
      expect(within(filaJuan!).getByText('No')).toBeInTheDocument();
    });
  });

  // ── Selección individual ────────────────────────────────────────────────────

  describe('selección de pescadores', () => {
    beforeEach(() => {
      mockGetFullList.mockResolvedValue(PESCADORES_FIXTURE);
    });

    it('selecciona un pescador al hacer clic en su fila', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const filas = screen.getAllByRole('row').slice(1);
      await user.click(filas[0]);

      expect(screen.getByText('1 pescador seleccionado')).toBeInTheDocument();
    });

    it('deselecciona un pescador al hacer clic de nuevo en su fila', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const filas = screen.getAllByRole('row').slice(1);
      await user.click(filas[0]);
      await user.click(filas[0]);

      expect(
        screen.getByText('Selecciona los pescadores que van hoy'),
      ).toBeInTheDocument();
    });

    it('muestra el plural correcto con varios pescadores seleccionados', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const filas = screen.getAllByRole('row').slice(1);
      await user.click(filas[0]);
      await user.click(filas[1]);

      expect(screen.getByText('2 pescadores seleccionados')).toBeInTheDocument();
    });

    it('selecciona todos con el checkbox de la cabecera', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const checkboxCabecera = screen.getAllByRole('checkbox')[0];
      await user.click(checkboxCabecera);

      expect(
        screen.getByText(`${PESCADORES_FIXTURE.length} pescadores seleccionados`),
      ).toBeInTheDocument();
    });

    it('deselecciona todos al hacer clic de nuevo en el checkbox de cabecera', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const checkboxCabecera = screen.getAllByRole('checkbox')[0];
      await user.click(checkboxCabecera);
      await user.click(checkboxCabecera);

      expect(
        screen.getByText('Selecciona los pescadores que van hoy'),
      ).toBeInTheDocument();
    });
  });

  // ── Validación del botón exportar ───────────────────────────────────────────

  describe('botón Exportar Excel', () => {
    beforeEach(() => {
      mockGetFullList.mockResolvedValue(PESCADORES_FIXTURE);
    });

    it('está deshabilitado sin selección', async () => {
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));
      expect(screen.getByRole('button', { name: /Exportar Excel/i })).toBeDisabled();
    });

    it('está deshabilitado con selección pero sin lugar ni fecha', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      const filas = screen.getAllByRole('row').slice(1);
      await user.click(filas[0]);

      expect(screen.getByRole('button', { name: /Exportar Excel/i })).toBeDisabled();
    });

    it('está deshabilitado con selección y lugar pero sin fecha', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      await user.type(screen.getByLabelText('Lugar'), 'Río Ebro');
      const filas = screen.getAllByRole('row').slice(1);
      await user.click(filas[0]);

      expect(screen.getByRole('button', { name: /Exportar Excel/i })).toBeDisabled();
    });

    it('se habilita cuando hay selección, lugar y fecha', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      await user.type(screen.getByLabelText('Lugar'), 'Río Ebro');
      await user.type(screen.getByLabelText('Fecha'), '2026-06-15');
      const filas = screen.getAllByRole('row').slice(1);
      await user.click(filas[0]);

      expect(screen.getByRole('button', { name: /Exportar Excel/i })).toBeEnabled();
    });
  });

  // ── Exportación Excel ───────────────────────────────────────────────────────

  describe('exportación Excel', () => {
    beforeEach(() => {
      mockGetFullList.mockResolvedValue(PESCADORES_FIXTURE);
      mockJsonToSheet.mockReturnValue({});
      mockBookNew.mockReturnValue({});
    });

    it('llama a XLSX.writeFile con el nombre correcto al exportar', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      await user.type(screen.getByLabelText('Lugar'), 'Río Ebro');
      await user.type(screen.getByLabelText('Fecha'), '2026-06-15');
      const filas = screen.getAllByRole('row').slice(1);
      await user.click(filas[0]);

      await user.click(screen.getByRole('button', { name: /Exportar Excel/i }));

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.anything(),
        'Río_Ebro_2026-06-15.xlsx',
      );
    });

    it('incluye solo los pescadores seleccionados en el Excel', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      await user.type(screen.getByLabelText('Lugar'), 'Lago');
      await user.type(screen.getByLabelText('Fecha'), '2026-07-01');

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // índice 0 es el checkbox de cabecera

      await user.click(screen.getByRole('button', { name: /Exportar Excel/i }));

      const filas = mockJsonToSheet.mock.calls[0][0] as Array<Record<string, unknown>>;
      expect(filas).toHaveLength(1);
      expect(filas[0]['Nombre']).toBe('Juan');
    });

    it('marca correctamente el campo Menor en el Excel exportado', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      await user.type(screen.getByLabelText('Lugar'), 'Lago');
      await user.type(screen.getByLabelText('Fecha'), '2026-07-01');

      await user.click(screen.getAllByRole('checkbox')[0]); // seleccionar todos

      await user.click(screen.getByRole('button', { name: /Exportar Excel/i }));

      const filas = mockJsonToSheet.mock.calls[0][0] as Array<Record<string, unknown>>;
      const filaJuan = filas.find((f) => f['Nombre'] === 'Juan');
      const filaMaria = filas.find((f) => f['Nombre'] === 'María');
      const filaPedro = filas.find((f) => f['Nombre'] === 'Pedro');

      expect(filaJuan?.['Menor']).toBe('No');
      expect(filaMaria?.['Menor']).toBe('Sí');
      expect(filaPedro?.['Menor']).toBe('No'); // exactamente 18 → NO menor
    });

    it('reemplaza espacios por guiones bajos en el nombre del archivo', async () => {
      const user = userEvent.setup();
      render(<GestionJornada />);
      await waitFor(() => screen.getByText('Juan'));

      await user.type(screen.getByLabelText('Lugar'), 'Río Grande del Norte');
      await user.type(screen.getByLabelText('Fecha'), '2026-08-10');
      await user.click(screen.getAllByRole('checkbox')[0]);

      await user.click(screen.getByRole('button', { name: /Exportar Excel/i }));

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.anything(),
        'Río_Grande_del_Norte_2026-08-10.xlsx',
      );
    });
  });
});

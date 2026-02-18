import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import readXlsxFile from 'read-excel-file';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface VenueImporterProps {
  session: any;
  onImportComplete: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function VenueImporter({ onImportComplete }: VenueImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: Normalize header strings (lowercase, remove accents, trim)
  const normalizeHeader = (header: string) => {
    return header
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .trim();
  };

  // Helper: Parse coordinates that might be integers or strings with commas
  const parseCoordinate = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;

    let num = value;

    if (typeof value === 'string') {
      // Replace comma with dot for decimals
      num = parseFloat(value.replace(',', '.'));
    }

    if (isNaN(num)) return null;

    // Fix typical integer coordinate error (e.g. -34570389 -> -34.570389)
    // Latitudes are between -90 and 90. Longitudes between -180 and 180.
    // If number is way out of bounds, it's likely missing a decimal point.

    // Simple heuristic: if absolute value > 180, try dividing by powers of 10 until it fits
    if (Math.abs(num) > 180) {
      // Try to find reasonable scale. 
      // Most coords in this context (Argentina) are like -34.xxx and -58.xxx
      // If we have -34570389, we have 8 digits. dividing by 10^6 gives -34.5...

      const strVal = String(Math.abs(Math.round(num)));
      // Assume the first 2 digits are the integer part for typical lat/lng in this region
      // This is a heuristic but handles the common case of missing decimal
      if (strVal.length > 3) {
        const divisor = Math.pow(10, strVal.length - 2);
        num = num / divisor;
      }
    }

    return num;
  };

  const processRows = (rows: any[]) => {
    if (rows.length < 2) return [];

    // First row is header
    const rawHeaders = rows[0];
    const dataRows = rows.slice(1);

    // Create a map of normalized headers to indices
    const headerMap: Record<string, number> = {};
    rawHeaders.forEach((h: any, i: number) => {
      if (typeof h === 'string') {
        headerMap[normalizeHeader(h)] = i;
      }
    });

    const getColIndex = (keys: string[]) => {
      for (const key of keys) {
        if (headerMap[key] !== undefined) return headerMap[key];
      }
      return -1;
    };

    const idxId = getColIndex(['id']);
    const idxName = getColIndex(['nombre del venue', 'nombre', 'name', 'venue']);
    const idxAddress = getColIndex(['direccion', 'address', 'calle']);
    const idxZone = getColIndex(['zona geografica', 'zona', 'region', 'zone']);
    const idxCity = getColIndex(['ciudad', 'city', 'localidad']);
    const idxChannel = getColIndex(['canal', 'channel', 'tipo']);
    const idxLat = getColIndex(['latitud', 'lat', 'latitude']);
    const idxLng = getColIndex(['longitud', 'lng', 'longitude', 'long']);

    return dataRows
      .filter(row => row[idxName] || row[idxAddress]) // Filter empty rows based on Name or Address
      .map(row => {
        return {
          id: row[idxId], // Keep original ID if present, or let DB generate
          nombre: row[idxName] || 'Sin Nombre',
          direccion: row[idxAddress] || '',
          region: row[idxZone] || '', // Map 'Zona' to 'region' (text field)
          ciudad: row[idxCity] || '',
          tipo: row[idxChannel] || 'Bar Premium', // Default channel
          latitud: parseCoordinate(row[idxLat]),
          longitud: parseCoordinate(row[idxLng]),
        };
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    try {
      const rows = await readXlsxFile(selectedFile);
      const jsonData = processRows(rows);

      if (jsonData.length === 0) {
        setError('No se encontraron datos válidos en el archivo. Verifica los nombres de las columnas.');
        setPreview([]);
        return;
      }

      // Show first 5 rows as preview
      setPreview(jsonData.slice(0, 5));
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Error al leer el archivo Excel. Verifica que sea un archivo válido.');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const rows = await readXlsxFile(file);
      const jsonData = processRows(rows);

      console.log('📊 Parsed Excel data:', jsonData);
      console.log('📍 Total rows to import:', jsonData.length);

      // Prepare data for Supabase insert
      // We map our parsed objects to the DB columns
      const venuesToInsert = jsonData.map((row: any) => ({
        // If ID column existed and is valid UUID, we could use it, but safer to let DB gen ID or ignore
        // If the user wants to upsert based on an external ID, they should ensure it matches
        // For now, we omit 'id' to let Supabase generate UUIDs, unless specifically needed.
        // But if the excel HAS IDs that match existing DB IDs, we might want to upsert.
        // The user's excel shows integer IDs (e.g. 72302834), which are NOT UUIDs. 
        // Supabase id is uuid default gen_random_uuid(). 
        // We should store this external ID in a separate field if we want to keep it, 
        // OR just ignore it and create new venues.
        // Let's assume we are creating NEW venues for now.

        nombre: row.nombre,
        direccion: row.direccion,
        ciudad: row.ciudad,
        region: row.region, // This goes to the text field 'region' for now
        tipo: row.tipo,
        latitud: row.latitud,
        longitud: row.longitud,
        // Default values
        activo: true,
        segmento: 'General'
      }));

      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('btl_puntos_venta')
        .insert(venuesToInsert as any)
        .select();

      if (insertError) throw insertError;

      console.log('✅ Venues inserted:', data?.length);

      setSuccess(true);
      setError(null);
      setImporting(false);

      toast.success(`Se importaron ${data?.length || 0} venues correctamente`);

      // Notify parent component
      onImportComplete();

      // Clear file after short delay
      setTimeout(() => {
        setFile(null);
        setPreview([]);
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error processing file:', err);
      setError(err.message || 'Error al procesar el archivo');
      setImporting(false);
      toast.error('Error al importar venues');
    }
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
          <FileSpreadsheet className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl text-white font-semibold">Importar Venues desde Excel</h2>
          <p className="text-sm text-slate-400">Carga un archivo .xlsx con el listado de bares</p>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2 text-sm text-slate-300">
          Seleccionar archivo Excel (.xlsx)
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="venue-file-upload"
            disabled={importing}
          />
          <label
            htmlFor="venue-file-upload"
            className={`
              flex items-center justify-center gap-3 w-full px-6 py-8 
              border-2 border-dashed rounded-lg cursor-pointer transition-all
              ${importing ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-500/50 hover:bg-slate-800/50'}
              ${file ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-600'}
            `}
          >
            <Upload className="w-6 h-6 text-slate-400" />
            <div className="text-center">
              <p className="text-white font-medium">
                {file ? file.name : 'Haz clic para seleccionar archivo'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Columnas requeridas: Nombre | Dirección | Zona | Lat | Lng
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-slate-300 font-medium mb-3">
            Vista Previa de Datos Normalizados (primeras 5 filas)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Nombre</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Zona/Región</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Dirección</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Lat</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Lng</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row: any, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50">
                    <td className="py-2 px-3 text-white">{row.nombre}</td>
                    <td className="py-2 px-3 text-slate-300">{row.region}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{row.direccion}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs font-mono">{row.latitud !== null ? row.latitud : <span className="text-red-400">Invalid</span>}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs font-mono">{row.longitud !== null ? row.longitud : <span className="text-red-400">Invalid</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 font-medium">Error de Importación</p>
            <p className="text-sm text-red-400 mt-1 whitespace-pre-wrap">{error}</p>
          </div>
        </div>
      )}

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!file || importing || success || preview.length === 0}
        className={`
          w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
          ${!file || importing || success || preview.length === 0
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-900/20'
          }
        `}
      >
        {importing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Guardando en Base de Datos...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            ¡Importación Exitosa!
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Confirmar e Importar
          </>
        )}
      </button>
    </div>
  );
}
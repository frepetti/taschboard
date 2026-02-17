import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface VenueImporterProps {
  session: any;
  onImportComplete: () => void;
}

export function VenueImporter({ session, onImportComplete }: VenueImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Read file and show preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        if (!data) return;

        // Parse Excel file
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Show first 5 rows as preview
        setPreview(jsonData.slice(0, 5) as any[]);
      } catch (err) {
        console.error('Error reading file:', err);
        setError('Error al leer el archivo Excel. Verifica que sea un archivo válido.');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      // Read file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          if (!data) throw new Error('No se pudo leer el archivo');

          // Parse Excel
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          console.log('📊 Parsed Excel data:', jsonData);
          console.log('📍 Total rows to import:', jsonData.length);

          // Transform Excel data to venue format
          const venues = jsonData.map((row: any, index: number) => ({
            id: row.ID || row.id || `venue-${index + 1}`,
            name: row['Nombre del venue'] || row.nombre || row.name || `Venue ${index + 1}`,
            address: row.Direccion || row.direccion || row.address || '',
            zone: row['Zona geografica'] || row.zona || row.zone || '',
            channel: row.Canal || row.canal || row.channel || 'Bar Premium',
            city: row.Ciudad || row.ciudad || row.city || '',
            lat: row.Latitud || row.lat || row.latitude || null,
            lng: row.Longitud || row.lng || row.longitude || null,
            imported: true,
            importedAt: new Date().toISOString()
          }));

          console.log('✅ Transformed venues:', venues);

          // Save to localStorage (temporary solution until Edge Function is deployed)
          localStorage.setItem('imported_venues', JSON.stringify(venues));
          console.log('💾 Venues saved to localStorage');

          setSuccess(true);
          setError(null);
          setImporting(false);
          
          // Notify parent component
          onImportComplete();

        } catch (err: any) {
          console.error('❌ Error processing file:', err);
          setError(err.message || 'Error al procesar el archivo');
          setImporting(false);
        }
      };

      reader.onerror = () => {
        setError('Error al leer el archivo');
        setImporting(false);
      };

      reader.readAsBinaryString(file);
    } catch (err: any) {
      console.error('❌ Error importing venues:', err);
      setError(err.message || 'Error al importar venues');
      setImporting(false);
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
                Formato esperado: ID, Nombre del venue, Zona geografica, Direccion, Latitud, Longitud
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-slate-300 font-medium mb-3">
            Vista Previa (primeras 5 filas)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">ID</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Nombre</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Zona</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Dirección</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Lat</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Lng</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row: any, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50">
                    <td className="py-2 px-3 text-slate-300">{row.ID || row.id || '-'}</td>
                    <td className="py-2 px-3 text-white">{row['Nombre del venue'] || row.nombre || '-'}</td>
                    <td className="py-2 px-3 text-slate-300">{row['Zona geografica'] || row.zona || '-'}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{row.Direccion || row.direccion || '-'}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{row.Latitud || row.lat || '-'}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{row.Longitud || row.lng || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Canal Assignment Info */}
      {preview.length > 0 && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            ℹ️ El canal se asignará automáticamente como <strong>"Bar Premium"</strong> para todos los venues.
            Podrás editarlo individualmente después de la importación.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-sm text-red-400 mt-1 whitespace-pre-wrap">{error}</p>
            {error.includes('Columns available') && (
              <div className="mt-3 p-3 bg-slate-900/50 rounded border border-slate-700">
                <p className="text-xs text-slate-300 font-medium mb-1">💡 Tip:</p>
                <p className="text-xs text-slate-400">
                  Asegúrate de que tu Excel tenga una columna llamada exactamente: 
                  <strong className="text-amber-400"> "Nombre del venue"</strong>, 
                  <strong className="text-amber-400"> "nombre"</strong>, o 
                  <strong className="text-amber-400"> "name"</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-medium">¡Importación Exitosa!</p>
            <p className="text-sm text-green-400 mt-1">Los venues se han importado correctamente.</p>
          </div>
        </div>
      )}

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!file || importing || success}
        className={`
          w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
          ${!file || importing || success
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
          }
        `}
      >
        {importing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Importando...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Importación Completada
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Importar Venues
          </>
        )}
      </button>
    </div>
  );
}
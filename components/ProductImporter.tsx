import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import readXlsxFile from 'read-excel-file';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface ProductImporterProps {
    onImportComplete: () => void;
}

export function ProductImporter({ onImportComplete }: ProductImporterProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper: Normalize header strings
    const normalizeHeader = (header: string) => {
        return header
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .trim();
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

        // Define column mappings
        const idxMarca = getColIndex(['marca', 'brand']);
        const idxNombre = getColIndex(['nombre', 'producto', 'name', 'product']);
        const idxCategoria = getColIndex(['categoria', 'category']);
        const idxSubcategoria = getColIndex(['subcategoria', 'subcategory', 'segmento']);
        const idxSku = getColIndex(['sku', 'codigo', 'code']);
        const idxPresentacion = getColIndex(['presentacion', 'medida', 'size']);
        const idxObjPresencia = getColIndex(['objetivo presencia', 'presencia', 'target presence']);
        const idxObjStock = getColIndex(['objetivo stock', 'stock', 'target stock']);
        const idxObjPop = getColIndex(['objetivo pop', 'pop', 'target pop']);

        return dataRows
            .filter(row => row[idxNombre] || row[idxMarca]) // Filter empty rows
            .map(row => {
                return {
                    marca: row[idxMarca] || 'Sin Marca',
                    nombre: row[idxNombre] || 'Sin Nombre',
                    categoria: row[idxCategoria] || 'General',
                    subcategoria: row[idxSubcategoria] || 'Estándar',
                    sku: row[idxSku] ? String(row[idxSku]) : null,
                    presentacion: row[idxPresentacion] ? String(row[idxPresentacion]) : null,
                    objetivo_presencia: typeof row[idxObjPresencia] === 'number' ? row[idxObjPresencia] : 80,
                    objetivo_stock: typeof row[idxObjStock] === 'number' ? row[idxObjStock] : 75,
                    objetivo_pop: typeof row[idxObjPop] === 'number' ? row[idxObjPop] : 60,
                    // Defaults
                    activo: true,
                    orden_visualizacion: 0,
                    configuracion: { perfect_serve: [] }
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
                setError('No se encontraron datos válidos. Verifica las columnas (Marca, Nombre, Categoría, SKU).');
                setPreview([]);
                return;
            }

            setPreview(jsonData.slice(0, 5));
        } catch (err) {
            console.error('Error reading file:', err);
            setError('Error al leer el archivo Excel.');
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setError(null);

        try {
            const rows = await readXlsxFile(file);
            const jsonData = processRows(rows);

            console.log('📊 Importing products:', jsonData.length);

            const { data, error: insertError } = await supabase
                .from('btl_productos')
                .insert(jsonData)
                .select();

            if (insertError) throw insertError;

            console.log('✅ Products inserted:', data?.length);

            setSuccess(true);
            toast.success(`Se importaron ${data?.length || 0} productos correctamente`);
            onImportComplete();

            setTimeout(() => {
                setFile(null);
                setPreview([]);
                setSuccess(false);
            }, 2000);

        } catch (err: any) {
            console.error('❌ Error importing products:', err);
            setError(err.message || 'Error al importar productos');
            toast.error('Error al importar productos');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="bg-surface-card border border-border-subtle rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-theme-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                    <h2 className="text-xl text-content-main font-semibold">Importar Productos desde Excel</h2>
                    <p className="text-sm text-content-muted">Carga un archivo .xlsx con el catálogo de productos</p>
                </div>
            </div>

            <div className="mb-6">
                <label className="block mb-2 text-sm text-content-muted">
                    Seleccionar archivo Excel (.xlsx)
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="product-file-upload"
                        disabled={importing}
                    />
                    <label
                        htmlFor="product-file-upload"
                        className={`
              flex items-center justify-center gap-3 w-full px-6 py-8 
              border-2 border-dashed rounded-lg cursor-pointer transition-all
              ${importing ? 'opacity-50 cursor-not-allowed' : 'hover:border-theme-primary/50 hover:bg-surface-card-subtle'}
              ${file ? 'border-theme-primary/50 bg-theme-primary/10' : 'border-border-subtle'}
            `}
                    >
                        <Upload className="w-6 h-6 text-content-muted" />
                        <div className="text-center">
                            <p className="text-content-main font-medium">
                                {file ? file.name : 'Haz clic para seleccionar archivo'}
                            </p>
                            <p className="text-sm text-content-muted mt-1">
                                Columnas: Marca | Nombre | Categoría | SKU | Presentación
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {preview.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm text-content-main font-medium mb-3">
                        Vista Previa (primeras 5 filas)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-subtle">
                                    <th className="text-left py-2 px-3 text-content-muted font-medium">Marca</th>
                                    <th className="text-left py-2 px-3 text-content-muted font-medium">Nombre</th>
                                    <th className="text-left py-2 px-3 text-content-muted font-medium">Categoría</th>
                                    <th className="text-left py-2 px-3 text-content-muted font-medium">SKU</th>
                                    <th className="text-left py-2 px-3 text-content-muted font-medium">Obj. Presencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row: any, idx) => (
                                    <tr key={idx} className="border-b border-border-subtle/50">
                                        <td className="py-2 px-3 text-content-main">{row.marca}</td>
                                        <td className="py-2 px-3 text-content-muted">{row.nombre}</td>
                                        <td className="py-2 px-3 text-content-muted">{row.categoria}</td>
                                        <td className="py-2 px-3 text-content-muted font-mono">{row.sku || '-'}</td>
                                        <td className="py-2 px-3 text-content-muted">{row.objetivo_presencia}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-red-300 font-medium">Error de Importación</p>
                        <p className="text-sm text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <button
                onClick={handleImport}
                disabled={!file || importing || success || preview.length === 0}
                className={`
          w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
          ${!file || importing || success || preview.length === 0
                        ? 'bg-surface-card-subtle text-content-muted border border-border-subtle cursor-not-allowed'
                        : 'bg-theme-primary hover:brightness-95 text-white shadow-sm font-medium'
                    }
        `}
            >
                {importing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
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

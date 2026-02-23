const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 1. CONFIGURATION
// You need to use the SERVICE_ROLE key to bypass Row Level Security (RLS)
// and fetch data from all tables.
const supabaseUrl = 'https://bottepcamxznevclxpfr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdHRlcGNhbXh6bmV2Y2x4cGZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM1NTM2MiwiZXhwIjoyMDg2OTMxMzYyfQ.cuskBpuroFSPcai4N9rbU0caehELJtIOZogmocbbAtY'; // Replace with your service_role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. TABLES TO MIGRATE
// We list all tables that contain data we want to keep.
// 'btl_inspecciones' is EXCLUDED as per your request.
const tables = [
    'btl_usuarios',
    'btl_regiones',
    'btl_productos',
    'btl_puntos_venta',
    'btl_capacitaciones',
    'btl_reportes',
    'btl_ticket_comentarios',
    'btl_clientes_venues',
    'btl_cliente_productos',
    'btl_capacitacion_asistentes',
    'btl_temas_capacitacion',
    'btl_config',
    'btl_acciones'
];

async function generateInserts() {
    let finalSql = '-- DATA MIGRATION SCRIPT\n';
    // This line is crucial: it disables triggers and foreign key checks during import
    finalSql += 'SET session_replication_role = \'replica\';\n\n';

    for (const table of tables) {
        console.log(`Fetching data from ${table}...`);

        // Fetch all rows from the table
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            finalSql += `-- Data for ${table}\n`;
            const columns = Object.keys(data[0]);

            data.forEach(row => {
                const values = columns.map(col => {
                    const val = row[col];
                    if (val === null) return 'NULL';

                    // Format strings and handle single quotes
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;

                    // Format arrays for PostgreSQL (e.g., {item1, item2})
                    if (Array.isArray(val)) {
                        return `'${JSON.stringify(val).replace('[', '{').replace(']', '}').replace(/'/g, "''")}'::text[]`;
                    }

                    // Format objects as JSONB
                    if (typeof val === 'object') {
                        return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
                    }

                    return val;
                });

                // Generate the INSERT statement
                finalSql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
            });
            finalSql += '\n';
        }
    }

    // Restore trigger and FK checks
    finalSql += 'SET session_replication_role = \'origin\';\n';

    // Save to file
    fs.writeFileSync('insert_data.sql', finalSql);
    console.log('\nSuccess! SQL statements generated in: insert_data.sql');
}

generateInserts();
